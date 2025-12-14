# SYSTEM PLAN – DEMO 1.0 (RÉSZLETES)

> **Cél:** egy 10–20 fős, élőben bemutatható, böngészőben futó multiplayer demó, amely stabil, érthető, és később minimális újraírással skálázható.

---

## 0. Kontextus és alapfeltevések

- A játék **webalapú (desktop + mobil webview/PWA)**, nincs natív app.
- A világ **perzisztens**, de **offline nem fut** (csak számolunk).
- Multiplayer **nem P2P**, hanem realtime csatornákon, **host-alapú szimulációval**.
- Biztonság, anti-cheat, monetizáció **nem cél** az 1.0-ban.
- A cél a **működő élmény**, nem a tökéletes mérnöki tisztaság.

---

## 1. A játék pontos meghatározása

Egy böngészőben futó, multiplayer stratégiai–szimulációs játék, amely procedurálisan generált, gömb alakú bolygók felszínén játszódik. A játékosok egy közös, perzisztens világban mozoghatnak, lőhetnek és építhetnek, miközben az egységek és épületek erőforrás-termelése és -fogyasztása időalapú. A világ állapota offline időszakban nem szimulálódik, hanem belépéskor számítódik újra aggregált ráták alapján. A valós idejű játékmenet host-alapú szimulációval, snapshot-szinkronizációval működik.

---

## 2. Rövid távú célok (Demo 1.0)

- 1 világban **max. 10 egyidejű játékos**
- **100–300 egység** kezelése
- **≤1 másodperc** érzékelt késleltetés
- Világ látogatása **6 jegyű kóddal**
- Regisztráció **handle + jelszó** alapon (email UX nélkül)
- Host kiesésekor **automatikus host-átvétel**

---

## 3. Hosszú távú célok (2.0+ irány)

- Dedikált szerveres (authoritative) szimuláció
- Determinisztikus netcode (lockstep / fixed seed)
- Háttérben futó AI (offline is élő világ)
- Monetizáció (belépési díj, in-app vásárlás)
- NFT / blockchain modul

Az 1.0 architektúra úgy készül, hogy ezek **ráépíthetők** legyenek.

---

## 4. Szimulációs döntések – MIÉRT ÍGY?

### 4.1 Best effort multiplayer

**Mit jelent:**
- Nem garantáljuk, hogy minden kliensnél bitpontos azonos állapot fut.
- A host küldi az igazságot (snapshot), a kliensek igazodnak.

**Miért jó demohoz:**
- Gyors implementáció
- Böngészőben stabil
- 10 főnél vizuálisan elfogadható

---

### 4.2 Fix timestep a hostnál

- Host oldali szimuláció **fix 30 Hz** lépésekkel fut.
- A render FPS-től független.

**Előnyök:**
- Stabilabb fizika és mozgás
- Később könnyebb determinisztikus irányba menni

---

### 4.3 Last write wins

- Konfliktus esetén (pl. két építés ugyanoda) az **első snapshotban rögzített** változás marad meg.
- Nincs komplex ellenőrzés, csak konzisztencia.

---

## 5. Világ futása és offline logika

### 5.1 Alapelv

- A világ **csak akkor fut**, ha legalább egy játékos bent van.
- Offline állapotban **nem szimulálunk**, csak számolunk.

---

### 5.2 Offline delta számítás

**Kilépéskor mentjük:**
- `snapshot` – teljes világállapot
- `rates` – aggregált termelés/fogyasztás (pl. erőforrás/sec)
- `last_saved_at` – időbélyeg

**Belépéskor (csak egyszer):**
```
dt = now - last_saved_at
resources += dt * rates
resources = clamp(resources, 0, storage_cap)
```

---

## 6. Multiplayer architektúra (Demo)

### 6.1 Host-alapú modell

- Egy világban **mindig van egy host**, amíg fut a session.
- A host:
  - futtatja a szimulációt
  - küldi a snapshotokat
  - ment DB-be

---

### 6.2 Host lease és heartbeat

- Host **2 másodpercenként** heartbeat-et küld.
- Lease idő: **6 másodperc**.
- Ha a lease lejár → host kiesett.

---

### 6.3 Host-átvétel algoritmus

1. Nincs érvényes host (lease lejárt)
2. A jelenlévők közül kiválasztjuk:
   - legkorábban belépőt, vagy
   - legkisebb user_id-t
3. Atomikus host-claim (DB tranzakció)
4. Új host betölti a legfrissebb snapshotot

---

## 7. Realtime kommunikáció

### 7.1 Csatorna

- `world:{worldId}`

---

### 7.2 Üzenettípusok

**Client → Host (intentek):**
- move
- fire
- build

**Host → Clients:**
- snapshot
- ack
- host_heartbeat

---

### 7.3 Snapshot stratégia

- Ajánlott: **4 Hz (250 ms)**
- Alternatíva: **2 Hz (500 ms)**
- Belépéskor: full snapshot
- Később: delta snapshot

---

## 8. Perzisztens mentés

### 8.1 Ki ment?

- **Csak a host** ír DB-be.

---

### 8.2 Mikor ment?

- 5–10 másodpercenként
- Nagy események után azonnal

---

### 8.3 Verziózás

- `world_state.version` nő minden mentésnél
- Host váltáskor a legfrissebb verzió a mérvadó

---

## 9. Belépés és regisztráció

### 9.1 Regisztráció

- Handle + jelszó
- Email UX nincs
- Technikai email: `handle@user.local`

---

### 9.2 Világ látogatása

- 6 jegyű numerikus kód
- Többször használható
- Owner nélkül is beléphető

---

## 10. Adatmodell (minimum)

- `profiles(user_id, handle)`
- `worlds(id, owner_id, join_code)`
- `world_state(world_id, snapshot, rates, last_saved_at, version)`
- `world_sessions(world_id, host_user_id, host_lease_until, host_epoch)`
- `world_players(world_id, user_id, joined_at, last_seen_at)`

---

## 11. Ami tudatosan nincs benne

- Fizetés
- NFT / coin
- AI háttérfolyamat
- Image → 3D pipeline
- Anti-cheat
- Dedikált szerver

---

## 12. Következő lépés (fejlesztési sorrend)

1. Repo létrehozás + dokumentum betétele
2. Supabase projekt + táblák
3. World create / join flow
4. Snapshot alapú szimuláció (single-player)
5. Realtime csatorna
6. Host logic + lease
7. Offline delta számítás
8. 2–3 fős belső teszt
9. 10 fős baráti demó

---

**Ez a dokumentum az 1.0 demó végleges alapja.**

