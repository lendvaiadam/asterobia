# Rendszerelemzési Jelentés és Master Dokumentum Terv

Ezt a jelentést a meglévő projekt dokumentáció (14 markdown fájl) részletes elemzése alapján állítottuk össze. A cél a rendszer struktúrájának, a fejlesztői szándéknak és a meglévő döntéseknek a tisztázása, valamint az ellentmondások feltárása volt.

## 1. Azonosított Témák és Rendszerterületek

A dokumentáció alapján a játék hat fő pillérre épül:

1.  **Gömb alakú világ és fizikai szimuláció**
    *   Procedurális bolygógenerálás, sima átmenet a zónák között.
    *   A játékmenet szigorúan a felszínen zajlik.
    *   Technikai optimalizáció: zóna rendszer, LOD.

2.  **K+F+Gy (Kutatás, Fejlesztés, Gyártás) és Gazdaság**
    *   Moduláris egységtervezés: A játékos nem kész egységeket gyárt, hanem funkciókat kutat.
    *   Folyamat: Szükséglet (Need) → Funkció (Feature) → Típus (Type) → Egység (Unit).
    *   Szín alapú erőforrás rendszer.

3.  **AI Paradigma: Imitációs Tanulás és Copilot**
    *   A játékos tanítja az AI-t ("QWOP-szerű" skill layertől a stratégiai szintig).
    *   AI Copilot / Parancsnok rendszer: A játékos parancsokat ad, az AI végrehajtja a tanultak alapján.
    *   Hibrid megközelítés: Szabály alapú rendszerek és ML (Machine Learning) keveréke.

4.  **Metajáték: Entrópia, Örökség és "Istenek"**
    *   A birodalmaknak életciklusa van: felemelkedés, stagnálás, összeomlás.
    *   A játékos célja nem a "győzelem", hanem a hagyaték (Legacy) építése.
    *   "Fehér törpe" állapot: A játék végén a birodalom maradványa.

5.  **Multiplayer Architektúra (Demó vs. Vízió)**
    *   **Demó 1.0 (Rövid táv):** Host-alapú, peer-to-peer jellegű, kisebb játékosszám.
    *   **Vízió (Hosszú táv):** Dedikált szerverek, perzisztens világ, GPS alapú lokális interakciók.

6.  **Kamera és Vezérlők**
    *   Komplex, gömbi kamera rendszer (Orbit, Fly-To, Drag).
    *   Egér alapú interakciók (Pan vs Orbit megkülönböztetése).

## 2. Meglévő Döntések (Hard Constraints)

A dokumentumok alapján az alábbi pontok tekinthetők eldöntött ténynek:

*   **Világforma:** A világ szigorúan gömb alakú (nem sík, nem tórusz).
*   **Fizika:** Geometriai alapú (felszíni projekció), nem teljes értékű newtoni fizika minden objektumra.
*   **Fog of War:** Kétrétegű rendszer ("Most látható" vs "Felfedezett, de nem látható").
*   **Szükségletek (Needs):** Dinamikusan felfedezhető események/állapotok, nem statikus tech tree.
*   **Egység felépítés:** Moduláris (Body + Engine + Weapon + Sensors).
*   **Offline szimuláció:** A játék leállítása után a szimuláció "megáll", visszatéréskor becsléssel zárkózik fel (offline delta).
*   **Motor:** Three.js (korábbi elképzelésekkel ellentétben).
*   **Irányítás:** Bal gomb = Kijelölés/Pan, Jobb gomb = Orbit/Parancs.
*   **Hálózat (Demó):** Server-authoritative logikára törekvés, de hostolt környezetben.

## 3. Ellentmondások és Nyitott Kérdések

A fejlesztés következő szakaszában ezeket kell tisztázni:

*   **Multiplayer Architektúra:**
    *   *Ellentmondás:* A vízió dedikált szervereket és masszív perzisztenciát ígér, de a Demó terv host-alapú megoldást vázol.
    *   *Teendő:* A Demó 1.0 hatókörének szigorú betartása, tudatosítva a későbbi átírás szükségességét.

*   **Motorválasztás:**
    *   *Ellentmondás:* Régi dokumentumok Unreal/Babylon.js-t említenek.
    *   *Döntés:* Three.js a végleges irány (ez a kódbázisból is látszik), a régi hivatkozások elavultak.

*   **Egységvezérlés pontossága:**
    *   *Ellentmondás:* A `Unit_Control_..._Spec_V3.md` nagyon részletes "Queue" és "TPS" módokat ír, a `controls.md` egyszerűbb RTS vezérlést.
    *   *Megoldás:* Indulás a `controls.md` egyszerűbb modelljével, a komplexebb elemeket később hozzáadni.

*   **AI implementáció valósága:**
    *   *Kérdés:* A PyTorch/ONNX pipeline ("tanuló AI") egyelőre csak terv. Hogyan hidaljuk át a "szabály alapú" és a "tanult" AI közötti szakadékot a demóban?
    *   *Valószínű válasz:* A Demó 1.0-ban tisztán szabály alapú AI lesz (ez a reális).

*   **Offline perzisztencia (Demó):**
    *   *Kérdés:* Hogyan valósul meg a "snapshot megosztás" valódi backend nélkül?
    *   *Megoldás:* Lokális fájl (JSON) export/import a demóhoz.

*   **GPS játékmenet:**
    *   *Állapot:* A koncepciókban hangsúlyos, de a demó tervből hiányzik.
    *   *Döntés:* Demó 1.0-ból kihagyandó.

## 4. Javasolt Master Dokumentum Vázlat

Javaslom a dokumentáció egységesítését egyetlen "Master System Document" (vagy mappa struktúra) alá, az alábbi fejezetekkel:

### I. Vízió és Metajáték
*   A játék célja, hangulata.
*   Az "Istenek" és "Örökség" koncepció.
*   Források: `birodalmak_istenei_koncepcio_v2.md`, `mobil_birodalom_jatek_koncepcio_full.md`

### II. Világ és Szimuláció
*   Gömb világ, fizika, időjárás.
*   Zónák és optimalizáció.
*   Források: `gomb_bolygos_jatek_terv_v2.md`, `system_plan_demo_1_0_full.md`

### III. K+F+Gy Rendszer (Egységmodell)
*   Szükségletek, Funkciók, Típusok, Egységek.
*   Gazdaság és erőforrások.
*   Források: `game_rdp_system_full_spec.md`

### IV. AI és Vezérlőrendszerek
*   Imitációs tanulás pipeline.
*   Parancsnoki hierarchia.
*   Források: `ai_open_world_design_v2.md`

### V. Multiplayer Architektúra
*   Hálózati modell (Host vs Dedicated).
*   Adatszinkronizáció.
*   Források: `system_plan_demo_1_0_full.md`

### VI. Technikai Implementáció (Gyakorlati útmutató)
*   Kódstruktúra, osztályok.
*   Fejlesztői irányelvek.
*   Források: `technical_documentation.md`, `Unit_Control_Unit_Panel_Spec_V3.md`, `controls.md`

## 5. Archiválási Javaslat

A tisztánlátás érdekében javasolt az alábbi, inkább "munkafüzet" jellegű fájlok archiválása (pl. egy `archive/` mappába), miután tartalmuk átkerült a Master dokumentumba vagy a feladatlistába:
*   `short_term_plan.md`
*   `fixes_and_ideas.md`
*   `planned_features.md` (ha beolvad a Masterbe)

---
*Dátum: 2024. 12. 13.*
