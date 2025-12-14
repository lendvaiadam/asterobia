# Camera System Documentation

> **SphericalCameraController4.js** - Version 4.0 (Precise Control)
> 
> Komplett kamera vezérlő rendszer gömbfelszíni bolygóhoz, cinematikus mozgásokkal.

---

## Áttekintés

A kamera rendszer a következő fő működési módokat támogatja:

| Mód | Aktiválás | Leírás |
|-----|-----------|--------|
| **Idle** | - | Alap állapot, nincs aktív interakció |
| **Drag** | LMB | Felszín "megfogása és húzása" |
| **Orbit** | RMB | Forgatás rögzített pivot pont körül |
| **Free Look** | LMB + RMB | FPS-stílusú szabad nézet |
| **Chase** | Unit kiválasztás | Unit követése hátulról |
| **Fly-To** | Unit tab dupla klikk | Cinematikus átmenet két pont között |
| **Zoom** | Scroll | Cinematikus zoom anchor ponthoz |

---

## Konfiguráció (`this.config`)

### Általános Beállítások

| Paraméter | Alapérték | Leírás |
|-----------|-----------|--------|
| `orbitSensitivity` | 0.005 | RMB orbit érzékenység |
| `freeLookSensitivity` | 0.002 | Free look érzékenység |
| `minDistance` | 2.0 | Minimum távolság a felszíntől |
| `maxDistance` | 500.0 | Maximum távolság a bolygó középpontjától |
| `minPitch` / `maxPitch` | ±~85° | Pitch korlátozás (ne menjen a föld alá) |
| `dampingFactor` | 0.05 | Általános simítási faktor |

### Orbit Beállítások (RMB)

| Paraméter | Alapérték | Leírás |
|-----------|-----------|--------|
| `orbitAlignmentSpeed` | 0.6 | Vízszintesbe forgatás sebessége (ease-in/out) |
| `orbitCenteringSpeed` | 0.0015 | Pivot középpontba húzás sebessége (jelenleg nem aktív) |

### Zoom Beállítások

| Paraméter | Alapérték | Leírás |
|-----------|-----------|--------|
| `zoomInImpulse` | 0.04 | Zoom be impulzus erőssége |
| `zoomOutImpulse` | 0.025 | Zoom ki impulzus erőssége |
| `zoomDamping` | 0.96 | Zoom lassítási faktor (magasabb = simább) |
| `zoomMinVelocity` | 0.0005 | Minimum sebesség mielőtt megáll |
| `zoomTimeout` | 500ms | Anchor reset időzítő |

### Chase Beállítások

| Paraméter | Alapérték | Leírás |
|-----------|-----------|--------|
| `chaseDistance` | 8.0 | Távolság a unit mögött |
| `chaseHeight` | 4.0 | Magasság a unit felett |
| `chaseResponsiveness` | 0.08 | Követés simítási faktora |

---

## Működési Módok Részletesen

### 1. LMB Drag - Felszín Húzás

**Aktiválás:** Bal egérgomb lenyomása a bolygón

**Működés:**
1. `onMouseDown` → `pickSurfacePoint()` meghatározza a kezdő pontot
2. `startDrag(hitPoint)` → `isDragging = true`, `dragLastHit = hitPoint`
3. `handleDrag(mouseX, mouseY)`:
   - Raycast az új egérpozícióra
   - Kiszámolja a mozgás delta vektort
   - A kamera pozíciót az ellenkező irányba tolja ("grab and drag" érzés)
4. `endDrag()` → `isDragging = false`

**Különlegesség:** 1:1 arányú mozgás érzet - a megfogott pont az egér alatt marad.

---

### 2. RMB Orbit - Pivot Körüli Forgatás

**Aktiválás:** Jobb egérgomb lenyomása

**Működés:**
1. `onMouseDown` → `pickSurfacePoint()` meghatározza a **pivot pontot**
2. `startOrbit(hitPoint)`:
   - `isOrbiting = true`
   - `orbitPivot = hitPoint` - ez a forgatás középpontja
   - `orbitPivotNormal` - felszín normálisa a pivotnál
3. `handleOrbit(dx, dy)`:
   - **Screen-space tengelyek:** kamera jobb (`camRight`) és fel (`camUp`) vektorai
   - **Vízszintes egér (dx):** forgatás a `camUp` tengely körül
   - **Függőleges egér (dy):** forgatás a `camRight` tengely körül
   - **Pozíció forgatás:** `pivotToCam.applyQuaternion(qCombined)`
   - **Orientáció forgatás:** `targetQuaternion.premultiply(qCombined)` - **AZONOS** quaternion!
   - **Pitch limit:** 5°-88° a pivot normálisához képest (ne menjen föld alá)
4. `updateOrbitAlignment(dt)`:
   - **Lassú vízszintesbe igazítás** a pivot pont normálisához
   - **Forgatási tengely:** kamera→pivot egyenes (viewDir)
   - **Ease-in/out:** cubic görbe alapján
   - Sebesség: `orbitAlignmentSpeed` (debug panelen állítható)

**Kritikus:** A pozíció ÉS orientáció AZONOS quaternion-nal forgatódik → a pivot pont RÖGZÍTVE MARAD a képernyőn!

---

### 3. LMB + RMB Free Look

**Aktiválás:** Mindkét egérgomb lenyomva

**Működés:**
1. Ha drag vagy orbit közben a másik gomb is lenyomódik → `startFreeLook()`
2. `handleFreeLook(dx, dy)`:
   - Kamera **pozíció változatlan**
   - Csak az **orientáció** forog (yaw + pitch)
   - Pitch korlát a bolygó "fel" vektorához képest
3. `endFreeLook()` → visszatér idle-ba

---

### 4. Scroll Zoom - Cinematikus Zoom

**Aktiválás:** Egérgörgő tekerés

**Működés:**
1. `onWheel(event)`:
   - Ha nincs `zoomAnchor` → `pickSurfacePoint()` beállítja az anchor pontot
   - Impulzus hozzáadása: `targetZoomVelocity += zoomInImpulse` (vagy `-zoomOutImpulse`)
   - Reset timer indítása (500ms után anchor törlődik)
2. `update(dt)`:
   - **Ease-in:** `zoomVelocity` lassan közelít `targetZoomVelocity`-hoz (faktor: 0.05)
   - **Ease-out:** `targetZoomVelocity` lassan csökken (faktor: 0.95)
3. `updateCinematicZoom()`:
   - Mozgás az **anchor pont** felé/felől egyenes vonalban
   - Sebesség: `moveAmount = zoomVelocity * distanceToAnchor` (távolság-arányos)
   - **Orientáció forgatás:** lassú slerp az anchor felé nézéshez
     - Velocity-alapú easing: gyors zoom = erősebb forgatás, lassuláskor gyengébb
     - Center falloff: képernyő közepén kevesebb, szélén több forgatás
   - **Damping:** `zoomVelocity *= zoomDamping` (0.96)
   - **Terrain clamp:** minDistance és maxDistance betartása

---

### 5. Chase Mode - Unit Követés

**Aktiválás:** `setChaseTarget(unit)` hívás (unit kiválasztáskor)

**Működés:**
1. `updateChaseMode()` minden frame-ben fut:
   - **Ideális pozíció** kiszámítása:
     - Unit mögött (`chaseDistance` távolságra)
     - Unit felett (`chaseHeight` magasságban)
     - Unit haladási iránya alapján (headingQuaternion)
   - **Balloon Drift:** ha a unit megáll, a kamera lassan "lebegteti" magát mögé
   - **Smooth követés:** `targetPosition.lerp(idealPosition, chaseResponsiveness)`
   - **LookAt:** kamera mindig a unit felé néz

**RMB Orbit Chase módban:**
- `chaseAzimuthOffset` és `chaseElevationOffset` változik
- A kamera a unit körül orbitál, nem fix világpontra

---

### 6. Fly-To - Cinematikus Átmenet

**Aktiválás:** `flyTo(unit, onComplete)` hívás (unit tab dupla klikk)

**Működés:**
1. `isFlying = true`, többi mód kikapcsol
2. **Pálya kiszámítás:**
   - Start: aktuális kamera pozíció
   - Land: ideális chase pozíció a célunit mögött
   - **Ballisztikus ív:** `arcOffset = sin(t * π) * peakHeight`
   - Peak magasság: `min(distance * 0.8, 600)` - távolság-arányos
3. **Easing:**
   - Pozíció: quartic ease-in-out (lassú indulás és érkezés)
   - Focus: 25%-kal előre jár (POI előbb megérkezik)
   - Up vektor: quintic slerp
4. **Quaternion rövidebb út:**
   - `if (camera.quaternion.dot(targetQuat) < 0)` → quaternion negálás
   - Biztosítja, hogy a forgatás MINDIG < 180°
5. Befejezéskor: `onComplete()` callback, chase mode aktiválás

---

### 7. Terrain Collision

**Működés:**
- `enforceTerrainDistance(position)` minden frame-ben fut
- `getRadiusAt(direction)` lekérdezi a terep magasságot az adott irányban
- Ha a kamera túl közel van → kistolja `minDistance` távolságra

---

## State Változók

### Input State
| Változó | Típus | Leírás |
|---------|-------|--------|
| `isLMBDown` | boolean | Bal egérgomb lenyomva |
| `isRMBDown` | boolean | Jobb egérgomb lenyomva |
| `lastMouseX/Y` | number | Előző egérpozíció (delta számításhoz) |

### Mode Flags
| Változó | Típus | Leírás |
|---------|-------|--------|
| `isDragging` | boolean | LMB drag aktív |
| `isOrbiting` | boolean | RMB orbit aktív |
| `isFreeLooking` | boolean | LMB+RMB free look aktív |
| `isFlying` | boolean | Fly-to animáció aktív |

### Zoom State
| Változó | Típus | Leírás |
|---------|-------|--------|
| `zoomAnchor` | Vector3 | Zoom célpont a felszínen |
| `zoomVelocity` | number | Aktuális zoom sebesség |
| `targetZoomVelocity` | number | Cél zoom sebesség (smooth-hoz) |

### Orbit State
| Változó | Típus | Leírás |
|---------|-------|--------|
| `orbitPivot` | Vector3 | Forgatás középpontja |
| `orbitPivotNormal` | Vector3 | Felszín normálisa a pivotnál |

### Chase State
| Változó | Típus | Leírás |
|---------|-------|--------|
| `chaseTarget` | Unit | Követett unit referencia |
| `chaseAzimuthOffset` | number | Vízszintes eltolás (RMB orbit) |
| `chaseElevationOffset` | number | Függőleges eltolás (RMB orbit) |
| `currentChaseDistance` | number | Aktuális távolság (scroll állítja) |

### Smoothing Targets
| Változó | Típus | Leírás |
|---------|-------|--------|
| `targetPosition` | Vector3 | Cél pozíció (lerp) |
| `targetQuaternion` | Quaternion | Cél orientáció (slerp) |

---

## Debug Panel Kontrollok

A kamera beállításai a Tweakpane debug panelen érhetők el:

**Camera folder:**
- Min Distance
- Max Distance
- Zoom In Speed
- Zoom Out Speed

**Camera → RMB Orbit folder:**
- Alignment (Roll) - vízszintesbe forgatás sebessége
- Centering (LookAt) - középpontba húzás sebessége (0-ra állítható)

---

## Kulcs Metódusok

| Metódus | Hívás | Célja |
|---------|-------|-------|
| `update(dt)` | Game loop | Fő frissítő loop |
| `pickSurfacePoint(x, y)` | Raycast | Felszíni pont keresése képernyő koordináták alapján |
| `handleOrbit(dx, dy)` | Mouse move | Orbit pozíció és orientáció frissítés |
| `updateOrbitAlignment(dt)` | Update loop | Lassú vízszintesbe igazítás |
| `updateCinematicZoom()` | Update loop | Zoom mozgás és orientáció |
| `updateChaseMode()` | Update loop | Chase pozíció és orientáció |
| `flyTo(unit, cb)` | Tab double-click | Cinematikus átmenet indítása |
| `enforceTerrainDistance(pos)` | Update loop | Terrain collision |

---

## Easing Görbék Összefoglaló

| Funkció | Görbe típus | Megjegyzés |
|---------|-------------|------------|
| Zoom velocity | Exponential decay | 0.96 damping |
| Zoom rotation | Quadratic + velocity | Gyors zoom = több forgatás |
| Orbit alignment | Cubic ease-in-out | Lassú start/stop |
| Fly-to position | Quartic ease-in-out | Sticky feel |
| Fly-to focus | Custom piecewise | 25% előre jár |
| Chase follow | Linear lerp | Egyenletes követés |

---

## Fontos Implementációs Részletek

### 1. Screen-Space Orbit
A forgatás a kamera **saját tengelyei** körül történik, nem világ tengelyek:
```javascript
const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
```

### 2. Pivot Rögzítés
A pivot pont azért marad helyben a képernyőn, mert **pozíció és orientáció azonos quaternion-nal forgatódik**:
```javascript
this.targetPosition.copy(newCamPos);
this.targetQuaternion.premultiply(qCombined).normalize();
```

### 3. Shortest Rotation Path
Fly-to esetén a quaternion dot product ellenőrzés biztosítja a < 180° forgatást:
```javascript
if (this.camera.quaternion.dot(targetQuat) < 0) {
    targetQuat.set(-targetQuat.x, -targetQuat.y, -targetQuat.z, -targetQuat.w);
}
```

### 4. Terrain Collision
A kamera soha nem megy a felszín alá:
```javascript
const terrainRadius = this.planet.terrain.getRadiusAt(direction);
const minAllowed = terrainRadius + this.config.minDistance;
if (position.length() < minAllowed) {
    position.normalize().multiplyScalar(minAllowed);
}
```

---

*Dokumentáció generálva: 2024-12-12*
