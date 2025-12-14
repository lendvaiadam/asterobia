# Entities Modul Dokumentáció

> **Fájl:** Unit.js (~1200 sor)
> 
> Játék egységek logikája: mozgás, útvonal követés, víz reakciók, selection visuals.

---

## 🤖 Unit Osztály

### Alapvető Tulajdonságok

```javascript
export class Unit {
    constructor(planet) {
        this.planet = planet;
        this.speed = 5.0;
        this.turnSpeed = 2.0;
        this.groundOffset = 0.5;      // Magasság terep felett
        this.smoothingRadius = 2.0;   // Normál átlagolás rádiusz
        
        // Speed control (hover slowdown)
        this.speedFactor = 1.0;
        this.hoverState = false;
        
        // Water capabilities
        this.canWalkUnderwater = false;
        this.canSwim = false;
        
        // Water state machine
        this.waterState = 'normal'; // normal, wading, escaping, shaking, backing, stopped
        this.waterSlowdownFactor = 1.0;
        
        // Position & orientation
        this.position = new THREE.Vector3(0, 10, 0);
        this.quaternion = new THREE.Quaternion();
        this.headingQuaternion = new THREE.Quaternion();
        
        // Path system
        this.waypointControlPoints = [];
        this.waypointMarkers = [];
        this.path = [];
        this.pathIndex = 0;
        this.isFollowingPath = false;
        this.loopingEnabled = false;
        this.isPathClosed = false;
        
        // Keyboard override
        this.savedPath = null;
        this.keyboardOverrideTimer = 0;
        this.isKeyboardOverriding = false;
        
        this.mesh = this.createMesh();
        this.snapToSurface();
    }
}
```

### Mesh Felépítés (Lights, Shadows, Glow)

```javascript
createMesh() {
    const group = new THREE.Group();
    
    // 1. BODY (default cone, replaced by GLTF)
    const coneGeo = new THREE.ConeGeometry(0.3, 1, 8);
    this.bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(coneGeo, this.bodyMaterial);
    group.add(body);
    
    // 2. CONTACT SHADOW (soft blob under unit)
    const contactShadowMat = new THREE.ShaderMaterial({
        fragmentShader: `
            varying vec2 vUv;
            void main() {
                float dist = length(vUv - vec2(0.5, 0.5)) * 2.0;
                float alpha = smoothstep(1.0, 0.0, dist) * 0.5;
                gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
            }
        `,
        transparent: true,
        depthWrite: false
    });
    // ...
    
    // 3. SELECTION SPOTLIGHT (projects ring on terrain)
    this.spotLight = new THREE.SpotLight(0x00ff88, 0.0);
    this.spotLight.angle = Math.PI / 3;  // 60°
    this.spotLight.penumbra = 0.5;
    this.spotLight.distance = 25;
    this.spotLight.position.set(0, 8, 0); // Above unit
    this.spotLight.castShadow = true;
    group.add(this.spotLight);
    
    // 4. GLOW RING (pulsating)
    const glowGeo = new THREE.RingGeometry(1.5, 3.5, 64);
    this.glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    this.glowRing = new THREE.Mesh(glowGeo, this.glowMaterial);
    group.add(this.glowRing);
    
    // 5. HEADLIGHTS (front spotlights)
    this.headlightLeft = new THREE.SpotLight(0xffffee, 3.0);
    this.headlightLeft.angle = Math.PI / 8;
    this.headlightLeft.distance = 15;
    this.headlightLeft.position.set(-0.2, 0.3, 0.5);
    this.headlightLeft.castShadow = true;
    group.add(this.headlightLeft);
    // ... right headlight similar ...
    
    return group;
}
```

### Selection Visuals (Pulsating)

```javascript
updateSelectionVisuals(dt) {
    const targetIntensity = this.isSelected ? 1.0 : 0.0;
    
    // Smooth transition
    const lerpSpeed = this.isSelected ? 5.0 : 3.0;
    this.selectionIntensity = THREE.MathUtils.lerp(this.selectionIntensity, targetIntensity, dt * lerpSpeed);
    
    if (this.selectionIntensity < 0.01) {
        this.spotLight.intensity = 0;
        this.glowMaterial.opacity = 0;
        this.glowRing.visible = false;
        return;
    }
    
    this.glowRing.visible = true;
    this.timeAccumulator += dt;
    
    // Pulse (2 Hz sine wave)
    const pulse = (Math.sin(this.timeAccumulator * 4.0) * 0.5 + 0.5);
    
    // Spotlight intensity
    const spotMax = 60.0;
    this.spotLight.intensity = this.selectionIntensity * (spotMax * 0.7 + spotMax * 0.3 * pulse);
    
    // Glow ring opacity
    this.glowMaterial.opacity = this.selectionIntensity * (0.5 + 0.3 * pulse);
    
    // Body emissive (green accent)
    this.bodyMaterial.emissive = new THREE.Color(0x00ff9d);
    this.bodyMaterial.emissiveIntensity = this.selectionIntensity * (0.5 + 0.3 * pulse);
    
    // Glow ring breathing scale
    const scale = 1.0 + 0.1 * pulse;
    this.glowRing.scale.set(scale, 1, scale);
}
```

---

## 🚗 Update Loop

```javascript
update(input, dt) {
    // 1. Selection visuals
    if (this.isSelected || this.selectionIntensity > 0.01) {
        this.updateSelectionVisuals(dt);
    }
    
    // 2. Hover speed control (smooth stop/resume)
    const targetFactor = this.hoverState ? 0.0 : 1.0;
    const lerpSpeed = this.hoverState ? 8.0 : 4.0; // Fast stop, slower resume
    this.speedFactor = THREE.MathUtils.lerp(this.speedFactor, targetFactor, dt * lerpSpeed);
    
    let moveSpeed = this.speed * dt * this.speedFactor * this.waterSlowdownFactor;
    
    // 3. PATH FOLLOWING (if active)
    if (this.path && this.path.length > 0 && this.isFollowingPath && !this.pausedByCommand) {
        // ... path following logic ...
    }
    
    // 4. KEYBOARD OVERRIDE SYSTEM
    if (hasKeyboardInput) {
        if (!this.isKeyboardOverriding && this.isFollowingPath) {
            // Save path state
            this.savedPath = [...this.path];
            this.savedPathIndex = this.pathIndex;
            this.isKeyboardOverriding = true;
            this.isFollowingPath = false;
        }
    } else if (this.isKeyboardOverriding) {
        this.keyboardOverrideTimer += dt;
        if (this.keyboardOverrideTimer >= 4.0 && this.savedPath) {
            // Resume path after 4 seconds
            this.path = this.savedPath;
            this.pathIndex = this.savedPathIndex;
            this.isKeyboardOverriding = false;
            this.isFollowingPath = true;
        }
    }
    
    // 5. ORIENTATION (sphere surface aligned)
    const currentSphereNormal = this.position.clone().normalize();
    const headingForward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.headingQuaternion);
    // ... orthonormalize forward to normal ...
    
    // 6. WATER STATE MACHINE
    // ... wading, backing, shaking behavior ...
    
    // 7. APPLY MOVEMENT
    const forwardWorld = new THREE.Vector3(0, 0, 1).applyQuaternion(this.headingQuaternion);
    this.position.addScaledVector(forwardWorld, moveSpeed * moveInput);
    
    // 8. SNAP TO SURFACE
    this.snapToSurface();
    
    // 9. UPDATE MESH
    this.mesh.position.copy(this.position);
    this.mesh.quaternion.copy(/* visual quaternion with tilt */);
}
```

### Path Following

```javascript
// Simple sequential path following
while (remainingMove > 0 && this.waterState === 'normal') {
    // Bounds check
    if (this.pathIndex >= this.path.length) {
        if (this.loopingEnabled || this.isPathClosed) {
            this.pathIndex = 0;
        } else {
            this.isFollowingPath = false;
            break;
        }
    }
    
    const currentTarget = this.path[this.pathIndex];
    const distToTarget = this.position.distanceTo(currentTarget);
    
    if (distToTarget <= remainingMove) {
        // Reached this point
        this.position.copy(currentTarget);
        remainingMove -= distToTarget;
        this.pathIndex++;
    } else {
        // Move towards
        const dir = currentTarget.clone().sub(this.position).normalize();
        this.position.addScaledVector(dir, remainingMove);
        remainingMove = 0;
    }
}

// ORIENTATION: Use curve tangent
let lookAhead = this.pathIndex + 3;
if (lookAhead >= this.path.length && this.isPathClosed) {
    lookAhead = lookAhead % this.path.length;
}

const tangent = this.path[lookAhead].clone().sub(this.position).normalize();
// ... build quaternion from tangent + sphere normal ...
```

### Water Behavior State Machine

```javascript
// States: normal → wading → backing (shake) → escaping → normal

if (this.waterState === 'normal') {
    if (isUnderwater && !canEnterWater && moveInput > 0) {
        this.waterState = 'wading';
    }
}
else if (this.waterState === 'wading') {
    // Gradual slowdown
    const depthFraction = Math.min(1.0, waterDepth / stopDepth);
    this.waterSlowdownFactor = 1.0 - (depthFraction * 0.9);
    
    if (waterDepth > stopDepth) {
        // REFUSAL! Start backing out with shake
        this.waterState = 'backing';
        this.waterBackupTimer = 0;
        this.waterShakeTimer = 1.5;
        this.waterSlowdownFactor = 0.0;
    }
}
else if (this.waterState === 'backing') {
    moveInput = -1; // Force backward
    
    // Shake effect (random amplitude/frequency)
    if (this.waterShakeTimer > 0) {
        this.waterShakeTimer -= dt;
        const shakeAngle = amplitude * Math.sin(elapsedTime * frequency * 2 * Math.PI);
        const shakeQuat = new THREE.Quaternion().setFromAxisAngle(terrainNormal, shakeAngle);
        this.headingQuaternion.premultiply(shakeQuat);
    }
    
    if (!isUnderwater) {
        this.waterState = 'normal'; // Escaped!
    }
}
```

---

## 🔧 Helper Methods

```javascript
// Snap to terrain surface
snapToSurface() {
    const dir = this.position.clone().normalize();
    const terrainRadius = this.planet.terrain.getRadiusAt(dir);
    this.position.copy(dir.multiplyScalar(terrainRadius + this.groundOffset));
}

// Get averaged normal (smooth hills)
getSmoothedNormal() {
    // Sample multiple points around position
    // Average their normals for smoother orientation
}

// Hover control
setHover(state) {
    this.hoverState = state;
    // Highlight effect
    if (state) {
        this.bodyMaterial.emissive = new THREE.Color(0xffffff);
        this.bodyMaterial.emissiveIntensity = 2.0;
    }
}

// Selection control
setSelection(active) {
    this.isSelected = active;
    // Visuals updated in update loop
}
```

---

*Generálva: 2024-12-13*
