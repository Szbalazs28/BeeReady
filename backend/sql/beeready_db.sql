-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Ápr 28. 20:19
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

CREATE DATABASE IF NOT EXISTS `BeeReady_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `BeeReady_db`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `beeready_db`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `admins`
--

INSERT INTO `admins` (`id`, `user_id`) VALUES
(1, 2);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `events`
--

INSERT INTO `events` (`event_id`, `user_id`, `event_date`, `title`, `description`) VALUES
(1, 3, '2025-05-10', 'Adatbázisok ZH', 'A relációs modellről és normálformákról lesz szó.'),
(2, 3, '2025-05-18', 'Webprogramozás beadandó', 'REST API beadandó határideje.'),
(3, 3, '2025-06-02', 'Vizsgaidőszak kezdete', 'Első vizsga: Algoritmusok.'),
(4, 3, '2025-05-25', 'Hackathon', '24 órás programozási verseny az egyetemen.'),
(5, 3, '2025-06-15', 'Diploma osztályozó', 'Az évzáró értekezlet időpontja.'),
(6, 4, '2025-05-08', 'Mikroökonómia ZH', 'Keresleti és kínálati összefüggések, piaci egyensúly.'),
(7, 4, '2025-05-20', 'Pénzügy vizsga', 'Szóbeli vizsga, kötelező irodalom átnézése.'),
(8, 4, '2025-05-30', 'Csoportos prezentáció', 'Marketing projekt bemutatása.'),
(9, 4, '2025-06-10', 'Számvitel ZH', 'Mérleg és eredménykimutatás feladatok.'),
(10, 4, '2025-06-20', 'Konferencia', 'Fiatal közgazdászok fóruma, Budapesti Corvinus.'),
(11, 5, '2025-05-07', 'Genetika labor', 'DNS kivonatolási kísérlet, köpeny és kesztyű szükséges.'),
(12, 5, '2025-05-15', 'Biokémia ZH', 'Anyagcsere útvonalak, enzimkinetika.'),
(13, 5, '2025-05-28', 'Terepgyakorlat', 'Ökológiai mintavételezés a Pilisben.'),
(14, 5, '2025-06-05', 'Sejtbiológia vizsga', 'Szóbeli, teljes anyag.'),
(15, 5, '2025-06-18', 'TDK leadási határidő', 'Tudományos diákköri dolgozat feltöltése.'),
(16, 6, '2025-05-09', 'Fizika I. ZH', 'Mechanika és termodinamika feladatsor.'),
(17, 6, '2025-05-22', 'Matematika dolgozat', 'Integrálszámítás és differenciálegyenletek.'),
(18, 6, '2025-06-01', 'Műszaki rajz beadandó', 'AutoCAD tervek leadása elektronikusan.'),
(19, 6, '2025-06-12', 'Gyárlátogatás', 'Bosch Miskolc üzemlátogatás, busz 7:00-kor indul.'),
(20, 6, '2025-06-22', 'Záróvizsga', 'Anyagismeret + Termodinamika záróvizsga.'),
(21, 7, '2025-05-06', 'Pszichológia szeminárium', 'Esettanulmány megvitatása, mindenki hozzon anyagot.'),
(22, 7, '2025-05-16', 'Fejlődéslélektan ZH', 'Piaget és Vygotsky elméletei.'),
(23, 7, '2025-05-27', 'Terápiás megfigyelés', 'Klinikai gyakorlat a Semmelweis Kórházban.'),
(24, 7, '2025-06-08', 'Szociálpszich. vizsga', 'Írásbeli, 90 perc, esszé + tesztkérdések.'),
(25, 7, '2025-06-19', 'Szakmai konferencia', 'Kognitív idegtudományi szimpózium, ELTE.'),
(26, 1, '2025-05-12', 'Analízis pót-ZH', 'Integrálásszámítás és differenciálegyenletek.'),
(27, 1, '2025-05-20', 'Hálózatok jegyzőkönyv', 'A Packet Tracer szimuláció leadási határideje.'),
(28, 1, '2025-05-28', 'Projektbemutató', 'A féléves szoftverfejlesztési projekt prezentációja.'),
(29, 1, '2025-06-05', 'Operációs rendszerek vizsga', 'Írásbeli vizsga a nagyteremben.'),
(30, 1, '2025-06-12', 'Szakmai gyakorlat interjú', 'Online interjú a kiválasztott céggel.'),
(31, 1, '2025-06-20', 'Kreditátviteli kérelem', 'Utolsó nap a választható tárgyak leadására.'),
(32, 1, '2026-05-04', 'Digitális Technika ZH', 'Logikai kapuk és szekvenciális hálózatok.'),
(33, 1, '2026-05-11', 'Adatbázisok projekt leadás', 'A normalizált adatbázisterv és az SQL szkriptek feltöltése.'),
(34, 1, '2026-05-15', 'Közgazdaságtan kiselőadás', 'A piaci formák bemutatása PPT formátumban.'),
(35, 1, '2026-05-22', 'Webprogramozás vizsgakurzus', 'JS keretrendszerek és React alapok teszt.'),
(36, 1, '2026-05-29', 'Szoftverfejlesztés demo', 'A féléves csapatmunka prototípusának bemutatása.'),
(37, 1, '2026-06-02', 'Vizsgaidőszak kezdete', 'Jelentkezés a Neptunban a meghirdetett időpontokra.'),
(38, 1, '2026-06-08', 'Algoritmuselmélet vizsga', 'Gráfelmélet és bonyolultságelmélet írásbeli.'),
(39, 1, '2026-06-15', 'Hálózatok II. gyakorlati vizsga', 'Konfigurációs feladatok fizikai eszközökön.'),
(40, 1, '2026-06-23', 'Fizika I. szóbeli vizsga', 'Mechanika és termodinamika tételek.'),
(41, 1, '2026-06-30', 'Félévzáró adminisztráció', 'Leckekönyv ellenőrzése és ösztöndíj pályázat leadása.');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `flashcard_card`
--

CREATE TABLE `flashcard_card` (
  `card_id` int(11) NOT NULL,
  `deck_id` int(11) NOT NULL,
  `front_text` varchar(255) DEFAULT NULL,
  `back_text` text DEFAULT NULL,
  `position` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `flashcard_card`
--

INSERT INTO `flashcard_card` (`card_id`, `deck_id`, `front_text`, `back_text`, `position`) VALUES
(1, 1, 'Mi a holtpont (deadlock)?', 'Olyan állapot, ahol folyamatok egymásra várnak, és egyik sem tud továbblépni.', 1),
(2, 1, 'Virtuális memória fogalma', 'A fizikai RAM kiterjesztése a merevlemez használatával.', 2),
(3, 1, 'Mi az ütemező (scheduler) feladata?', 'Meghatározza, hogy melyik folyamat kapja meg a CPU használati jogát.', 3),
(4, 1, 'Mi a kernel (rendszermag)?', 'Az operációs rendszer központi része, amely kezeli a hardvererőforrásokat.', 4),
(5, 1, 'Paging (lapozás)', 'Memóriakezelési technika, amely fix méretű blokkokra osztja a memóriát.', 5),
(6, 1, 'Mi a különbség a folyamat és a szál között?', 'A folyamat egy futó program, a szál (thread) a folyamaton belüli legkisebb végrehajtási egység.', 6),
(7, 1, 'Interrupt (megszakítás)', 'Egy jelzés a hardvertől vagy szoftvertől, amely azonnali figyelmet igényel a CPU-tól.', 7),
(8, 1, 'Fájlrendszer feladata', 'Az adatok tárolásának, rendszerezésének és visszakeresésének módja a háttértáron.', 8),
(9, 1, 'Race condition', 'Olyan hiba, amikor a kimenet a műveletek végrehajtásának sorrendjétől függ.', 9),
(10, 2, 'Mi a DOM?', 'Document Object Model - a HTML dokumentum objektum alapú reprezentációja.', 1),
(11, 2, 'HTTP 404 hiba jelentése', 'A keresett erőforrás (oldal) nem található.', 2),
(12, 2, 'CSS Box Modell részei', 'Content, Padding, Border, Margin.', 3),
(13, 2, 'Szemantikus HTML', 'Olyan tagek használata, amik leírják a tartalom jelentését (pl. <article>, <nav>).', 4),
(14, 2, 'Mi a JWT?', 'JSON Web Token - biztonságos információátadásra használt token (pl. bejelentkezésnél).', 5),
(15, 2, 'Responsive design', 'Olyan weboldal tervezés, amely minden kijelzőméreten (mobil, asztali) jól jelenik meg.', 6),
(16, 2, 'Mi a különbség a GET és POST között?', 'A GET adatot kér le a szervertől, a POST adatot küld a szervernek feldolgozásra.', 7),
(17, 2, 'Mi a JavaScript Event Loop?', 'A mechanizmus, amely lehetővé teszi az aszinkron műveletek kezelését egyszálú környezetben.', 8),
(18, 2, 'REST API jelentése', 'Representational State Transfer - szabványosított architektúra webszolgáltatásokhoz.', 9),
(19, 2, 'CSS Flexbox célja', 'Elemek elrendezése és igazítása egy konténeren belül, dinamikus méretezéssel.', 10),
(20, 2, 'LocalStorage vs SessionStorage', 'A LocalStorage nem jár le, a SessionStorage a böngészőfül bezárásakor törlődik.', 11),
(21, 2, 'Mi az a CORS?', 'Cross-Origin Resource Sharing - biztonsági mechanizmus az eltérő eredetű lekérések korlátozására.', 12),
(22, 3, 'Mi az első normálforma (1NF)?', 'Az attribútumok csak atomi értékeket tartalmazhatnak.', 1),
(23, 3, 'Idegen kulcs (Foreign Key)', 'Egy mező, amely egy másik tábla elsődleges kulcsára hivatkozik.', 2),
(24, 3, 'ACID tulajdonságok', 'Atomicity, Consistency, Isolation, Durability.', 3),
(25, 3, 'Mi az a tranzakció?', 'Logikai egységbe foglalt adatbázis-műveletek sorozata, ami vagy teljesen lefut, vagy sehogy.', 4),
(26, 3, 'SQL JOIN típusok', 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN.', 5),
(27, 3, 'Indexelés előnye', 'Jelentősen gyorsítja az adatok keresését és lekérdezését a táblában.', 6),
(28, 3, 'Relációs adatbázis (RDBMS)', 'Adatok tárolása táblákban, amelyek között kapcsolatok (relációk) állnak fenn.', 7),
(29, 3, 'Mi az a NoSQL?', 'Nem relációs adatbázis, amely rugalmas sémákat használ (pl. MongoDB, Redis).', 8),
(30, 3, 'Adatintegritás', 'Az adatok pontosságának, teljességének és következetességének megőrzése.', 9),
(31, 4, 'Unit teszt fogalma', 'A legkisebb kódegységek (pl. függvények) izolált tesztelése.', 1),
(32, 4, 'Regression testing', 'Annak ellenőrzése, hogy a változtatások nem rontották-e el a már meglévő funkciókat.', 2),
(33, 4, 'Black-box tesztelés', 'A tesztelő nem ismeri a rendszer belső felépítését, csak a bemeneteket és kimeneteket.', 3),
(34, 4, 'Integrációs tesztelés', 'Különálló modulok közötti együttműködés és adatcsere ellenőrzése.', 4),
(35, 4, 'White-box tesztelés', 'A tesztelő ismeri a forráskódot és a belső algoritmusokat.', 5),
(36, 4, 'Acceptance testing (átvételi teszt)', 'Annak igazolása, hogy a rendszer megfelel a felhasználói igényeknek és specifikációknak.', 6),
(37, 4, 'Bug (hiba) életciklusa', 'New -> Assigned -> Open -> Fixed -> Pending Retest -> Closed.', 7),
(38, 4, 'TDD jelentése', 'Test Driven Development - tesztvezérelt fejlesztés (előbb írjuk a tesztet, aztán a kódot).', 8),
(39, 4, 'Boundary Value Analysis', 'Határérték-analízis: a bemeneti tartomány szélein történő tesztelés.', 9),
(40, 5, 'Mi a Big-O jelölés?', 'Az algoritmus futási idejének felső korlátját leíró jelölés (pl. O(n), O(log n)).', 1),
(41, 5, 'Memoizáció', 'Rekurzív hívások eredményeinek tárolása a felesleges újraszámítás elkerülésére.', 2),
(42, 5, 'Quicksort időbonyolultsága', 'Átlagos eset: O(n log n), legrosszabb: O(n²).', 3),
(43, 5, 'Mi a gráf?', 'Csúcsok (node) és élek (edge) halmaza; lehet irányított vagy irányítatlan.', 4),
(44, 6, 'SELECT DISTINCT', 'Ismétlődő sorokat szűr ki az eredményből.', 1),
(45, 6, 'LEFT JOIN', 'Az összes bal oldali sort visszaadja, még ha nincs egyezés a jobb oldalon.', 2),
(46, 6, 'GROUP BY', 'Sorokat csoportosít egy vagy több oszlop értéke alapján.', 3),
(47, 6, 'HAVING', 'GROUP BY után szűr aggregált értékekre (WHERE csak sorokra szűr).', 4),
(48, 6, 'INDEX', 'Adatbázis objektum, ami gyorsítja a keresést egy vagy több oszlopon.', 5),
(49, 7, 'Kereslet törvénye', 'Ha az ár nő, a keresett mennyiség csökken (ceteris paribus).', 1),
(50, 7, 'Rugalmasság', 'Azt méri, mennyire érzékeny a kereslet vagy kínálat az árak változására.', 2),
(51, 7, 'Piaci egyensúly', 'Az a pont, ahol a kereslet és a kínálat egyenlő.', 3),
(52, 7, 'Externália', 'Olyan külső hatás, amit a piac nem áraz be (pl. környezetszennyezés).', 4),
(53, 8, 'NPV (Nettó jelenérték)', 'Jövőbeli pénzáramlások jelenértékének és a kezdeti befektetés különbsége.', 1),
(54, 8, 'IRR', 'Az a diszkontráta, ahol az NPV nulla.', 2),
(55, 8, 'Diverzifikáció', 'Kockázat csökkentése különböző eszközökbe fektetéssel.', 3),
(56, 8, 'Likviditás', 'Az eszköz rövid idő alatt, veszteség nélkül pénzre válthatóságának mértéke.', 4),
(57, 9, 'DNS', 'Dezoxiribonukleinsav; a genetikai információ hordozója kettős hélix szerkezetben.', 1),
(58, 9, 'Mutáció', 'A DNS bázissorrendjének öröklődő megváltozása.', 2),
(59, 9, 'Mitózis', 'Sejtosztódás, amelynek során két azonos leánysejt keletkezik.', 3),
(60, 9, 'Mendel I. törvénye', 'Az egységesség törvénye: az F1 generáció fenotípusosan egységes.', 4),
(61, 10, 'Glikolízis', 'A glükóz lebontásának első fázisa; 2 ATP-t termel.', 1),
(62, 10, 'Krebskör', 'Citromsavciklus; acetil-CoA oxidációja, NADH és FADH₂ termelésével.', 2),
(63, 10, 'ATP', 'Adenozin-trifoszfát; az élő szervezetek fő energiahordozója.', 3),
(64, 10, 'Enzim', 'Biológiai katalizátor, amely felgyorsítja a kémiai reakciókat.', 4),
(65, 10, 'Oxidatív foszforiláció', 'Mitokondriális ATP-szintézis, elektrontranszportlánc segítségével.', 5),
(66, 11, 'Newton II. törvénye', 'F = m·a  (erő = tömeg × gyorsulás).', 1),
(67, 11, 'Munka', 'W = F·d·cos(θ)  (erő és elmozdulás skalárszorzata).', 2),
(68, 11, 'Ohm törvénye', 'U = R·I  (feszültség = ellenállás × áramerősség).', 3),
(69, 11, 'Gravitációs törvény', 'F = G·(m₁·m₂)/r²', 4),
(70, 12, 'Rugalmassági modulus', 'E = σ/ε  (feszültség és relatív alakváltozás hányadosa).', 1),
(71, 12, 'Keménység', 'Anyag ellenállása plasztikus deformációval szemben (pl. Brinell-skála).', 2),
(72, 12, 'Törékeny anyag', 'Olyan anyag, amely nagy alakváltozás nélkül törik (pl. kerámia, üveg).', 3),
(73, 12, 'Kompozit anyag', 'Két vagy több különböző anyag kombinációja jobb tulajdonságok eléréséért.', 4),
(74, 13, 'Behaviorizmus', 'Csak megfigyelhető viselkedéssel foglalkozik; belső folyamatokat nem vizsgál.', 1),
(75, 13, 'Humanisztikus pszich.', 'Maslow, Rogers; az önmegvalósítás és szabad akarat hangsúlyozása.', 2),
(76, 13, 'Pszichoanalízis', 'Freud elmélete az öntudatlan folyamatokról és a személyiségstruktúráról.', 3),
(77, 13, 'Kognitív irányzat', 'A mentális folyamatok – gondolkodás, memória, figyelem – vizsgálata.', 4),
(78, 14, 'Munkamemória', 'Rövid idejű, korlátozott kapacitású memóriarendszer (Baddeley-modell).', 1),
(79, 14, 'Kognitív séma', 'Mentális keret, ami segít értelmezni az új információkat.', 2),
(80, 14, 'ZPD (Vygotsky)', 'Közelítő fejlődési zóna: a tényleges és potenciális fejlettség közti rés.', 3),
(81, 14, 'Kondicionálás', 'Tanulás asszociáció útján; klasszikus (Pavlov) és operáns (Skinner).', 4),
(82, 14, 'Metacognition', 'Az egyén saját gondolkodási folyamatainak tudatossága és kontrollja.', 5);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `flashcard_deck`
--

CREATE TABLE `flashcard_deck` (
  `deck_id` int(11) NOT NULL,
  `deck_name` varchar(200) DEFAULT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `position` int(11) NOT NULL,
  `public` tinyint(1) DEFAULT 0,
  `share_code` varchar(8) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `flashcard_deck`
--

INSERT INTO `flashcard_deck` (`deck_id`, `deck_name`, `create_date`, `position`, `public`, `share_code`, `user_id`) VALUES
(1, 'Operációs rendszerek', '2026-04-28 17:21:22', 0, 1, 'Os9R2tW4', 1),
(2, 'Webfejlesztés alapok', '2026-04-28 17:21:22', 1, 0, 'Wb4K8pL1', 1),
(3, 'Adatbázis elmélet', '2026-04-28 17:21:22', 2, 1, 'Db7X3zM9', 1),
(4, 'Szoftvertesztelés', '2026-04-28 17:21:22', 3, 0, 'St1V6nJ2', 1),
(5, 'Algoritmusok fogalmai', '2026-04-28 16:45:03', 1, 0, 'R9k2LpM5', 3),
(6, 'SQL parancsok', '2026-04-28 16:45:03', 2, 1, 'T7vB4xWz', 3),
(7, 'Mikroökonómia fogalmak', '2026-04-28 16:45:03', 1, 0, 'X2yS8fHq', 4),
(8, 'Pénzügyi kifejezések', '2026-04-28 16:45:03', 2, 0, 'N5mJ1kP9', 4),
(9, 'Genetika alapok', '2026-04-28 16:45:03', 1, 0, 'D4gT7hL3', 5),
(10, 'Biokémia anyagcsere', '2026-04-28 16:45:03', 2, 1, 'A9vE2cR1', 5),
(11, 'Fizika képletek', '2026-04-28 16:45:03', 1, 0, 'K8bN6mZ4', 6),
(12, 'Anyagismeret fogalmak', '2026-04-28 16:45:03', 2, 0, 'W3xQ9pT0', 6),
(13, 'Pszichológia irányzatok', '2026-04-28 16:45:03', 1, 0, 'V1sR7zF2', 7),
(14, 'Kognitív fogalmak', '2026-04-28 16:45:03', 2, 0, 'L6kJ4pX8', 7);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quizzes`
--

CREATE TABLE `quizzes` (
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `last_modified` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `public` tinyint(1) DEFAULT 0,
  `randomize_questions` tinyint(1) DEFAULT 0,
  `total_points` int(11) DEFAULT 0,
  `position` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quizzes`
--

INSERT INTO `quizzes` (`quiz_id`, `user_id`, `title`, `description`, `last_modified`, `public`, `randomize_questions`, `total_points`, `position`) VALUES
(4, 1, 'Szoftverfejlesztési Életciklus', 'A szoftverfejlesztés fázisai és módszertanai.', '2026-04-28 18:06:07', 0, 0, 40, 2),
(5, 1, 'Hálózati Alapismeretek és Biztonság', 'IP címzés, protokollok és alapvető védelmi vonalak.', '2026-04-28 18:06:07', 0, 0, 35, 3),
(9, 1, 'Modern Webfejlesztés alapjai', 'HTML5, CSS3 és JavaScript alapfogalmak.', '2026-04-28 18:08:47', 1, 1, 40, 5),
(10, 1, 'Adatbázis és SQL Haladó Kvíz', 'Összetett kérdéstípusok tesztelése.', '2026-04-28 18:08:57', 1, 1, 34, 6),
(11, 1, 'TCP/IP és Hálózati Protokollok', 'Mélyebb betekintés az internet működésébe és a rétegek feladataiba.', '2026-04-28 18:09:01', 1, 0, 43, 7),
(14, 5, 'Sejtbiológia teszt', 'A sejt felépítése és működése.', '2026-04-28 18:12:53', 0, 1, 9, 1),
(16, 3, 'Algoritmusok kvíz', 'Alapvető algoritmusok és bonyolultságelmélet.', '2026-04-28 18:15:59', 1, 1, 22, 0),
(17, 4, 'Közgazdaságtan alapjai', 'Mikro- és makroökonómiai alapfogalmak tesztje.', '2026-04-28 18:16:35', 1, 0, 16, 0),
(18, 7, 'Pszichológia kvíz', 'Alapvető pszichológiai elméletek és fogalmak.', '2026-04-28 18:17:10', 1, 0, 12, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `answer_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` text NOT NULL,
  `right_answer` tinyint(1) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quiz_answers`
--

INSERT INTO `quiz_answers` (`answer_id`, `question_id`, `answer_text`, `right_answer`, `points`) VALUES
(18, 10, 'Scrum', 1, 10),
(19, 11, '{\"words\":[\"Integration\",\"Deployment\"],\"text\":\"A CI jelentése Continuous {}, míg a CD jelentése Continuous {}.\",\"points\":[10, 10]}', 1, 20),
(20, 12, 'Követelményanalízis', 1, 1),
(21, 12, 'Tervezés', 1, 1),
(22, 12, 'Implementáció', 1, 1),
(23, 12, 'Tesztelés', 1, 1),
(24, 13, 'A legkisebb kódegységeket tesztelik elkülönítve.', 1, 2),
(25, 13, 'Mindig manuálisan kell lefuttatni őket.', 0, 2),
(26, 13, 'Segítenek a regressziós hibák gyors felderítésében.', 1, 2),
(27, 14, 'HTTPS', 1, 10),
(28, 15, '{\"words\":[\"Hálózati\",\"Szállítási\"],\"text\":\"Az IP címzés a(z) {} rétegben történik, míg a TCP/UDP a(z) {} réteg feladata.\",\"points\":[8, 7]}', 1, 15),
(29, 16, 'SYN', 1, 1),
(30, 16, 'SYN-ACK', 1, 1),
(31, 16, 'ACK', 1, 1),
(32, 16, 'Adatátvitel megkezdése', 1, 1),
(33, 17, '192.168.0.0 - 192.168.255.255', 1, 2),
(34, 17, '10.0.0.0 - 10.255.255.255', 1, 2),
(35, 17, '8.8.8.8 - 8.8.4.4', 0, 2),
(56, 26, 'const', 1, 1),
(57, 27, '{\"words\":[\"padding\",\"margin\"],\"text\":\"A tartalom és a keret közötti távolság a {}, míg a kereten kívüli távolság a {}.\",\"points\":[10,10]}', 1, 1),
(58, 28, '<!DOCTYPE html>', 1, 1),
(59, 28, '<html>', 1, 1),
(60, 28, '<head>', 1, 1),
(61, 28, '<body>', 1, 1),
(62, 29, '<li>', 1, 2),
(63, 29, '<ul>', 0, 2),
(64, 29, '<ol>', 0, 2),
(65, 30, 'UPDATE', 1, 1),
(66, 31, 'COUNT', 1, 1),
(67, 32, '{\"words\":[\"WHERE\",\"ORDER BY\"],\"text\":\"SELECT * FROM table {} id > 10 {} name ASC;\",\"points\":[5,5]}', 1, 1),
(68, 33, 'Adatbázis létrehozása', 1, 1),
(69, 33, 'Tábla definiálása', 1, 1),
(70, 33, 'Adatok beszúrása', 1, 1),
(71, 33, 'Lekérdezés futtatása', 1, 1),
(72, 34, 'TCP', 1, 1),
(73, 35, '{\"words\":[\"22\",\"80\"],\"text\":\"Az SSH protokoll alapértelmezett portja a {}, míg a HTTP forgalom a {} porton zajlik.\",\"points\":[10,10]}', 1, 1),
(74, 36, 'Alkalmazási réteg (L7)', 1, 1),
(75, 36, 'Megjelenítési réteg (L6)', 1, 1),
(76, 36, 'Viszony réteg (L5)', 1, 1),
(77, 36, 'Szállítási réteg (L4)', 1, 1),
(78, 36, 'Hálózati réteg (L3)', 1, 1),
(79, 37, 'Kapcsolatmentes átvitelt valósít meg.', 1, 2),
(80, 37, 'Alacsonyabb a késleltetése, mint a TCP-nek.', 1, 2),
(81, 37, 'Garantálja a csomagok sorrendiségét.', 0, 2),
(82, 37, 'Gyakran használják streaming szolgáltatásokhoz.', 1, 2),
(105, 44, 'Sejtmag', 0, 0),
(106, 44, 'Mitokondrium', 1, 3),
(107, 44, 'Golgi-készülék', 0, 0),
(108, 44, 'Lizoszóma', 0, 0),
(109, 45, 'Lipidek szintézise', 0, 0),
(110, 45, 'Fehérjeszintézis', 1, 3),
(111, 45, 'DNS replikáció', 0, 0),
(112, 45, 'Sejtosztódás irányítása', 0, 0),
(113, 46, '1', 0, 0),
(114, 46, '2', 1, 3),
(115, 46, '4', 0, 0),
(116, 46, '8', 0, 0),
(129, 50, 'O(n)', 0, 3),
(130, 50, 'O(n log n)', 0, 3),
(131, 50, 'O(n²)', 1, 3),
(132, 50, 'O(log n)', 0, 3),
(133, 51, 'Sor (Queue)', 0, 1),
(134, 51, 'Verem (Stack)', 1, 1),
(135, 51, 'Fa (Tree)', 0, 1),
(136, 51, 'Lista', 0, 1),
(137, 52, 'Igaz', 0, 3),
(138, 52, 'Hamis', 1, 3),
(139, 53, 'Az ország összes adóbevétele egy évben.', 0, 1),
(140, 53, 'Egy ország határain belül megtermelt összes javak és szolgáltatások értéke.', 1, 1),
(141, 53, 'Az export és import különbsége.', 0, 1),
(142, 53, 'Az egy főre jutó átlagbér.', 0, 1),
(143, 54, 'Ahol a kereslet nagyobb, mint a kínálat.', 0, 1),
(144, 54, 'Ahol a kínálat nagyobb, mint a kereslet.', 0, 1),
(145, 54, 'Az a pont, ahol a keresett és kínált mennyiség egyenlő.', 1, 1),
(146, 54, 'Ahol az árak a legalacsonyabbak.', 0, 1),
(147, 55, '1%-os árváltozás 2%-os mennyiségváltozást okoz.', 1, 2),
(148, 55, '2%-os árváltozás 1%-os mennyiségváltozást okoz.', 0, 2),
(149, 55, 'A kereslet rugalmatlan.', 0, 2),
(150, 55, 'Az ár és a kereslet egyenlő.', 0, 2),
(151, 56, 'Carl Rogers', 0, 1),
(152, 56, 'Sigmund Freud', 1, 1),
(153, 56, 'B.F. Skinner', 0, 1),
(154, 56, 'Jean Piaget', 0, 1),
(155, 57, 'Biztonság', 0, 1),
(156, 57, 'Szeretet és valakihez tartozás', 0, 1),
(157, 57, 'Önmegvalósítás', 1, 1),
(158, 57, 'Fiziológiai szükségletek', 0, 1),
(159, 58, 'Jutalmazással erősítjük a kívánt viselkedést.', 0, 1),
(160, 58, 'Semleges inger feltételes reflexet vált ki ismétlés után.', 1, 1),
(161, 58, 'A viselkedést belső motiváció vezérli.', 0, 1),
(162, 58, 'Az ember tudattalanból cselekszik.', 0, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `question_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('standard','order','short','fill') DEFAULT 'standard',
  `points` int(11) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quiz_questions`
--

INSERT INTO `quiz_questions` (`question_id`, `quiz_id`, `question_text`, `question_type`, `points`, `position`) VALUES
(10, 4, 'Melyik agilis keretrendszer használ \"Sprint\"-eket a fejlesztési ciklusokhoz?', 'short', 10, 1),
(11, 4, 'CI/CD alapfogalmak kiegészítése', 'fill', 20, 2),
(12, 4, 'Állítsd sorrendbe a vízesésmodell lépéseit!', 'order', 0, 3),
(13, 4, 'Melyik állítás igaz a Unit tesztekre?', 'standard', 6, 4),
(14, 5, 'Melyik protokoll felelős a weboldalak titkosított továbbításáért?', 'short', 10, 1),
(15, 5, 'OSI modell kiegészítése', 'fill', 15, 2),
(16, 5, 'Állítsd sorrendbe a TCP Three-Way Handshake lépéseit!', 'order', 0, 3),
(17, 5, 'Melyek érvényes privát IP cím tartományok?', 'standard', 6, 4),
(26, 9, 'Melyik JavaScript kulcsszóval deklarálhatunk olyan változót, amelynek értéke nem módosítható?', 'short', 10, 0),
(27, 9, 'CSS Box Modell kiegészítése', 'fill', 0, 1),
(28, 9, 'Állítsd sorrendbe a HTML dokumentum alapvető vázát!', 'order', 0, 2),
(29, 9, 'Melyik HTML elem használható listaelemek definiálására?', 'standard', 6, 3),
(30, 10, 'Melyik SQL parancs használható a meglévő rekordok módosítására egy táblában?', 'short', 10, 0),
(31, 10, 'Melyik aggregáló függvénnyel kérdezhetjük le a sorok számát?', 'short', 10, 1),
(32, 10, 'SQL sorrend kiegészítése', 'fill', 0, 2),
(33, 10, 'Állítsd logikai sorrendbe a műveleteket!', 'order', 0, 3),
(34, 11, 'Melyik szállítási rétegbeli protokoll biztosít hibajavítást és garantált kézbesítést?', 'short', 10, 0),
(35, 11, 'Portok és szolgáltatások párosítása', 'fill', 0, 1),
(36, 11, 'Állítsd sorrendbe az OSI modell rétegeit fentről lefelé (7-től 3-ig)!', 'order', 0, 2),
(37, 11, 'Mely állítások igazak az UDP protokollra?', 'standard', 8, 3),
(44, 14, 'Melyik sejtszervecske felelős az ATP-termelésért?', 'standard', 3, 1),
(45, 14, 'Mi a riboszóma fő funkciója?', 'standard', 3, 2),
(46, 14, 'Hány kromatid van egy megkettőzött kromoszómában?', 'standard', 3, 3),
(50, 16, 'Mi a buborékrendezés (bubble sort) legrosszabb esetbeli időbonyolultsága?', 'standard', 12, 0),
(51, 16, 'Melyik adatszerkezet működik LIFO elven?', 'standard', 4, 1),
(52, 16, 'Igaz vagy hamis: A bináris keresés rendezetlen tömbön is működik.', 'standard', 6, 2),
(53, 17, 'Mi a GDP?', 'standard', 4, 0),
(54, 17, 'Melyik a helyes definíció a piaci egyensúlyra?', 'standard', 4, 1),
(55, 17, 'A kereslet rugalmassága 2. Mit jelent ez?', 'standard', 8, 2),
(56, 18, 'Ki dolgozta ki a pszichoanalízis elméletét?', 'standard', 4, 0),
(57, 18, 'Melyik Maslow szükséglethierarchiájának legmagasabb szintje?', 'standard', 4, 1),
(58, 18, 'Mi a klasszikus kondicionálás lényege?', 'standard', 4, 2);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quiz_results`
--

CREATE TABLE `quiz_results` (
  `result_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` text NOT NULL,
  `points_earned` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quiz_results`
--

INSERT INTO `quiz_results` (`result_id`, `question_id`, `answer_text`, `points_earned`) VALUES
(2, 10, '{\"answers\":[{\"answer\":\"Node\",\"correct\":false}]}', 0),
(2, 11, '{\"answers\":[{\"answer\":\"Integration\",\"points\":10,\"correct\":true},{\"answer\":\"Deployment\",\"points\":10,\"correct\":true}]}', 20),
(2, 12, '{\"answers\":[{\"answer\":\"21\",\"points\":0,\"correct\":false},{\"answer\":\"22\",\"points\":0,\"correct\":false},{\"answer\":\"23\",\"points\":0,\"correct\":false},{\"answer\":\"20\",\"points\":0,\"correct\":false}],\"ispartial\":true}', 0),
(2, 13, '{\"answers\":[{\"answer\":true,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":0,\"correct\":false}]}', 4),
(3, 14, '{\"answers\":[{\"answer\":\"HTTPS\",\"correct\":true}]}', 10),
(3, 15, '{\"answers\":[{\"answer\":\"Hálózati\",\"points\":8,\"correct\":true},{\"answer\":\"Szállítási\",\"points\":7,\"correct\":true}]}', 15),
(3, 16, '{\"answers\":[{\"answer\":\"32\",\"points\":0,\"correct\":false},{\"answer\":\"29\",\"points\":0,\"correct\":false},{\"answer\":\"31\",\"points\":1,\"correct\":true},{\"answer\":\"30\",\"points\":0,\"correct\":false}],\"ispartial\":true}', 1),
(3, 17, '{\"answers\":[{\"answer\":true,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":0,\"correct\":false},{\"answer\":true,\"points\":0,\"correct\":false}]}', 2),
(6, 29, '{\"answers\":[{\"answer\":false,\"points\":0,\"correct\":false},{\"answer\":true,\"points\":0,\"correct\":false},{\"answer\":false,\"points\":2,\"correct\":true}]}', 2),
(6, 27, '{\"answers\":[{\"answer\":\"padding\",\"points\":10,\"correct\":true},{\"answer\":\"margin\",\"points\":10,\"correct\":true}]}', 20),
(6, 28, '{\"answers\":[{\"answer\":\"58\",\"points\":1,\"correct\":true},{\"answer\":\"59\",\"points\":1,\"correct\":true},{\"answer\":\"60\",\"points\":1,\"correct\":true},{\"answer\":\"61\",\"points\":1,\"correct\":true}],\"ispartial\":true}', 4),
(6, 26, '{\"answers\":[{\"answer\":\"const\",\"correct\":true}]}', 10),
(7, 28, '{\"answers\":[{\"answer\":\"58\",\"points\":1,\"correct\":true},{\"answer\":\"59\",\"points\":1,\"correct\":true},{\"answer\":\"60\",\"points\":1,\"correct\":true},{\"answer\":\"61\",\"points\":1,\"correct\":true}],\"ispartial\":true}', 4),
(7, 26, '{\"answers\":[{\"answer\":\"const\",\"correct\":true}]}', 10),
(7, 29, '{\"answers\":[{\"answer\":true,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":2,\"correct\":true},{\"answer\":true,\"points\":0,\"correct\":false}]}', 4),
(7, 27, '{\"answers\":[{\"answer\":\"margin\",\"points\":0,\"correct\":false},{\"answer\":\"ő\",\"points\":0,\"correct\":false}]}', 0),
(8, 53, '{\"answers\":[{\"answer\":false,\"points\":1,\"correct\":true},{\"answer\":true,\"points\":1,\"correct\":true},{\"answer\":false,\"points\":1,\"correct\":true},{\"answer\":false,\"points\":1,\"correct\":true}]}', 4),
(8, 54, '{\"answers\":[{\"answer\":true,\"points\":0,\"correct\":false},{\"answer\":false,\"points\":1,\"correct\":true},{\"answer\":false,\"points\":0,\"correct\":false},{\"answer\":false,\"points\":1,\"correct\":true}]}', 2),
(8, 55, '{\"answers\":[{\"answer\":true,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":2,\"correct\":true},{\"answer\":false,\"points\":2,\"correct\":true}]}', 8);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quiz_share`
--

CREATE TABLE `quiz_share` (
  `result_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `position` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quiz_share`
--

INSERT INTO `quiz_share` (`result_id`, `quiz_id`, `user_id`, `position`) VALUES
(7, 9, 3, 0),
(8, 17, 1, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `quiz_submit`
--

CREATE TABLE `quiz_submit` (
  `result_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `taken_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_points` int(11) NOT NULL DEFAULT 0,
  `earned_points` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `quiz_submit`
--

INSERT INTO `quiz_submit` (`result_id`, `quiz_id`, `user_id`, `taken_at`, `total_points`, `earned_points`) VALUES
(2, 4, 1, '2026-04-28 17:57:00', 40, 24),
(3, 5, 1, '2026-04-28 17:59:15', 35, 28),
(6, 9, 1, '2026-04-28 18:09:28', 40, 36),
(7, 9, 3, '2026-04-28 18:11:48', 40, 18),
(8, 17, 1, '2026-04-28 18:18:00', 16, 14);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `timetable`
--

CREATE TABLE `timetable` (
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `week_type` varchar(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `timetable`
--

INSERT INTO `timetable` (`event_id`, `user_id`, `day`, `start_time`, `end_time`, `subject`, `location`, `week_type`) VALUES
(1, 1, 0, '08:00:00', '09:30:00', 'Analízis I.', 'A101', 'A'),
(2, 1, 0, '10:00:00', '11:30:00', 'Digitális Technika', 'Labor 1', 'A'),
(3, 1, 0, '12:00:00', '13:30:00', 'Programozás Alapjai', 'A202', 'A'),
(4, 1, 0, '14:00:00', '15:30:00', 'Angol Nyelv I.', 'B12', 'A'),
(5, 1, 1, '08:30:00', '10:00:00', 'Adatbázisok Elmélet', 'C2', 'A'),
(6, 1, 1, '10:15:00', '11:45:00', 'Lineáris Algebra', 'A101', 'A'),
(7, 1, 1, '12:30:00', '14:00:00', 'Számítógép Architektúrák', 'Labor 4', 'A'),
(8, 1, 2, '09:00:00', '10:30:00', 'Programozás', 'A205', 'A'),
(9, 1, 2, '11:00:00', '12:30:00', 'Hálózatok I.', 'B104', 'A'),
(10, 1, 2, '13:00:00', '14:30:00', 'Programozás', 'Labor 2', 'A'),
(11, 1, 2, '15:00:00', '16:30:00', 'Közgazdaságtan', 'D-Díszterem', 'A'),
(12, 1, 3, '08:00:00', '09:30:00', 'Operációs Rendszerek', 'Labor 5', 'A'),
(13, 1, 3, '10:00:00', '11:30:00', 'Diszkrét Matematika', 'A101', 'A'),
(14, 1, 3, '12:00:00', '13:30:00', 'Mesterséges Intelligencia', 'C1', 'A'),
(15, 1, 4, '08:30:00', '10:00:00', 'Fizika I.', 'Fiz-Lab', 'A'),
(16, 1, 4, '10:30:00', '12:00:00', 'Algoritmuselmélet', 'A202', 'A'),
(17, 1, 4, '13:00:00', '14:30:00', 'Projektmenedzsment', 'B10', 'A'),
(18, 1, 0, '08:00:00', '09:30:00', 'Analízis I. Gyakorlat', 'A101', 'B'),
(19, 1, 0, '10:00:00', '11:30:00', 'Digitális Technika Mérés', 'Mérés-Labor', 'B'),
(20, 1, 0, '12:00:00', '13:30:00', 'Szakmai Etika', 'Online', 'B'),
(21, 1, 0, '14:00:00', '15:30:00', 'Környezetvédelem', 'B12', 'B'),
(22, 1, 1, '09:00:00', '10:30:00', 'Adatbázisok Labor', 'Labor 3', 'B'),
(23, 1, 1, '11:00:00', '12:30:00', 'Valószínűségszámítás', 'A202', 'B'),
(24, 1, 1, '13:00:00', '14:30:00', 'Számítógép Architektúrák II.', 'A105', 'B'),
(25, 1, 2, '08:30:00', '10:00:00', 'Mobilalkalmazás fejlesztés', 'Labor 6', 'B'),
(26, 1, 2, '10:30:00', '12:00:00', 'Hálózatok II.', 'B104', 'B'),
(27, 1, 2, '13:00:00', '14:30:00', 'Testnevelés', 'Tornacsarnok', 'B'),
(28, 1, 2, '15:00:00', '16:30:00', 'Vállalati Pénzügyek', 'D-Díszterem', 'B'),
(29, 1, 3, '08:00:00', '09:30:00', 'Unix Adminisztráció', 'Labor 5', 'B'),
(30, 1, 3, '10:00:00', '11:30:00', 'Kriptográfia', 'C1', 'B'),
(31, 1, 3, '12:00:00', '13:30:00', 'Adatbányászat', 'C2', 'B'),
(32, 1, 4, '09:00:00', '10:30:00', 'Fizika Labor', 'Fiz-Lab', 'B'),
(33, 1, 4, '11:00:00', '12:30:00', 'Szociológia', 'B10', 'B'),
(34, 1, 4, '13:00:00', '14:30:00', 'Grafikai Rendszerek', 'Labor 2', 'B');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `todo_tasks`
--

CREATE TABLE `todo_tasks` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `task_description` text DEFAULT NULL,
  `importance` enum('high','medium','low') NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `todo_tasks`
--

INSERT INTO `todo_tasks` (`id`, `user_id`, `task_name`, `task_description`, `importance`, `is_completed`, `created_at`) VALUES
(1, 3, 'SQL feladatok megoldása', 'Az adatbázis óra 3. feladatsora.', 'high', 0, '2026-04-28 16:45:03'),
(2, 3, 'REST API dokumentálása', 'Swagger leírás elkészítése a beadandóhoz.', 'high', 0, '2026-04-28 16:45:03'),
(3, 3, 'Git repó rendezése', 'Felesleges branchek törlése, README frissítés.', 'medium', 1, '2026-04-28 16:45:03'),
(4, 3, 'Algoritmusok könyv elolvasása', '4-6. fejezet gráfalgoritmusok.', 'medium', 0, '2026-04-28 16:45:03'),
(5, 3, 'Hackathon csapat szervezése', 'Legalább 3 főt toborozni.', 'low', 0, '2026-04-28 16:45:03'),
(6, 4, 'Mikroökonómia ZH-ra készülés', 'Korábbi tesztek megoldása.', 'high', 0, '2026-04-28 16:45:03'),
(7, 4, 'Marketing prezentáció összeáll.', 'PowerPoint elkészítése, diák formázása.', 'high', 0, '2026-04-28 16:45:03'),
(8, 4, 'Pénzügy tankönyv 5-7. fejezet', 'Derivatívák és portfólióelmélet.', 'medium', 0, '2026-04-28 16:45:03'),
(9, 4, 'Számvitel feladatok', 'Mérlegfeladatok ellenőrzése.', 'medium', 1, '2026-04-28 16:45:03'),
(10, 4, 'Konferenciára regisztráció', 'Online regisztráció határideje május 15.', 'low', 0, '2026-04-28 16:45:03'),
(11, 5, 'Labor napló írása', 'DNS kísérlet eredményeinek dokumentálása.', 'high', 0, '2026-04-28 16:45:03'),
(12, 5, 'Biokémia anyag memorizálása', 'Krebskör, glikolízis lépései.', 'high', 0, '2026-04-28 16:45:03'),
(13, 5, 'Terepgyakorlat felszerelés', 'Gumicsizma, esőkabát, mintavételi edények.', 'medium', 0, '2026-04-28 16:45:03'),
(14, 5, 'TDK dolgozat vázlata', 'Bevezetés és módszertan rész megírása.', 'medium', 0, '2026-04-28 16:45:03'),
(15, 5, 'Mikroszkóp foglalása', 'Labor előjegyzési rendszerben.', 'low', 1, '2026-04-28 16:45:03'),
(16, 6, 'Fizika ZH feladatok', 'Munka-energia tétel, lendületmegmaradás.', 'high', 0, '2026-04-28 16:45:03'),
(17, 6, 'AutoCAD rajz befejezése', 'Gépészeti alkatrész 3D modellje.', 'high', 0, '2026-04-28 16:45:03'),
(18, 6, 'Matematika házi feladat', 'Integrálfeladatok 10-15. oldal.', 'medium', 0, '2026-04-28 16:45:03'),
(19, 6, 'Gyárlátogatás visszaigazolása', 'E-mail küldése a koordinátornak.', 'medium', 1, '2026-04-28 16:45:03'),
(20, 6, 'Anyagismeret kísérlet', 'Tensile test eredmények kiértékelése.', 'low', 0, '2026-04-28 16:45:03'),
(21, 7, 'Esettanulmány elemzése', 'Borderline személyiségzavar esetbemutatása.', 'high', 0, '2026-04-28 16:45:03'),
(22, 7, 'Fejlődéslélektan ZH-ra készülés', 'Piaget stádiumok + Vygotsky ZPD.', 'high', 0, '2026-04-28 16:45:03'),
(23, 7, 'Klinikai naplóbejegyzés', 'Megfigyelési tapasztalatok rögzítése.', 'medium', 0, '2026-04-28 16:45:03'),
(24, 7, 'Konferencia absztrakt', 'Max. 250 szó, május 30-i határidő.', 'medium', 0, '2026-04-28 16:45:03'),
(25, 7, 'Statisztika feladatok', 'SPSS adatelemzés, varianciaanalízis.', 'low', 1, '2026-04-28 16:45:03'),
(26, 1, 'Analízis gyakorló feladatok', 'A deriválási szabályok begyakorlása a hétfői órára.', 'high', 0, '2026-04-28 17:11:34'),
(27, 1, 'Digitális Technika mérés előkészítés', 'A logikai kapuk bekötési rajzának elkészítése.', 'high', 0, '2026-04-28 17:11:34'),
(28, 1, 'Adatbázis sématerv véglegesítése', 'A normalizálási lépések dokumentálása a projekthez.', 'high', 0, '2026-04-28 17:11:34'),
(29, 1, 'Hálózatok jegyzőkönyv vázlat', 'A Packet Tracer topológia képernyőmentéseinek rendezése.', 'medium', 1, '2026-04-28 17:11:34'),
(30, 1, 'Szoftverfejlesztés stand-up', 'A heti elvégzett feladatok összefoglalása a csapatnak.', 'medium', 0, '2026-04-28 17:11:34'),
(31, 1, 'Unix parancsok gyakorlása', 'A sed és awk parancsok alapvető használata.', 'medium', 0, '2026-04-28 17:11:34'),
(32, 1, 'Angol szaknyelvi szószedet', 'Az informatikai kifejezések gyűjtése a 12. fejezethez.', 'low', 1, '2026-04-28 17:11:34'),
(33, 1, 'Konditerem bérlet megújítása', 'A testnevelés kurzushoz kapcsolódó adminisztráció.', 'low', 0, '2026-04-28 17:11:34'),
(34, 1, 'Vizsgaidőpontok böngészése', 'A preferált időpontok kigyűjtése a Neptun nyitás előtt.', 'medium', 0, '2026-04-28 17:11:34');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profil_pic_url` text DEFAULT NULL,
  `selected_week_type` varchar(2) DEFAULT 'A'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `profil_pic_url`, `selected_week_type`) VALUES
(1, 'teszt1', 'teszt1@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/oroszlan.webp', 'B'),
(2, 'admin1', 'admin1@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/oroszlan.webp', 'A'),
(3, 'kovacs_anna', 'anna.kovacs@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/roka.webp', 'B'),
(4, 'nagy_peter', 'peter.nagy@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/farkas.webp', 'B'),
(5, 'szabo_reka', 'reka.szabo@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/bagoly.webp', 'A'),
(6, 'toth_balazs', 'balazs.toth@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/medve.webp', 'A'),
(7, 'horvath_nora', 'nora.horvath@beeready.hu', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/tigris.webp', 'B');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user_favorites`
--

CREATE TABLE `user_favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_type` enum('quiz','flashcard') NOT NULL,
  `item_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `user_favorites`
--

INSERT INTO `user_favorites` (`id`, `user_id`, `item_type`, `item_id`, `created_at`) VALUES
(1, 3, 'quiz', 2, '2026-04-28 16:45:04'),
(2, 3, 'quiz', 4, '2026-04-28 16:45:04'),
(3, 3, 'flashcard', 9, '2026-04-28 16:45:04'),
(4, 3, 'flashcard', 14, '2026-04-28 16:45:04'),
(5, 4, 'quiz', 1, '2026-04-28 16:45:04'),
(6, 4, 'quiz', 3, '2026-04-28 16:45:04'),
(7, 4, 'flashcard', 6, '2026-04-28 16:45:04'),
(8, 4, 'flashcard', 11, '2026-04-28 16:45:04'),
(9, 5, 'quiz', 4, '2026-04-28 16:45:04'),
(10, 5, 'quiz', 2, '2026-04-28 16:45:04'),
(11, 5, 'flashcard', 14, '2026-04-28 16:45:04'),
(12, 5, 'flashcard', 5, '2026-04-28 16:45:04'),
(13, 6, 'quiz', 1, '2026-04-28 16:45:04'),
(14, 6, 'quiz', 4, '2026-04-28 16:45:04'),
(15, 6, 'flashcard', 8, '2026-04-28 16:45:04'),
(16, 6, 'flashcard', 10, '2026-04-28 16:45:04'),
(17, 7, 'quiz', 3, '2026-04-28 16:45:04'),
(18, 7, 'quiz', 1, '2026-04-28 16:45:04'),
(19, 7, 'flashcard', 7, '2026-04-28 16:45:04'),
(20, 7, 'flashcard', 6, '2026-04-28 16:45:04'),
(21, 3, 'quiz', 9, '2026-04-28 18:12:03');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `flashcard_card`
--
ALTER TABLE `flashcard_card`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `deck_id` (`deck_id`);

--
-- A tábla indexei `flashcard_deck`
--
ALTER TABLE `flashcard_deck`
  ADD PRIMARY KEY (`deck_id`),
  ADD UNIQUE KEY `share_code` (`share_code`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`quiz_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`answer_id`),
  ADD KEY `question_id` (`question_id`);

--
-- A tábla indexei `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`question_id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- A tábla indexei `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD KEY `result_id` (`result_id`),
  ADD KEY `question_id` (`question_id`);

--
-- A tábla indexei `quiz_share`
--
ALTER TABLE `quiz_share`
  ADD KEY `result_id` (`result_id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `quiz_submit`
--
ALTER TABLE `quiz_submit`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `quiz_id` (`quiz_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `todo_tasks`
--
ALTER TABLE `todo_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_favorite` (`user_id`,`item_type`,`item_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT a táblához `flashcard_card`
--
ALTER TABLE `flashcard_card`
  MODIFY `card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT a táblához `flashcard_deck`
--
ALTER TABLE `flashcard_deck`
  MODIFY `deck_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT a táblához `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `quiz_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT a táblához `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `answer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- AUTO_INCREMENT a táblához `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `question_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT a táblához `quiz_submit`
--
ALTER TABLE `quiz_submit`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `timetable`
--
ALTER TABLE `timetable`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT a táblához `todo_tasks`
--
ALTER TABLE `todo_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT a táblához `user_favorites`
--
ALTER TABLE `user_favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `flashcard_card`
--
ALTER TABLE `flashcard_card`
  ADD CONSTRAINT `flashcard_card_ibfk_1` FOREIGN KEY (`deck_id`) REFERENCES `flashcard_deck` (`deck_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `flashcard_deck`
--
ALTER TABLE `flashcard_deck`
  ADD CONSTRAINT `flashcard_deck_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`question_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `quiz_results`
--
ALTER TABLE `quiz_results`
  ADD CONSTRAINT `quiz_results_ibfk_1` FOREIGN KEY (`result_id`) REFERENCES `quiz_submit` (`result_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_results_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`question_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `quiz_share`
--
ALTER TABLE `quiz_share`
  ADD CONSTRAINT `quiz_share_ibfk_1` FOREIGN KEY (`result_id`) REFERENCES `quiz_submit` (`result_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_share_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_share_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `quiz_submit`
--
ALTER TABLE `quiz_submit`
  ADD CONSTRAINT `quiz_submit_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_submit_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `timetable`
--
ALTER TABLE `timetable`
  ADD CONSTRAINT `timetable_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `todo_tasks`
--
ALTER TABLE `todo_tasks`
  ADD CONSTRAINT `todo_tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `user_favorites`
--
ALTER TABLE `user_favorites`
  ADD CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
