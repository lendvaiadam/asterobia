# Controls Specification

## Mouse Controls

### Left Mouse Button (LMB)

| Action | Target | Result |
|--------|--------|--------|
| Click | Unit | Select + Fly-To |
| Click | Terrain | Deselect + Close Panel |
| Shift+Click | Terrain | Add Waypoint (if Unit selected) |
| Drag | Terrain | **Pan View** (translate camera, no rotation) |
| Drag | Waypoint Marker | Move Marker (Control Point) |
| Click | Start Marker (0) | Close Path Loop (if 3+ points) |

**Pan View Behavior (LMB Drag):**
- On LMB drag, the camera moves in the **opposite direction** of drag
- This is **pure translation** - no rotation
- Like Google Maps: you're sliding the map under your finger
- Speed scales with zoom level (1:1 feel)

### Right Mouse Button (RMB)

| Action | Target | Result |
|--------|--------|--------|
| Drag | Any | **Orbit** around clicked point |

**Orbit Constraints:**
- Pivot point is set on RMB down and **stays fixed** throughout drag
- Pivot does NOT move when camera descends to terrain
- Rotation effect **gradually slows** when camera approaches planet center
- Effect scales from 100% at 3x planet radius to 10% at planet surface
- Behavior is **identical** whether on planet surface or in sky

### LMB + RMB Together

| Action | Result |
|--------|--------|
| Both held + Move | **Free-Look** (camera stays, view rotates) |

### Scroll Wheel

| Action | Result |
|--------|--------|
| Scroll | Zoom toward/away from cursor position |

---

## Hover Behavior

### Unit Hover

| Condition | Behavior |
|-----------|----------|
| Unit is **auto-following path** | Unit slows and stops (ease-in) |
| Unit is **manually controlled** | Unit does NOT stop |
| Mouse leaves Unit | Unit resumes path (ease-out) |

### Waypoint Marker Hover

| Action | Result |
|--------|--------|
| Hover on Marker | Highlight Marker + Highlight in Command Queue |
| Click on Marker | Select Marker (both highlighted) |

---

## Double-Click

| Target | Result |
|--------|--------|
| Unit | Open Focus Panel (detailed view) |

---

## Keyboard Controls

*(To be expanded)*

| Key | Action |
|-----|--------|
| W/↑ | Unit Forward |
| S/↓ | Unit Backward |
| A/← | Unit Turn Left |
| D/→ | Unit Turn Right |
| Tab | Cycle Selected Unit |
| Esc | Deselect / Close Panel |

---

## Edge Cases

1. **Path Crossing**: Unit stays on its current segment, doesn't jump to crossing path
2. **Swimming**: Unit attempts to enter water, backs up, shakes, reverses
3. **Rocks**: Unit attempts to climb, rolls back, reverses (like water)
4. **End of Path**: Unit decelerates and stops smoothly (ease-in)
5. **Looping Path**: Unit continuously follows closed loop
