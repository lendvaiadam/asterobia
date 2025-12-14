# Spherical RTS Game - Technical Documentation

*Last updated: 2025-12-12*

## Overview

A web-based RTS game built with Three.js featuring a spherical planet with procedural terrain, units with waypoint-based pathfinding, fog of war, and cinematic camera controls.

---

## Architecture

### Core Files

| File | Purpose |
|------|---------|
| `src/Core/Game.js` | Main game loop, scene management, unit selection, waypoint system |
| `src/Core/InteractionManager.js` | Mouse/touch input handling, mode state machine |
| `src/Entities/Unit.js` | Unit behavior, path following, visual effects |
| `src/Camera/SphericalCameraController4.js` | Advanced camera with orbit, drag, free-look, chase modes |
| `src/World/Planet.js` | Terrain mesh, water, FOW shader integration |
| `src/World/RockSystem.js` | Procedural rock generation and placement |
| `src/World/FogOfWar.js` | GPU-based fog of war system |

---

## Unit System

### Selection States

| State | Visual Effect |
|-------|---------------|
| **Hover** | Strong white glow (emissive 2.0), highlight ring |
| **Selected** | Subtle green glow (`#00ff9d`), pulsing spotlight on terrain |
| **Neither** | No glow |

### Path Following

**Simple Sequential Algorithm:**
1. Unit follows `unit.path[]` (dense array of terrain-projected curve points)
2. `pathIndex` increments as unit reaches each point
3. For closed paths: wraps from `path.length-1` to `0`
4. **Never goes backwards** - always moves to next point

**Path Update Logic:**
```
When waypoint moved/added/reordered:
1. Find closest point on NEW path
2. If unit far from path (>0.5 units): SNAP to closest point
3. Set pathIndex = closestIdx + 1 (always forward)
4. For closed paths: wrap around if needed
```

### Waypoint System

- Control points stored in `unit.waypointControlPoints[]`
- Catmull-Rom curve generates smooth path
- Path projected onto terrain surface
- Visualized as TubeGeometry with depth testing

### Tire Tracks

- Dual tracks (left/right wheelbase)
- 12-level opacity fade over 30 seconds
- Multiply blending with terrain
- Indentation shadow effect (sun-based)
- Specular highlight on sun-facing inner edge

---

## Camera System

### Control Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Pan** | LMB Drag | Pure translation, no rotation |
| **Orbit** | RMB Drag | Rotate around picked surface point |
| **Free-Look** | LMB+RMB | Camera stays, view rotates |
| **Chase** | Double-click unit | Follow unit with configurable offset |
| **Zoom** | Scroll | Zoom toward cursor position |

### Pan (LMB Drag)

- Camera moves opposite to drag direction
- Pure translation - no rotation applied
- Speed scales with zoom level (1:1 feel)
- Like Google Maps drag behavior

### Orbit (RMB Drag)

- Pivot point set on RMB down, stays fixed
- Rotation slows near planet center (10% at surface, 100% at 3x radius)
- Prevents "wild spinning" when close to planet

### Chase Mode

- Camera follows unit from behind
- Azimuth drifts to 0 (behind) when unit moves
- Elevation drifts to ideal 3rd-person angle (~17°)
- Occlusion detection lifts camera over obstacles

### Fly-To Animation

- Smooth cinematic transition to target
- POI arrives 20% earlier than camera
- Ease-in-out timing curves

---

## Visual Effects

### Selection Glow

**When selected:**
- Spotlight from above (intensity 25, pulsing)
- Glow ring at feet (additive blending)
- Body emissive glow (green `#00ff9d`, intensity 0.5-0.8)

**When hovered (not selected):**
- Strong white emissive (intensity 2.0)
- Highlight ring (opacity 0.6)

### Contact Shadows

- Soft oval decals under units and rocks
- Shader-based radial falloff
- Prevents "floating" appearance

### Rock System

- 40 procedurally generated rocks
- Sunk 15% into terrain for flush contact
- **Shadow extension**: invisible cylinder below each rock casts shadows into "under" area
- Prevents light bleeding at rock-terrain junction

---

## Fog of War

### States

| State | Terrain | Water |
|-------|---------|-------|
| **Visible** | Full color | Full color with transparency |
| **Explored** | Desaturated, darker (20% brightness) | Darker, high-contrast memory |
| **Unexplored** | Black | **Completely invisible** (discard) |

### Implementation

- GPU-based with two render targets (explored, visible)
- Per-fragment calculation in terrain/water/rock shaders
- Unit vision range controls reveal radius

---

## Interaction States

```
IDLE → MOUSE_DOWN → DRAGGING_TERRAIN
                  → DRAGGING_MARKER
                  → DRAWING_PATH
```

### Click Actions

| Target | Action |
|--------|--------|
| Unit | Select + Fly-To |
| Terrain | Deselect + Close Panel |
| Terrain (Shift) | Add Waypoint |
| Waypoint Marker | (none, wait for drag) |
| Start Marker | Close Path Loop |

### Hover Effects

| Target | Effect |
|--------|--------|
| Unit (auto-following path) | Unit slows and stops |
| Unit (manual control) | No stop |
| Waypoint Marker | Highlight marker + command queue sync |

---

## UI System

### Unit Tabs

- Generated dynamically for each unit
- Accent color: `#00ff9d`
- Active tab has bottom border and gradient

### Command Queue Panel

- Appears on double-click (focus mode)
- Drag-and-drop reordering
- Icons for command types (Start, Move, Attack)
- Hover sync with map markers

### Split-Screen Mode

- Panel slides up from bottom
- Camera adjusts to fit visible area

---

## Technical Decisions

### Why Segment Tracking Was Removed

The original segment-based path following caused bugs:
- Complex math for segment boundaries
- Back-and-forth movement at segment transitions
- Underground movement when segments miscalculated

**Solution**: Simple sequential following using the dense path array directly.

### Why Path Snapping

When waypoints are moved, the path shape changes. Without snapping:
- Unit might be "between" path points in 3D space
- Movement vector could point through terrain

**Solution**: Snap unit to closest path point, then continue forward.

### Why Invisible Shadow Extensions

Shadow mapping has "peter panning" artifacts at surface contacts. On the shadow side of rocks:
- Light appears to leak under the rock
- Creates unnatural bright band

**Solution**: Invisible cylinder geometry extends below rock, casts shadows into the "under" area.

---

## File Structure

```
_GAME_3_/
├── index.html
├── css/style.css
├── src/
│   ├── Main.js
│   ├── Core/
│   │   ├── Game.js
│   │   └── InteractionManager.js
│   ├── Camera/
│   │   └── SphericalCameraController4.js
│   ├── Entities/
│   │   └── Unit.js
│   ├── World/
│   │   ├── Planet.js
│   │   ├── Terrain.js
│   │   ├── RockSystem.js
│   │   ├── RockMeshGenerator.js
│   │   └── FogOfWar.js
│   ├── Math/
│   │   └── SphericalMath.js
│   └── UI/
│       ├── CameraDebug.js
│       └── RockDebug.js
└── docs/
    └── controls.md
```

---

## Configuration

### Default Values

| Parameter | Value |
|-----------|-------|
| Rock Count | 40 |
| Unit Speed | 5.0 |
| Unit Ground Offset | 0.5 |
| Selection Ring Radius | 2.5 |
| Chase Height | 10 |
| Chase Distance | 15 |
| Orbit Sensitivity | 0.003 |

---

## Running the Game

```bash
cd _GAME_3_
npx http-server . -c-1 -p 8081
```

Open: `http://localhost:8081`
