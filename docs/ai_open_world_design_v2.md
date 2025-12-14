
# AI-alapú open world bolygó-stratégia – Tervezési dokumentum (vázlat)

> **Fontos jelölések:**
> - **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**: olyasmi, amit kifejezetten te mondtál, és a játék lényegéhez tartozik.
> - **[OPCIONÁLIS – TECHNIKAI IRÁNY]**: az én javaslataim, lehetséges megvalósítási utak. Ezek szabadon módosíthatók / elhagyhatók.

---

## 1. Alapvízió és játékfantázia

### 1.1. Játék típusa és világ

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - A játék egy **open world, multiplayer bolygós stratégia / taktikai játék**.
  - Minden játékosnak lehet **saját bolygója**, saját hadserege, saját nyersanyag-rendszere.
  - A saját bolygón a játékos **túlerőben van**:
    - Nem kívánatos a klasszikus “Clash of Clans” jellegű, távollétben zajló, frontális base-raid.
    - A hangsúly nem azon van, hogy amíg offline vagy, valaki porig rombolja a bázisod.
  - A világ **folyamatosnak tűnik** (“élő világ”), de technikailag elég, ha:
    - **időegységre vetített becslésekkel** számolunk (pl. ha 1 óra alatt 10 nyersanyagot bányásznak, akkor 1 hét alatt ennek megfelelő mennyiséget),
    - és csak **rendkívüli eseményeknél** (pl. harc, invázió, rajtaütés) fut valósidejű, részletes szimuláció.

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - A világ felosztható **zónákra / szektorokra**:
    - `INACTIVE` állapot: csak aggregált gazdasági becslés fut.
    - `SIMULATED` állapot: részletes fizika + AI (pathfinding, harc, detekció).
  - Egy `WorldManager` modul felel a zónák aktiválásáért/inaktiválásáért a játékosok és események függvényében.

---

## 2. Játékos szerepe, egységek irányítása és AI-copilot

### 2.1. Nagyfőnök + operatív AI-vezető

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - A játékos **“nagyfőnök”**:
    - **Magas szintű parancsokat** ad:
      - pl. “Bányászok menjenek oda bányászni” – a játékos **rámutat egy helyre** a térképen.
      - pl. “Vegyék körbe és támadják meg a mellettem lévő várost” – a játékos kijelöli a célt.
  - Egy **AI-copilot / operatív vezető** végzi a parancsok **lebontását**:
    - Kiválasztja, mely egységek menjenek.
    - Útvonalakat számol.
    - Körbezárja a várost, ostrompozíciókat választ.
    - Bányászoknál: ki menjen bányászni, ki hordja haza, ki őrizzen, stb.

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - Belső API-szinten:
    - Magas szintű parancsok struktúrált formában:
      - `Order.Mine(position)`, `Order.Siege(cityId)`, `Order.Defend(areaId)` stb.
    - Egy `Commander` modul / rendszer:
      - ez a modul bontja le a high-level célokat unit-szintű **taskokra**:
        - pl. `Task.GoTo(pos)`, `Task.Mine`, `Task.Attack(target)`, `Task.Patrol(area)`.

### 2.2. Direkt irányítás – „beszállok egy tankba”

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - A játékos **bármikor beszállhat egy tankba** (vagy más egységbe):
    - ekkor **közvetlenül irányítja** azt (FPS/TPS-szerű irányítás),
    - **harcol is vele**, és **tanítja is** egyben.
  - A játékos:
    - **nem csak akkor tanítja** az egységeket, amikor offline lesz,
    - hanem **mindig**, amikor ő maga irányít egy egységet.
  - Amíg egy adott egységben a játékos ül:
    - azt **teljesen ő kontrollálja**,
    - közben **minden más saját egysége**, amit épp nem ő irányít:
      - **úgy működik, ahogyan tőle tanulták** korábbi játékhelyzetekben.

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - Minden egység rendelkezik egy `ControllerComponent`-tel, amely azt tartja nyilván, hogy:
    - `ActiveController = PlayerController | LearnedAIController | RuleBasedAIController`.
  - Prioritás:
    1. Ha a játékos “beszállt” → `PlayerController` az aktív.
    2. Ha nincs player kontroll:
       - ha van tanult policy → `LearnedAIController`.
       - ha nincs / hibás → `RuleBasedAIController`.
  - A “beszállás” szerveroldalról:
    - kliens küldi: `REQUEST_POSSESS(unitId)`,
    - szerver ellenőrzi, hogy az egység a játékosé-e,
    - beállítja az aktív kontrollert `PlayerController`-re.

---

## 3. Tanuló egységek – hogyan tanulnak „tőlem”?

### 3.1. Fázis: először én irányítom, aztán az AI

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - A játék elején a játékos **maga irányítja**:
    - a tankot, tüzérségi egységet, bányászokat, stb.
  - Miután **már többször irányította** ezeket a típusegységeket:
    - a játék **megtanulja**, hogyan csinálta,
    - és ezután:
      - az AI **úgy irányítja az adott egységtípust**, ahogyan a játékos.
  - A játékos **bármikor beavatkozhat**:
    - átveheti egy-egy egység közvetlen irányítását,
    - ezzel **folyamatosan tovább tréningezi** az adott egységtípust és/vagy az adott konkrét egységet.
  - Cél:
    - Az egységek **„maguktól is arra legyenek képesek”**, amit a játékostól tanultak.

### 3.2. Imitation learning / behavioral cloning alapelve

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - A tanulás mintája: **imitation learning / behavioral cloning**:
    - a rendszer **nem általános gondolkodást** tanul,
    - hanem a **state → action** mintázatot másolja:
      - “ilyen helyzetben mit csinált a játékos?”
  - Bemenet (state) példák:
    - egység pozíciója, sebessége, iránya,
    - ellenségek pozíciói, távolsága, iránya,
    - fedezékek, akadályok,
    - HP, ammo, aktuális cél (támadás, védelem, felderítés).
  - Kimenet (action) példák:
    - mozgási parancsok (előre, hátra, jobbra, balra, megáll),
    - támadó parancsok (melyik célpontra, lő/nem lő),
    - speciális képességek használata.

### 3.3. Adatgyűjtés – PlayerDataRecorder

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - Amikor az egységet a játékos irányítja (`PlayerController` aktív):
    - minden tick-ben rögzítjük:
      - az aktuális **state vektort**,
      - és a játékos által kiadott **action**-t.
  - Az adatgyűjtés:
    - **egységtípusonként** (tank, arty, bányász),
    - akár **egység-csoportonként** is (pl. speciális elit egységek).
  - Ezek a logok később egy `TrainingService` számára szolgálnak bemenetként, amely:
    - tanít egy kis neurális hálót,
    - majd azt modelként exportálja (pl. ONNX).

### 3.4. Policy-k és controller váltás

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - A tanult modellek (policy-k) pl.:
    - `TankPolicy_PlayerX_v1.onnx`,
    - `ArtilleryPolicy_PlayerX_v1.onnx`.
  - Egy `PolicyStore` modul tárolja, hogy:
    - adott játékosnak adott egységtípuson:
      - melyik policy-verzió az aktuális.
  - A `LearnedAIController`:
    - a `PolicyRuntime` segítségével:
      - state → model.predict(state) → action folyamatot hajt végre.

### 3.5. Fairness és balansz (opcionális tervezési szempont)

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - A tanult AI **emberfeletti mikrot** is tudna (ha nincs korlátozva), ezért:
    - érdemes:
      - limitálni a döntéssűrűséget (pl. max X döntés / másodperc),
      - beépíteni minimális reakcióidőt (pl. 100–200 ms),
      - simítani a mozgást, hogy ne legyen “túl robotikus”.
  - Így a tanult AI:
    - **hasonlóan viselkedik, mint a játékos**, de nem lesz irreálisan OP.

---

## 4. Folyamatos „élő világ” – de okos, becsléses háttérszámítással

### 4.1. Aggregált időbeli becslés

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - Nem szükséges, hogy a világ **minden pillanatban teljes részletességgel fusson**.
  - Elég:
    - ha tudjuk, hogy **egységnyi idő** alatt (pl. 1 óra) mennyi termelés történik (pl. 10 egység resource),
    - és ebből **interpolálunk**:
      - pl. 1 hét alatt várhatóan mennyit termel.
  - Ha **rendkívüli esemény** történik:
    - pl. ellenség érkezik, harc alakul ki,
  - akkor:
    - annak **eredményét kell kiszámolni**,
    - és **belekalkulálni** a világ állapotába addigra, míg a játékos visszatér a játékba.

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - INACTIVE zónában:
    - pl. `ore += miners * miningRate * deltaTime`,
    - figyelembe véve:
      - paraziták csapolását,
      - szimbionták által adott bónuszokat.
  - SIMULATED zónában:
    - teljes, tick-alapú AI + fizika fut (harc, detekció, mozgás).

---

## 5. Külső jelenlét a bolygón: paraziták és szimbionták

### 5.1. Parazita egységek – „élősködők” a bolygómon

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - Idegen játékosok a bolygómon:
    - **nem feltétlenül engem akarnak megtámadni** frontálisan,
    - mert a saját bolygómon **túlerőben vagyok**.
  - Ehelyett:
    - **megpróbálnak észrevétlenek maradni**,
    - elrejtőzve a nyersanyagforrásaimat **megcsapolják**.
  - Amíg:
    - a bolygóm **túloldalán vannak**, lehet, hogy **észre sem veszem őket**.
  - Ilyen egységeket **bárki elhelyezhet** mások bolygóján, és:
    - ezek **egymás ellen is harcolhatnak** a jó helyekért.
  - Ha **észreveszem őket**:
    - akkor is **nehéz ezeket az “élősködőket” a bolygómról kiirtani**,
    - vagyis ne legyen triviális a “felkutatom és egy lövéssel lelövöm” típusú megoldás.

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - Parazita egység (`UnitType = PARASITE`), fő adatok:
    - `StealthRating` – rejtőzködő képesség,
    - `SiphonRate` – csapolási sebesség,
    - `RiskProfile` – lebukási valószínűség,
    - `OwnerPlayerId` – kié az élősködő (nem a host!).
  - Egy `DetectionSystem`:
    - **indirekt jelek**:
      - termelési anomália (vártnál kevesebb resource),
      - szenzor “zaj”, ghost ping-ek,
    - **aktív felderítés**:
      - scanner sweepek, járőrözés, drónok,
    - **cleanup fázis**:
      - ha lokalizáltuk, akkor vadász missziók, harc.
  - Parazita vs parazita:
    - több frakció parazitája ugyanazon resource környékén:
      - mini-harcok egymás között,
      - vagy “piacmegosztás” jellegű csapolás.

### 5.2. Szimbionta frakciók – „városállamok” a bolygómon

- **[KÖTELEZŐ – FELHASZNÁLÓI VÍZIÓ]**
  - Nem csak olyan idegenek lehetnek, akik **visznek**:
    - hanem olyanok is, akik **valami értékelhetőt adnak**.
  - Ezekkel:
    - **dönthetek úgy**, hogy **szimbiózisban élek**,
    - hasonlóan, mint a **Civ6-ban a városállamokkal**.
  - Tehát:
    - a saját bolygómon megjelenhetnek olyan idegen egységek / telepek, amelyekkel **partnerséget köthetek**, nem csak ellenségként kezelem őket.

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - `ExternalPresence` entitás:
    - `mode = PARASITE | SYMBIONT | NEUTRAL/TRADER`.
  - Szimbionta (SYMBIONT) fő jellemzői:
    - **ad**:
      - termelési bónuszok (pl. +X% resource),
      - különleges tech / egység / modul elérés,
      - védelmi támogatás (pl. lő parazitákra),
      - információ (előbb jelzi a gyanús aktivitást).
    - **kér**:
      - fix resource részesedést,
      - területet (no-build/no-attack zónát),
      - diplomáciai kötelezettséget (védelem, bosszú).
  - Civilizáció VI városállam-analóg:
    - `RelationSystem`:
      - `Trust`, `Influence`, `TreatyType`,
    - `SymbiosisContractSystem`:
      - konkrét szerződések:
        - mit ad a szimbionta,
        - mit adok én neki.

---

## 6. AI-architektúra – klasszikus AI + opcionális LLM-réteg

### 6.1. Klasszikus game AI (javasolt alap)

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - A **unit-szintű irányításhoz** (tank mozgása, lövés, bányász ciklus) célszerű:
    - **klasszikus játékmenet AI-t** használni:
      - FSM (Finite State Machine),
      - Behavior Tree (BT),
      - GOAP (Goal-Oriented Action Planning).
  - Ezek:
    - gyorsak,
    - determinisztikusak,
    - szerveroldalon jól skálázhatók.
  - A tanult policy (NN):
    - az **Action választás módjába** épülhet be:
      - pl. adott state-ben a behavior tree egy döntési pontján a policy dönti el, melyik ágat válassza,
      - vagy full “policy-controllerként” működik.

### 6.2. LLM, mint magas szintű parancs-fordító (nem kötelező)

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - Ha a játékos **természetes nyelven** akar parancsot adni (pl. chatbe beírja: “A bányászok menjenek a keleti hegylánchoz és ott bányásszanak”), akkor:
    - egy LLM használható **parancs-fordító rétegként**:
      - input: szöveges parancs,
      - output: struktúrált high-level parancs JSON-ben:
        - pl. `{ "command": "MINE_AT", "area": "east_mountains" }`.
  - A tényleges irányítást **nem** az LLM végzi:
    - a játékon belüli AI (Commander + Controller + policy) végzi a tennivalókat.
  - RL (reinforcement learning) alapú teljes vezérlés:
    - elvileg lehetséges,
    - de komplexitás és erőforrásigény miatt **nem javasolt első iterációban**.

---

## 7. Technikai architektúra – modulok és rétegek

### 7.1. Fő rétegek

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  1. **World & Time Layer**
     - zónák, időkezelés, aktív vs inaktív zónák.
  2. **Entity & Component Layer**
     - egységek, struktúrák, resource node-ok, external presence.
  3. **Control Layer**
     - ki irányít egy egységet (Player / LearnedAI / RuleBased).
  4. **AI & Learning Layer**
     - adatgyűjtés, modell-tanítás, policy-futtatás.
  5. **Simulation Scheduler**
     - mikor fut részletes szimuláció és mikor csak aggregált becslés.
  6. **Networking & Authority**
     - szerver-authoritative logika, kliens csak megjelenít + input.

### 7.2. Entity & Component model – példák

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - Fő entity típusok:
    - `Unit` (tank, tüzér, gyalogos, bányász, parazita, szimbionta egység),
    - `Structure` (bázis, torony, gyár, szimbionta outpost),
    - `ResourceNode` (érc, energia, ritka resource),
    - `ExternalPresence` (paraziták, szimbionták, trader-ek),
    - `PlayerProfile`.
  - Tipikus komponensek:
    - `TransformComponent` – pozíció, irány,
    - `StatsComponent` – HP, armor, sebesség,
    - `ControllerComponent` – aktív kontroller,
    - `AIStateComponent` – belső AI-státusz,
    - `PolicyReference` – melyik policy vonatkozik az egységre,
    - `FactionComponent` – melyik játékos / frakció tulajdona.

### 7.3. Control Layer – IController és implementációi

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - `IController`:
    - `DecideAction(unit, worldState) -> Action`.
  - Implementációk:
    - `PlayerController` – közvetlen játékos input,
    - `LearnedAIController` – tanult policy-k,
    - `RuleBasedAIController` – FSM/BT/GOAP,
    - opcionálisan `ScriptedController` – küldetésekhez.

### 7.4. AI & Learning Layer – PlayerDataRecorder, TrainingService, PolicyRuntime

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - `PlayerDataRecorder`: state/action logolás, ha PlayerController aktív.
  - `TrainingService`: modell tanítása a logokból (pl. Python + PyTorch).
  - `PolicyStore`: modellek és verziók tárolása.
  - `PolicyRuntime`: szerveroldali inference.

### 7.5. Simulation Scheduler – ZoneState, BackgroundEconomy

- **[OPCIONÁLIS – TECHNIKAI IRÁNY]**
  - `ZoneState = INACTIVE | SIMULATED`.
  - `ZoneSimulationController`: zónák váltása inaktív ↔ szimulált között.
  - `BackgroundEconomy`: aggregált gazdasági számítások (termelés, csapolás, szimbionta-bónuszok).

---

## 8. Összegző ellenőrző lista – lefedettség

Az itt felsorolt pontok mind **megjelennek a dokumentumban**:

1. AI-copilot, mint operatív vezető → **2.1.**
2. Direkt irányítás („beszállok egy tankba”) + tanítás → **2.2., 3.1.–3.3.**
3. Egységek tőled tanulnak, és mindig – online/offline – “úgy viselkednek, mint te” → **2.2., 3.1.–3.4.**
4. Nem CoC-jellegű offline raid, hanem túlerő saját bolygón → **1.1., 5.1.**
5. Folyamatos élő világ, interpoláció, csak eseménynél részletes szimuláció → **1.1., 4.1.**
6. Paraziták: lopakodó csapolás, nehéz észrevenni, egymás ellen is harcolnak → **5.1.**
7. Nehéz kiirtani az élősködőket → **5.1.**
8. Szimbionták: nem csak visznek, adnak is; Civ6 városállam analóg → **5.2.**
9. Szimbionták segíthetnek a paraziták detektálásában → **5.2.** (DetectionSystem-mel kombinálva).
10. Klasszikus game AI + imitation learning kombinációja → **3.2.–3.4., 6.1.**
11. LLM csak opcionális, parancs-fordító rétegként → **6.2.**
12. Moduláris, „vizsgadokumentum-szerű” architektúra leírás → **7. fejezet.**

Ha új ötletet hozol, ez a dokumentum bővíthető további fejezetekkel, de az eddigi beszélgetésből **nem maradt ki lényegi gondolat**: minden felvetésed és a hozzá tartozó (opcionális) megvalósítási javaslat benne van jelölve.

