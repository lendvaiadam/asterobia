# Gömb-bolygós webböngészős játék – Részletes tervezési dokumentum (v2)

> **Cél:** Összegyűjteni *minden* eddig elhangzott igényt (a te kommentjeidből), és mellétenni az én megvalósítási javaslataimat.  
> Minden pontnál jelölöm, hogy mi **Felhasználói követelmény (FK)** és mi **Javasolt megoldás (JM)**.  
> A dokumentum a korábbi verzió **kibővített és pontosított** változata.

---

## 0. Fő koncepció összefoglalva

- **FK:** A játék **weboldalon fut**, desktop + mobil böngészőben is elérhető.
- **FK:** A világ egy **gömb alakú bolygó**, amelynek felszínén járművek mozognak, tereptárgyak vannak, és a játék teljes rendszere ezen a felszínen zajlik.
- **FK:** A járművek a **domborzat felszínén mennek**, a jármű függőleges tengelye mindig **merőleges a felszín lokális síkjára** (normálvektorra).
- **FK:** A bolygó felszíne **nem sima gömb**, hanem domborzattal torzított (hegyek, dombok, árkok, völgyek), zaj- és fraktálfüggvényekkel létrehozva.
- **FK:** Van egy külön **vízszint-gömb** is:
  - Ez szabályos gömb (nem torzított) – ez jelöli a tengerek szintjét.
  - A domborzat egyes részei a víz alatt, mások fölötte vannak.
  - Járműtípusonként/állapotonként eltérhet, hogy:
    - nem mehet víz alá,
    - mehet víz alatt,
    - a vízfelszínen úszik.
- **FK:** A játékban vannak **gyémántok** a felszín alatt, amelyeket egy **radargömb** fed fel.
- **FK:** Van **látótávolság** (vision), amelynek metszete a domborzattal megadja, mi látszik éppen.
- **FK:** Van **kétrétegű fog of war (köd)**:
  - ami most látható (aktuális látótávon belül),
  - ami valaha már látható volt (explored), de most nem látszik.
- **FK:** A játék **multiplayer**, és két aspektus kiemelten fontos:
  - **hely-alapú (GPS)** közeli multiplayer,
  - valamint **online távoli** multiplayer (pl. űrben való találkozás).
- **FK:** Lehetőség legyen **űrhajóval másik játékos bolygójára átrepülni**.
- **FK:** A multiplayer-t **a szerver vezérli**, a kliens csak megjeleníti (server-authoritative szemlélet).

- **JM:** A teljes rendszer WebGL-es frontend + Node.js alapú backend + geolokációs adatbázis kombinációjára épül, skálázható módon.

---

## 1. Világmodell: gömb-bolygó és alternatív „domb-sziget” koncepció

### 1.1. Gömb-bolygó mint alap

- **FK:** A gondolkodás kiindulópontja két opció volt:
  1. „Domb-sziget” (kupola jellegű felszín, mint egy félgömb / kupola),
  2. Teljes **gömb alakú bolygó**.
- **FK:** A végső fókusz: **gömb alakú bolygó**, de elvben a kupola-sziget és a gömb logikailag **azonos elv alapján működik**:
  - Mindkettőn van egy „domborzati kupola”,
  - A jármű a felszín mentén mozog,
  - A jármű függőleges tengelye a felszín lokális normáljára merőleges.

- **JM:** A motorban érdemes úgy tervezni, hogy:
  - A **„kupola-sziget” is csak a gömb egy „lokális szelete”** legyen, azonos kóddal kezelve (egyszerűsített debug / tutorial mapként).

### 1.2. Domborzat + víz koncepció

- **FK:** A bolygónak van egy **domborzati térképe**, amely:
  - különféle függvényekkel, fraktálokkal, zajokkal (Perlin, simplex, stb.) generált,
  - realisztikus, változatos terepet ad (hegyek, dombok, árkok, síkságok).
- **FK:** A vízszint egy **másik gömb**, teljesen szabályos, amely a vízfelszínt jelöli.

- **JM:** Technikai modell:
  - Egy alap **cubesphere vagy icosphere** (gömbháló) minden vertexét:
    - normalizáljuk: `baseNormal = normalize(vertex - planetCenter)`,
    - domborzatfüggvénnyel módosítjuk:  
      `height = noise(baseNormal * scale) + fractal_terms`,
    - végső pozíció:  
      `pos = planetCenter + baseNormal * (R + height)`.
  - A vízszint-gömb sugara: `R_water`.  
    - Ha `R + height < R_water` → víz alatt,
    - Ha `R + height > R_water` → szárazföld.

- **FK:** Kell tudni kezelni azt a szabályt, hogy:
  - egyes járművek **nem mehetnek víz alá**,
  - egyesek **átmehetnek víz alá**,
  - egyesek **úszhatnak a felszínen**.

- **JM:** Jármű-típus flag-ek:
  - `canGoUnderwater: boolean`
  - `canFloatOnWater: boolean`
  - A mozgás- és ütközéslogika ezeket figyelembe veszi (pl. vízszint metszésénél).

### 1.3. Miért nem kell „gravitációt” szimulálni?

- **FK:** Felvetésed: valójában nem szükséges külön gravitációs vektort számolni, mert:
  - A jármű **végig a domborzaton megy**, a domborzati felület határozza meg:
    - a pozícióját (függvény a felszínen),
    - az orientációját (normálvektor).
- **FK:** Ezért elegendő a **felszínre „rávetített” mozgás** és az, hogy a jármű függőleges tengelye mindig **merőleges a lokális domborzatra**.

- **JM:** A fizikai motorban/kódban:
  - nem kötelező „valódi gravitációs erőt” szimulálni (mint 3D physics engine-ben),  
  - elég a **geometriai kényszert** tartani:
    - jármű pozíció = felszín pontja,
    - jármű orientáció = felszín normáljára épülő mátrix/quaternion.

---

## 2. Járművek mozgása és orientációja

### 2.1. Pozíció számítása a felszínen

- **FK:** A járművek mindig a felszínen legyenek, ne lebegjenek, ne bukjanak át a bolygón.
- **JM:** Alapelv:
  1. `dir = normalize(vehiclePos - planetCenter)` – a jármű „irányvektora” a középponttól kifelé.
  2. `height_at_dir = heightFunction(dir)` – domborzat magassága ezen az irányon.
  3. `vehiclePos = planetCenter + dir * (R + height_at_dir)` – jármű pozíciója a felszínen.

### 2.2. Orientáció: függőleges tengely = normálvektor

- **FK:** A jármű „függőleges tengelye” (up) legyen **merőleges a domborzat felületére**, ahol éppen áll.
- **JM:** Technikai lépés:
  - `up = surfaceNormal(dir)`
  - `forward` vektor: az input-irány a tangens síkba vetítve:
    - `forward = normalize(projectOnPlane(inputDir, up))`
  - `right = normalize(cross(up, forward))`
  - Ezekből mátrix/quat, amit a render motor használ.

### 2.3. Mozgás a tangens síkban

- **FK:** A jármű **bármely irányba mozoghat**, de mindig ragaszkodva a felszínhez.
- **JM:** Frame-enként:
  1. Inputból kapsz egy kívánt irányt (2D/3D).  
  2. Ezt vetíted a tangens síkra (ne menjen a bolygó belseje felé).  
  3. `vehiclePos += forward * speed * dt` a tangens síkban.  
  4. Utána újra normalizálod és felszínre vetíted (2.1. lépés).

---

## 3. Radar-gömb és gyémántok

### 3.1. Funkció – mit vársz el tőle?

- **FK:** Minden jármű körül van egy **radargömb**, amely:
  - a bolygó felszíne **alá is belát**,
  - a gyémántok közül azokat „fedi fel”, amelyek **a radargömb hatósugarán belül vannak**.
- **FK:** Vizuálisan **nem csak az egész gyémánt**, hanem **a gyémánt és a radargömb metszete** jelenjen meg – tehát amit a gyémánt „kimetsz” a gömbből.

### 3.2. Ki dönti el, hogy a gyémánt radaron van-e?

- **FK:** Felvetésed: jobb, ha **nem a kliens**, hanem a **szerver** dönti el, hogy mi van radaron, és a kliens csak kirajzol.
- **FK:** A multiplayer-t is a szerver vezérli, a kliens csak a vizualizációt végzi.

- **JM:** Szerver-authoritative radar logika:
  - A szerver minden tickben / adott időközönként kiszámolja:
    - `d = distance(diamondPos, vehiclePos)`
    - ha `d < radarRadius + diamondRadius` → **radaron belüli gyémánt** az adott játékos számára.
  - A szerver csak azokat a gyémántokat küldi ki a kliensnek, amelyek:
    - radaron belül vannak,
    - vagy már valamilyen játékszabály szerint felfedezettek.

### 3.3. Vizuális metszet – shaderalapú megoldás kliensen

- **JM:** A kliens csak **vizuálisan számolja a metszetet**, de **nem dönt felfedezésről**.

  - A gyémánt shaderében:
    1. A fragment shader megkapja:
       - világpozíció (`worldPos`),
       - `radarCenter` és `radarRadius` uniformban.
    2. `dist = length(worldPos - radarCenter)`
    3. Ha `dist > radarRadius` → `discard` vagy nagyon áttetsző.
    4. Ha `dist <= radarRadius` → normál gyémánt rendering.

- **FK:** Ez pontosan azt adja, amit kértél: **a gyémánt és a radargömb metszete jelenik meg**, nem az egész gyémánt.

---

## 4. Látótávolság (vision) és domborzat metszete

### 4.1. Funkcionális igény

- **FK:** Kell egy **látótávolság gömb** minden jármű köré rajzolva.  
- **FK:** A **látótáv gömb és a domborzat metszete** határozza meg, mi látszik éppen a bolygó felszínéből.
- **FK:** Erre épül a fog of war (most látszik / valaha látta).

### 4.2. Egyszerű, kézben tartható modell (első verzió)

- **JM:** Első iterációra **nem feltétlen kell „hegy mögötti takarás”** – egyszerűsítés:
  - A felszíni pont akkor „látható”, ha a **felszíni távolsága** (vagy szögtávolsága) a járműtől kisebb, mint a látótáv sugara.
- Gömbfelszínen:
  - `angle = arccos( dot(dir_surfacePoint, dir_vehicle) )`
  - Ha `angle < maxAngle` → pont a vision belsejében van.

### 4.3. Haladó modell – valódi terep-takarás (opcionális továbbfejlesztés)

- **JM (opció):** Ha később szeretnél **hegy mögötti takarást**:
  1. Rendelsz egy **depth-mapet** a jármű szemszögéből (csak a domborzat).  
  2. A depth-map alapján látod, mely felszíni pont esik az első „hit”-re (látható), és mi van mögötte (nem látható).  
  3. Ezeket használhatod a fog of war „most látható” jelölésére.

- **FK:** Jelenleg elég, ha a **látótáv gömb metszete** adja a láthatóságot; a hegy mögötti takarás későbbi igény lehet.

---

## 5. Kétrétegű Fog of War (FOW)

### 5.1. Funkcionális igény

- **FK:** Fog of war két réteggel:
  1. **Most látható réteg** – ami éppen a látótávon belül van.
  2. **Valaha látható réteg** – amit a jármű korábban már látott, de most épp nem lát.
- **FK:** Ami **soha nem volt látótávolságon belül**, az teljesen **ismeretlen** (sötét / köd).  
- **FK:** Ami **volt látótávban, de most nincs**, az **„ismert, de nem aktuálisan látott”** módon jelenjen meg (pl. halványabb).

### 5.2. Tárolás – textúra a bolygó UV-ján

- **JM:** A bolygó mesh-nek van UV-leképezése.  
- Készítesz egy **2D textúrát** (pl. 1024×1024 / felbontás tetszőleges kompromisszummal), amelyet ráhúzol a bolygóra.

- Csatornák:
  - **R (red)**: `explored` – valaha látott (0–1).  
  - **G (green)**: `visibleNow` – jelenleg látótávon belül (0–1).

### 5.3. Frissítés – „ecsettel festés”

- **JM:** A kliens (a szerver által jóváhagyott „látható területek” alapján) frissíti a textúrát:

  1. A jármű pozícióját UV-térbe transzformálja.  
  2. Egy kör-alakú „brush”-szal a G csatornán 1-re festi a pixeleket a látótávolság sugara alapján.  
  3. R csatorna: `R = max(R, G)` – ami valaha látott volt, az megmarad „explored”-nek.

- A frissítés offscreen render targeten (render-to-texture) fut.

### 5.4. Megjelenítés a shaderben

- **JM:** A bolygó shaderében:
  - Ha `G=1` → teljesen látható, normál színek.  
  - Ha `R=1` és `G=0` → halványabb, deszaturált felszín (valaha látott, de nem aktuálisan látható).  
  - Ha `R=0` és `G=0` → sötét / köd (sosem látott).

### 5.5. Szerver szerepe a FOW-ban

- **FK:** A kliens **ne dönthesse el, hogy mit lát „jogosan”** – a szerver vezérelje a logikát.  
- **JM:** Szerver:
  - kiszámítja, hogy a játékos/jármű aktuális pozíciója alapján mely felszíndarabok lehetnek látótávon belül,
  - *csak azokhoz* ad adatot (entitásokat, gyémántot, ellenséget, stb.).
- A kliens így **nem tud olyan dolgot kirajzolni**, amiről nem kapott adatot (cheat elleni védelem).

---

## 6. Multiplayer architektúra – szerver vs kliens

### 6.1. Alapelv

- **FK:** „A multiplayert a szerver vezérli, a kliens csak megjeleníti.”
- **FK:** Külön kérdésed volt: ne a kliens döntse, hogy a gyémánt „radaron van-e”, hanem a **szerver**.

- **JM:** **Szerver-authoritative** modell:
  - A **szerver** tartja karban a *realitást* (game state).  
  - A kliens csak inputot küld (mit akar csinálni) és megjeleníti a szerver által küldött eredményt.

### 6.2. Szerver feladatai

- Járművek állapotának tárolása (pozíció, orientáció, sebesség).  
- Bolygók paramétereinek / seedjeinek kezelése.  
- Gyémántok helye, állapota (rejtett / radaron / kibányászva).  
- Radar logika:
  - mely gyémánt van radaron belül, melyik játékos számára.
- Látótáv + fog of war logika:
  - mit lát most a játékos,
  - mit látott valaha.
- Instance-ek (világpéldányok) kezelése:
  - saját bolygó instance,
  - másik játékos bolygója,
  - közös űrtér,
  - hely-alapú közös tér.

### 6.3. Kliens feladatai

- WebGL render (Babylon.js / Three.js) – bolygó, járművek, gyémántok, radargömb, FoW.  
- Input gyűjtés (egér, billentyűzet, touch).  
- Vizuális effektek számítása (radargömb-gyémánt metszet, látótáv, fog of war textúra) **csak a szervertől kapott adatok alapján**.  
- Interpoláció / smoothing, hogy a hálózati késleltetés ne legyen zavaró, de ne írja felül a szerver döntéseit.

---

## 7. Hely-alapú (GPS) és online multiplayer módok

### 7.1. GPS-alapú lokális multiplayer – „egy térben lévő” játékosok

- **FK:** A játékosok **mobilon is beléphetnek**, és a **GPS lokációjuk alapján**:
  - a **közelükben lévő játékosokkal** interakcióba léphetnek,
  - felszállhatnak egy űrhajóra,
  - átmehetnek a közeli user bolygójára,
  - tehát a „lokálisan egy térben lévő” multiplayer fontos.
- **FK:** Ez az „egy térben lévő” funkció kiemelten fontos, még a távoli online módhoz képest is.

- **JM:** Geolokációs komponens:
  - A mobil kliens időszakonként elküldi a GPS pozícióját (`lat`, `lon`) a szervernek.
  - A szerver geospatial adatbázist használ (pl. PostGIS / Redis geospatial / Mongo 2dsphere):
    - `updatePlayerLocation(userId, lat, lon)` – pozíció frissítése.
    - `findNearbyPlayers(lat, lon, radiusKM)` – közeli játékosok keresése.
  - Ha két (vagy több) játékos **x km-en belül van**, a szerver:
    - őket ugyanabba a **„lokális sessionbe / térbe”** helyezi.

### 7.2. Saját bolygó és más bolygók meglátogatása

- **FK:** Minden játékosnak legyen **saját bolygója**, amelyre később űrhajóval más játékos is átmehet.
- **FK:** A játékos felszállhat egy űrhajóra, és átmehet más user bolygójára – legyen ez játékmeneti opció.

- **JM:** Minden játékoshoz tároljuk:
  - `planetSeed` / `planetParams` – ebből generáljuk a bolygót.
- Amikor egy játékos:
  - belép a saját bolygójára → a kliens generálja a bolygót a seed alapján; a szerver küldi a dinamikus state-et.
  - úgy dönt, hogy átrepül egy másik játékos bolygójára:
    - a szerver átteszi őt **annak a bolygó-instance-nek** a sessionjébe,
    - a kliens átáll a másik bolygó seedjére és state-jére.

### 7.3. Távoli online mód – űrben való találkozás

- **FK:** Lehetőség a **multiplayer „online távoli módjára”**, amikor a játékosok **az űrben találkoznak**, nem egymás bolygóján.
- **JM:** Külön „űr-instance”:
  - minden „utazó” játékos hajója bekerülhet ebbe az űrtérbe,
  - ott interakciók, ütközések, kereskedés, harc, stb. történik,
  - GPS itt már nem számít – tisztán online multiplayer tér.

### 7.4. GPS-csalás / spoofing szempontok

- **JM (biztonsági megfontolás):**
  - A GPS kliensoldalon manipulálható, ezért:
    - soft limit: életszerűtlen „teleportok” (pl. 2000 km 1 perc alatt) kiszűrése,
    - sebesség limit: pl. max. emberi/jármű sebességek,
    - ha a helyalapúság csak „hangulati / match-making” célú, a védelem lazább is lehet.

---

## 8. Technológiai stack és szerverköltség

### 8.1. Frontend technológia (web + mobil böngésző)

- **JM:**  
  - **Babylon.js** vagy **Three.js** WebGL-es motorral.  
  - Nyelv: **TypeScript** (átláthatóbb, típusos kód).  
  - Babylon/Three használható:
    - gömb-bolygó megjelenítéséhez,
    - shader alapú radargömb-gyémánt metszethez,
    - fog of war textúrákhoz,
    - járművek, űrhajók, UI megjelenítéséhez.
- Input:
  - desktop: egér + billentyűzet,
  - mobil: touch + opcionálisan giroszkóp / virtuális joystick.

### 8.2. Backend technológia

- **JM:**
  - **Node.js** alapú szerver (Express / Fastify / custom).  
  - **WebSocket** / Supabase Realtime a real-time multiplayer kommunikációhoz.  
  - Adatbázis:
    - **PostgreSQL + PostGIS** a geolokációhoz és relációs adatokhoz,
    - vagy alternatív geospatial képes adatbázis (Redis, MongoDB).  
  - Supabase mint kiegészítő:
    - Auth (user accountok),
    - adatbázis réteg,
    - alap realtime csatornák.

### 8.3. Szerverköltség szintek (becslés)

- **FK:** Kérdésed: mennyibe kerül a szerver, milyen user-szinteken milyen nagyságrenddel kell számolni?

- **JM (reális becslések):**

  1. **Prototípus / kicsi userbázis** (tucat–száz user, kevés egyidejű játékos):
     - 1 kisebb VPS: 2–4 vCPU, 4–8 GB RAM.  
     - ~**20–60 USD / hó** nagyságrend.

  2. **Közepes skálázás** (száz–néhány ezer egyidejű játékos):
     - Teljesebb infra: több instance, adatbázis, backup, monitorozás.  
     - **Néhány tíz–néhány száz USD / hó** tartomány.

  3. **Nagyobb nemzetközi játék** (több ezer+ játékos, több régió, 24/7, redundancia):
     - Regionális szerverek, DDoS védelem, auto-scaling.  
     - **Több száz – akár ezer+ USD / hó** szinttől felfelé.

- Pontos ár a **konkrét játékos-szám**, tick-rate, adatforgalom, és a rendszer optimalizáltsága függvénye.

---

## 9. Ellenőrzés – mi minden került bele a beszélgetés alapján?

**Ellenőrző lista a te oldali igényekre:**

- [x] Weboldalon futó játék, mobil támogatással.  
- [x] Gömb-bolygó és „kupola-sziget” koncepció egymás viszonyában.  
- [x] Domborzati felszín (zajokkal, fraktálokkal), külön vízszint-gömb.  
- [x] Járművek mozgása a felszínen, függőleges tengely merőleges a felszínre, gravitáció explicit kezelése nélkül.  
- [x] Víz alá nem mehet / mehet / úszik – jármű-specifikus szabályok.  
- [x] Gyémántok a felszín alatt.  
- [x] Radargömb, amely a gyémántokat belülről metszve fed fel (a közös rész látszik).  
- [x] Látótávolság, mint jármű körüli gömb és domborzat metszete.  
- [x] Kétrétegű fog of war: most látható + valaha látott.  
- [x] Multiplayer, amelyet a szerver vezérel; kliens csak megjelenít (server-authoritative).  
- [x] Kérdésed, hogy a radar „igen/nem” döntése szerver vagy kliens legyen → dokumentálva a szerver-oldali döntés.  
- [x] Hely-alapú (GPS) közeli multiplayer, „egy térben lévő” játékosokkal való interakció.  
- [x] Lehetőség űrhajóval másik játékos bolygójára átrepülni.  
- [x] Távoli online multiplayer mód (űrben találkozás).  
- [x] Szerverköltség kérdés – szintekre bontott becslésekkel.

**Ellenőrző lista a javasolt megoldásokra:**

- [x] Gömb-bolygó megvalósítása cubesphere/icosphere alapon.  
- [x] Domborzat noise + fractal displacement segítségével.  
- [x] Jármű pozíció: bolygóközéppont + normal * (R+height).  
- [x] Jármű orientáció: felszín normáljára illesztett „up”, tangens síkbeli „forward”.  
- [x] Radar-logika szerver-oldali hitdetekcióval.  
- [x] Radargömb–gyémánt metszet vizuálisan shaderben (WorldPosition + uniform).  
- [x] Látótáv első verzióban szög- / távolság alapú; opcionális depth-map-os takarás.  
- [x] Kétrétegű FOW R/G csatornás textúrával, offscreen „ecsetelt” frissítéssel.  
- [x] Szerver-authoritative architektúra: kliens csak azt látja, amire a szerver adatot ad.  
- [x] Geolokációs backend (PostGIS / Redis geospatial) a közeli játékosok detektálására.  
- [x] Instance-alapú világ (saját bolygó, másik bolygó, űr, lokális instance).  
- [x] Frontend javaslat: Babylon.js / Three.js + TypeScript.  
- [x] Backend javaslat: Node.js + WebSocket + Postgres/PostGIS/Supabase.  
- [x] Szerverköltség szintenkénti becsléssel.

Ha később új követelményt mondasz, ehhez a dokumentumhoz hozzá tudjuk fűzni, de a jelenlegi beszélgetésben eddig elhangzott **minden lényeges funkció és technikai javaslat** most belekerült és külön jelölve van, mi volt tőled (FK) és mi tőlem (JM).
