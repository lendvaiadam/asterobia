# Megoldott Hibák és Egyéb Felvetések

*Frissítve: 2025-12-12*

---

## ✅ Megoldott Hibák

### Kamera Rendszer

| Hiba | Megoldás |
|------|----------|
| View Offset Panel | Panel overlay-ként jelenik meg |
| FlyTo Snap | `currentChaseDistance` sync |
| Agresszív Return-to-Back | Csak ha kamera ELŐL van |
| 1-2° Rotation Snap | `.clone().add()` fix |
| Context Menu | `preventDefault()` RMB-re |
| Orbit Pivot Drift | Pivot rögzítve RMB down-on |
| Orbit Spinning | Slowdown faktor (10%-100%) |
| LMB Rotation | Pure translation |

### Path Following

| Hiba | Megoldás |
|------|----------|
| Visszafelé Mozgás | Simple sequential |
| Underground Movement | Path snap |
| Path Self-Crossing | PathIndex mindig előre |
| Segment Math Error | Segment tracking eltávolítva |

### Vizuális

| Hiba | Megoldás |
|------|----------|
| Path Markers Through Planet | `depthTest: true` |
| FOW Water Inverted | `discard` unexplored-nél |
| Rock Light Bleeding | Shadow extension cylinder |
| Floating Rocks | 15% süllyesztés |
| Selection Ring Complex | Pulsating glow + spotlight |
| UI Text Selectable | `user-select: none` |

---

## 🔧 Technológiai Stack (Mind akarjuk!)

| Technológia | Státusz | Megjegyzés |
|-------------|---------|------------|
| **WebGL / Three.js** | ✅ Aktív | Teljes 3D renderer - már működik |
| **AI (dinamikus NPC-k)** | ⏳ Tervezett | LLM-agent, játékos stílusából tanul |
| **WebRTC / Realtime** | ⏳ Tervezett | P2P multiplayer (Supabase jelzés, QR-kód join) |
| **WASM** | ⏳ Később | Pathfinding/fizika optimalizáció |
| **Cloud Gaming** | ⏳ Később | Játék stream böngészőbe (opcionális) |
| **Blockchain/NFT** | ⏳ Később | On-chain itemek, gazdaság |
| **WebXR (VR/AR)** | ⏳ Később | VR/AR élmény böngészőben |

---

## 🌍 Atmoszféra Rendszer (Tervezett)

### Koncepció

Rétegelt átlátszó gömbhéjak a bolygó körül:
- **Belülről**: Kékes, felhős hatás
- **Kívülről**: Csak felhők látszanak
- **Távolról**: Csillagos ég

### Implementáció (Best Practice)

```
Közel a felszínhez:
  → Kékes shader, fokozatosan halványul

Közepes távolság:
  → Felhő textúrás layer (átlátszó)

Nagyon távol:
  → Légkör shader kikapcsol
  → Csillagos ég megjelenik
```

### Technikai megvalósítás

- 1-2 plusz gömbhéj a bolygó körül
- Shader: átlátszóság + szín a kamera távolságától függ
- Alacsony erőforrásigény (böngészőbarát)

---

## 💭 Gameplay Ötletek

| Ötlet | Megjegyzés |
|-------|------------|
| Klíma/időjárás | Dinamikus hatás |
| Nap/éjszaka | Vizuális + gameplay |
| Építési rendszer | Épületek bolygón |
| Resource típusok | Nyersanyagok |
| Unit típusok | Tank, bányász, stb. |
| Tech tree | Kutatás |

---

## 🎨 Vizuális Ötletek

| Ötlet | Megjegyzés |
|-------|------------|
| Részecske rendszer | Por, füst |
| Decal system | Robbanás nyomok |
| Vegetation | Fák, bokrok |
| Day/night lighting | Dinamikus fény |

---

## 🖥️ UI/UX Ötletek

| Ötlet | Megjegyzés |
|-------|------------|
| Minimap toggle | Debug panel |
| Texture debugger | FOW debug |
| Height color controls | Terep színek |
| Radar blips | FOW detekció |

---

## 📝 Tanulságok

### Mi Működött
- Simple sequential > segment tracking
- Pure translation > rotation drag
- Discard shader > alpha=0
- Shadow extension > bias tweaking

### Mi Nem Működött
- Segment-based path tracking
- View offset for panel
- POI drag rotation
- Visible unexplored water
