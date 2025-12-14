# Game R&D&P System – Full Design Specification (Markdown Version)

## 0. Purpose of This Document

This document describes **in full detail** the Research–Development–Production (R&D&P) system of the game we discussed.  
The goal is to have a **single, complete, consistent Markdown file** that can be given to AI code generators or human developers as a specification.

Everything below is based on:
- your original Hungarian description (feature categories, triggers, processes),
- your clarifications (modules, capacity, limits, multiplayer behavior, versioning),
- and a consistent formalization of the R&D&P pipeline.


---

## 1. Core Concepts and Hierarchy

### 1.1 Empire-Level vs Unit-Level

**Empire-level (global for one player’s faction):**

- **Need**
  - A newly appearing desire or problem discovered during gameplay.
  - Example: water blocks movement → Need: `swimming on water`, `rolling on the seabed`.
- **Feature**
  - An abstract capability that has been researched.
  - Example: `swimming on water`, `radar`, `shot`, `shield`, `mining`.
- **Type**
  - A unit design (template, blueprint) that the empire has developed.
  - Example: an “Amphibious Miner 1.0” Type with Movement + Gathering modules.

These are **global** within the player’s empire. Once you have a Feature or Type, every relevant module in the empire can potentially use it.

**Unit-level (per-instance):**

- **Unit**
  - A concrete instance of a Type placed on the map.
  - It has a reference to a given **Type version** (e.g. `Tank 1.0`, `Tank 3.0`).
  - It can be **outdated** and individually **upgraded** to the latest Type version via Production.

---

### 1.2 Modules (Feature Categories)

In the game, **features are not shown in one flat list**.  
They are grouped into **modules** (feature categories).

Modules:

- `Research`
- `Development`
- `Production`
- `Explore`
- `Movement`
- `Combat`
- `Gathering`
- (future modules can be added later)

A **Module** is a category of functions that a Unit can operate.  
Each Module may contain multiple **Features**.

Examples:

- **Explore module**
  - Features: `Vision`, `Radar` (later).
- **Movement module**
  - Features: `Rolling`, `Fly`, `Float`, `Underwater`, `Transport`.
- **Combat module**
  - Features: `Shot`, `Shield`, later `Rapid fire`, `Heavy artillery`.
- **Gathering module**
  - Features: `Mining`, `Harvesting`.

The UI always shows Features **grouped by Modules**. The player never sees all Features in one unstructured list.

---

### 1.3 Needs, Features, Types, Units

- **Need**
  - Dynamic, appears from in-game events.
  - Stored in a global **Needs list** for the empire.
  - Drives the start of Research (Explore / Extend).

- **Feature**
  - Result of Research.
  - Stored in a global **Features list**.
  - Can be used in Type design and Enhancement.

- **Type**
  - A blueprint defined in Development.
  - Specifies:
    - which Modules the Type has,
    - which Features inside those Modules,
    - how the 100% capability capacity is distributed between Features,
    - the **version number** (e.g. `1.0`, `2.0`, `3.0`).
  - Stored in a global **Types list**.

- **Unit**
  - Concrete instance built from a Type.
  - Lives on the map.
  - Has:
    - a reference to a Type,
    - a current **Type version** (e.g. 1.0),
    - its own state (position, tasks, etc.).
  - All Units are kept in a **Units list**.

---

### 1.4 Type Capacity (100%) and Module Limit

- Each Type has an abstract **100% capability capacity**.
- During **Design**, the player divides this 100% between Features, across Modules.

Example (for a Type):

- Movement module:
  - `Rolling`: 40%
- Explore module:
  - `Vision`: 30%
- Combat module:
  - `Shot`: 20%
- Research module:
  - `Invent`: 10%

This allocation defines:
- what the Type can do,
- how strong / how fast it is in each function (higher % = stronger/faster).

**Module limit (design rule):**

- It is planned (and documented) that a Type can have a maximum number of Modules (e.g. **max 3 Modules per Type**).
- Example:
  - A Type has `Explore + Movement + Gathering`.
  - It cannot later gain `Combat` as a completely new Module.
- This limit prevents “do-everything” Types and forces specialization.

---

### 1.5 Versioning of Types

- Each Type has a **version**, starting at `1.0`.
- Every time a Type is **Enhanced**, a new version is created:
  - `Tank 1.0` → `Tank 2.0` → `Tank 3.0`.
- The **latest version** is used as the current blueprint for:
  - further Enhancements,
  - production of new Units.

Units:

- Units built earlier may still be `Tank 1.0`.
- When `Tank 3.0` exists:
  - these Units are considered **outdated**,
  - they can be **Upgraded** individually from `1.0` directly to `3.0`.

Old versions:

- Old Type versions are not shown as separate Types in the UI for design.
- They live only through:
  - Units referencing their version,
  - upgrade logic that knows which version a Unit is on.

---

## 2. Module-by-Module Feature Overview

Below we list each Module, its Features, and when Features become available.

### 2.1 Research Module

**Purpose:** Discover new Features and extend existing ones.

- **Starting Feature:**
  - `Invent`
    - Research new Features from existing Needs (Explore pipeline).
- **Later Feature:**
  - `Extend`
    - Research improvements and extensions of existing Features.

**Trigger for Extend:**

- When a known Feature is no longer sufficient to solve a newly appeared goal.
- Example:
  - The empire has basic flying.
  - A new, much higher mountain appears that cannot be reached with current flight.
  - A popup appears:
    - explains that current flight level is not enough,
    - unlocks **Extend** within Research modules.

---

### 2.2 Development Module

**Purpose:** Create new Types (Design) and improve existing Types (Enhance).

- **Starting Feature:**
  - `Design`
    - Combine Features into a Type.
    - Allocate the 100% capacity across Features.
- **Later Feature:**
  - `Enhance`
    - Improve an existing Type:
      - increase Feature values,
      - add additional Features **inside already existing Modules**.

**Important rule:**

- Enhance **cannot add new Modules** to a Type.
- Enhance **can**:
  - add new Features inside already present Modules, and
  - increase values of existing Features.

**Trigger for Enhance:**

- Once a Feature has been successfully built into a Type and there exists at least one Unit using it:
  - The corresponding Type becomes Enhance-able in the Development module.
- Also:
  - some Enhancements can be driven by new Needs (e.g. “rapid fire”, “heavy artillery”).

---

### 2.3 Production Module

**Purpose:** Build Units from Types and Upgrade existing Units to newer versions.

- **Starting Feature:**
  - `Build`
    - Create Units based on existing Types.
- **Later Feature:**
  - `Upgrade`
    - Upgrade existing Units to the latest Type version.

**Trigger for Upgrade:**

- When a Type has been Enhanced and thus has a **newer version** than the one some Units are currently using.
- Those Units become “upgradeable” when they meet a Unit with Production (or have Production themselves).

---

### 2.4 Explore Module

**Purpose:** Sensing, vision, detection.

- **Starting Feature:**
  - `Vision`
    - Basic line-of-sight sensing.
- **Later Feature:**
  - `Radar`
    - Extended detection, possibly through obstacles or longer range.

**Trigger for Radar:**

- Encounter with a special object like a **diamond emerging from the ground**.
  - Popup explains the potential of enhanced detection.
  - A Need appears, which leads to Research → Feature: `Radar`.

---

### 2.5 Movement Module

**Purpose:** Movement capabilities of Units.

- **Starting Feature:**
  - `Rolling`
    - Basic ground movement.
- **Later Features:**
  - `Fly`
    - Trigger:
      - When a Unit reaches a high mountain it cannot climb with `Rolling`.
  - `Float`
    - Trigger:
      - When a Unit reaches the shoreline and cannot enter water.
  - `Underwater`
    - Trigger:
      - Same shoreline event, representing movement along the seabed.
  - `Transport`
    - Trigger:
      - Either:
        - after designing and using a Type that cannot move at all (need for transport appears), or
        - after encountering a diamond, where `Transport` may unlock together with `Mining`.

---

### 2.6 Combat Module

**Purpose:** Offensive and defensive combat abilities.

- **Starting Feature:**
  - `Shot` (Shooting)
    - Basic offensive capability.
- **Later Features:**
  - `Shield`
    - Defensive capability.
  - `Rapid fire`
    - Higher rate-of-fire.
  - `Heavy artillery`
    - High-damage, possibly slower attack.

**Triggers:**

- First combat Needs:
  - When a Unit encounters a dangerous enemy:
    - Popup suggests:
      - “It would be good if the unit could shoot.”
      - “It would be good if the unit could defend with a shield.”
    - Needs appear:
      - `shot`
      - `shield`.
- Later combat Needs:
  - When attacking is difficult (e.g. enemies too strong or too many):
    - New Needs appear:
      - `rapid fire`
      - `heavy artillery`.

---

### 2.7 Gathering Module

**Purpose:** Resource collection (mining, harvesting).

- **Starting Feature:**
  - *None at the very beginning.*
- **Later Features:**
  - `Mining`
    - Trigger:
      - When a Unit encounters a diamond emerging from the ground.
  - `Harvesting`
    - Trigger:
      - When a Unit encounters harvestable natural resources (e.g. plants, resource nodes).

---

## 3. Needs System

### 3.1 What Goes into the Needs List?

The **Needs list** contains **only dynamic Needs** that are discovered during gameplay.

- **NOT added to Needs list:**
  - starting/basic capabilities:
    - `Rolling`
    - `Vision`
    - `Invent`
    - `Design`
    - `Build`
- **ADDED to Needs list:**
  - newly appearing requirements, for example:
    - Water-related:
      - `swimming on water`
      - `rolling on the seabed`
    - Combat-related:
      - `shot`
      - `shield`
      - `rapid fire`
      - `heavy artillery`
    - Resource-related:
      - `Mining`
      - `Harvesting`
    - Sensing-related:
      - `Radar`
    - Transport-related:
      - `Transport` (if needed).

### 3.2 Need Lifetime

- When a Need appears:
  - It is added to the **Needs list**.
  - A popup explains:
    - the situation,
    - why this is a problem,
    - and possible directions (e.g. “swimming on water”, “rolling on the seabed”).
- When a corresponding Feature is fully researched and implemented:
  - The Need is **marked as solved / checked** in the Needs list.
- Enhance:
  - Does **not require new Needs** in all cases.
  - Once a Feature exists and has been built into at least one Type, **Enhance** becomes available for that Feature in Development, even without a new Need.

### 3.3 Global vs Multiplayer

- Within one player’s **empire**:
  - Needs, Features, Types are all **global**.
- In **multiplayer**:
  - Your Needs/Features/Types are **not shared** with other players.
  - However:
    - If your Unit encounters another player’s Unit that uses an unknown Feature:
      - You receive a new Need corresponding to that Feature.
      - Example:
        - Another player has a cloaking capability.
        - On first encounter → new Need: “cloaking capability” appears in your Needs list.

---

## 4. R&D&P Pipelines

### 4.1 New Capability Pipeline

This is the full pipeline for introducing a **new capability** into the empire.

Text form:

- `Need` → `Research module: EXPLORE` → `Feature` → `Development module: DESIGN` → `Type` → `Production module: BUILD` → `Unit`

Detailed:

1. **Need**
   - Appears based on a gameplay event (e.g. water, enemy, diamond).
   - Added to the Needs list.
   - Example:
     - Reaching water:
       - `swimming on water`
       - `rolling on the seabed`.

2. **Research Module – EXPLORE**
   - The player assigns the Need to a Unit that has a **Research module** with **Explore**.
   - Assignment can be:
     - on the **Research screen** (drag Need → Unit row),
     - or directly on the **map** (drag Need → Unit).
   - Each Research module:
     - can run **1 research process at a time** (others are queued),
     - has a **research capacity** based on its Feature values,
     - consumes **Resource** over time while researching.

   Parallelism:

   - Having more Units with Research modules allows:
     - more **parallel research processes** (one per module),
     - effectively higher total research speed for the empire.

3. **Feature**
   - When Explore completes:
     - a new Feature is created and added to the **Features list**.
   - A popup announces:
     - the new Feature,
     - that it is now available in Development for Design.

4. **Development Module – DESIGN**
   - On the Development screen, the player:
     - selects Modules for the new Type (respecting the module limit),
     - selects Features within those Modules,
     - allocates the **100% capacity** across all Features.
   - The player then assigns this **Design task** to a Development Unit:
     - 1 task at a time per Development module,
     - consumes Resource,
     - takes time, speed depends on development capacity.

5. **Type**
   - When Design completes:
     - a new Type is added to the **Types list**.
     - It gets an initial version, e.g. `1.0`.

6. **Production Module – BUILD**
   - On the Production screen or on a Unit’s production UI:
     - The player chooses a Type to build.
     - Units with Production modules are highlighted.
     - The player assigns the Type to one of these Units (drag & drop).
   - Build process:
     - runs on that Production Unit,
     - 1 active build process per Production module,
     - consumes Resource and time.
   - When a build completes:
     - a new Unit appears next to the producer.
     - If multiple Units are created, they can be arranged in a **spiral pattern** around the producer.

---

### 4.2 Enhancement Pipeline (Upgrading Existing Capabilities)

This is the pipeline for improving existing capabilities.

Text form:

- `Need` → `Research module: EXTEND` → `Feature` → `Development module: ENHANCE` → `Type` (new version) → `Production module: UPGRADE` → `Unit`

Detailed:

1. **Need (for improvement)**
   - Appears when an existing capability proves insufficient.
   - Example:
     - Hard-to-hit enemy → Needs:
       - `rapid fire`
       - `heavy artillery`.
   - These Needs are added to the Needs list.
   - Note:
     - Enhance mechanics can sometimes be used even without a new Need, as long as a Feature exists and is used.

2. **Research Module – EXTEND**
   - The player assigns the Need or existing Feature to a Research Unit with **Extend** capability.
   - 1 Extend process per Research module at a time.
   - Consumes Resource and time, speed depends on the unit’s Extend-related features.

3. **Extended Feature**
   - Extend can:
     - increase values of an existing Feature (e.g. more range, higher speed), or
     - add a new Feature within an already existing Module.
   - Example:
     - Existing Explore module with `Vision`.
     - After Extend, we unlock `Radar` and can add it inside the same Explore module.

4. **Development Module – ENHANCE**
   - On the Development screen:
     - The player selects an existing Type.
     - Enhance allows:
       - increasing Feature values,
       - adding newly researched Features **inside Modules that the Type already has**.
     - It cannot add new Modules that the Type did not already have.
   - Enhance creates a new **Type version**:
     - e.g. from `Tank 1.0` to `Tank 2.0`, then to `Tank 3.0`.
   - The system:
     - stores and uses the **latest version** as the main blueprint for future design/ui lists.

5. **Type Versioning and Old Versions**

- After Enhance:
  - `Tank` Type might go from version `1.0` → `2.0`.
- The **Types list**:
  - displays only the latest version as the design/build option (old versions are not listed as separate Types).
- However:
  - Units built before Enhancement may still be `Tank 1.0`.

6. **Production Module – UPGRADE**

- Units become **upgradeable** if:
  - their Type version (e.g. 1.0) is lower than the latest Type version (e.g. 3.0).
- For a Unit to Upgrade:
  - It must either:
    - meet a Unit with a Production module, or
    - itself contain a mobile Production module.
- When in range:
  - an **Upgrade button** appears on the Unit.
- Upgrade process:
  - consumes Resource,
  - takes time,
  - updates the Unit from its current version to the **latest version**:
    - e.g. `1.0` → `3.0` (no step-by-step requirement).
  - Upgrade is **per-Unit**; no global, instant upgrades.

---

## 5. UI and Interaction Logic

### 5.1 Common UI Principles

- **Highlighting:**
  - When the player selects a Need or a Type in the global UI:
    - appropriate Units are highlighted on the map (e.g. Units with Research / Development / Production modules).
- **Drag & Drop:**
  - Many processes are initiated via drag & drop:
    - Need → Research Unit (for Explore / Extend),
    - Type → Production Unit (for Build),
    - Outdated Unit → Production Unit (for Upgrade).
- **Popups:**
  - When new Needs appear, a popup explains:
    - the cause (situation),
    - which Needs are available,
    - that these Needs are now in the Needs list and can be researched.

---

### 5.2 Central Screens

The game has three **central pipeline screens**, plus Type and Unit detail screens, plus a terminology console.

#### 5.2.1 Research Screen

Shows all Units with **Research modules**:

- Columns per Unit:
  - Unit ID / name,
  - position (optional),
  - total Research capacity,
  - Explore capacity,
  - Extend capacity,
  - current task (if any),
  - remaining time,
  - queue overview.

Shows lists:

- **Needs list**:
  - all current Needs (new and unsolved),
  - each with:
    - name,
    - short description,
    - status (new/in progress/solved).
- **Features list (for Extend)**:
  - Features that can be extended.

Actions:

- Drag a Need onto a Unit row to start an **Explore** process.
- Drag a Feature onto a Unit row to start an **Extend** process.
- Alternatively, on the map:
  - drag from Needs/Features panel directly onto a Unit with a Research module.

#### 5.2.2 Development Screen

Shows all Units with **Development modules**:

- For each Unit:
  - its development capacity,
  - current Design/Enhance task,
  - progress and queue.

Provides a **Type Designer UI**:

- Choose:
  - Modules (e.g. Research, Explore, Movement, Combat, Gathering),
  - Features inside those Modules,
  - allocate the Type’s 100% capacity among the Features.
- Name the Type and set version (for new Types default is `1.0`).
- Confirm:
  - The Design/Enhance task is put into the queue of a selected Development Unit.

Visual constraints:

- The UI enforces the **maximum module count per Type** (e.g. 3 Modules).
- If a Type already has its allowed number of Modules, Enhance can only:
  - increase Feature values,
  - add Features inside existing Modules.

#### 5.2.3 Production Screen

Shows all Units with **Production modules**:

- For each Unit:
  - its production capacity,
  - current Build/Upgrade task,
  - progress and queue.

Lists:

- Available **Types** (latest versions) that can be built.
- **Outdated Units** (per Type) that can be upgraded.

Actions:

- Build:
  - drag a Type onto a Production Unit row (or click assign + Build button).
- Upgrade:
  - choose an outdated Unit,
  - assign it to a Production Unit for Upgrade (or drag & drop).

---

### 5.3 Type Detail Screen

For a given Type:

- Show:
  - Type name and **version** (e.g. `Amphibious Miner 2.0`),
  - Modules included (Research / Explore / Movement / Combat / Gathering),
  - inside each Module:
    - Features,
    - their allocated capacity (percent or points),
  - any limit information (e.g. “3 Modules used / max 3 allowed”).

- State:
  - if the Type is eligible for further Enhance (e.g. some Features can still grow, new Features unlocked).
  - how many Units currently use:
    - this version,
    - older versions (aggregated by version).

---

### 5.4 Unit Detail Screen

For a given Unit:

- Show:
  - its **Type name and version**,
  - Modules and Features it has,
  - effective values (movement speed, detection range, damage, etc.).
- Show current tasks:
  - if the Unit is:
    - researching (Explore/Extend),
    - developing (Design/Enhance),
    - building,
    - upgrading,
    - or idle.
- If newer Type version exists:
  - indicate:
    - that the Unit is outdated,
    - that Upgrade is possible,
    - the cost and time for Upgrade to the newest version.

---

### 5.5 Terminology Console

To ensure **consistent English terminology**, there is a Terminology console.

It lists:

- All **Needs**.
- All **Features**.
- All **Modules**.
- Optionally, all **Types**.

For each entry:

- Canonical **English name** (editable).
- Short **English description** (editable).

The whole game uses these canonical names & descriptions:

- UI labels,
- tooltips,
- logs,
- popups.

This guarantees consistent naming and allows you to adjust terminology at any time without changing deeper code.

---

## 6. Data Structures (Lists)

The system must maintain the following core collections:

1. **Needs list**
   - All current and past Needs for the empire.
   - Fields:
     - ID
     - name
     - description
     - status (new / in progress / solved)
     - originating event (optional: water, enemy, diamond, etc.).

2. **Features list**
   - All Features the empire has researched.
   - Fields:
     - ID
     - name
     - description
     - Module reference (which Module this Feature belongs to)
     - base values
     - possible extended values (if any).

3. **Types list**
   - All Types ever designed (only latest version visible in main lists).
   - Fields:
     - ID
     - name
     - version
     - modules used
     - features per module with capacity allocation
     - history of Enhancements (optional).

4. **Units list**
   - All Units on the map.
   - Fields:
     - ID
     - Type ID
     - Type version
     - current position
     - current tasks (if any)
     - state flags (e.g. outdated, under-upgrade).

These lists drive:

- central screens (Research / Development / Production),
- Unit and Type detail screens,
- gameplay logic (who can do what, and how efficiently).

---

## 7. Example Flows (Combined with Original Logic)

### 7.1 Water Obstacle Example

1. A Unit with only `Rolling` Movement reaches a shoreline.
2. It cannot enter water and stops.
3. A popup appears:
   - Text (example):
     - “I cannot cross the water. I should develop something so this is no longer a problem.”
   - Offers two Needs:
     - `swimming on water`
     - `rolling on the seabed`
4. Both Needs are added to the **Needs list**.
5. The player opens the Research screen:
   - sees the new Needs,
   - drags `swimming on water` onto a Unit with a Research module (Explore).
6. After the Explore process completes:
   - new Feature: `swimming on water` appears in the Features list.
   - popup announces this.
7. On the Development screen:
   - the player Designs a new Type with:
     - Movement module containing `Rolling` + `swimming on water`.
   - assigns this Design task to a Development Unit.
8. After Design completes:
   - the new Type is added to the Types list.
9. On the Production screen:
   - the player chooses this Type,
   - assigns it to a Production Unit for Build.
10. When build finishes:
    - a new Unit (amphibious Type) appears next to the factory,
    - it can now cross water by swimming on the surface.

---

### 7.2 Combat Example (Shot and Shield, Rapid Fire, Heavy Artillery)

1. A Unit encounters a dangerous enemy.
2. A popup appears:
   - explains the threat,
   - suggests:
     - “It would be good if the unit could shoot.”
     - “It would be good if the unit could defend itself with a shield.”
   - adds Needs:
     - `shot`
     - `shield`
     to the Needs list.
3. On the Research screen:
   - the player assigns these Needs to Research Units (Explore).
4. After Explore tasks:
   - Features `Shot` and `Shield` are added to the Features list (Combat module).
5. On the Development screen:
   - the player designs a new combat Type with Combat module (`Shot` and optionally `Shield`).
6. On the Production screen:
   - the player builds Units from this Type.
7. Later, in battles:
   - if hitting enemies is still difficult / too slow:
     - new Needs appear:
       - `rapid fire`
       - `heavy artillery`.
8. These Needs go through the Extend + Enhance + Upgrade pipeline:
   - Extend to obtain new or improved combat Features,
   - Enhance the combat Type to add `Rapid fire` / `Heavy artillery`,
   - Upgrade existing Units to the latest version.

---

### 7.3 Diamond Example (Mining, Radar, Transport)

1. A Unit encounters a diamond emerging from the ground.
2. Popup:
   - explains potential:
     - gatherable high-value resource,
     - possible advanced sensing tech,
     - possibly new transport needs.
   - Adds Needs such as:
     - `Mining`
     - `Radar`
     - `Transport` (if relevant).
3. On the Research screen:
   - the player explores `Mining` and `Radar`.
4. Features:
   - `Mining` is added to the Gathering module.
   - `Radar` is added to the Explore module.
5. On the Development screen:
   - the player designs:
     - a Miner Type:
       - Modules: Movement + Gathering (with `Mining`).
     - an Explorer Type:
       - Modules: Explore (with `Vision` + `Radar`), Movement, etc.
6. On the Production screen:
   - the player builds Mining Units and Radar-equipped scouts.

---

## 8. Unified Rule Across All Modules

A key design principle:

- **All new capabilities** follow the same base pipeline:

  - `Need` → `Research module: EXPLORE` → `Feature` → `Development module: DESIGN` → `Type` → `Production module: BUILD` → `Unit`

- **All improvements of existing capabilities** follow the same enhancement pipeline:

  - `Need` → `Research module: EXTEND` → `Feature` → `Development module: ENHANCE` → `Type` → `Production module: UPGRADE` → `Unit`

This rule applies uniformly to:

- Explore-related Features,
- Movement-related Features,
- Combat-related Features,
- Gathering-related Features,
- and any future Modules and Features you add.

This makes the R&D&P system:

- mechanically consistent,
- conceptually clean,
- and easy to extend in future iterations.

---

## 9. Future Extension: Resource vs Energy

Currently:

- All processes (Invent, Explore, Extend, Design, Enhance, Build, Upgrade) consume a single abstract **Resource**.

Later plan:

- Split into:
  - **Raw materials** (e.g. ore),
  - **Energy** (generated from raw materials or other sources).
- Each process will then have:
  - a raw material cost,
  - an energy cost.

The design of the system in this document already assumes that such a split can be introduced later without changing the core logic of:

- Needs,
- Features,
- Types,
- Units,
- Modules,
- and the R&D&P pipelines.

---

## 10. Summary

This Markdown document is a **complete, unified description** of:

- the R&D&P system,
- its data model (Needs, Features, Types, Units),
- the Module–Feature structure,
- the Type capacity and Module limit,
- the New Capability and Enhancement pipelines,
- UI behaviors (screens, highlighting, drag & drop),
- and example in-game flows.

It is intended to be used directly as:

- a design reference for developers,
- input to AI code generators,
- and a baseline for further game design iterations.
