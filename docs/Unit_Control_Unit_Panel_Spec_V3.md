\# Robot Colony War – Unit Control & Unit Panel Spec (V3)

ULTRA-THINK verzió – Gemini számára implementációs szemlélettel, \*\*kód nélkül\*\*, csak viselkedés.

\---

\## 0. Alapelv – Módok VAGY/VAGY

Bal egérgomb esetén \*\*egy adott művelet alatt mindig csak egy mód aktív\*\*

(egy mousedown–mouseup ciklusban pontosan egy interpretáció):

1\. Bal click uniton → \*\*select unit\*\*

2\. Bal click terepen (drag nélkül) → \*\*deselect\*\*

3\. Bal drag terepen → \*\*terrain / camera drag\*\*

4\. Bal drag uniton → \*\*path draw\*\* (útvonalrajzolás)

5\. Dupla bal click uniton → \*\*Unit ablak nyitása\*\*

Ezek \*\*nem keveredhetnek\*\* egyetlen interakció során.

\---

\## 1. Hover (on mouse over)

\- Ha az egér \*\*unit fölé kerül\*\*, jelenjen meg egy \*\*korszerű hover-jelölés\*\*:

\- pl. soft glow / outline / ring a unit körül.

\- Szín egységes rendszerben: pl. a kijelöléshez és path-vonalhoz illeszkedő narancs árnyalat.

\- Hover \*\*nem\*\* jelent kijelölést, csak vizuális visszajelzés arról, hogy melyik unit lenne érintve egy kattintás esetén.

\---

\## 2. Bal egérgomb – Top-down nézetben

\### (1) Bal click uniton → SELECT

\- \*\*Bal gomb lenyom + felenged uniton, minimális egérmozgással\*\*

→ a unit \*\*kijelölődik\*\*.

\- A kijelölt unit erősebb highlightot kap, mint a hover állapot (pl. vastagabb gyűrű, erősebb glow).

\---

\### (2) Bal click terepen → DESELECT

\- \*\*Bal gomb lenyom + felenged terepen (nem uniton), minimális egérmozgással\*\*

→ \*\*deselect\*\*, semmi más nem történik.

\- A kamera/terrain ilyenkor \*\*nem mozdul\*\*.

\---

\### (3) Bal drag terepen → TERRAIN / CAMERA DRAG

\- \*\*Bal gomb lenyomása terepen (raycast: nem unit), majd egér mozgatása\*\*

→ \*\*kamera / terep drag\*\*:

\- a játékos „megfogja” a világot, és húzza / pan-eli.

\- A korábban kijelölt unit \*\*nem veszti el\*\* a selectiont.

\- Deselect csak az (2) esetben történik (click, drag nélkül).

\- Döntés logika:

\- MOUSEDOWN pillanatában raycast → ha \*\*terrain-hit\*\*, akkor ez az input \*\*kamera/terrain drag\*\*,

\- ez az input \*\*nem mehet át\*\* path-rajzolásnak.

A Gemini gondolja át:

\- top-down kamera panning/orbit kombináció,

\- domborzat miatti perspektíva,

\- zoom + pan interakció.

\---

\### (4) Bal drag uniton → ÚTVONALRAJZOLÁS (PATH DRAW)

\- \*\*Bal gomb lenyomása uniton (raycast: unit-hit), majd egér mozgatása\*\*

→ az egér kurzor 3D világra raycastelt pontja a domborzaton \*\*útvonalat rajzol\*\*.

\- Útvonal vizuális stílusa:

\- kijelöléssel harmonizáló narancsos vonal,

\- lehet glow, nyilak, pontok,

\- a vonal ténylegesen a 3D terepgeometriához igazodik (magasságok, lejtők, akadályok).

\- \*\*Egérgomb felengedésekor\*\*:

\- a unit \*\*elindul az útvonalon\*\*,

\- ha \*\*CTRL nyomva volt\*\*, akkor ez az útvonal \*\*queue-elem lesz\*\* (lásd: CTRL mód).

\- Döntés logika:

\- MOUSEDOWN unit-hit → ez az interakció \*\*mindig path-mode\*\*,

\- a kamera controller \*\*nem kaphat\*\* drag eseményt ebből a ciklusból.

A Gemini gondolja át:

\- path smoothing (Bezier/spline),

\- akadálykerülés,

\- meredek lejtők, szakadékok kezelése.

\---

\### (5) Dupla bal click uniton → UNIT ABLAK

\- \*\*Dupla bal click egy uniton\*\*

→ megnyitja a \*\*Unit ablakot\*\* (overlay / panel).

\- A panel jobb felső sarkában \*\*X\*\* gombbal zárható.

\- A játékvilág a háttérben tovább futhat (nincs kötelező pause).

\---

\## 3. Jobb egérgomb – Akciók

Top-down nézetben, kijelölt unityvel:

\### Pont-akció (point action)

\- \*\*Jobb click egy pontra a terepen / célponton\*\*

→ a unit \*\*akciót hajt végre\*\* azon a ponton:

\- harci unit: oda lő / támad,

\- exkavátor: ott simítja/ássa a talajt,

\- bányász: ott kezd bányászni,

\- stb.

\- Ha \*\*CTRL nincs lenyomva\*\* → az akció \*\*azonnal végrehajtásra kerül\*\* (a unit odamegy / odafordul és cselekszik).

\- Ha \*\*CTRL lenyomva\*\* → a „itt hajts végre akciót” parancs \*\*queue-elem\*\* lesz (lásd: CTRL mód).

\---

\### Terület-akció (area action)

\- \*\*Jobb gomb lenyomva tartása + drag + felengedés\*\*

→ kijelöl egy \*\*célterületet\*\* (area).

\- A gomb \*\*felengedésekor\*\*:

\- a unit a kijelölt területen hajt végre akciót (AoE lövés, nagy terület tereprendezése, bányászat, stb.).

\- Ha \*\*CTRL nincs lenyomva\*\* → a terület-akció \*\*azonnali\*\*.

\- Ha \*\*CTRL lenyomva\*\* → a „ezen a területen hajts végre akciót” \*\*queue-elem\*\* lesz.

\---

\## 4. CTRL mód – Parancssor (QUEUE)

\*\*CTRL lenyomása = programozó mód (queue módszer).\*\*

\### Működés

\- Amíg a \*\*CTRL le van nyomva\*\*, a bal és jobb egérgombbal kiadott parancsok:

\- \*\*nem azonnal hajtódnak végre\*\*,

\- hanem \*\*parancssorként (queue)\*\* tárolódnak.

\#### Queue-elem típusok:

CTRL lenyomva tartása közben:

\- Bal click terepen → „\*\*menj ide\*\*”.

\- Bal drag uniton + felengedés → „\*\*járd be ezt az útvonalat\*\*”.

\- Jobb click ponton → „\*\*itt hajts végre akciót\*\*”.

\- Jobb drag + area → „\*\*ezen a területen hajts végre akciót\*\*”.

A parancsok a \*\*bevitel sorrendjében kerülnek\*\* a queue-be.

\### Queue indítása

\- Amikor a játékos \*\*felengedi a CTRL-t\*\*:

\- a unit \*\*elkezdi sorban végrehajtani\*\* a queue minden elemét:

1\. Menj ide,

2\. ott akció,

3\. menj amoda,

4\. ott terület-akció,

5\. stb.

A Gemini gondolja át:

\- queue vizuális megjelenítése (számozott waypoint ikonok, action-piktogramok),

\- azonnali parancsok viszonya queue-hoz (felülírják-e, vagy a végére fűződnek),

\- queue törlése / szerkeszthetősége.

\---

\## 5. Roham / Third Person mód – fővilág

\### Egér-alapú Roham mód

\- Ha egy \*\*kijelölt unityn\*\* a játékos \*\*lenyomva tartja a bal gombot\*\* (nem click, hanem press-and-hold):

1\. A kamera \*\*folyamatos átmenettel\*\* (smooth, íves interpolációval) a unit mögé fordul, klasszikus \*\*third-person view\*\* pozícióba.

2\. Amíg a bal gomb \*\*lenyomva van\*\*,

\- az egér \*\*képernyőn belüli pozíciója\*\* határozza meg a unit \*\*mozgásirányát és sebességét\*\*:

\- irány: vektor a referencia-pont (pl. képernyő közepe / fix pont) és a kurzor pozíciója között,

\- sebesség: ennek a vektornak a hossza (joystick-szerű érzet).

\- \*\*Bal gomb felengedésekor\*\*:

\- a unit \*\*folytatja a mozgást\*\* a legutolsó irány/ sebesség szerint,

\- megáll, ha:

\- eléri azt a pontot, ahol a bal gombot legutóbb felengedték, vagy

\- a játékos bal gombbal rákattint / ráhúzza a kurzort a unitra és ott engedi fel.

\### Roham akciók

\- \*\*Jobb click\*\*:

\- az aktuális célkereszt pontján \*\*azonnali akció\*\* (pl. lövés).

\- \*\*Jobb drag + felengedés\*\*:

\- terület kijelölése,

\- a kijelölt területre vonatkozó terület-akció.

A Gemini gondolja át:

\- kamera-spring, enyhe rázkódás,

\- camera collision (ne menjen a talaj / objektumok belsejébe),

\- horizon stabilitás, ne forduljon át a kamera.

\---

\### Billentyűs Roham / TPS

\- Ha egy unit \*\*kijelölt\*\*, és \*\*nincs nyitva Unit ablak\*\*,

és a játékos \*\*mozgásra szolgáló billentyűt nyom (W/A/S/D vagy kurzorok)\*\*:

\- a kamera \*\*smooth átmenettel\*\* a unit mögé fordul third-person nézetbe,

\- a unit mozgását innentől a billentyűk vezérlik, a kamera követi (TPS logika).

\---

\## 6. Unit ablak – Third Person „minimap”

\### Nyitás

\- \*\*Dupla bal click\*\* egy uniton → megnyílik a \*\*Unit ablak\*\*.

\### Tartalom

A Unit ablak tartalmazhat:

1\. \*\*Tulajdonságok panel\*\*: HP, armor, range, speed, modulok, fegyverek, AI viselkedésmódok.

2\. \*\*Queue megjelenítés\*\* (ha van aktív parancssor).

3\. \*\*Mini 3D „minimap”\*\*, ami valójában:

\- egy unit-központú \*\*third-person / orbit kamera\*\* mini nézete.

\### Minimapos kamera viselkedése

\- A minimap a valódi 3D világot mutatja, a unit középponttal.

\- Az egér \*\*pozíciója a minimap nézeten belül\*\*:

\- jobbra mozgatás → a kamera jobbra orbitál a unit körül,

\- balra → balra,

\- felfelé → a kamera magasabb pozícióból néz le,

\- lefelé → a kamera alacsonyabban helyezkedik el.

\- A kamera mozgása \*\*mindig folyamatos (smooth)\*\*:

\- easing (ease-in/out),

\- kerüli a hirtelen 180° fordulatokat, gimbal lock helyzeteket.

\#### Kalibráció

\- Ha a játékos a minimap-nézetben \*\*a kurzort a unit ikonja fölé mozgatja\*\*:

\- a kamera automatikusan egy \*\*alap third-person nézetbe\*\* áll:

\- a unit mögött,

\- enyhe felülnézetből,

\- stabil „TPS alap” beállítás.

A Gemini gondolja át:

\- hogyan bővíthető a minimap-TP nézet később mozgásvezérléssel is,

\- mikor marad csak „körülnézés” (kamera), és mikor aktív unit-mozgás.

\---

\## 7. Kamera átmenetek (általános elv)

Bármilyen nézetváltásnál:

\- top-down ↔ third-person,

\- third-person ↔ minimap-TP,

\- top-down ↔ bármely más kameraügynök,

\*\*soha ne legyen vágás\*\*, hanem:

\- a kamera \*\*folytonos pályán (ív mentén)\*\* interpoláljon a régi és az új pozíció / orientáció között,

\- vegye figyelembe a 3D világot:

\- ne menjen terep alá,

\- kerülje az objektumokon való áthaladást,

\- tartsa a unitot láthatóan a képernyőn.

\---

\## 8. 3D világ-specifikus gondolkozás (Gemini számára)

A Gemini gondolja végig, kód nélkül:

\- \*\*Raycast használata\*\*:

\- egér kurzor → raycast a 3D világba,

\- path-rajzolásnál a terepre eső pontból épül az útvonal,

\- selection/hit detection is raycast-alapon történik.

\- \*\*Terepmagasság, akadályok\*\*:

\- path-smoothingnél a vonal kövesse a terep valós magasságát,

\- ne engedje, hogy az útvonal irreálisan átvágjon sziklákon, falakon,

\- állapítsa meg, mely útvonalak megvalósíthatók.

\- \*\*Camera collision és horizon\*\*:

\- kamera ne menjen ki a pályáról, ne üsse be magát tereptárgyakba,

\- kezelje, ha a unit és a kamera közé tereptárgy kerül (pl. „camera lift” vagy „wall fade”),

\- tartsa a horizontot stabilnak, hogy a játékos ne dezorientálódjon.

\---