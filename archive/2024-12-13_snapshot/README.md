# Spherical Planet RTS - Kódbázis Archívum

> **Snapshot dátum:** 2024-12-13
> 
> **Verzió:** v0.4 - Camera System 4.0

---

## 📁 Projekt Struktúra

```
_GAME_3_/
├── index.html          # Belépési pont, import map
├── package.json        # NPM konfiguráció
├── css/
│   └── style.css       # UI stílusok
├── src/
│   ├── Main.js         # Alkalmazás indítás
│   ├── Core/           # Fő játék rendszerek
│   │   ├── Game.js     # Központi vezérlő (~1400 sor)
│   │   ├── Input.js    # Billentyűzet kezelés
│   │   └── InteractionManager.js  # Egér interakciók
│   ├── Camera/         # Kamera vezérlés
│   │   └── SphericalCameraController4.js  # V4.0 (~1350 sor)
│   ├── Entities/       # Játék entitások
│   │   └── Unit.js     # Egység logika (~1200 sor)
│   ├── World/          # Világ generálás
│   │   ├── Planet.js   # Bolygó mesh és víz
│   │   ├── Terrain.js  # Procedurális terep
│   │   ├── FogOfWar.js # Köd rendszer
│   │   ├── RockSystem.js      # Szikla elhelyezés
│   │   └── RockMeshGenerator.js  # Szikla geometria
│   ├── UI/             # Debug panelek
│   │   ├── DebugPanel.js      # Tweakpane főpanel
│   │   ├── CameraDebug.js     # Kamera overlay
│   │   ├── RockDebug.js       # Szikla kontrollok
│   │   └── TextureDebugger.js # Textúra megjelenítő
│   ├── Math/           # Matematikai segédek
│   │   └── SphericalMath.js   # Gömb geometria
│   └── Utils/          # Általános segédek
│       └── MathUtils.js
└── modellek/           # GLTF modellek (1-5.glb)
```

---

## 🔧 Technológiai Stack

| Technológia | Verzió | CDN |
|-------------|--------|-----|
| **Three.js** | 0.160.0 | unpkg.com |
| **Tweakpane** | 4.0.1 | unpkg.com |
| **simplex-noise** | 4.0.1 | unpkg.com |

**Futtatás:**
```bash
npx http-server . -c-1 -p 8081
```

---

## 📚 Dokumentációs Fájlok

| Fájl | Tartalom |
|------|----------|
| [01_CORE.md](./docs/01_CORE.md) | Game.js, Input.js, InteractionManager.js |
| [02_CAMERA.md](./docs/02_CAMERA.md) | SphericalCameraController4.js teljes kód |
| [03_WORLD.md](./docs/03_WORLD.md) | Planet, Terrain, FogOfWar, RockSystem |
| [04_ENTITIES.md](./docs/04_ENTITIES.md) | Unit.js teljes kód |
| [05_UI.md](./docs/05_UI.md) | DebugPanel, CameraDebug, RockDebug |
| [06_MATH.md](./docs/06_MATH.md) | SphericalMath, MathUtils |

---

## 🎮 Főbb Rendszerek Áttekintés

### 1. Kamera Rendszer (V4.0)
- **LMB Drag:** Felszín "megfogása és húzása"
- **RMB Orbit:** Pivot pont körüli forgatás (screen-space)
- **Scroll Zoom:** Cinematikus zoom anchor ponthoz
- **Chase Mode:** Unit követés hátulról
- **Fly-To:** Cinematikus átmenet unitok között
- **Collision:** Sziklák és unitok elkerülése

### 2. Interakció Rendszer (V3.0)
- **Click:** Unit kiválasztás, deselect
- **Drag:** Útvonal rajzolás unit-ra húzva
- **Shift+Click:** Waypoint hozzáadás
- **Double-Click:** Panel megnyitás
- **Hover:** Unit kiemelés, path megjelenítés

### 3. Terep Generálás
- **Procedurális noise:** Ridged multifractal, domain warping
- **Biome színek:** Magasság-alapú gradiens
- **Víz:** Shader alapú, csillag tükröződés

### 4. Unit Rendszer
- **Mozgás:** Gömb felszínen, terep követés
- **Útvonal:** Catmull-Rom spline, looping támogatás
- **Víz reakció:** Wading, backing, shaking animáció
- **Selection:** Spotlight, glow ring, headlights

---

## 🔑 Fontos Config Értékek

### Camera (`SphericalCameraController4.config`)
```javascript
minDistance: 2.0,          // Min távolság felszíntől
maxDistance: 500.0,        // Max távolság bolygó középtől
chaseDistance: 8.0,        // Unit mögötti távolság
chaseHeight: 4.0,          // Unit feletti magasság
minRockDistance: 2.0,      // Collision távolság sziklától
minUnitDistance: 1.5,      // Collision távolság unittól
```

### Terrain (`Terrain.params`)
```javascript
radius: 60,                // Bolygó sugár
heightMultiplier: 6.0,     // Terep magasság szorzó
waterLevel: 1.5,           // Vízszint
mountainScale: 3.0,        // Hegy noise skála
mountainStrength: 0.5,     // Hegy erősség
```

### Unit
```javascript
speed: 5.0,                // Mozgási sebesség
turnSpeed: 2.0,            // Fordulási sebesség
groundOffset: 0.5,         // Magasság terep felett
```

---

## ⚠️ Ismert Korlátozások

1. **Rock Debug Panel:** Jelenleg nem működik megfelelően
2. **Camera Occlusion:** `checkUnitVisibility` kikapcsolva teszteléshez
3. **Path UI:** Régi sárga vonal hidden, csak zöld tube látszik

---

## 📝 Changelog (Utolsó Munkamenet)

- ✅ RMB Orbit screen-space fix (pivot stabil)
- ✅ Zoom smooth easing (power-6)
- ✅ Fly-to shortest path (<180° rotation)
- ✅ Camera collision (rock + unit)
- ✅ Collision throttling (distance-based)
- ✅ Fly-to duration increased (3.5s → 5.0s)

---

*Generálva: 2024-12-13 01:30*
