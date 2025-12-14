# Core Modul Dokumentáció

> **Fájlok:** Game.js, Input.js, InteractionManager.js
> 
> Ez a modul a játék központi vezérlését és az input kezelést tartalmazza.

---

## 📦 Game.js (~1400 sor)

A `Game` osztály a teljes alkalmazás központi hub-ja. Minden más rendszer itt kerül példányosításra és összekapcsolásra.

### Inicializálás (constructor)

```javascript
export class Game {
    constructor() {
        // 1. RENDERER
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 2. SCENE
        this.scene = new THREE.Scene();
        
        // 3. STARFIELD (10000 pont a távolban)
        const starCount = 10000;
        // ... gömb eloszlás pozíciók ...
        
        // 4. CAMERA
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        
        // 5. LIGHTING
        // - AmbientLight: 0.15 intenzitás, árnyékos oldal világítás
        // - HemisphereLight: 0.2 intenzitás, ég/föld szín különbség
        // - DirectionalLight (sunLight): 2.0 intenzitás, shadow map 4096x4096
        
        // 6. PLANET
        this.planet = new Planet();
        this.scene.add(this.planet.mesh);
        this.scene.add(this.planet.waterMesh);
        
        // 7. CAMERA CONTROLS
        this.cameraControls = new SphericalCameraController4(
            this.camera, 
            this.renderer.domElement, 
            this.planet
        );
        this.cameraControls.game = this; // Referencia unit collision-hoz
        
        // 8. ENTITIES
        this.units = [];
        this.loadUnits(); // GLTF modellek betöltése
        
        // 9. FOG OF WAR
        this.fogOfWar = new FogOfWar(this.renderer, this.planet.terrain.params.radius);
        
        // 10. ROCKS
        this.rockSystem = new RockSystem(this, this.planet);
        this.rockSystem.generateRocks();
        
        // 11. UI / DEBUG
        this.debugPanel = new DebugPanel(this);
        this.cameraDebug = new CameraDebug(this);
        
        // 12. INTERACTION
        this.interactionManager = new InteractionManager(this);
    }
}
```

### Unit Betöltés

```javascript
loadUnits() {
    const loader = new GLTFLoader();
    const models = ['1.glb', '2.glb', '3.glb', '4.glb', '5.glb'];
    
    models.forEach((modelName, index) => {
        loader.load(`./modellek/${modelName}`, (gltf) => {
            const unit = new Unit(this.planet);
            unit.name = `Unit ${index + 1}`;
            
            // GLTF modell beillesztése
            unit.mesh = gltf.scene;
            unit.mesh.scale.set(0.5, 0.5, 0.5);
            this.scene.add(unit.mesh);
            
            // Random pozíció a bolygón
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            // ... pozíció számítás ...
            
            this.units.push(unit);
            
            // Első unit kiválasztása alapértelmezetten
            if (index === 0) {
                this.selectedUnit = unit;
                this.positionCameraAboveUnit(unit);
            }
        });
    });
}
```

### Selection Flow

```javascript
// 1. Unit kiválasztás (click-re)
selectUnit(unit) {
    this.deselectUnit(); // Előző deselect
    this.selectedUnit = unit;
    unit.setSelection(true);
    this.showUnitMarkers(unit); // Útvonal megjelenítés
    this.updateTabActiveState();
}

// 2. Kiválasztás megszüntetése
deselectUnit() {
    if (this.selectedUnit) {
        this.selectedUnit.setSelection(false);
        this.hideUnitMarkers(this.selectedUnit);
        this.selectedUnit = null;
    }
    this.exitFocusMode();
}

// 3. Focus mode (double-click után)
enterFocusMode(unit) {
    this.focusedUnit = unit;
    this.cameraControls.setChaseTarget(unit); // Kamera követi
    this.openPanel();
    this.updatePanelContent(unit);
}
```

### Unit Tab Rendszer

```javascript
generateUnitTabs() {
    const tabContainer = document.getElementById('unit-tabs');
    
    this.units.forEach((unit, index) => {
        const tab = document.createElement('div');
        tab.className = 'unit-tab';
        tab.textContent = `Unit ${index + 1}`;
        
        tab.addEventListener('click', () => {
            this.onUnitTabClick(index);
        });
        
        tabContainer.appendChild(tab);
    });
}

// Tab klikk = fly-to VAGY panel toggle
onUnitTabClick(index) {
    const unit = this.units[index];
    
    if (this.selectedUnit === unit && this.isFocusMode) {
        // Már kiválasztva ÉS fókuszban → panel toggle
        this.togglePanel();
    } else {
        // Új unit vagy fókusz aktívlás → fly-to
        this.selectAndFlyToUnit(unit);
    }
}
```

### Path Drawing (Útvonal Rajzolás)

```javascript
startPathDrawing(unit) {
    this.isDrawingPath = true;
    this.pathUnit = unit;
    
    // Kezdőpont = unit jelenlegi pozíciója
    this.liveControlPoints = [unit.position.clone()];
    
    // Zöld előnézet vonal
    this.livePathLine = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.5 })
    );
}

updatePathDrawing(mouseNDC) {
    // Raycast a terepen
    const hitPoint = this.raycastTerrain(mouseNDC);
    if (!hitPoint) return;
    
    // Távolság check (ne legyen túl sok pont)
    const lastPoint = this.liveControlPoints[this.liveControlPoints.length - 1];
    if (lastPoint.distanceTo(hitPoint) > 2.0) {
        this.liveControlPoints.push(hitPoint.clone());
        this.updateLivePathVisual();
    }
}

finishPathDrawing() {
    const unit = this.pathUnit;
    
    // Control points -> Catmull-Rom spline -> Dense path
    const curve = new THREE.CatmullRomCurve3(this.liveControlPoints);
    const densePoints = curve.getPoints(100);
    
    unit.setPath(densePoints);
    unit.waypointControlPoints = [...this.liveControlPoints];
    
    this.updateWaypointCurve(); // Zöld tube megjelenítés
    this.isDrawingPath = false;
}
```

### Animate Loop

```javascript
animate(time) {
    requestAnimationFrame(this.animate);
    
    const dt = this.clock.getDelta();
    
    // 1. Input update
    const keys = this.input.getKeys();
    
    // 2. Units update
    this.units.forEach(unit => {
        unit.update(keys, dt);
        
        // FOW update ha van vision
        if (unit.visionRadius > 0) {
            this.fogOfWar.updateVisibility(unit.position, unit.visionRadius);
        }
    });
    
    // 3. Camera update
    this.cameraControls.update(dt);
    
    // 4. Render
    this.renderer.render(this.scene, this.camera);
}
```

---

## 📦 Input.js (58 sor)

Egyszerű billentyűzet állapot kezelő.

```javascript
export class Input {
    constructor() {
        this.keys = {
            forward: false,   // W, ArrowUp
            backward: false,  // S, ArrowDown
            left: false,      // A, ArrowLeft
            right: false,     // D, ArrowRight
            up: false,        // Space
            down: false       // ShiftLeft
        };
        
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
    
    updateKey(code, isPressed) {
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = isPressed;
                break;
            // ... többi gomb ...
        }
    }
    
    getKeys() {
        return this.keys;
    }
}
```

---

## 📦 InteractionManager.js (386 sor)

Egér interakciók kezelése a V3 specifikáció szerint:
- **Egy interakció per MouseDown→MouseUp ciklus**
- Módok: SELECT, DESELECT, TERRAIN_DRAG, PATH_DRAW

### State Machine

```javascript
export class InteractionManager {
    constructor(game) {
        this.game = game;
        this.DRAG_THRESHOLD = 3; // pixels
        
        // State: IDLE, MOUSE_DOWN, DRAGGING_TERRAIN, DRAWING_PATH
        this.state = 'IDLE';
        
        this.startMouse = new THREE.Vector2();
        this.mouseDownUnit = null;
        this.mouseDownTerrain = null;
        
        // Event listeners (CAPTURE phase for priority)
        this.domElement.addEventListener('mousedown', this.onMouseDown, { capture: true });
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
    }
}
```

### MouseDown Decision

```javascript
onMouseDown(event) {
    // RMB = Orbit (pass to camera)
    if (event.button === 2) {
        // Exception: RMB during Path Draw = Attack Command
        if (this.state === 'DRAWING_PATH') {
            event.stopImmediatePropagation();
            return;
        }
        return; // Let camera handle RMB
    }
    
    // LMB only
    this.state = 'MOUSE_DOWN';
    this.startMouse.set(event.clientX, event.clientY);
    
    // 1. Raycast Waypoint Marker? (Drag priority)
    const hitMarker = this.raycastWaypointMarker();
    if (hitMarker) {
        this.mouseDownMarker = hitMarker;
        event.stopImmediatePropagation(); // Block camera
        return;
    }
    
    // 2. Raycast Unit?
    const hitUnit = this.raycastUnit();
    if (hitUnit) {
        this.mouseDownUnit = hitUnit;
        return;
    }
    
    // 3. Raycast Terrain
    this.mouseDownTerrain = this.raycastTerrain();
    
    // Disable camera drag until decision
    this.game.cameraControls.isLMBDown = false;
}
```

### MouseMove → State Transition

```javascript
onMouseMove(event) {
    if (this.state === 'IDLE') {
        this.handleHover(); // Hover highlight
        return;
    }
    
    if (this.state === 'MOUSE_DOWN') {
        const dist = this.currentMouse.distanceTo(this.startMouse);
        
        if (dist > this.DRAG_THRESHOLD) {
            // DECISION PONT
            if (this.mouseDownMarker) {
                this.state = 'DRAGGING_MARKER';
            } else if (this.mouseDownUnit) {
                this.state = 'DRAWING_PATH';
                this.game.startPathDrawing(this.mouseDownUnit);
            } else if (this.mouseDownTerrain) {
                this.state = 'DRAGGING_TERRAIN';
                this.game.cameraControls.startDrag(this.mouseDownTerrain);
            }
        }
    }
    
    // Continue active state
    if (this.state === 'DRAWING_PATH') {
        this.game.updatePathDrawing(this.mouseNDC);
    }
}
```

### MouseUp → Action

```javascript
onMouseUp(event) {
    if (this.state === 'MOUSE_DOWN') {
        // CLICK (no drag happened)
        if (this.mouseDownUnit) {
            this.game.selectAndFlyToUnit(this.mouseDownUnit);
        } else if (this.mouseDownTerrain) {
            if (event.shiftKey && this.game.selectedUnit) {
                this.game.addWaypoint(this.mouseDownTerrain);
            } else {
                this.game.deselectUnit();
            }
        }
    } else if (this.state === 'DRAWING_PATH') {
        this.game.finishPathDrawing();
    } else if (this.state === 'DRAGGING_MARKER') {
        // Update control point from marker position
        // ...
    }
    
    this.state = 'IDLE';
}
```

### Hover Logic

```javascript
handleHover() {
    // 1. Direct raycast
    let hitUnit = this.raycastUnit();
    
    // 2. Screen-space proximity (80px hover zone)
    if (!hitUnit) {
        const hoverRadiusScreen = 80;
        this.game.units.forEach(unit => {
            const screenPos = unit.position.clone().project(this.game.camera);
            // ... distance check ...
            if (dist < hoverRadiusScreen) hitUnit = unit;
        });
    }
    
    // Highlight change
    if (hitUnit !== this.hoveredUnit) {
        if (this.hoveredUnit) {
            this.hoveredUnit.setHighlight(false);
            this.hoveredUnit.setHover(false);
        }
        if (hitUnit) {
            hitUnit.setHighlight(true);
            if (hitUnit.isFollowingPath) {
                hitUnit.setHover(true); // Stop movement temporarily
            }
        }
        this.hoveredUnit = hitUnit;
    }
}
```

---

## 🔗 Kapcsolatok

```
InteractionManager
    ↓ events
    ↓ raycast calls
Game
    ↓ manages
    ├── Units[]
    ├── CameraControls
    └── FogOfWar

Input → Game.animate() → Unit.update(keys)
```

---

*Generálva: 2024-12-13*
