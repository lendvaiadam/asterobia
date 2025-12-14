# BIRODALMAK ISTENEI – KONCEPCIÓS DOKUMENTUM (v2)

**Megjegyzés a verzióról**

- Ebben a verzióban **minden koncepcionális elem elsődlegesen a te (játéktervező) gondolataidból származik**.
- Az **én technikai / megvalósítási javaslataim mindenhol külön, „(opcionális javaslat)” jelöléssel** szerepelnek.
- A dokumentum célja, hogy **hiánytalanul összefoglalja** az eddigi beszélgetésben elhangzott ötleteidet, struktúrált formában, GDD‑alapként.

---

## 1. ALAPKONCEPCIÓ ÉS FŐ CÉLOK

### 1.1 Alapfelállás

- Minden játékos **„istenként / uralkodóként”** működik.
- A játékos **saját stílusát, döntéseit és „ügyességi lenyomatát” ráégeti a birodalmára és az AI‑jára**.
- A játék keveri:
  - **4X**: eXplore, eXpand, eXploit, eXterminate  
  - **R&D**: Research & Development (Kutatás + Fejlesztés + Gyártás)  
  - **4C**: Communication, Cooperation, Creativity, Critical thinking

### 1.2 A játék végső célja

- A játék végső célja **nem egy klasszikus „győzelem”**, hanem:
  - **az entrópia elleni túlélés**, és
  - **az örökség átadása**.
- A nagy, közös univerzum (minden játékos birodalma együtt) a háttér.  
- A singleplayer játék **csak ideiglenesen a közös világból leválasztott birodalom**:
  - egy „élet”: egy birodalom felemelkedése és hanyatlása,
  - a birodalom **maradék magja** és **mementói** a közös világba kerülnek vissza.

### 1.3 Örökség és „győzelem”

- A **win** akkor teljesül, ha a játékos **nem tűnik el nyomtalanul**:
  - fennmaradnak általa létrehozott **építmények, egységek, típusok, nevek, mementók**,
  - ezek annyira értékesek, hogy **későbbi játékosoknak érdekük** lesz azokat fenntartani.
- A győzelem **fokozatos**:
  - minél nagyobb **komplexitást** hozott létre,
  - minél nagyobb **mennyiségben**,
  - minél **tartósabban** marad fenn,
  - annál **nagyobb a győzelem**.
- Nincsenek **előre definiált győzelmi utak**:
  - különböző konfigurációk, különböző erőforrás-mixek, különböző specializációk vezethetnek magas „örökségi értékhez”.

---

## 2. VILÁG- ÉS PÁLYASZERKEZET

### 2.1 Csillag + gyűrű + kisbolygók

- A jelenleg megvalósítandó világmodell:
  - **Egy csillag**, körülötte **egy gyűrű**.
  - A gyűrű mentén **sok kisbolygó** / bolygó / aszteroida.
- A kisbolygók/felszínek **színlogikája**:
  - Minden kisbolygó „**egy adott alapszínhez kötött**” a színkörön.
  - Ezen kívül:
    - van rajta még **két szín**, amelyek az alapszíntől **~45°‑ra** vannak (a színkörön),
    - és egy további szín, ami az alapszíntől **~90°‑ra** helyezkedik el valamelyik irányban.
  - Így bolygónként **max. 4 szín bányászható**, jellegzetes kombinációkban.

### 2.2 Meteorzáporok és kráterek

- A nagy bolygó (vagy egyes világok) felszínén:
  - **folyamatos meteorzápor**,
  - a becsapódások **krátereket hoznak létre**,
  - a kráterek körül **színes „tájak”** jelennek meg (RGB-színmezők).
- Ezek a színes tájak:
  - **bányászható nyersanyag-zónák**,
  - színük a **nyersanyag-szín** egyértelmű jelölése.

### 2.3 Balanced alapvilág + „tüske rendszer”

- A játék **alapja egy kiegyensúlyozott, „gömbszerű” állapot**:
  - ha a teljes potenciált egy **gömbfelületként** képzeljük el,  
  - a gömb bármely pontján nincsenek „magasabb” pontok:  
    az alapvilág **fair, szimmetrikus**.
- Erre jön rá egy **„tüskerendszer”**, ami **homogén módon borítja a felületet**:
  - kisebb „kiszögellések” / csúcsok:  
    - **gyakoribbak** (pl. kb. minden 10. játékban érezhető),  
    - kb. **+10% eredményességet** adó előnyök,
  - ritkább, nagyobb csúcsok:  
    - **nagyon ritkák** (pl. kb. minden 30. játékban),  
    - akár **+30% eredményességet** adó speciális körülmények.
- Ezek a csúcsok:
  - **kedvezőbb kiindulóhelyzeteket** jelentenek,
  - amelyeket **felismerve és kihasználva** a játékos extra örömöt él át:
    - rátalál egy különleges lehetőségre,
    - stratégiát építhet rá,
    - a játék **jutalmazza a felismerést és a kiaknázást**.

### 2.4 Vizuális koherencia és HUD minimalizmus

- A játék **vizuálisan koherens**:
  - amit a **tájon látok**, az **maga az információ**:
    - ha követ látok, **ott kő van**,
    - ha színes mezőt látok, **ott az adott színű nyersanyag**.
- **Nincsenek túlzsúfolt ikonmezők** a főképen:
  - a **valóságszerű látvány** hordozza az adatokat.
- A **föld alatti információk** (pl. mélyebb ércek) külön **radarkép overlay‑el** kapcsolhatók be:
  - ekkor jelennek meg extra jelölők, de csak igény szerint.

---

## 3. ERŐFORRÁSOK ÉS SZÍN-ALAPÚ GAZDASÁG

### 3.1 Színes nyersanyagok, komplementerek és energia

- A nyersanyagok **teljes RGB-palettára** épülnek.
- Minden szín:
  - **külön „pénznem”** bizonyos típusú fejlesztésekhez (funkciók gyorsítására).
- Energia-termelés **additív színkeverés** szerint:
  - **komplementer párok / triók** → több energia,
  - **fehér** (RGB teljes keverék vagy tökéletes komplementer kombináció) = **maximális energia**,
  - **minél kevésbé fehér** az eredő szín, annál **kevesebb energia** keletkezik.
- A cél:
  - **komplementer szín-kombinációk felkutatása és összekapcsolása**,  
  - ritka, nagy hozamú energiacellák létrehozása.

### 3.2 Erőforrás-mennyiség és lokális ritkaság

- Jelenlegi verzió:  
  - **minden színből „korlátlan” mennyiség van a föld alatt**,  
  - a kitermelést **csak a bányászati kapacitás** limitálja.
- Az erőforrások:
  - **globálisan kiegyensúlyozottak**,  
  - **lokálisan ritkák**:  
    - egy adott szín vagy kombináció bizonyos helyeken sokkal gyakoribb,  
    - máshol hiányzik → **kereskedelemre kényszerít**.
- **Kimerülés** (resource depletion):
  - jelen verzióban **nincs** tényleges kimerülés,
  - későbbi verziókban **újra átgondolható** opcionális modul.

### 3.3 Két szintű nyersanyag-modell

#### 3.3.1 Alapnyersanyag – Szürke

- Minden játékos számára **mindenhol elérhető**.
- Minden fejlesztésre **alkalmas**, de:
  - **lassú**, kicsi lépésekre képes,
  - „**1×” szorzó mindenre.

#### 3.3.2 Speciális nyersanyagok – „színpénzek”

- Mindegyik:
  - **1×** hatású általánosan,
  - a **saját fókuszára 3×** gyorsítást ad.
- Példa mapping (bővíthető, finomhangolható):
  - **Bézs** → Látótávolság
  - **Türkiz** → Sebesség
  - **Narancssárga** → Pajzs / Védelem
  - **Sötétszürke / Fekete** → Tűzerő
  - **Kék** → Kutatás (tech-plafon emelése)
  - **Zöld** → Felfedezés / Exploration
  - **Piros** → Építés / Construction
  - **Fehér** → Kooperáció, szövetségi projektek, közös mega-struktúrák
- **Hozzáférés**:
  - Minden játékosnak a Szürke mellett **2–3 speciális szín** garantáltan elérhető a kezdő környékén.
  - Ez kényszerít:
    - **specializációra**, és
    - **kereskedelemre**.

---

## 4. FUNKCIÓK, EGYSÉGEK, PROTOTÍPUSOK

### 4.1 Funkció-alapú design

- A játékban **elsődlegesen nem „egységek” vannak, hanem funkciók**.
- Az egységek:
  - mindig **funkciók keverékei**,
  - a funkciók kombinációját **a játékos határozza meg**.
- Alapvető funkciók (példák):
  - **Lát** (felderítés)
  - **Mozog**
  - **Lő**
  - **Bányászik**
  - **Anyagot feldolgoz** (anyagból másik anyag)
  - **Energiát termel** (anyagból energia)
  - **Gyárt / Épít** (anyagból eszköz/egység/épület)
  - **Fejleszt** (eszközök, prototípusok fejlesztése)
  - **Tárol** (alapanyag / energia / eszköz tárolás)
  - **Kommunikál** (kapcsolatok, hálózat)
  - **Szállít** (anyag / eszköz / energia mozgatása)
  - **Kereskedik** (csere, piac)

### 4.2 Példa alapegységek funkció-kombinációi

- **Felderítő**: lát + mozog + kommunikál  
- **Őrtorony**: lát  
- **Katonai egység**: lát + lő (+ pajzs)  
- **Kitermelő**: bányászik  
- **Alapanyag feldolgozó**: anyagból anyagot gyárt  
- **Energiatermelő**: anyagból energiát állít elő  
- **Gyártó / Építő**: anyagból eszközt/egységet épít  
- **Fejlesztő**: eszközöket/prototípusokat fejleszt (Development)  
- **Raktározó**: alapanyag/energia tárolás  
- **Kommunikációs egység**: kapcsolat/hálózat kiépítés  
- **Szállító**: anyag/eszköz/energia mozgatása  
- **Kereskedő**: anyag/eszköz/energia csere

Ezek mind **ugyanarra az alapmodellre** vezethetők vissza; a különbség az, hogy **milyen funkciókat kap és milyen arányban**.

### 4.3 100%-os kapacitás és specializációs bónusz

- Minden egységtípusnak van egy **összkapacitása** (pl. 100%).
- Ezt a 100%-ot a különböző funkciók **maximálisan elérhető értékei között kell szétosztani**.
- Példa:
  - A birodalmadban a maximális elérhető:
    - látótáv: 100 egység,
    - lövési táv: 100 egység,
    - sebesség: 100 egység stb.
  - Ha egy egység **csak lát**, akkor a látótávjára rakhatod a 100%-ot:
    - a gyakorlatban ez **bónusszal** jár: pl. **150%‑os látótáv** a birodalmad aktuális maximumához képest (specializációs jutalom).
  - Ha két funkciót kombinálsz (pl. lát + lő):
    - a 100% megoszlik pl. 50–50%-ban,
    - a bónusz is kisebb (pl. csak +25–25%).
- **Alapszabály**:
  - **Minél kevesebb funkciója van egy egységnek, annál nagyobb bónuszt kap azokra.**
  - 1 funkció → akár **+50%** azon az egy területen.  
  - 2 funkció → **+25%–25%** (összességében gyengébb, mint két külön specialistát gyártani).
  - 3+ funkcióra **csökkenő bónusz** (pontos értékek balanszolhatók).

### 4.4 Véges számú prototípus-típus

- A birodalomban **nem végtelen számú típus hozható létre**.
- **Alapállapot**: pl. **3 típus** hozható létre.
- Ahogy fejlődik a birodalom:
  - **új technológiákat kutatsz ki**, új plafonértékeket érsz el,
  - megnyílik a lehetőség **új prototípus-típusok létrehozására**.
- A típusok száma:
  - **lassan növekszik** (pl. fejlesztéssel 3 → 4 → … → max. **15 típus**),
  - minden új típus létrehozása **komoly erőforrás-befektetés**.
- Minden típus:
  - **egy fejlesztési pillanatban „fagy be”**:
    - akkor érvényes technológiák szerint,
    - egy adott arányban osztja el a funkciókat (pl. 40% lát, 30% lő, 30% mozog).
  - Későbbi technológiai plafon-emelkedéskor:
    - **ezt a típust is lehet tovább fejleszteni** (a saját plafonja fölé),
    - vagy **új típusokat lehet létrehozni**.

---

## 5. KUTATÁS, FEJLESZTÉS, GYÁRTÁS (R–D–P)

### 5.1 Háromszintes technológiai folyamat

1. **Research (Kutatás)**  
   - Absztrakt technológiai szint:
     - pl. „kétszer messzebbre lehet látni”, „lehet vízen úszni”, „repülés”.
   - Kimenet: **elméleti lehetőség** (nincs még konkrét eszköz).

2. **Development (Fejlesztés)**  
   - A kutatás eredményeiből **konkrét prototípus-bluprint** készül:
     - pl. új egységtípus, amely képes úszni / repülni / messzire látni.
   - Kimenet: **tervrajz / típusdefiníció**.

3. **Production (Gyártás)**  
   - A kész blueprint alapján:
     - az egység **gyárthatóvá válik**,
     - legördül a gyártósorról, és **használható a játékban**.

### 5.2 Igényvezérelt fejlesztés

- Sok fejlesztési igény **akkor jelenik meg**, amikor az egységek **konkrét helyzettel találkoznak**:
  - pl. elérik a tengerpartot → felmerül az igény: **úszás / víz alatti mozgás**,
  - repedések, szakadékok → **ugrás / repülés**,
  - sötét zónák → **szenzor / radar**.
- A folyamat:
  1. Az igény megjelenik (pl. „jó lenne úszni”).
  2. **Research**: kutatás, hogyan lehet.
  3. **Development**: prototípus-kialakítás (úszó egységtípus).
  4. **Production**: tömeggyártás.

---

## 6. AI-BETANÍTÁS ÉS ÜGYESSÉGI JÁTÉK

### 6.1 AI mint „tanuló pilóta”

- Az AI **nem magától tanul a hibáiból**, hanem:
  - **a játékos manuális irányításából tanul**.
- Betanítás folyamata:
  - A játékos **„beül” egy egységbe** (pl. tank, bánya, megfigyelőtorony).
  - Egy **külön gyakorlópályán** vagy éles helyzetben:
    - **manuálisan irányítja** az egységet,
    - az AI **folyamatosan rögzíti**, hogy mit csinál:
      - hogyan mozog,
      - hogyan bújik fedezékbe,
      - hogyan lő (ritmus, célzás),
      - hogyan üzemeltet egy bányát (ritmus, sorrend),
      - hogyan koordinál több egységet együtt.

### 6.2 QWOP / Bennett Foddy / Overcooked-szerű ügyességi réteg

- A betanítás **nem „könnyű klikkelgetés”**, hanem:
  - kicsit olyan, mint a **QWOP** vagy **Bennett Foddy** játékai:
    - szokatlan és **nehéz irányítás**,
    - az egységek mozgása **nem triviális**.
  - vagy mint az **Overcooked**:
    - optimalizálni kell egy bonyolult **folyamatot** (pl. vendéglő üzemeltetése),
    - itt: **bányák, gyártás, logisztika, harc** optimális működtetése.
- Senki sem tudja **100%-os hatékonysággal** csinálni:
  - mindig van hova fejlődni,
  - a plafon megközelítése **hosszú gyakorlást igényel**.

### 6.3 AI-tudás eróziója és „halhatatlan egységek”

- Amikor új mintát tanítasz az AI-nak:
  - a tudása **kezdetben 100%-ban** tükrözi a játékos mintáját.
- Idővel:
  - a tudás **erodálódik** (pl. 100% → 90% → 80%…),
  - ha nem kap **friss, új betanítást**, a teljesítmény romlik.
- Folyamatos gyakorlással:
  - a játékos **fenntarthatja és javíthatja** az AI-tudást.
- Lehetőség:
  - ha egy egységet **nagyon hosszan és magas szinten betanítottak**,  
  - és rengeteg jutalmon, bónuszkörön, harci helyzeten ment át,  
  - akkor elérhető egy **„matuzsálem” / legendás egység** állapot:
    - tudása **nem erodálódik tovább**,
    - **örök magas szintű** marad.
  - Az ilyen egységek:
    - a birodalom bukása után is **mementóként fennmaradhatnak**,
    - **az örökség részévé válnak**.

---

## 7. AKCIÓK, FIGYELEM GAZDÁLKODÁS, STRATÉGIAI PONTOK

### 7.1 Stratégiai lépések (turn‑szerű réteg)

- A játékban vannak **stratégiai lépések**, amelyek **limitáltak**:
  - pl. napi X darab **„nagy stratégiai akció”** (kutatás, fejlesztés-irány váltás, nagy diplomáciai manőver).
- Időkezelés:
  - Egy nap alatt:
    - csak **meghatározott számú ilyen lépést** tehetsz.
  - Ha nem használod el aznap:
    - a lépések **80%-a megmarad** még **6 napig**,
    - 6 nap után **elvész** a fel nem használt rész.
- Ez a réteg akkor is érvényes, ha a játékmód:
  - **nem turn based**, hanem **realtime**:
    - a stratégiai döntések akkor is limitált erőforrást jelentenek.

### 7.2 Realtime mikromenedzsment és AI‑átadás

- A játéknak van egy **realtime rétege**, ahol:
  - az egységek **folyamatosan működnek**,
  - a játékos **bármikor beülhet** egy egységbe, irányíthatja.
- Ha a játékos **nem irányít**, akkor:
  - az **AI** irányítja az egységeket **az eddig tanult minta alapján**,
  - az **akciók nem vesznek el**, csak a játékos **nem ő maga hajtja végre** őket.
- Következmény:
  - játszhatsz akkor is, amikor **elfogytak a stratégiai pontjaid**:
    - ilyenkor inkább **mikroszinten** fejlesztesz, betanítasz,
  - ha pedig **nem tudsz egy ideig játszani**:
    - a birodalmad **nem áll le**, az AI viszi tovább,
    - később visszatérve ugyanott folytathatod, sőt **újrataníthatod**.

---

## 8. BIRODALMI SZINTEK, HŰBÉR ÉS ANYAG–ENERGIA–IDŐ–TÉR

### 8.1 Birodalmi szintek lépcsője

1. **Alap kolónia szint**  
   - Egy kis terület, kis bázis.
   - Kevés egység, elsősorban **bányászat** és túlélés.

2. **Többkolóniás szint**  
   - Egy játékos már **több kolóniát alapít**.
   - Nagyobb terület, belső logisztika, többféle specializáció.

3. **Hűbéri szint**  
   - A játékos **más kolóniákat / kisebb birodalmakat hűbéresi viszonyban tart**:
     - win–win: a kisebbek erőforrást adnak,
     - a nagyobb védelmet, stabil energiát és technológiát ad.
   - Ez a szint:
     - a **birtoklás és uralom** szintje,
     - de **nem ellenséges kizsákmányolás**, inkább kölcsönös érdek.

4. **Anyag / Energia / Idő / Tér specializált szint**  
   - A hűbéri szint fölött a birodalmak **különböző dimenziókra specializálódhatnak**:
     - **Anyag-specialista birodalom**:
       - a nyersanyagokat **bármilyen más anyaggá** tudja alakítani,
       - és visszaadja azt annak, akitől kapta.
     - **Energia-specialista birodalom**:
       - az anyagból **energiát** állít elő,
       - és energiát „ad vissza” a rendszerbe / szövetségeseknek.
     - **Idő-specialista birodalom**:
       - **plusz játékidőt** adhat:
         - több lépést, több stratégiai akciót,
         - időgyorsítás / időnyújtás (adott időszakban több tevékenység fér bele).
     - **Tér-specialista birodalom**:
       - a tér görbítésével **kapukat / féregjáratokat** nyit,
       - távoli helyekre is **gyorsan eljuttat** egységeket / erőforrásokat.
   - Ezek a magas szintek:
     - a **világ anyag–energia–idő–tér struktúrájával játszanak**,
     - extrém nagy hatású, de extrém nehezen fenntartható birodalmak.

### 8.2 Szinthez kötött tevékenységek

- **Legalacsonyabb szint (kolónia)**:
  - bányászat, alap kitermelés, első egységek.
- **Gyár szint**:
  - nyersanyag + energia → **egységek**, modulok, infrastruktúra gyártása.
- **Erőmű szint**:
  - **energia-termelés** bonyolult színkombinációkból, fehér energia.
- **Anyag / Energia / Idő / Tér szint**:
  - globális **átalakítások**,
  - távoli pontok összekapcsolása, extrém erőforrás-hatások.

### 8.3 Piramis-struktúra és arányok

- A rendszer **piramisként működik**:
  - **sok** bányászkolónia,
  - **kevesebb** gyár,
  - még **kevesebb** erőmű,
  - nagyon kevés anyag/energia/idő/tér-specialista birodalom.
- Irányadó arányok (balanszolhatók):
  - ~**10 kolónia** tart el **1 gyárat**,
  - ~**10 gyár** tart el **1 erőművet**.
- Következmény:
  - **minél magasabb szintre lép valaki, annál több játékosra támaszkodik alatta**,
  - felfelé a szerepek **ritkulnak**.

### 8.4 Nem lehet „lejjebb ütni” a szint alapját

- A birodalomnak van egy **„belső magja”** minden szinten:
  - pl. bányászkolónia alap, erőmű belépő szint, gyár magja.
- Ezek a **magok nagyon erősen védettek**:
  - **teljesen elpusztíthatatlanok** gyakorlatilag,
  - legfeljebb **visszalökhető** a játékos erre az alap állapotra.
- Példa:
  - Ha egy erőmű-szintű játékost **óriási sereg támad**:
    - a külső rétegei elpusztulhatnak,
    - de a szint **kezdő állapotára visszaesve**:
      - olyan erős a védelem, hogy ott **minden támadást megállít**,
      - a játékos **nem esik ki**, csak **szint-alapra esik vissza**.

### 8.5 Belső mag vs külső rétegek, fájdalom, elköteleződés

- A birodalom:
  - **belső magból** és
  - egyre nagyobb **külső rétegekből** áll.
- Minél távolabb vannak a külső részek:
  - annál **könnyebben el lehet veszíteni** őket.
- A birodalom növekedése:
  - **sok „fájdalom” és áldozat** árán történik,
  - sokszor értékek vesznek el,
  - máskor nagy munkával fordul sikerre a befektetett energia.
- Ez a rendszer:
  - a **szülés fájdalma** és az **áldozatbemutatás** metaforájához hasonló:
    - **növeli az elköteleződést**,
    - a birodalomért való tenni akarást.

---

## 9. DIPLOMÁCIA, KAPCSOLATI HÁLÓ, ASZIMMETRIA

### 9.1 Kapcsolati típusok és automatikus viselkedés

- Minden másik játékossal való viszony:
  - egy **folyamatos skálán** helyezkedik el:
    - **maximális barátság** ↔ **semleges** ↔ **ellenség / háború**.
- A viszony:
  - egyrészt a **játékos szándéka**,
  - másrészt az **ellenfél szándéka**,
  - harmadrészt a **tettek** (pl. támadás) alapján **automatán is változik**.
- Ez a globális viszonyérték:
  - **meghatározza az egységek automatikus viselkedését**:
    - baráti viszony esetén:
      - az egységek **szabadon mozognak egymás mellett**,
      - nem futnak el, nem támadnak.
    - ellenséges viszony esetén:
      - a harcképes egységek **automatikusan támadnak**, ha az ellenfél belép egy zónába,
      - a civil / harcképtelen egységek **futva menekülnek**.

### 9.2 Kapcsolati háló mint „social graph”

- A kereskedelmi és katonai szövetségek:
  - egy **social media-szerű hálót** alkotnak.
- Mindenki:
  - **csak limitált számú kereskedelmi + katonai partnerrel** tud érdemben kapcsolatot fenntartani.
- Kezdő állapot:
  - pl. **3 partner** lehet.
- Ha többet szeretne:
  - **erőforrásokat kell fordítania** a kapcsolati kapacitás fejlesztésére:
    - ez egy külön **fejlesztési irány** (akár specializáció),
    - az ilyen civilizációk **HUB-ként** működnek a hálóban.

### 9.3 Aszimmetrikus játékmenet

- A játék **eleve aszimmetrikus**:
  - több **„fiatalabb” játékos** közösen is felveheti a versenyt
  - **egy erősebb, magasabb szinten lévő birodalommal**.
- Lehetőség:
  - többen együtt **kooperatív hadjáratot indítanak** az AI vagy nagyobb birodalom ellen,
  - a jutalom (zsákmány, erőforrás) **arányosan elosztható**.

### 9.4 Hűbéres toborzás – „piramis játék” elem

- A játékosok **érdekeltek abban**, hogy:
  - **új játékosokat hozzanak be a játékba**,
  - hűbéresként **harcosokat, bányászokat, kistulajdonosokat** kapcsoljanak maguk alá.
- Példa:
  - a fő játékos ad:
    - egy darab földet,
    - egy egységet (pl. katonai),
    - amelyet a barátja használhat **mellette harcolva**.
- A hűbéres rendszer:
  - hasonlít bizonyos **piramisjáték-logikára**,  
  - de itt **minden fél valódi játékelőnyöket** kap:
    - a felsőbb szint **stabil ellátást és védelmet**,
    - az alsóbb szint **technológiát, védelmet és piacot**.

---

## 10. ÉLETSZAKASZOK, ENTRÓPIA, DINASZTIA

### 10.1 Életszakaszok (emberi analógia)

1. **Gyermekkor – Nyersanyagkor**  
   - bányászat, túlélés, első lépések.

2. **Ifjúkor – Energiakor**  
   - komplementerek keresése,
   - energiarendszerek kiépítése,
   - szövetségek kezdeményei.

3. **Felnőttkor – Ipar kora**  
   - gyárak, nagyléptékű gyártás,
   - infrastruktúra, logisztika, háború.

4. **Érett kor – Tudomány kora**  
   - magas szintű kutatás,
   - technológiai plafon emelése,
   - különleges funkciók (pl. repülés, űrutazás).

5. **Időskor – Kultúra kora**  
   - monumentumok, presztízsprojektek,
   - műemlékek, emlékhelyek, örökség formálása.

6. **Vég – Entrópia kora**  
   - a rendszer belső feszültségei nőnek,
   - a fenntartás költségei meredeken emelkednek,
   - megkezdődik a **bomlás**.

### 10.2 Gazdasági alap az entrópia mögött

- A játék elején:
  - a kitermelt nyersanyag + energia **bőven fedezi**:
    - az új egységek létrehozását,
    - a meglévők fenntartását.
- Ahogy nő a birodalom:
  - a **fenntartási költségek gyorsuló ütemben nőnek**,
  - egy ponton túl:
    - a beérkező **anyag + energia** már **nem tart lépést** a szükséglettel.
- Ez hozza el:
  - az **entrópia szakaszát**:
    - a láncreakciós **összeomlás** gazdasági alapját,
    - a „repülő leszállása” metaforát:
      - **szupernova**: robbanásszerű szétesés,
      - **fekete lyuk**: összeomlás,
      - **fehér törpe**: kontrollált leállás, kis stabil magállapot.

### 10.3 Örökség és dinasztia (több játszma)

- A játék lehet:
  - **több egymást követő, 2–3 napos játszmából álló ív**.
- Egy játszma:
  - egy „emberi élet” / birodalom története,
  - a végén a birodalom:
    - elpusztul vagy
    - **magállapotba esik vissza**.
- Az örökség **elsődleges haszonélvezője mégis a játékos**:
  - a következő játszmákban:
    - **nem lesz lényegesen könnyebb** a játék,
    - de a játékos **rangot és élményt** kap:
      - látja a korábbi birodalmai maradványait,
      - tudja, hogy „ő hagyta hátra” ezeket.
- A dinasztia:
  - egymást követő játékok sorozata,
  - a **korábbi örökség támogatja érzelmileg és részben játékmenetileg is** a következőket.

### 10.4 White dwarf állapot – statikus mementók

- Ha a birodalom a végén:
  - **nem szupernovaként vagy fekete lyukként** omlik össze,
  - hanem **fehér törpeként**:
    - marad egy **stabil, kis magállapotú település/bázis**,
    - amelyben:
      - a termelés és fogyasztás **egyensúlyban van**,
      - a rendszer **stagnáló, de stabil**.
- Ezek a magtelepülések:
  - **adat-szinten, statikusan tárolódnak a háttérben**,
  - amikor egy új játékos **találkozik velük**:
    - akkor „**felélednek**” a megjelenítés szintjén,
    - de az állapotuk **nem növekszik tovább**, csak mutatják, **mi maradt meg**.

---

## 11. KEZDŐ ÉLMÉNY, FELFEDEZÉS, REJTETT ÉRTÉKEK

### 11.1 Első 60 perc – sandbox, vezetett kibomlás

- A játék **sandbox jellegű**:
  - nincs túl direkt, szkriptelt tutorial,
  - de:
    - az **AI menedzsment szint** folyamatosan:
      - **kérdéseket tesz fel**,
      - **döntéseket kér**,  
      - **tanítást vár** (AI‑betanítás).
- Az új lehetőségek:
  - **lépésről lépésre bomlanak ki**,
  - a komplexitás **fokozatosan nő**.

- Az első **markáns sikerélmények**:
  - első fejlesztések,
  - első egységtípus létrehozása,
  - első egység legyártása,
  - első AI-betanítás,
  - első ismeretlen területek felfedezése,
  - első bányászati hely sikeres kiaknázása.

### 11.2 Kis kezdeti terület, rejtett potenciál

- A játék:
  - **kis területen indul**.
- Az egységek:
  - **nem mehetnek messzebb egymástól**, mint egy egység **radartávolsága**.
- Ez limitálja:
  - hogy milyen messze juthatnak el a bázistól.
- A bázis:
  - **vontatható**, ha a játékos úgy dönt:
    - az egész kolónia **vándorolhat**,
    - de **nem kötelező**.
- A környező terület:
  - **rengeteg rejtett értéket tartalmaz**,
  - ha egy irányba fejlesztesz,  
    - a többi sokáig rejtve maradhat,
    - de az érzés végig megvan:
      - „**ezen a kis területen is rengeteg ismeretlen kincs vár**”.

---

## 12. KOMMUNIKÁCIÓS TÁVOLSÁG ÉS TERJESZKEDÉS

### 12.1 Kommunikációs távolság mint limit

- Az egységek:
  - a **központi egységtől / bázistól** nem távolodhatnak el jobban,
  - mint amennyi a **kommunikációs hatótáv**.
- Ha ennél messzebb mennek:
  - **elveszik a kapcsolat**,
  - az egység „lekapcsolódik” a birodalom hálózatáról.

### 12.2 Három módja a „távolra jutásnak”

1. **Kommunikációs távolság brutális fejlesztése**  
   - Egy egység kommunikációs hatótávját nagyon magasra emelve:
     - **egyedül is messzire mehet** a többiektől.

2. **Kommunikációs lánc**  
   - Az egységek **vonalban sorakoznak fel**,  
   - egymás hatótávját **láncszerűen továbbadva**:
     - így létrejön egy **kommunikációs lánc**,
     - a lánc végén lévő egység is kapcsolatban marad a központtal.

3. **Teljes kolónia vándorlása**  
   - Minden egységnek **mozgási képességet fejlesztesz**,
   - az egész kolónia **együtt elindul**:
     - a birodalom **fizikailag odébb vándorol**.

---

## 13. MOBIL VERZIÓ ÉS LOKÁLIS COOP (OPCIONÁLIS KONCEPCIÓ)

*(opcionális javaslatként megőrizve, ha össze kívánod hangolni a fő PC-s / nagyjáték koncepcióval)*

- **Mobil játék**:
  - fiatalok mobilon játszhatják,
  - a birodalmuk **folyamatosan termel** (idle jelleg),
  - ha **eltelik két nap**, a termelés is két napnyi.
- A játékos:
  - bármikor **beléphet**, döntéseket hozhat,
  - egyébként az **AI mikromenedzsel** (általad tanított módon).
- Ha a játékosok **fizikailag találkoznak**:
  - elővehetik a mobiljukat,  
  - **lokális multiplayerben**:
    - kereskedhetnek,
    - közös hadjáratot indíthatnak **AI ellen**,
    - vagy akár egymás ellen is játszhatnak.
- Egyedüli játék:
  - otthon, egyedül:
    - az AI ellen kisebb eredményeket érnek el,
  - közösen:
    - **nagyobb csatákat**,  
    - nagyobb zsákmányt tudnak megszerezni.

---

## 14. EGYÉNI ÉRTÉKTEREMTÉS VS SZINTLÉPÉS

- Lehetséges, hogy:
  - egy játékos **„extrém nehéz” módon** végig az **alsóbb szinteken marad**,
  - de ott **olyan hatékonyan teremt értéket**,
  - hogy **eléri a játék végső célját**:
    - az örökség mértéke nagyobb lehet,
    - mint egy magas szinten, de gyengén menedzselt birodalomé.
- Másik játékos:
  - **túl gyorsan tör felfelé**,
  - eléri a csúcsszinteket,
  - de **nem marad utána érték**.
- Következtetés:
  - **nem a szint a lényeg**, hanem:
    - a létrehozott érték mennyisége,
    - komplexitása,
    - és fennmaradásának ideje.
  - A felső szint **nagyobb potenciális volumen**,  
    - de **rossz rendszerrel** ez sem hoz több végső értéket.

---

## 15. STRATÉGIAI ÖSSZEFOGLALÓ – MI MINDEN VAN BENNE?

Az eddigiek alapján a játékban:

- **Nyersanyagok a színkörről**:
  - komplementerek a legértékesebbek,
  - fehér energia a csúcs.
- **Funkció-montázs alapú egységek**:
  - bányász-tank, repülő-felderítő, stb.,
  - mindig a környezet és nyersanyagkészlet kényszereihez idomulnak.
- **Egységek mint AI-ok**:
  - **betaníthatók** ügyességi mini-játékokon keresztül,
  - a hatékonyság a játékos **ügyességétől függ**.
- **Belső mag vs külső birodalom**:
  - kifelé egyre könnyebb veszteség,
  - befelé nehezebb, de annál fájdalmasabb.
- **Szintalapú harc és biznisz**:
  - azonos szinten harc vagy coop,
  - különböző szintek között főként **gazdasági, hűbéri kapcsolatok**.
- **Hűbéres toborzás és „piramis játék”**:
  - megéri új játékost hozni, hűbérest nevelni.
- **Ritka anyagpárosítások és hatalmas energia**:
  - magas szinten elérheted a világ „túloldalát”,
  - összekapcsolhatod a **karika két ellentétes pontján lévő színeket**,
  - létrejön a **legritkább, legnagyobb energiát adó kombináció**.
- **Életszakaszok**:
  - eszköz, terjeszkedés, anyag, energia, örökség.
- **Entrópia**:
  - a top birodalom komplexitása **fenntarthatatlan**,
  - a végső cél a **kontrollált leállás és értékfennmaradás**.

---

## 16. Opcionális megvalósítási és inspirációs javaslatok

*(Ezek mind az én kiegészítő ötleteim, **nem kötelező elemei** a koncepciónak.)*

- **Prototípus motor / engine**:  
  - (opcionális javaslat) Unreal Engine, vagy böngésző alapú WebGL (pl. Babylon.js) prototípus.
- **UI / UX inspirációk**:
  - (opcionális javaslat) **Factorio**: hatékony óriásrendszer-építés és automatizáció,
  - (opcionális javaslat) **Civ 6 district adjacency**: egységek/épületek egymást erősítő elhelyezése.
- **Dokumentációs irányok**:
  - (opcionális javaslat) formális GDD, technikai GDD, UX‑flowk, tutorial-szegmensek rajzolása.

---

## 17. KÖVETKEZŐ LÉPÉSEK (TERVEZŐI SZEMPONTBÓL)

*(Ezek inkább teendő-lista jellegűek, nem a világ részei.)*

- Konkrétan definiálni:
  - milyen **metrikák** mérik az örökséget (pl. fennmaradt mementók száma, minősége),
  - hogyan **jelenik meg UI‑ban** (örökség-nézet).
- Finomítani:
  - a **színek–nyersanyagok–funkciók** pontos mappingjét,
  - a **specializációs bónuszok** számértékeit.
- Részletesebben megírni:
  - az **első 60 perc** konkrét lépésről lépésre élményét,
  - a **tutorial-szcenáriókat** (még sandbox jelleggel is).
- Játékmenet-ritmus:
  - pontosítani a **stratégiai pontok napi regenerálódását**,
  - az **AI hibernálás időablakát**,
  - a **játszmák 2–3 napos ívét** és a dinasztia-meta struktúráját.

