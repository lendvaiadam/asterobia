# Rövidtávú Fejlesztési Terv

*Frissítve: 2025-12-12*

---

## ✅ MÁR KÉSZ

| Funkció | Megoldás |
|---------|----------|
| Path markerek látszanak bolygón keresztül | `depthTest: true` |
| LMB drag forgat | Pure translation |
| Szikla árnyék bleeding | Shadow extension |
| Unit selection ring | Simplified glow |
| Path visszafelé mozgás | Simple sequential |
| FOW víz unexplored | `discard` |
| Hover vs selected | Különböző intenzitás |

---

## 🎯 RÖVIDTÁVÚ TEENDŐK (Prioritás szerint)

### 1️⃣ KRITIKUS - Gameplay

| # | Feladat | Részletek |
|---|---------|-----------|
| 1.1 | **Víz interakció** | Unit megáll vízparton ease-in-nel |
| 1.2 | **Szikla collision** | Unit ne menjen át, guruljon vissza |
| 1.3 | **Szikla FOW** | Unexplored = átlátszó (nem fekete) |
| 1.4 | **Domborzat path fix** | Görbe bezárás is terrain-re simuljon |
| 1.5 | **Path end slowdown** | Útonal végén ease-in lassulás |

### 2️⃣ VIZUÁLIS - Javítások

| # | Feladat | Részletek |
|---|---------|-----------|
| 2.1 | **FOW víz balance** | Visible túl sötét → világosabb. Explored-not-visible túl világos → sötétebb |
| 2.2 | **Fly-to mid-flight** | Túl gyors forgás közben → lassítani |
| 2.3 | **Scroll smoothness** | Nagyobb ease-in/ease-out |
| 2.4 | **Path glow** | Glow effekt a tube körül (mert transparency nem ment) |
| 2.5 | **Unit headlights** | Lámpák a jármű elején, árnyékvetés |
| 2.6 | **Sand textúra** | sand_1.png + normal map a bolygóra |

### 3️⃣ AUDIO - "Low Hanging Fruit"

| # | Feladat | Részletek |
|---|---------|-----------|
| 3.1 | **Bolygo_1.mp3** | Nyitózene (10 sec), fade out |
| 3.2 | **Theme.mp3** | Háttérzene játék közben |
| 3.3 | **Motor_hum_1.mp3** | Unit közelében hangosodik |
| 3.4 | **Atmosphere_1.mp3** | Ambient, távolodáskor hangosodik |

### 4️⃣ PRELOADER & LANDING

**Preloader Design:**
- Fekete háttér
- Félhold ív (vékony sarló)
  - Végei elvékonyodnak
  - Vonal széle: **brand zöld**
  - Vonal közepe: **brand kék**
- Forgás: **6 másodperc/körülfordulás**, konstans sebesség
- Betöltés végeztén: ív kitölti a kört, fekete play gomb marad

**Landing Szekvencia:**
1. Play gomb megnyomása → `Bolygo_1.mp3` indul
2. Kamera **180°-ot fordul** (ease-out)
3. Bolygó látszik, napos oldallal felénk
4. **Egy unit pontosan a napos oldal közepén**
5. Kamera smooth leszáll a unithoz (ease-out → ease-in)
6. `Bolygo_1.mp3` fade out → `Atmosphere_1.mp3` + `Motor_hum_1.mp3` fade in

**Sand Textúra:**
- Fájlok: `assets/textures/sand_1.png` + `sand_1_normal.png`
- A bolygó felszínére alkalmazandó

---

## 🌊 VFX RENDSZER (Új igény)

### Víz Effektek

| Elem | Technika | Prioritás |
|------|----------|-----------|
| **Víz fodrozódás** | Ripple normal decal - kör alakú, tágul, halványul | Magas |
| **Víz tükröződés** | Environment cubemap fake reflection | Közepes |
| **Planar reflection** | Csak ha muszáj (drága) | Alacsony |

**Implementáció:**
```javascript
// Ripple shader concept
uniform float uTime;
uniform vec2 uRippleCenter;
uniform float uRippleAge;

float ripple = sin((distance(vUv, uRippleCenter) - uTime * 0.5) * 20.0);
ripple *= smoothstep(1.0, 0.0, uRippleAge); // Fade out
```

### Porfelhő (Dust Particles)

| Elem | Technika | Prioritás |
|------|----------|-----------|
| **Billboard sprites** | 50-200 nagy, lágy alpha | Magas |
| **Smoke textúra** | Radial gradient, soft edge | Magas |
| **Flipbook anim** | Opcionális, ha kell | Alacsony |
| **Distance culling** | Messziről kevesebb/semmi | Közepes |

**Aktiválási szabályok:**
- Gyors mozgásnál aktív
- Becsapódásnál burst
- Lassú mozgásnál minimális

### Teljesítmény Presetek

| Preset | Víz | Particles | Szikla |
|--------|-----|-----------|--------|
| **Low** | 1 normal map, env map | Max 50 | Egyszerű shader |
| **Medium** | 2 normal map, ripples | Max 100 | Normal mapped |
| **High** | Full ripples, reflection | Max 200 | Full detail |

**Optimalizációs elvek:**
- Animációk shaderből (time uniform)
- KTX2/Basis textúra tömörítés
- Mipmap minden textúrán
- LOD + distance culling

---

## ✅ ELLENŐRIZENDŐ (működik-e még)

| Funkció | Státusz | Teendő |
|---------|---------|--------|
| LMB+RMB Free Look | ❓ Ellenőrizni | Működik szerinted |
| Chase mode occlusion | ⚠️ Disabled | Visszakapcsolni? |

---

## 🛡️ REGRESSION PREVENTION

| Módszer | Leírás |
|---------|--------|
| **feature_requirements.md** | Minden funkció dokumentálva |
| **Commit checklist** | Ellenőrzés minden commit előtt |
| **Console.log markers** | Kritikus funkciók logolnak |
| **Screenshot testing** | Későbbi automatizálás |

---

## 📅 JAVASOLT SORREND

```
1. Gameplay fixes (víz, szikla, path) ─────┐
2. Visual fixes (FOW, fly-to, scroll) ─────┼── Parallel
3. Audio system (low effort) ──────────────┘
4. Sand texture integration
5. Path glow effect
6. VFX: Dust particles
7. VFX: Water ripples
8. Preloader & Landing
9. VFX: Reflections
```

---

*Ez a dokumentum élő - minden sprint után frissítendő!*
