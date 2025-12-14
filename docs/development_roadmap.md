# Fejlesztési Ütemterv - Részletes Roadmap

*Verzió: 1.0 | Frissítve: 2025-12-12*

---

## Bevezetés

Ez a dokumentum részletesen leírja a játék fejlesztésének hátralevő lépéseit. A fejlesztés **fázisokra** van bontva, minden fázis **mérföldköveket** tartalmaz, és minden mérföldkő **konkrét feladatokból** áll.

### Jelenlegi Állapot

A játék alapjai már működnek:
- ✅ Spherical planet rendering
- ✅ Waypoint-based path following
- ✅ Advanced camera system (orbit, chase, fly-to)
- ✅ Fog of War
- ✅ Basic rock system
- ✅ Unit selection & UI panels

### Fejlesztési Filozófia

1. **Vertikális szelet első**: Egy funkció teljesen működjön, mielőtt a következőre lépünk
2. **Folyamatos tesztelés**: Minden mérföldkő után játszható állapot
3. **Függőségek tiszteletben tartása**: A lentebb lévő fázisok a fentiekre építenek

---

## Fázis 1: Core Gameplay Finomítás

> **Cél**: A meglévő rendszerek stabilizálása és hiányzó alapfunkciók pótlása
> **Becsült idő**: 2-3 hét
> **Függőség**: Nincs (ez az alap)

### 1.1 Mérföldkő: Víz Interakció

**Miért fontos**: A unitoknak reálisan kell reagálniuk a vízre - ez a bolygó egyik természetes akadálya.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 1.1.1 | Unit capability flags | `canSwim` és `canWalkUnderwater` property-k hozzáadása | `Unit.js` |
| 1.1.2 | Water edge detection | Útvonal ellenőrzése: belép-e vízbe | `Unit.js`, `Game.js` |
| 1.1.3 | Ease-in megállás | Ha útvonal vízbe vezet, unit lassulva megáll a parton | `Unit.js` |
| 1.1.4 | Swimming animation state | Úszó állapot és animáció előkészítése | `Unit.js` |
| 1.1.5 | Underwater walking | Tengerfenéken sétáló unit speciális mozgása | `Unit.js` |

**Implementációs részletek**:
```javascript
// Unit.js - új property-k
this.canSwim = false;        // Tud-e úszni a felszínen
this.canWalkUnderwater = false; // Tud-e a tengerfenéken járni

// Path checking
const waterLevel = this.planet.terrain.params.waterLevel;
const targetHeight = this.planet.terrain.getRadiusAt(targetDir);
const isUnderwater = targetHeight < waterLevel;

if (isUnderwater && !this.canSwim && !this.canWalkUnderwater) {
    // Megállás ease-in-nel
    this.targetSpeed = 0;
    this.isFollowingPath = false;
}
```

**Tesztelési kritériumok**:
- [ ] Unit megáll a vízparton
- [ ] `canSwim = true` unitok átúsznak
- [ ] `canWalkUnderwater = true` unitok végigmennek a fenéken
- [ ] Nincs "ugrás" vagy teleportálás

---

### 1.2 Mérföldkő: Szikla Collision

**Miért fontos**: A sziklák jelenleg csak vizuálisak - a unitoknak ki kell kerülniük őket.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 1.2.1 | Rock collision data | Szikla pozíciók és sugarak exportálása | `RockSystem.js` |
| 1.2.2 | Simple sphere collision | Alap ütközésvizsgálat sphere-sphere alapon | `Unit.js` |
| 1.2.3 | Path obstacle check | Útvonal tervezéskor sziklák figyelembevétele | `Game.js` |
| 1.2.4 | Unit push-back | Ha unit nekimegy sziklának, visszatolás | `Unit.js` |
| 1.2.5 | Climbing capability | `canClimb` flag és mászás logika | `Unit.js` |

**Implementációs részletek**:
```javascript
// RockSystem.js - collision data export
getRockColliders() {
    return this.rocks.map(rock => ({
        position: rock.position.clone(),
        radius: rock.userData.collisionRadius || 1.0
    }));
}

// Unit.js - collision check
checkRockCollision(newPosition) {
    const colliders = this.game.rockSystem.getRockColliders();
    for (const rock of colliders) {
        const dist = newPosition.distanceTo(rock.position);
        if (dist < rock.radius + this.collisionRadius) {
            return rock; // Ütközés!
        }
    }
    return null;
}
```

**Függőségek**: Semmi (párhuzamosan fejleszthető 1.1-gyel)

---

### 1.3 Mérföldkő: Navmesh Alapok

**Miért fontos**: A jelenlegi path following egyenes vonalakból áll - valódi útvonaltervezés kell az akadályok kerüléshez.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 1.3.1 | Navmesh generálás | Spherical navmesh a bolygó felszínén | Új: `Navmesh.js` |
| 1.3.2 | Obstacle marking | Sziklák és víz "unwalkable" jelölése | `Navmesh.js` |
| 1.3.3 | A* pathfinding | Útvonalkeresés a navmesh-en | `Navmesh.js` |
| 1.3.4 | Path smoothing | Catmull-Rom simítás a durva útvonalon | `Game.js` |
| 1.3.5 | Dynamic update | Navmesh frissítése ha akadály változik | `Navmesh.js` |

**Implementációs megközelítés**:
- Spherical triangle mesh a bolygó felszínén
- Minden háromszög: walkable / unwalkable / costly
- A* algoritmus a háromszög-gráfon
- Funnel algorithm a simításhoz

**Függőségek**: 1.1 (víz) és 1.2 (sziklák) - ezek nélkül nincs mit jelölni

---

## Fázis 2: AI Alaprendszer

> **Cél**: Az AI-copilot és a unit kontroll rendszer alapjainak megépítése
> **Becsült idő**: 3-4 hét
> **Függőség**: Fázis 1 (működő mozgás és akadálykezelés)

### 2.1 Mérföldkő: Controller Architektúra

**Miért fontos**: A tanuló AI-hoz tiszta kontroller interfész kell - ki irányítja a unitot?

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 2.1.1 | IController interface | Alap kontroller interfész definiálása | Új: `IController.js` |
| 2.1.2 | PlayerController | Közvetlen játékos input kezelése | Új: `PlayerController.js` |
| 2.1.3 | RuleBasedController | FSM/BT alapú AI kontroller | Új: `RuleBasedController.js` |
| 2.1.4 | Controller switching | Runtime kontroller váltás | `Unit.js` |
| 2.1.5 | Input abstraction | `DecideAction(state) → Action` pattern | Új: `Action.js` |

**Architekturális diagram**:
```
┌─────────────────────────────────────────┐
│                  Unit                    │
├─────────────────────────────────────────┤
│  activeController: IController          │
│  ├── PlayerController (keyboard/mouse)  │
│  ├── RuleBasedController (FSM/BT)       │
│  └── LearnedController (ML policy)      │
└─────────────────────────────────────────┘
          │
          ▼
    DecideAction(state) → Action
          │
          ▼
    Unit.executeAction(action)
```

**Implementációs részletek**:
```javascript
// IController.js
export class IController {
    decideAction(unit, worldState) {
        throw new Error("Must implement decideAction");
    }
}

// Unit.js - controller használat
update(dt) {
    if (this.activeController) {
        const worldState = this.game.getWorldState(this);
        const action = this.activeController.decideAction(this, worldState);
        this.executeAction(action);
    }
}
```

---

### 2.2 Mérföldkő: Behavior Tree Rendszer

**Miért fontos**: A rule-based AI-hoz rugalmas, karbantartható viselkedési rendszer kell.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 2.2.1 | BT Core nodes | Selector, Sequence, Parallel, Decorator | Új: `BehaviorTree/` |
| 2.2.2 | Action nodes | MoveTo, Attack, Mine, Patrol | `BehaviorTree/Actions/` |
| 2.2.3 | Condition nodes | IsEnemyNearby, HasResource, IsHealthy | `BehaviorTree/Conditions/` |
| 2.2.4 | Tree builder | JSON-ból BT építés | Új: `BTBuilder.js` |
| 2.2.5 | Unit type trees | Tank, Miner, Scout alap behavior tree-k | `data/behaviors/` |

**Behavior Tree példa (Tank)**:
```
Selector
├── Sequence [Combat]
│   ├── Condition: IsEnemyInRange?
│   └── Action: AttackEnemy
├── Sequence [Patrol]
│   ├── Condition: HasPatrolRoute?
│   └── Action: FollowPatrolRoute
└── Action: Idle
```

**Függőségek**: 2.1 (Controller architektúra)

---

### 2.3 Mérföldkő: AI-Copilot (Commander)

**Miért fontos**: A játékos magas szintű parancsokat ad, a copilot bontja le unit-szintű feladatokra.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 2.3.1 | Order types | MineAt, AttackTarget, DefendArea, Patrol | Új: `Orders.js` |
| 2.3.2 | Commander modul | Order → Task lebontás logika | Új: `Commander.js` |
| 2.3.3 | Task assignment | Melyik unit kapja a feladatot | `Commander.js` |
| 2.3.4 | Multi-unit koordináció | Csoportos támadás, körbekerítés | `Commander.js` |
| 2.3.5 | UI integration | Parancs kiadás UI-ból | `Game.js`, `InteractionManager.js` |

**Order → Task lebontás példa**:
```
Order.AttackCity(cityId)
    │
    ├── Task.MoveTo(approach_point_1) → Unit_1
    ├── Task.MoveTo(approach_point_2) → Unit_2
    ├── Task.MoveTo(approach_point_3) → Unit_3
    └── Task.Siege(cityId) → All units (when in position)
```

**Függőségek**: 2.1, 2.2 (a taskok végrehajtásához kell a BT)

---

## Fázis 3: Tanulási Rendszer

> **Cél**: A unitok megtanulják a játékos viselkedését és utánozzák
> **Becsült idő**: 4-6 hét
> **Függőség**: Fázis 2 (működő controller és action system)

### 3.1 Mérföldkő: Adatgyűjtés (PlayerDataRecorder)

**Miért fontos**: A tanuláshoz state-action párok kellenek a játékos viselkedéséből.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 3.1.1 | State vector definition | Mit tartalmaz a "state" (inputs) | Új: `StateVector.js` |
| 3.1.2 | Action vector definition | Mit tartalmaz az "action" (outputs) | Új: `ActionVector.js` |
| 3.1.3 | Data recorder | Tick-enkénti state-action rögzítés | Új: `PlayerDataRecorder.js` |
| 3.1.4 | Session management | Recording start/stop, session ID | `PlayerDataRecorder.js` |
| 3.1.5 | Data export | JSON/CSV export a tanításhoz | `PlayerDataRecorder.js` |

**State vector tartalom**:
```javascript
const stateVector = {
    // Saját unit
    position: [x, y, z],           // Normalizált
    velocity: [vx, vy, vz],
    heading: [hx, hy, hz],
    health: 0.85,                  // 0-1 normalizált
    ammo: 0.5,
    
    // Környezet
    nearestEnemy: {
        exists: true,
        direction: [dx, dy, dz],
        distance: 0.3,             // Normalizált
        health: 0.6
    },
    nearestCover: {
        exists: true,
        direction: [cx, cy, cz],
        distance: 0.1
    },
    
    // Cél
    currentObjective: "ATTACK",
    targetDirection: [tx, ty, tz]
};
```

**Függőségek**: 2.1 (PlayerController azonosítás)

---

### 3.2 Mérföldkő: Modell Tanítás (TrainingService)

**Miért fontos**: A rögzített adatokból kis neurális hálót tanítunk.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 3.2.1 | Python training pipeline | PyTorch alapú modell tanítás | `training/train.py` |
| 3.2.2 | Model architecture | Kis MLP (state → action) | `training/model.py` |
| 3.2.3 | ONNX export | Tanított modell exportálása | `training/export.py` |
| 3.2.4 | Versioning | Policy verziók kezelése | `training/` |
| 3.2.5 | Evaluation metrics | Tanítás minőségének mérése | `training/evaluate.py` |

**Modell architektúra**:
```
Input Layer (state_size ~50)
    │
Dense(128, ReLU)
    │
Dense(64, ReLU)
    │
Dense(32, ReLU)
    │
Output Layer (action_size ~10)
```

**Függőségek**: 3.1 (rögzített adatok)

---

### 3.3 Mérföldkő: Policy Futtatás (LearnedController)

**Miért fontos**: A tanított modellt futtatni kell a játékban real-time.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 3.3.1 | ONNX.js integration | ONNX runtime a böngészőben | Új: `PolicyRuntime.js` |
| 3.3.2 | LearnedController | Policy-based action döntés | Új: `LearnedController.js` |
| 3.3.3 | Policy store | Modellek tárolása és betöltése | Új: `PolicyStore.js` |
| 3.3.4 | Controller fallback | Ha policy hibás → RuleBasedController | `Unit.js` |
| 3.3.5 | Performance optimization | Inference batching, caching | `PolicyRuntime.js` |

**Függőségek**: 3.2 (ONNX model)

---

## Fázis 4: Élő Világ Rendszer

> **Cél**: A világ "él" akkor is, amikor a játékos nem figyeli
> **Becsült idő**: 3-4 hét
> **Függőség**: Fázis 2 (AI alapok)

### 4.1 Mérföldkő: Zóna Rendszer

**Miért fontos**: Nem futtathatunk teljes szimulációt mindenhol - csak ahol szükséges.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 4.1.1 | Zone definition | Bolygó felosztása zónákra | Új: `ZoneManager.js` |
| 4.1.2 | Zone states | INACTIVE / SIMULATED állapotok | `ZoneManager.js` |
| 4.1.3 | Activation triggers | Mikor aktiválódik egy zóna | `ZoneManager.js` |
| 4.1.4 | State serialization | Zóna állapot mentése/töltése | Új: `ZoneState.js` |
| 4.1.5 | Transition handling | Smooth átmenet activated/deactivated között | `ZoneManager.js` |

**Zóna aktiválási szabályok**:
```
SIMULATED if:
  - Játékos kamerája a zónában van
  - Játékos unit-ja a zónában van
  - Harc zajlik a zónában
  - Esemény történt (< 5 perc)

INACTIVE otherwise
```

---

### 4.2 Mérföldkő: Háttér Gazdaság

**Miért fontos**: INACTIVE zónákban is történik termelés - ezt becsülni kell.

**Feladatok**:

| # | Feladat | Leírás | Fájl(ok) |
|---|---------|--------|----------|
| 4.2.1 | Production rates | Bányász output/óra kiszámítása | Új: `BackgroundEconomy.js` |
| 4.2.2 | Consumption rates | Resource felhasználás becslése | `BackgroundEconomy.js` |
| 4.2.3 | Time simulation | Eltelt idő alapján state update | `BackgroundEconomy.js` |
| 4.2.4 | Event generation | Véletlenszerű események (raid, discovery) | `BackgroundEconomy.js` |
| 4.2.5 | Reconciliation | Becslés és valós állapot szinkronizálása | `BackgroundEconomy.js` |

**Becslési formula**:
```javascript
// INACTIVE zónában eltelt idő után:
const deltaTime = Date.now() - zone.lastActiveTime;
const hoursElapsed = deltaTime / (1000 * 60 * 60);

zone.resources.ore += zone.miners.count * zone.miners.ratePerHour * hoursElapsed;
zone.resources.ore -= zone.parasites.siphonRate * hoursElapsed;
zone.resources.ore *= zone.symbionts.productionBonus;
```

**Függőségek**: 4.1 (zóna rendszer)

---

## Fázis 5: Külső Jelenlét

> **Cél**: Paraziták és szimbionták rendszere
> **Becsült idő**: 4-5 hét
> **Függőség**: Fázis 4 (a háttérben is működniük kell)

### 5.1 Mérföldkő: Parazita Rendszer

**Feladatok**:

| # | Feladat | Leírás |
|---|---------|--------|
| 5.1.1 | Parasite entity | Parazita unit típus, tulajdonságok |
| 5.1.2 | Stealth mechanics | Rejtőzködés, észlelési esély |
| 5.1.3 | Siphoning | Resource csapolás mechanikája |
| 5.1.4 | Detection system | Anomália figyelés, aktív scanning |
| 5.1.5 | Parasite vs parasite | Parazita-csaták a területekért |

### 5.2 Mérföldkő: Szimbionta Rendszer

**Feladatok**:

| # | Feladat | Leírás |
|---|---------|--------|
| 5.2.1 | Symbiont entity | Szimbionta telepek/egységek |
| 5.2.2 | Contract system | Szerződések: mit ad, mit kér |
| 5.2.3 | Relation tracking | Trust, Influence értékek |
| 5.2.4 | Bonuses | Production boost, detection help |
| 5.2.5 | Diplomacy UI | Szerződéskötés felület |

---

## Fázis 6: Multiplayer

> **Cél**: Több játékos közös univerzuma
> **Becsült idő**: 6-8 hét
> **Függőség**: Minden előző fázis

### 6.1-6.3 Mérföldkövek

| Mérföldkő | Tartalom |
|-----------|----------|
| 6.1 Server Core | Authoritative server, game state sync |
| 6.2 Client Prediction | Input prediction, rollback |
| 6.3 Planet Persistence | Planet DB, player ownership |

---

## Függőségi Diagram

```
Fázis 1 ─────────────────────────────────────────────────────────
   │
   ├── 1.1 Víz ──┐
   │             ├── 1.3 Navmesh
   └── 1.2 Rock ─┘
                 │
Fázis 2 ─────────┼───────────────────────────────────────────────
                 │
   ┌─────────────┘
   │
   ├── 2.1 Controller Arch ─┬── 2.2 Behavior Tree ─┐
   │                        │                      │
   │                        └── 2.3 Commander ─────┤
   │                                               │
Fázis 3 ───────────────────────────────────────────┼─────────────
                                                   │
   3.1 Data Recording ───► 3.2 Training ───► 3.3 Learned Controller
                                                   │
Fázis 4 ───────────────────────────────────────────┼─────────────
                                                   │
   4.1 Zones ───► 4.2 Background Economy ──────────┤
                                                   │
Fázis 5 ───────────────────────────────────────────┼─────────────
                                                   │
   5.1 Parasites ──────┬───────────────────────────┤
   5.2 Symbionts ──────┘                           │
                                                   │
Fázis 6 ───────────────────────────────────────────┴─────────────
   
   6.1 Server ───► 6.2 Client ───► 6.3 Persistence
```

---

## Idővonal (Becsült)

| Fázis | Hét | Kumulatív |
|-------|-----|-----------|
| Fázis 1 | 2-3 | 3 hét |
| Fázis 2 | 3-4 | 7 hét |
| Fázis 3 | 4-6 | 13 hét |
| Fázis 4 | 3-4 | 17 hét |
| Fázis 5 | 4-5 | 22 hét |
| Fázis 6 | 6-8 | 30 hét |

**Teljes becsült fejlesztési idő: ~6-8 hónap**

---

## Rizikók és Kihívások

| Rizikó | Valószínűség | Hatás | Mitigáció |
|--------|--------------|-------|-----------|
| Spherical navmesh komplexitás | Magas | Magas | Egyszerűsített megközelítés először |
| ML training instabilitás | Közepes | Közepes | Fallback rule-based AI |
| Multiplayer latency | Magas | Magas | Client prediction, server authority |
| Browser performance | Közepes | Magas | Level-of-detail, culling |

---

## Következő Lépések

1. **Dönteni kell**: Fázis 1.1 (Víz) vagy 1.2 (Sziklák) először?
2. **Prototípus**: Egyszerű collision detection sziklákkal
3. **Mérés**: Jelenlegi teljesítmény baseline

---

*Ez a dokumentum élő - minden fázis után frissítendő a tapasztalatok alapján.*
