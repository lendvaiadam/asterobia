# Tervezett Funkciók - Roadmap

*Frissítve: 2025-12-12*

---

## 🎮 Játékmenet Alapvízió

### Multiplayer Bolygós Stratégia

- Minden játékosnak **saját bolygója** van
- A saját bolygón a játékos **túlerőben van** (nem CoC-szerű offline raid)
- **Élő világ** illúziója időalapú becsléssel
- Csak rendkívüli eseményeknél (harc, invázió) fut valósidejű szimuláció

**Zóna rendszer:** `INACTIVE` (becslés) / `SIMULATED` (fizika+AI)

---

## 🌊 VFX Rendszer (Rövidtávú)

### Víz Effektek

| Elem | Technika |
|------|----------|
| **Víz fodrozódás** | Ripple normal decal - kör, tágul, halványul |
| **Víz tükröződés** | Environment cubemap fake reflection |
| **Planar reflection** | Csak ha muszáj (drága) |

### Porfelhő (Dust Particles)

| Elem | Leírás |
|------|--------|
| **Billboard sprites** | 50-200 nagy, lágy alpha |
| **Aktiválás** | Gyors mozgás, becsapódás |
| **Distance culling** | Messziről kevesebb/semmi |

### Teljesítmény Presetek

| Preset | Víz | Particles |
|--------|-----|-----------|
| **Low** | 1 normal, env map | Max 50 |
| **Medium** | 2 normal, ripples | Max 100 |
| **High** | Full ripples | Max 200 |

---

## 🔊 Audio Rendszer (Rövidtávú)

| Hang | Fájl | Viselkedés |
|------|------|------------|
| **Nyitózene** | Bolygo_1.mp3 | 10 sec, fade out |
| **Háttérzene** | Theme.mp3 | Konstans |
| **Motor** | Motor_hum_1.mp3 | Unit közelében hangos |
| **Atmoszféra** | Atmosphere_1.mp3 | Távolodva hangosodik |

**Távolság mixing:**
- Unit közel → Motor hangos, Atmo halk
- Unit távol → Motor halk, Atmo hangos
- Bolygó magasban → Bolygo_1 hangosodik

---

## 📍 Waypoint Ikonok

| Típus | Ikon | Leírás |
|-------|------|--------|
| **Start** | 🏁 flag | Útvonal kezdőpontja |
| **Milestone** | • pont | Közbülső pont |
| **End** | 🎯 target | Útvonal végpontja |
| **Loop** | ⟲ | Zárt kör (Start+End) |

Azonos ikonok: térképen és Command Queue-ben!

---

## 💥 Ütközési Viselkedés

1. **Rezzenés** - Kis visszapattanás
2. **Visszatolás** - Rövid hátra mozgás
3. **Megállás** - Ease-in fékezés
4. **Útvonal újratervezés** - Legrövidebb akadálymentes út

---

## 🪨 Szikla JSON Schema

```json
{
  "id": 1,
  "type": "SPIRE",
  "pos": [x, y, z],
  "rotY": 1.57,
  "scale": [1.2, 2.0, 1.1],
  "seed": 42,
  "state": "intact",
  "tags": ["blocking", "climbable"]
}
```

**Típusok:** BOULDER | SPIRE | SLAB

---

## 🤖 AI és Tanuló Rendszer

### AI-Copilot

- Játékos = "Nagyfőnök" - magas szintű parancsok
- AI bontja le: `Order.Mine(pos)` → `Task.GoTo`, `Task.Mine`

### Imitation Learning

1. Játékos irányít (FPS/TPS)
2. Rendszer rögzít (state → action)
3. AI megtanulja
4. Egység "úgy viselkedik, mint játékos"

### Controller Prioritás

1. `PlayerController`
2. `LearnedAIController`
3. `RuleBasedAIController` (fallback)

---

## 👽 Külső Jelenlét

### Paraziták
- Lopakodnak, csapolnak, harcolnak egymással
- Nehéz kiirtani

### Szimbionták (Civ6 városállam)
- Adnak: bónuszok, védelem, figyelmeztetés
- Kérnek: resource, terület, diplomácia

---

## 🗺️ Víz és Szikla Interakció

### Víz
- `canSwim`: úszik felszínen
- `canWalkUnderwater`: tengerfenéken sétál
- Egyik sem: megáll parton (ease-in)

### Szikla
- Collision: blocking
- Navmesh: unwalkable
- `canClimb`: mászható sziklákra felmegy

---

## 📷 Kamera Fejlesztések

- ⚠️ Chase occlusion (disabled)
- ⏳ Fly-to mid-flight túl gyors forgás

---

## 🌐 Multiplayer Rendszer

**Csatlakozás:**
- **QR-kód** - Host generál, guest beolvassa
- **Háromkarakteres szobakód** - Egyszerű join
- **Supabase Realtime** - Jelzések és szobakezelés

**Technológia:**
- WebRTC P2P (tervezett)
- Server-authoritative logika
- Kliens: megjelenít + input

---

## 🧭 Navmesh / Útvonaltervezés

**Spherical Navmesh:**
- Háromszög rács a gömb felszínén
- Minden háromszög: `walkable | unwalkable | costly`

**Algoritmusok:**
- **A*** - Útvonalkeresés a gráfon
- **Funnel algorithm** - Path simítás

**Trigger események:**
- Ütközés detektálás
- Új waypoint hozzáadás
- Akadály megjelenése

---

## Összefoglaló

| Funkció | Státusz |
|---------|---------|
| Orbit/Chase/Fly-To | ✅ Aktív |
| Waypoint/Path | ✅ Aktív |
| FOW | ✅ Aktív |
| Tire tracks | ✅ Aktív |
| VFX (ripple, dust) | 📝 Spec |
| Audio | 📝 Spec |
| Víz interakció | 📝 Spec |
| Szikla collision | 📝 Spec |
| Navmesh | 📝 Spec |
| Multiplayer | 📝 Spec |
| AI-copilot | 📝 Spec |
