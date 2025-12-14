# Mobil birodalomépítő játék – Koncepció (egyszerű mobil verzió)

## 1. Alapötlet

- **Platform**: mobiljáték, elsősorban fiatal játékosoknak.
- **Műfaj**: folyamatosan futó, birodalomépítő stratégiai játék.
- **Lényeg**: a játékos saját birodalmat épít, amely **akkor is működik és gazdagszik**, amikor ő éppen nem játszik.
- A birodalom egységei **automatikusan termelnek** (bányásznak, gyűjtenek, működtetnek kolóniákat), és az így felhalmozott javakat a játékos belépéskor veheti át és oszthatja be.

A játékos tehát két rétegben van jelen:
1. **Időszakos stratégiai irányítás** – amikor belép, döntéseket hoz.
2. **Folyamatos háttérműködés** – amikor nincs jelen, az **AI a tőle tanult minták alapján mikromenedzseli** a birodalmát.


## 2. Egyjátékos működés (solo loop)

- A játékos bármikor beléphet a játékba, és ilyenkor:
  - begyűjti az időközben kitermelt nyersanyagokat,
  - elköltözteti/átcsoportosítja az egységeit,
  - fejlesztésekről dönt,
  - támadásokat indíthat az **AI által irányított ellenfelek** ellen.
- **Egyedül mindig tud játszani**: otthon, útközben, bármikor.
- Ha egyedül támadja az AI-t, **kisebb zsákmányra, kisebb értékű nyereségre** számíthat – solo módban a jutalom korlátozottabb, mint közös akcióknál.


## 3. Lokális multiplayer – amikor a játékosok fizikailag találkoznak

- Ha a játékosok **egy térben vannak** (pl. iskolában, játszótéren, edzésen, baráti találkozón), elővehetik a mobiljukat, és **multiplayer módba kapcsolhatnak**.
- Ilyenkor egy **közös játéktérben** jelennek meg a birodalmaik vagy azok expedíciós egységei, és kétféle irányba mehet a játék:

### 3.1. Együttműködés (co-op az AI ellen)

- Közösen, **összehangoltan támadhatják az AI-t**.
- Ilyenkor olyan **nagy értékű csatákat és küldetéseket** indíthatnak, amelyek:
  - solo módban nem, vagy csak erősen korlátozott formában érhetők el,
  - lényegesen több zsákmányt, ritka erőforrásokat, különleges fejlesztési lehetőségeket adnak.
- **Minél több játékos dolgozik össze**, annál nagyobb potenciált tudnak kihasználni – az együttműködés skálázódik:
  - 2–3 fő: kisebb raid-ek,
  - nagyobb csapat: nagy horderejű, „event-szintű” akciók.
- A co-op mód célja, hogy **jutalmazza a közös jelenlétet és együttműködést**.

### 3.2. Versengés (PvP lehetőség)

- Ugyanebben a lokális multiplayer módban dönthetnek úgy is, hogy **egymás ellen harcolnak**.
- Formák lehetnek például:
  - barátságos küzdelmek,
  - rangsorolt PvP csaták,
  - területfoglaló vagy rabló jellegű összecsapások.
- A lényeg: amikor többen együtt vannak, **nem csak együtt**, hanem **egymás ellen is játszhatnak**, ha ezt választják.


## 4. Kommunikációs távolság és mozgás – hogyan terjeszkednek az egységek?

Az egységek **nem szakadhatnak el korlátlanul** a birodalom központjától.

- Minden egység csak addig a **kommunikációs távolságig** működik, ameddig elér a központi egység „jele”.
- Ha ezen a távolságon túlra kerül, **elveszik a kapcsolat**, és az egység nem képes hatékonyan működni.

### A távoli helyek elérésének három módja

1. **Kommunikációs távolság fejlesztése**
   - A játékos fejleszti az egységek vagy a központ kommunikációs technológiáját.
   - Egy adott egység így **messzebbre is eltávolodhat** a többiektől, miközben még kapcsolatban marad.

2. **Kommunikációs lánc kialakítása**
   - Az egységek **egymás után, egy vonalban** helyezkednek el, így egy „láncot” alkotnak.
   - A jel **egységről egységre továbbítódik**, ezért a lánc végén lévő egységek is kapcsolatban maradnak a központtal.
   - Ez stratégiai elhelyezést, tervezést igényel (hol legyenek „átjátszó” egységek).

3. **Kolónia együttes vándorlása**
   - A játékos **minden egységének fejleszti a mozgásképességét**, majd az egész kolóniát elindítja.
   - Ilyenkor **a központ is vándorol**, a birodalom maga mozdul el egy új régió felé.
   - Ez nagyobb kockázattal és költséggel jár, de teljesen új területek elérését teszi lehetővé.


## 5. Többszintű játékrendszer – az alsó szint rendszere a felső szint alapegysége

A játék **szintekre tagolódik**, ahol minden magasabb szinten a korábbi szint egy komplett rendszere **egy új „alapegységként”** jelenik meg.

### 5.1. Első szint – Bányászkolónia felépítése

- A játékos az első szinten **bányász egységekkel** dolgozik.
- Példa: kezdetben legfeljebb **X darab bányászegységet** (pl. 10-et) tud koordinálni.
- Feladatai ezen a szinten:
  - bányászegységek telepítése,
  - egységtípusok létrehozása,
  - egységek viselkedésének „betanítása” (mit, hol, hogyan termeljenek),
  - a kolónia **hatékony működésének beállítása**.
- Amikor a játékos létrehoz egy **stabilan működő, teljes bányászkolóniát** (pl. 10 jól programozott egységből álló rendszert), és az önjáróan működik, **szintet lép**.

### 5.2. Második szint – Kolóniák szintje

- A következő szinten a játékos **már nem egyes bányászegységeket irányít**, hanem:
  - a korábbi szinten felépített **bányászkolóniákat tekinti egyetlen egységnek**.
- Feladatai ezen a szinten:
  - bányászkolóniák létrehozása, elhelyezése, specializálása,
  - a különböző kolóniák közti munkamegosztás, útvonalak, védelem megszervezése.
- Az, amit az alsóbb szinten egy teljes rendszerként épített fel, **itt már egy „building block”**, egy magasabb szintű egység.

### 5.3. Felsőbb szintek – Kereskedelem, anyag- és energia-termelés, birodalmi hálózat

- A későbbi szinteken ugyanez az elv ismétlődik:
  - a bányászkolóniák rendszeréből lesz a **kereskedelmi hálózat alapegysége**,
  - a kereskedelmi és termelő rendszerekből lesz a **birodalomstratégiai szint egysége**.
- A játékos egyre inkább **magasabb absztrakciós szinteken** hoz döntéseket:
  - az alsóbb szintek már önműködő rendszerek,
  - a felső szinteken ezeket csak egységként mozgatja, kombinálja, optimalizálja.

A játék különlegessége, hogy **minden szint egy teljes, jól működő rendszer**, ami a következő szinten **egy darab „egységgé zsugorodik össze”**, és így épül egymásra a komplexitás.


## 6. Birodalmi stabilitás – végjáték és rekorddöntő kihívás

A birodalom növekedésével **a stabilitás fenntartása egyre nehezebb**.

- A legmagasabb szinteken a stabil állapot **már csak nagyon rövid ideig érhető el**, és rendkívül nehéz fenntartani.
- Azok a játékosok, akik idáig eljutnak, olyanok, mint az **olimpiai döntősök**:
  - már „tizedmásodpercekkel” verik egymást,
  - apró optimalizálások, finom döntések döntenek siker és bukás között.

### 6.1. Ellentétes irányú hatások rendszere

A stabilitást **egymással ellentétes irányú hatások** egyensúlya adja.

- Ezek a hatások a játék előrehaladtával **exponenciálisan erősödnek**, ezért:
  - egyre nehezebb őket szinkronban tartani,
  - egyre könnyebb kibillenni az egyensúlyból.

Példa egy ilyen ellentétre:

1. **Birodalom szétterjedése (expanzió)**
   - Minél nagyobb területet fed le a birodalom, annál lazább a struktúra.
   - Ha a terjedés „lenyomja” az összetartó erőt:
     - a birodalom **szupernovaként szétrobban**,
     - az egyes részek **elszakadnak, függetlenednek**,
     - többé nem egy egységes birodalmat alkotnak, hanem **interakció nélküli szigetekre esnek szét**.

2. **Birodalom összetartása / központ felé gravitálása**
   - Ha túl erős a központosító erő, minden a centrum felé húz.
   - Ha ez kerül túlsúlyba:
     - a birodalom **fekete lyukként omlik össze**,
     - minden korábbi szervezettség és komplexitás **eltűnik**,
     - a rendszer egy **fortyogó őskáoszba** zuhan vissza.

### 6.2. Minimum két ellentétes erő

- A rendszerben **legalább két** ilyen, egymással ellentétes irányú erőnek kell jelen lennie:
  - az egyik **távolodásra, szétterjedésre** késztet,
  - a másik **központosulásra, sűrűsödésre** húz.
- Ha a játékosnak sikerül ezeket **egyensúlyban tartania**, akkor:
  - **lokális maximumok** jönnek létre,
  - ilyenek lehetnek például **városok, bolygók, csomópontok**, ahol a sűrűség magas, de még nem omlik fekete lyukba a rendszer.

A végjáték lényege, hogy a játékos **a növekedést, a hálózatot és az ellentétes erőket egyensúlyban tartva** próbálja minél tovább fenntartani a stabilitást. Ez a rekorddöntés terepe.


---

## 7. Ellenőrzés – mi került bele az anyagba?

Az összefoglaló **kifejezetten erre a beszélgetésre épül**, és tartalmazza:

- a te leírásaidat a:
  - mobil birodalomépítős alapkoncepcióról,
  - folyamatos termelésről és AI-menedzsmentről,
  - lokális co-op és PvP multiplayer működéséről,
  - kommunikációs távolság és háromféle terjeszkedési mód rendszeréről,
  - többszintű, egymásra épülő játékszintekről (alsó szint rendszere = felső szint alapegysége),
  - birodalom stabilitását meghatározó ellentétes erőkről, szupernova–fekete lyuk végállapotokról, lokális maximumokról;

- és az én technikai/koncepcionális kiegészítéseimet **csak ebből a beszélgetésből**:
  - a solo vs. co-op jutalmi különbségek megfogalmazását,
  - a többjátékos akciók skálázódását (minél többen, annál nagyobb raid),
  - a szintek egymásra épülésének rendszerszintű leírását.

Ha szeretnéd, a következő lépésben készíthetünk külön fejezetet a:  
- UI/UX képernyőkről,  
- gazdasági modellről (in-game economy, monetizáció),  
- vagy konkrét „első 10 perc játékélmény” scriptjéről is.