# Camera Modul Dokumentáció

> **Fájl:** SphericalCameraController4.js (~1350 sor)
> 
> V4.0 "Precise Control" - Teljes újraépítés a korábbi verziókból tanulva.

---

## 🎯 Működési Módok

| Mód | Trigger | Leírás |
|-----|---------|--------|
| **Idle** | - | Alap állapot |
| **Drag** | LMB | Felszín megfogása és húzása |
| **Orbit** | RMB | Pivot pont körüli forgatás |
| **Free Look** | LMB+RMB | FPS-stílusú szabad nézet |
| **Chase** | Unit select | Unit követés hátulról |
| **Fly-To** | Tab click | Cinematikus átmenet |
| **Zoom** | Scroll | Anchor ponthoz közelítés |

---

## ⚙️ Konfiguráció

```javascript
this.config = {
    // Érzékenység
    orbitSensitivity: 0.005,
    freeLookSensitivity: 0.002,
    
    // Távolság korlátozás
    minDistance: 2.0,          // Min távolság felszíntől
    maxDistance: 500.0,        // Max távolság bolygó középtől
    minPitch: -Math.PI/2 + 0.1,
    maxPitch: Math.PI/2 - 0.1,
    
    // Simítás
    dampingFactor: 0.05,       // Általános lerp faktor
    
    // RMB Orbit
    orbitAlignmentSpeed: 0.6,  // Roll korrekció sebessége
    orbitCenteringSpeed: 0.0015, // Pivot középre húzás (1/10)
    
    // Scroll Zoom
    zoomInImpulse: 0.04,       // Zoom be impulzus
    zoomOutImpulse: 0.025,     // Zoom ki impulzus  
    zoomDamping: 0.96,         // Ease-out faktor
    zoomMinVelocity: 0.0005,   // Megállási küszöb
    zoomTimeout: 500,          // Anchor reset (ms)
    
    // Chase Mode
    chaseDistance: 8.0,        // Távolság unit mögött
    chaseHeight: 4.0,          // Magasság unit felett
    chaseResponsiveness: 0.08, // Követés simítás
    
    // Collision
    minRockDistance: 2.0,      // Min táv sziklától
    minUnitDistance: 1.5,      // Min táv unittól
};
```

---

## 🔄 Update Loop

```javascript
update(dt) {
    // 1. FLY-TO ANIMÁCIÓ (legmagasabb prioritás)
    if (this.isFlying && this.flyFn) {
        const finished = this.flyFn(dt);
        if (finished) {
            this.isFlying = false;
            this.flyFn = null;
        }
        this.enforceTerrainDistance(this.camera.position);
        return; // Skip többi logika
    }
    
    // 2. CINEMATIKUS ZOOM (velocity-based)
    if (this.targetZoomVelocity !== 0 || this.zoomVelocity !== 0) {
        // Smooth acceleration/deceleration
        const isAccelerating = Math.abs(this.targetZoomVelocity) > Math.abs(this.zoomVelocity);
        const damping = isAccelerating ? 0.05 : 0.1;
        
        this.zoomVelocity += (this.targetZoomVelocity - this.zoomVelocity) * damping;
        this.targetZoomVelocity *= 0.95; // Decay
        
        if (Math.abs(this.zoomVelocity) > 0.001) {
            this.updateCinematicZoom();
        }
    }
    
    // 3. CHASE MODE
    if (this.chaseTarget) {
        this.updateChaseMode();
    }
    
    // 4. ORBIT ALIGNMENT (vízszintesbe igazítás)
    if (this.isOrbiting && this.orbitPivot) {
        this.updateOrbitAlignment(dt);
    }
    
    // 5. DAMPING (smooth interpolation)
    const damping = this.chaseTarget ? this.config.chaseResponsiveness : this.config.dampingFactor;
    this.camera.position.lerp(this.targetPosition, damping);
    this.camera.quaternion.slerp(this.targetQuaternion, damping);
    
    // 6. TERRAIN + OBSTACLE COLLISION
    this.enforceTerrainDistance(this.camera.position);
    
    this.camera.updateMatrixWorld();
}
```

---

## 🖱️ RMB Orbit (Screen-Space)

**Kritikus:** A pivot pont STABIL marad a képernyőn!

```javascript
handleOrbit(dx, dy) {
    if (!this.orbitPivot) return;
    
    // 1. Screen-space tengelyek (kamera saját tengelyei)
    const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const camUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
    
    // 2. Quaternion forgatások
    const qYaw = new THREE.Quaternion().setFromAxisAngle(camUp, -dx * this.config.orbitSensitivity);
    const qPitch = new THREE.Quaternion().setFromAxisAngle(camRight, -dy * this.config.orbitSensitivity);
    const qCombined = qYaw.multiply(qPitch);
    
    // 3. Pozíció forgatás pivot körül
    const pivotToCam = this.targetPosition.clone().sub(this.orbitPivot);
    pivotToCam.applyQuaternion(qCombined);
    const newCamPos = this.orbitPivot.clone().add(pivotToCam);
    
    // 4. Pitch limit (ne menjen föld alá)
    const angleToNormal = newCamPos.clone().sub(this.orbitPivot).normalize()
        .angleTo(this.orbitPivotNormal);
    if (angleToNormal < 0.1 || angleToNormal > Math.PI * 0.48) {
        return; // Block if too close to surface
    }
    
    // 5. KRITIKUS: Pozíció ÉS orientáció AZONOS quaternion-nal!
    this.targetPosition.copy(newCamPos);
    this.targetQuaternion.premultiply(qCombined).normalize();
}
```

### Orbit Alignment (vízszintesbe forgatás)

```javascript
updateOrbitAlignment(dt) {
    // Célvektor: pivot normálisa legyen a kamera "up"
    const currentUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.targetQuaternion);
    const targetUp = this.orbitPivotNormal.clone();
    
    // Forgatási tengely és szög
    const viewDir = this.orbitPivot.clone().sub(this.targetPosition).normalize();
    const projectedCurrent = currentUp.clone().projectOnPlane(viewDir).normalize();
    const projectedTarget = targetUp.clone().projectOnPlane(viewDir).normalize();
    
    let angle = projectedCurrent.angleTo(projectedTarget);
    const cross = projectedCurrent.clone().cross(projectedTarget);
    if (cross.dot(viewDir) < 0) angle = -angle;
    
    // Ease-in/out görbe
    const t = Math.abs(angle) / Math.PI;
    const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const speed = this.config.orbitAlignmentSpeed * easedT;
    
    // Alkalmazás
    const correction = Math.sign(angle) * Math.min(Math.abs(angle), speed * dt);
    const correctionQuat = new THREE.Quaternion().setFromAxisAngle(viewDir, correction);
    this.targetQuaternion.premultiply(correctionQuat).normalize();
}
```

---

## 📹 Cinematikus Zoom

```javascript
updateCinematicZoom() {
    const anchor = this.zoomAnchor;
    const camPos = this.targetPosition.clone();
    const distToAnchor = camPos.distanceTo(anchor);
    
    // Mozgás anchor felé/felől
    const toAnchor = anchor.clone().sub(camPos).normalize();
    const moveAmount = this.zoomVelocity * distToAnchor;
    
    const newPos = camPos.clone().addScaledVector(toAnchor, moveAmount);
    
    // Min/Max távolság clamp
    const dir = newPos.clone().normalize();
    const terrainRadius = this.planet.terrain.getRadiusAt(dir);
    const minAllowed = terrainRadius + this.config.minDistance;
    const maxAllowed = this.config.maxDistance;
    
    if (newPos.length() < minAllowed) {
        newPos.normalize().multiplyScalar(minAllowed);
    } else if (newPos.length() > maxAllowed) {
        newPos.normalize().multiplyScalar(maxAllowed);
    }
    
    this.targetPosition.copy(newPos);
    
    // ORIENTÁCIÓ: Lassú forgatás anchor felé
    // Velocity-alapú easing (gyors zoom = erősebb forgatás)
    const velocityFactor = Math.abs(this.zoomVelocity) * 2;
    const rotationBlend = 0.08 * velocityFactor * velocityFactor;
    
    // Center falloff (képernyő közepén kevesebb forgatás)
    // ... projekció számítás ...
    
    const lookAtQuat = new THREE.Quaternion();
    // ... lookAt quaternion ...
    this.targetQuaternion.slerp(lookAtQuat, rotationBlend);
    
    // Damping
    this.zoomVelocity *= this.config.zoomDamping;
}
```

---

## 🎬 Fly-To Animáció

```javascript
flyTo(unit, onComplete) {
    this.isFlying = true;
    this.chaseTarget = null;
    
    const startPos = this.camera.position.clone();
    const landPos = /* ideal chase position behind unit */;
    
    const duration = 5.0; // Másodperc
    let elapsed = 0;
    
    this.flyFn = (dt) => {
        elapsed += dt;
        const t = Math.min(1.0, elapsed / duration);
        
        // Quintic ease-in-out (power of 5)
        const easePosition = t < 0.5
            ? 16 * t * t * t * t * t
            : 1 - Math.pow(-2 * t + 2, 6) / 2; // Power 6 landing
        
        // Ballisztikus ív
        const currentPos = startPos.clone().lerp(landPos, easePosition);
        const arcHeight = Math.sin(t * Math.PI) * peakHeight;
        currentPos.addScaledVector(upDirection, arcHeight);
        
        this.camera.position.copy(currentPos);
        
        // Orientáció (shortest path)
        if (this.camera.quaternion.dot(targetQuat) < 0) {
            targetQuat.negate(); // Ensure < 180° rotation
        }
        this.camera.quaternion.slerp(targetQuat, easePosition);
        
        return (t >= 1.0); // Return true when complete
    };
}
```

---

## 🚧 Collision Detection (Optimized)

```javascript
enforceTerrainDistance(position) {
    // 1. TERRAIN (always check - cheap)
    const dir = position.clone().normalize();
    const terrainRadius = this.planet.terrain.getRadiusAt(dir);
    const minAllowed = terrainRadius + this.config.minDistance;
    
    if (position.length() < minAllowed) {
        position.normalize().multiplyScalar(minAllowed);
    }
    
    // 2. OBSTACLE COLLISION (throttled)
    // Adaptive check frequency based on closest obstacle
    let checkInterval = 0;
    if (this.closestObstacleDistance > 30) {
        checkInterval = 0.3; // 300ms
    } else if (this.closestObstacleDistance > 15) {
        checkInterval = 0.1; // 100ms
    }
    // else: every frame
    
    this.obstacleCheckTimer += 0.016;
    if (this.obstacleCheckTimer < checkInterval) return position;
    this.obstacleCheckTimer = 0;
    
    let closestDist = Infinity;
    
    // 2a. ROCK COLLISION
    for (const rock of this.planet.rockSystem.rocks) {
        const dist = position.distanceTo(rock.position);
        if (dist < closestDist) closestDist = dist;
        
        const rockRadius = rock.scale.x * 1.2;
        const safeDistance = rockRadius + this.config.minRockDistance;
        
        if (dist < safeDistance) {
            const pushDir = position.clone().sub(rock.position).normalize();
            position.addScaledVector(pushDir, safeDistance - dist);
        }
    }
    
    // 2b. UNIT COLLISION (skip chase target)
    for (const unit of this.game.units) {
        if (unit === this.chaseTarget) continue;
        
        const dist = position.distanceTo(unit.position);
        if (dist < closestDist) closestDist = dist;
        
        const safeDistance = 1.5 + this.config.minUnitDistance;
        if (dist < safeDistance) {
            // Push away
        }
    }
    
    this.closestObstacleDistance = closestDist;
    return position;
}
```

---

## 📊 State Változók

| Változó | Típus | Leírás |
|---------|-------|--------|
| `isLMBDown` | bool | Bal gomb lenyomva |
| `isRMBDown` | bool | Jobb gomb lenyomva |
| `isDragging` | bool | LMB drag aktív |
| `isOrbiting` | bool | RMB orbit aktív |
| `isFreeLooking` | bool | Free look aktív |
| `isFlying` | bool | Fly-to animáció fut |
| `targetPosition` | Vector3 | Cél pozíció (lerp) |
| `targetQuaternion` | Quaternion | Cél orientáció (slerp) |
| `orbitPivot` | Vector3 | Orbit középpont |
| `orbitPivotNormal` | Vector3 | Felszín normál pivotnál |
| `zoomAnchor` | Vector3 | Zoom célpont |
| `zoomVelocity` | number | Aktuális zoom sebesség |
| `chaseTarget` | Unit | Követett unit |
| `closestObstacleDistance` | number | Legközelebbi akadály táv |

---

*Generálva: 2024-12-13*
