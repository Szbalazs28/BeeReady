CREATE DATABASE IF NOT EXISTS `BeeReady_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `BeeReady_db`;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profil_pic_url TEXT DEFAULT NULL,
  selected_week_type VARCHAR(2) DEFAULT 'A'  
);

CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS user_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM ('quiz', 'flashcard') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS todo_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    importance ENUM ('high', 'medium', 'low') NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
); 

CREATE TABLE IF NOT EXISTS flashcard_deck(
  deck_id int not null AUTO_INCREMENT PRIMARY KEY,
  deck_name varchar(200),
  create_date TIMESTAMP,
  position int not null,
  public boolean default false,
  share_code varchar(8) UNIQUE DEFAULT NULL,
  user_id int not null, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flashcard_card(
  card_id int not null AUTO_INCREMENT PRIMARY KEY,
  deck_id int not null, 
  front_text varchar(255),
  back_text TEXT,
  position int not null,
  FOREIGN KEY (deck_id) REFERENCES flashcard_deck(deck_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timetable (
  event_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject VARCHAR(100),
  location VARCHAR(50),    
  week_type VARCHAR(2), 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS quizzes (
  quiz_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT default NULL,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  public BOOLEAN DEFAULT FALSE,
  last_result INT DEFAULT NULL,
  randomize_questions BOOLEAN DEFAULT FALSE,
  total_points INT DEFAULT 0,
  position INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('standard', 'order', 'short', 'fill') default 'standard',
  points INT NOT NULL,
  position INT NOT NULL default 1,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_answers (
  answer_id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  right_answer BOOLEAN NOT NULL,
  points INT NOT NULL default 1,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_submit (
  result_id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_points INT NOT NULL default 0,
  earned_points INT NOT NULL default 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_results (
  result_id INT not null,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  points_earned INT NOT NULL default 0,
  FOREIGN KEY (result_id) REFERENCES quiz_submit(result_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_share (
  result_id INT not null,
  quiz_id INT NOT NULL,
  user_id INT NOT NULL,
  position INT NOT NULL,
  FOREIGN KEY (result_id) REFERENCES quiz_submit(result_id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);




INSERT INTO `users` (username, email, password, profil_pic_url) VALUES
  ('teszt1', 'teszt1@gmail.com', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/oroszlan.webp'),
  ('admin1', 'admin1@gmail.com', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/oroszlan.webp');
INSERT INTO admins (user_id) VALUES (2)
-- Teszt1$

USE `BeeReady_db`;

-- ============================================================
-- USERS - mindegyiknek Teszt1$ a jelszava
-- ============================================================
INSERT INTO `users` (username, email, password, profil_pic_url, selected_week_type) VALUES
  ('kovacs_anna',  'anna.kovacs@gmail.com',  '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/roka.webp',   'A'),
  ('nagy_peter',   'peter.nagy@gmail.com',   '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/farkas.webp',  'B'),
  ('szabo_reka',   'reka.szabo@gmail.com',   '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/bagoly.webp',  'A'),
  ('toth_balazs',  'balazs.toth@gmail.com',  '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/medve.webp',   'A'),
  ('horvath_nora', 'nora.horvath@gmail.com', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/tigris.webp',  'B');

-- ============================================================
-- TIMETABLE
-- ============================================================
INSERT INTO timetable (user_id, day, start_time, end_time, subject, location, week_type) VALUES
  ((SELECT id FROM users WHERE username='kovacs_anna'), 1, '08:00', '09:30', 'Algoritmusok és adatszerkezetek', 'A-101', 'A'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 1, '10:00', '11:30', 'Adatbázisok',                    'B-203', 'A'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 2, '08:00', '09:30', 'Webprogramozás',                 'PC-1',  'A'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 2, '12:00', '13:30', 'Lineáris algebra',               'A-105', 'A'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 3, '09:00', '10:30', 'Operációs rendszerek',           'A-201', 'A'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 4, '08:00', '09:30', 'Algoritmusok és adatszerkezetek', 'A-101', 'B'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 4, '10:00', '11:30', 'Szoftverfejlesztés',             'PC-2',  'B'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 5, '08:00', '09:30', 'Webprogramozás',                 'PC-1',  'B'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 5, '11:00', '12:30', 'Statisztika',                    'A-104', 'B');

INSERT INTO timetable (user_id, day, start_time, end_time, subject, location, week_type) VALUES
  ((SELECT id FROM users WHERE username='nagy_peter'), 1, '09:00', '10:30', 'Mikroökonómia',     'C-301', 'A'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 1, '12:00', '13:30', 'Pénzügy',           'C-302', 'A'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 2, '10:00', '11:30', 'Makroökonómia',     'C-301', 'A'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 3, '08:00', '09:30', 'Számvitel',         'C-105', 'A'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 3, '13:00', '14:30', 'Marketing alapjai', 'D-201', 'A'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 2, '09:00', '10:30', 'Mikroökonómia',     'C-301', 'B'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 4, '11:00', '12:30', 'Pénzügy',           'C-302', 'B'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 5, '08:00', '09:30', 'Makroökonómia',     'C-301', 'B'),
  ((SELECT id FROM users WHERE username='nagy_peter'), 5, '10:00', '11:30', 'Vállalkozástan',    'D-102', 'B');

INSERT INTO timetable (user_id, day, start_time, end_time, subject, location, week_type) VALUES
  ((SELECT id FROM users WHERE username='szabo_reka'), 1, '08:00', '09:30', 'Sejtbiológia',   'BIO-1', 'A'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 1, '10:00', '12:00', 'Biológia labor', 'LAB-3', 'A'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 2, '09:00', '10:30', 'Genetika',       'BIO-2', 'A'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 3, '08:00', '09:30', 'Biokémia',       'BIO-1', 'A'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 3, '11:00', '12:30', 'Ökológia',       'BIO-3', 'A'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 1, '08:00', '09:30', 'Genetika',       'BIO-2', 'B'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 4, '10:00', '12:00', 'Biológia labor', 'LAB-3', 'B'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 5, '09:00', '10:30', 'Mikrobiológia',  'BIO-1', 'B'),
  ((SELECT id FROM users WHERE username='szabo_reka'), 5, '13:00', '14:30', 'Biokémia',       'BIO-1', 'B');

INSERT INTO timetable (user_id, day, start_time, end_time, subject, location, week_type) VALUES
  ((SELECT id FROM users WHERE username='toth_balazs'), 1, '07:30', '09:00', 'Fizika I.',       'E-101', 'A'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 1, '09:30', '11:00', 'Műszaki rajz',    'E-204', 'A'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 2, '08:00', '09:30', 'Anyagismeret',    'E-103', 'A'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 3, '10:00', '11:30', 'Matematika I.',   'E-101', 'A'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 4, '08:00', '09:30', 'Fizika I.',       'E-101', 'A'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 2, '10:00', '11:30', 'Termodinamika',   'E-102', 'B'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 3, '08:00', '09:30', 'Matematika I.',   'E-101', 'B'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 5, '07:30', '09:00', 'Anyagismeret',    'E-103', 'B'),
  ((SELECT id FROM users WHERE username='toth_balazs'), 5, '10:00', '11:30', 'Műszaki mechan.', 'E-205', 'B');

INSERT INTO timetable (user_id, day, start_time, end_time, subject, location, week_type) VALUES
  ((SELECT id FROM users WHERE username='horvath_nora'), 1, '09:00', '10:30', 'Általános pszichológia', 'PSZ-1', 'A'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 2, '10:00', '11:30', 'Fejlődéslélektan',       'PSZ-2', 'A'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 2, '13:00', '14:30', 'Szociálpszichológia',    'PSZ-1', 'A'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 3, '09:00', '10:30', 'Neurológia alapjai',     'PSZ-3', 'A'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 4, '11:00', '12:30', 'Statisztika',            'A-104', 'A'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 1, '10:00', '11:30', 'Kognitív pszichológia',  'PSZ-2', 'B'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 3, '08:00', '09:30', 'Általános pszichológia', 'PSZ-1', 'B'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 4, '09:00', '10:30', 'Fejlődéslélektan',       'PSZ-2', 'B'),
  ((SELECT id FROM users WHERE username='horvath_nora'), 5, '10:00', '11:30', 'Klinikai pszichológia',  'PSZ-3', 'B');

-- ============================================================
-- EVENTS
-- ============================================================
INSERT INTO events (user_id, event_date, title, description) VALUES
  ((SELECT id FROM users WHERE username='kovacs_anna'), '2025-05-10', 'Adatbázisok ZH',          'A relációs modellről és normálformákról lesz szó.'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), '2025-05-18', 'Webprogramozás beadandó', 'REST API beadandó határideje.'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), '2025-06-02', 'Vizsgaidőszak kezdete',   'Első vizsga: Algoritmusok.'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), '2025-05-25', 'Hackathon',               '24 órás programozási verseny az egyetemen.'),
  ((SELECT id FROM users WHERE username='kovacs_anna'), '2025-06-15', 'Diploma osztályozó',      'Az évzáró értekezlet időpontja.');

INSERT INTO events (user_id, event_date, title, description) VALUES
  ((SELECT id FROM users WHERE username='nagy_peter'), '2025-05-08', 'Mikroökonómia ZH',      'Keresleti és kínálati összefüggések, piaci egyensúly.'),
  ((SELECT id FROM users WHERE username='nagy_peter'), '2025-05-20', 'Pénzügy vizsga',        'Szóbeli vizsga, kötelező irodalom átnézése.'),
  ((SELECT id FROM users WHERE username='nagy_peter'), '2025-05-30', 'Csoportos prezentáció', 'Marketing projekt bemutatása.'),
  ((SELECT id FROM users WHERE username='nagy_peter'), '2025-06-10', 'Számvitel ZH',          'Mérleg és eredménykimutatás feladatok.'),
  ((SELECT id FROM users WHERE username='nagy_peter'), '2025-06-20', 'Konferencia',           'Fiatal közgazdászok fóruma, Budapesti Corvinus.');

INSERT INTO events (user_id, event_date, title, description) VALUES
  ((SELECT id FROM users WHERE username='szabo_reka'), '2025-05-07', 'Genetika labor',        'DNS kivonatolási kísérlet, köpeny és kesztyű szükséges.'),
  ((SELECT id FROM users WHERE username='szabo_reka'), '2025-05-15', 'Biokémia ZH',          'Anyagcsere útvonalak, enzimkinetika.'),
  ((SELECT id FROM users WHERE username='szabo_reka'), '2025-05-28', 'Terepgyakorlat',        'Ökológiai mintavételezés a Pilisben.'),
  ((SELECT id FROM users WHERE username='szabo_reka'), '2025-06-05', 'Sejtbiológia vizsga',   'Szóbeli, teljes anyag.'),
  ((SELECT id FROM users WHERE username='szabo_reka'), '2025-06-18', 'TDK leadási határidő',  'Tudományos diákköri dolgozat feltöltése.');

INSERT INTO events (user_id, event_date, title, description) VALUES
  ((SELECT id FROM users WHERE username='toth_balazs'), '2025-05-09', 'Fizika I. ZH',         'Mechanika és termodinamika feladatsor.'),
  ((SELECT id FROM users WHERE username='toth_balazs'), '2025-05-22', 'Matematika dolgozat',  'Integrálszámítás és differenciálegyenletek.'),
  ((SELECT id FROM users WHERE username='toth_balazs'), '2025-06-01', 'Műszaki rajz beadandó','AutoCAD tervek leadása elektronikusan.'),
  ((SELECT id FROM users WHERE username='toth_balazs'), '2025-06-12', 'Gyárlátogatás',        'Bosch Miskolc üzemlátogatás, busz 7:00-kor indul.'),
  ((SELECT id FROM users WHERE username='toth_balazs'), '2025-06-22', 'Záróvizsga',           'Anyagismeret + Termodinamika záróvizsga.');

INSERT INTO events (user_id, event_date, title, description) VALUES
  ((SELECT id FROM users WHERE username='horvath_nora'), '2025-05-06', 'Pszichológia szeminárium', 'Esettanulmány megvitatása, mindenki hozzon anyagot.'),
  ((SELECT id FROM users WHERE username='horvath_nora'), '2025-05-16', 'Fejlődéslélektan ZH',      'Piaget és Vygotsky elméletei.'),
  ((SELECT id FROM users WHERE username='horvath_nora'), '2025-05-27', 'Terápiás megfigyelés',     'Klinikai gyakorlat a Semmelweis Kórházban.'),
  ((SELECT id FROM users WHERE username='horvath_nora'), '2025-06-08', 'Szociálpszich. vizsga',    'Írásbeli, 90 perc, esszé + tesztkérdések.'),
  ((SELECT id FROM users WHERE username='horvath_nora'), '2025-06-19', 'Szakmai konferencia',       'Kognitív idegtudományi szimpózium, ELTE.');

-- ============================================================
-- TODO TASKS
-- ============================================================
INSERT INTO todo_tasks (user_id, task_name, task_description, importance, is_completed) VALUES
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'SQL feladatok megoldása',       'Az adatbázis óra 3. feladatsora.',                'high',   FALSE),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'REST API dokumentálása',        'Swagger leírás elkészítése a beadandóhoz.',        'high',   FALSE),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'Git repó rendezése',            'Felesleges branchek törlése, README frissítés.',   'medium', TRUE),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'Algoritmusok könyv elolvasása', '4-6. fejezet gráfalgoritmusok.',                  'medium', FALSE),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'Hackathon csapat szervezése',   'Legalább 3 főt toborozni.',                       'low',    FALSE);

INSERT INTO todo_tasks (user_id, task_name, task_description, importance, is_completed) VALUES
  ((SELECT id FROM users WHERE username='nagy_peter'), 'Mikroökonómia ZH-ra készülés',   'Korábbi tesztek megoldása.',                      'high',   FALSE),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'Marketing prezentáció összeáll.', 'PowerPoint elkészítése, diák formázása.',         'high',   FALSE),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'Pénzügy tankönyv 5-7. fejezet',  'Derivatívák és portfólióelmélet.',                'medium', FALSE),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'Számvitel feladatok',             'Mérlegfeladatok ellenőrzése.',                    'medium', TRUE),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'Konferenciára regisztráció',      'Online regisztráció határideje május 15.',        'low',    FALSE);

INSERT INTO todo_tasks (user_id, task_name, task_description, importance, is_completed) VALUES
  ((SELECT id FROM users WHERE username='szabo_reka'), 'Labor napló írása',           'DNS kísérlet eredményeinek dokumentálása.',       'high',   FALSE),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'Biokémia anyag memorizálása', 'Krebskör, glikolízis lépései.',                  'high',   FALSE),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'Terepgyakorlat felszerelés',  'Gumicsizma, esőkabát, mintavételi edények.',     'medium', FALSE),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'TDK dolgozat vázlata',        'Bevezetés és módszertan rész megírása.',         'medium', FALSE),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'Mikroszkóp foglalása',        'Labor előjegyzési rendszerben.',                 'low',    TRUE);

INSERT INTO todo_tasks (user_id, task_name, task_description, importance, is_completed) VALUES
  ((SELECT id FROM users WHERE username='toth_balazs'), 'Fizika ZH feladatok',           'Munka-energia tétel, lendületmegmaradás.',       'high',   FALSE),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'AutoCAD rajz befejezése',        'Gépészeti alkatrész 3D modellje.',               'high',   FALSE),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'Matematika házi feladat',        'Integrálfeladatok 10-15. oldal.',                'medium', FALSE),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'Gyárlátogatás visszaigazolása',  'E-mail küldése a koordinátornak.',               'medium', TRUE),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'Anyagismeret kísérlet',          'Tensile test eredmények kiértékelése.',          'low',    FALSE);

INSERT INTO todo_tasks (user_id, task_name, task_description, importance, is_completed) VALUES
  ((SELECT id FROM users WHERE username='horvath_nora'), 'Esettanulmány elemzése',          'Borderline személyiségzavar esetbemutatása.',   'high',   FALSE),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'Fejlődéslélektan ZH-ra készülés', 'Piaget stádiumok + Vygotsky ZPD.',             'high',   FALSE),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'Klinikai naplóbejegyzés',         'Megfigyelési tapasztalatok rögzítése.',         'medium', FALSE),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'Konferencia absztrakt',           'Max. 250 szó, május 30-i határidő.',           'medium', FALSE),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'Statisztika feladatok',           'SPSS adatelemzés, varianciaanalízis.',          'low',    TRUE);

-- ============================================================
-- FLASHCARD DECKS & CARDS
-- ============================================================
INSERT INTO flashcard_deck (deck_name, create_date, position, public, user_id) VALUES
  ('Algoritmusok fogalmai', NOW(), 1, FALSE, (SELECT id FROM users WHERE username='kovacs_anna')),
  ('SQL parancsok',         NOW(), 2, TRUE,  (SELECT id FROM users WHERE username='kovacs_anna'));

INSERT INTO flashcard_deck (deck_name, create_date, position, public, user_id) VALUES
  ('Mikroökonómia fogalmak', NOW(), 1, FALSE, (SELECT id FROM users WHERE username='nagy_peter')),
  ('Pénzügyi kifejezések',   NOW(), 2, FALSE, (SELECT id FROM users WHERE username='nagy_peter'));

INSERT INTO flashcard_deck (deck_name, create_date, position, public, user_id) VALUES
  ('Genetika alapok',     NOW(), 1, FALSE, (SELECT id FROM users WHERE username='szabo_reka')),
  ('Biokémia anyagcsere', NOW(), 2, TRUE,  (SELECT id FROM users WHERE username='szabo_reka'));

INSERT INTO flashcard_deck (deck_name, create_date, position, public, user_id) VALUES
  ('Fizika képletek',       NOW(), 1, FALSE, (SELECT id FROM users WHERE username='toth_balazs')),
  ('Anyagismeret fogalmak', NOW(), 2, FALSE, (SELECT id FROM users WHERE username='toth_balazs'));

INSERT INTO flashcard_deck (deck_name, create_date, position, public, user_id) VALUES
  ('Pszichológia irányzatok', NOW(), 1, FALSE, (SELECT id FROM users WHERE username='horvath_nora')),
  ('Kognitív fogalmak',       NOW(), 2, FALSE, (SELECT id FROM users WHERE username='horvath_nora'));

-- CARDS – deck_id-k subquery-vel
INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Algoritmusok fogalmai' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'Mi a Big-O jelölés?',        'Az algoritmus futási idejének felső korlátját leíró jelölés (pl. O(n), O(log n)).', 1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Algoritmusok fogalmai' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'Memoizáció',                 'Rekurzív hívások eredményeinek tárolása a felesleges újraszámítás elkerülésére.',    2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Algoritmusok fogalmai' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'Quicksort időbonyolultsága', 'Átlagos eset: O(n log n), legrosszabb: O(n²).',                                     3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Algoritmusok fogalmai' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'Mi a gráf?',                 'Csúcsok (node) és élek (edge) halmaza; lehet irányított vagy irányítatlan.',         4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'SELECT DISTINCT', 'Ismétlődő sorokat szűr ki az eredményből.',                                  1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'LEFT JOIN',       'Az összes bal oldali sort visszaadja, még ha nincs egyezés a jobb oldalon.',  2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'GROUP BY',        'Sorokat csoportosít egy vagy több oszlop értéke alapján.',                   3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'HAVING',          'GROUP BY után szűr aggregált értékekre (WHERE csak sorokra szűr).',          4),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')), 'INDEX',           'Adatbázis objektum, ami gyorsítja a keresést egy vagy több oszlopon.',       5);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Mikroökonómia fogalmak' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'Kereslet törvénye', 'Ha az ár nő, a keresett mennyiség csökken (ceteris paribus).',        1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Mikroökonómia fogalmak' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'Rugalmasság',       'Azt méri, mennyire érzékeny a kereslet vagy kínálat az árak változására.', 2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Mikroökonómia fogalmak' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'Piaci egyensúly',   'Az a pont, ahol a kereslet és a kínálat egyenlő.',                    3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Mikroökonómia fogalmak' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'Externália',        'Olyan külső hatás, amit a piac nem áraz be (pl. környezetszennyezés).', 4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pénzügyi kifejezések' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'NPV (Nettó jelenérték)', 'Jövőbeli pénzáramlások jelenértékének és a kezdeti befektetés különbsége.', 1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pénzügyi kifejezések' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'IRR',                   'Az a diszkontráta, ahol az NPV nulla.',                                   2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pénzügyi kifejezések' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'Diverzifikáció',        'Kockázat csökkentése különböző eszközökbe fektetéssel.',                  3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pénzügyi kifejezések' AND user_id=(SELECT id FROM users WHERE username='nagy_peter')), 'Likviditás',            'Az eszköz rövid idő alatt, veszteség nélkül pénzre válthatóságának mértéke.', 4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Genetika alapok' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'DNS',                'Dezoxiribonukleinsav; a genetikai információ hordozója kettős hélix szerkezetben.', 1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Genetika alapok' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Mutáció',            'A DNS bázissorrendjének öröklődő megváltozása.',                                   2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Genetika alapok' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Mitózis',            'Sejtosztódás, amelynek során két azonos leánysejt keletkezik.',                    3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Genetika alapok' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Mendel I. törvénye', 'Az egységesség törvénye: az F1 generáció fenotípusosan egységes.',                4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Biokémia anyagcsere' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Glikolízis',            'A glükóz lebontásának első fázisa; 2 ATP-t termel.',                        1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Biokémia anyagcsere' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Krebskör',              'Citromsavciklus; acetil-CoA oxidációja, NADH és FADH₂ termelésével.',     2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Biokémia anyagcsere' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'ATP',                   'Adenozin-trifoszfát; az élő szervezetek fő energiahordozója.',             3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Biokémia anyagcsere' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Enzim',                 'Biológiai katalizátor, amely felgyorsítja a kémiai reakciókat.',           4),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Biokémia anyagcsere' AND user_id=(SELECT id FROM users WHERE username='szabo_reka')), 'Oxidatív foszforiláció','Mitokondriális ATP-szintézis, elektrontranszportlánc segítségével.',       5);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Fizika képletek' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Newton II. törvénye', 'F = m·a  (erő = tömeg × gyorsulás).',                           1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Fizika képletek' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Munka',               'W = F·d·cos(θ)  (erő és elmozdulás skalárszorzata).',            2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Fizika képletek' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Ohm törvénye',        'U = R·I  (feszültség = ellenállás × áramerősség).',              3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Fizika képletek' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Gravitációs törvény', 'F = G·(m₁·m₂)/r²',                                              4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Anyagismeret fogalmak' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Rugalmassági modulus', 'E = σ/ε  (feszültség és relatív alakváltozás hányadosa).',                    1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Anyagismeret fogalmak' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Keménység',            'Anyag ellenállása plasztikus deformációval szemben (pl. Brinell-skála).',     2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Anyagismeret fogalmak' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Törékeny anyag',       'Olyan anyag, amely nagy alakváltozás nélkül törik (pl. kerámia, üveg).',     3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Anyagismeret fogalmak' AND user_id=(SELECT id FROM users WHERE username='toth_balazs')), 'Kompozit anyag',       'Két vagy több különböző anyag kombinációja jobb tulajdonságok eléréséért.',  4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pszichológia irányzatok' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Behaviorizmus',         'Csak megfigyelhető viselkedéssel foglalkozik; belső folyamatokat nem vizsgál.', 1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pszichológia irányzatok' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Humanisztikus pszich.', 'Maslow, Rogers; az önmegvalósítás és szabad akarat hangsúlyozása.',            2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pszichológia irányzatok' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Pszichoanalízis',       'Freud elmélete az öntudatlan folyamatokról és a személyiségstruktúráról.',    3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Pszichológia irányzatok' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Kognitív irányzat',     'A mentális folyamatok – gondolkodás, memória, figyelem – vizsgálata.',        4);

INSERT INTO flashcard_card (deck_id, front_text, back_text, position) VALUES
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Munkamemória',   'Rövid idejű, korlátozott kapacitású memóriarendszer (Baddeley-modell).',   1),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Kognitív séma',  'Mentális keret, ami segít értelmezni az új információkat.',                2),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'ZPD (Vygotsky)', 'Közelítő fejlődési zóna: a tényleges és potenciális fejlettség közti rés.',3),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Kondicionálás',  'Tanulás asszociáció útján; klasszikus (Pavlov) és operáns (Skinner).',    4),
  ((SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak' AND user_id=(SELECT id FROM users WHERE username='horvath_nora')), 'Metacognition',  'Az egyén saját gondolkodási folyamatainak tudatossága és kontrollja.',    5);

-- ============================================================
-- QUIZZES
-- ============================================================
INSERT INTO quizzes (user_id, title, description, public, randomize_questions, total_points, position) VALUES
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'Algoritmusok kvíz',     'Alapvető algoritmusok és bonyolultságelmélet.',        TRUE,  TRUE,  10, 1),
  ((SELECT id FROM users WHERE username='nagy_peter'),  'Közgazdaságtan alapjai','Mikro- és makroökonómiai alapfogalmak tesztje.',       TRUE,  FALSE, 12, 1),
  ((SELECT id FROM users WHERE username='szabo_reka'),  'Sejtbiológia teszt',    'A sejt felépítése és működése.',                      FALSE, TRUE,   9, 1),
  ((SELECT id FROM users WHERE username='horvath_nora'),'Pszichológia kvíz',     'Alapvető pszichológiai elméletek és fogalmak.',       TRUE,  FALSE, 12, 1);

-- Quiz kérdések – quiz_id-k subquery-vel
INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, position) VALUES
  ((SELECT quiz_id FROM quizzes WHERE title='Algoritmusok kvíz'),     'Mi a buborékrendezés (bubble sort) legrosszabb esetbeli időbonyolultsága?', 'standard', 3, 1),
  ((SELECT quiz_id FROM quizzes WHERE title='Algoritmusok kvíz'),     'Melyik adatszerkezet működik LIFO elven?',                                   'standard', 3, 2),
  ((SELECT quiz_id FROM quizzes WHERE title='Algoritmusok kvíz'),     'Igaz vagy hamis: A bináris keresés rendezetlen tömbön is működik.',          'standard', 4, 3),
  ((SELECT quiz_id FROM quizzes WHERE title='Közgazdaságtan alapjai'),'Mi a GDP?',                                                                   'standard', 4, 1),
  ((SELECT quiz_id FROM quizzes WHERE title='Közgazdaságtan alapjai'),'Melyik a helyes definíció a piaci egyensúlyra?',                             'standard', 4, 2),
  ((SELECT quiz_id FROM quizzes WHERE title='Közgazdaságtan alapjai'),'A kereslet rugalmassága 2. Mit jelent ez?',                                  'standard', 4, 3),
  ((SELECT quiz_id FROM quizzes WHERE title='Sejtbiológia teszt'),    'Melyik sejtszervecske felelős az ATP-termelésért?',                          'standard', 3, 1),
  ((SELECT quiz_id FROM quizzes WHERE title='Sejtbiológia teszt'),    'Mi a riboszóma fő funkciója?',                                               'standard', 3, 2),
  ((SELECT quiz_id FROM quizzes WHERE title='Sejtbiológia teszt'),    'Hány kromatid van egy megkettőzött kromoszómában?',                          'standard', 3, 3),
  ((SELECT quiz_id FROM quizzes WHERE title='Pszichológia kvíz'),     'Ki dolgozta ki a pszichoanalízis elméletét?',                                'standard', 3, 1),
  ((SELECT quiz_id FROM quizzes WHERE title='Pszichológia kvíz'),     'Melyik Maslow szükséglethierarchiájának legmagasabb szintje?',               'standard', 4, 2),
  ((SELECT quiz_id FROM quizzes WHERE title='Pszichológia kvíz'),     'Mi a klasszikus kondicionálás lényege?',                                     'standard', 5, 3);

-- Quiz válaszok – question_id-k subquery-vel
INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a buborékrendezés (bubble sort) legrosszabb esetbeli időbonyolultsága?' LIMIT 1), 'O(n)',       FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a buborékrendezés (bubble sort) legrosszabb esetbeli időbonyolultsága?' LIMIT 1), 'O(n log n)', FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a buborékrendezés (bubble sort) legrosszabb esetbeli időbonyolultsága?' LIMIT 1), 'O(n²)',      TRUE,  3),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a buborékrendezés (bubble sort) legrosszabb esetbeli időbonyolultsága?' LIMIT 1), 'O(log n)',   FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik adatszerkezet működik LIFO elven?' LIMIT 1), 'Sor (Queue)',   FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik adatszerkezet működik LIFO elven?' LIMIT 1), 'Verem (Stack)', TRUE,  3),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik adatszerkezet működik LIFO elven?' LIMIT 1), 'Fa (Tree)',     FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik adatszerkezet működik LIFO elven?' LIMIT 1), 'Lista',         FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Igaz vagy hamis: A bináris keresés rendezetlen tömbön is működik.' LIMIT 1), 'Igaz',  FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Igaz vagy hamis: A bináris keresés rendezetlen tömbön is működik.' LIMIT 1), 'Hamis', TRUE,  4);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a GDP?' LIMIT 1), 'Az ország összes adóbevétele egy évben.',                                        FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a GDP?' LIMIT 1), 'Egy ország határain belül megtermelt összes javak és szolgáltatások értéke.',    TRUE,  4),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a GDP?' LIMIT 1), 'Az export és import különbsége.',                                                FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a GDP?' LIMIT 1), 'Az egy főre jutó átlagbér.',                                                     FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik a helyes definíció a piaci egyensúlyra?' LIMIT 1), 'Ahol a kereslet nagyobb, mint a kínálat.',                  FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik a helyes definíció a piaci egyensúlyra?' LIMIT 1), 'Ahol a kínálat nagyobb, mint a kereslet.',                  FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik a helyes definíció a piaci egyensúlyra?' LIMIT 1), 'Az a pont, ahol a keresett és kínált mennyiség egyenlő.',   TRUE,  4),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik a helyes definíció a piaci egyensúlyra?' LIMIT 1), 'Ahol az árak a legalacsonyabbak.',                          FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='A kereslet rugalmassága 2. Mit jelent ez?' LIMIT 1), '1%-os árváltozás 2%-os mennyiségváltozást okoz.', TRUE,  4),
  ((SELECT question_id FROM quiz_questions WHERE question_text='A kereslet rugalmassága 2. Mit jelent ez?' LIMIT 1), '2%-os árváltozás 1%-os mennyiségváltozást okoz.', FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='A kereslet rugalmassága 2. Mit jelent ez?' LIMIT 1), 'A kereslet rugalmatlan.',                         FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='A kereslet rugalmassága 2. Mit jelent ez?' LIMIT 1), 'Az ár és a kereslet egyenlő.',                    FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik sejtszervecske felelős az ATP-termelésért?' LIMIT 1), 'Sejtmag',        FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik sejtszervecske felelős az ATP-termelésért?' LIMIT 1), 'Mitokondrium',   TRUE,  3),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik sejtszervecske felelős az ATP-termelésért?' LIMIT 1), 'Golgi-készülék', FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik sejtszervecske felelős az ATP-termelésért?' LIMIT 1), 'Lizoszóma',      FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a riboszóma fő funkciója?' LIMIT 1), 'Lipidek szintézise',          FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a riboszóma fő funkciója?' LIMIT 1), 'Fehérjeszintézis',            TRUE,  3),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a riboszóma fő funkciója?' LIMIT 1), 'DNS replikáció',              FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a riboszóma fő funkciója?' LIMIT 1), 'Sejtosztódás irányítása',     FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Hány kromatid van egy megkettőzött kromoszómában?' LIMIT 1), '1', FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Hány kromatid van egy megkettőzött kromoszómában?' LIMIT 1), '2', TRUE,  3),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Hány kromatid van egy megkettőzött kromoszómában?' LIMIT 1), '4', FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Hány kromatid van egy megkettőzött kromoszómában?' LIMIT 1), '8', FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Ki dolgozta ki a pszichoanalízis elméletét?' LIMIT 1), 'Carl Rogers',   FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Ki dolgozta ki a pszichoanalízis elméletét?' LIMIT 1), 'Sigmund Freud', TRUE,  3),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Ki dolgozta ki a pszichoanalízis elméletét?' LIMIT 1), 'B.F. Skinner',  FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Ki dolgozta ki a pszichoanalízis elméletét?' LIMIT 1), 'Jean Piaget',   FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik Maslow szükséglethierarchiájának legmagasabb szintje?' LIMIT 1), 'Biztonság',                    FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik Maslow szükséglethierarchiájának legmagasabb szintje?' LIMIT 1), 'Szeretet és valakihez tartozás',FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik Maslow szükséglethierarchiájának legmagasabb szintje?' LIMIT 1), 'Önmegvalósítás',               TRUE,  4),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Melyik Maslow szükséglethierarchiájának legmagasabb szintje?' LIMIT 1), 'Fiziológiai szükségletek',     FALSE, 0);

INSERT INTO quiz_answers (question_id, answer_text, right_answer, points) VALUES
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a klasszikus kondicionálás lényege?' LIMIT 1), 'Jutalmazással erősítjük a kívánt viselkedést.',              FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a klasszikus kondicionálás lényege?' LIMIT 1), 'Semleges inger feltételes reflexet vált ki ismétlés után.',  TRUE,  5),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a klasszikus kondicionálás lényege?' LIMIT 1), 'A viselkedést belső motiváció vezérli.',                     FALSE, 0),
  ((SELECT question_id FROM quiz_questions WHERE question_text='Mi a klasszikus kondicionálás lényege?' LIMIT 1), 'Az ember tudattalanból cselekszik.',                         FALSE, 0);

  USE `BeeReady_db`;

-- ============================================================
-- USER FAVORITES
-- Mindenki más felhasználók kvízjeit és flashcard paklijait menti
-- ============================================================

-- kovacs_anna menti: Közgazdaságtan kvízt, Pszichológia kvízt, Genetika alapok paklit
INSERT INTO user_favorites (user_id, item_type, item_id) VALUES
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Közgazdaságtan alapjai')),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Pszichológia kvíz')),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Genetika alapok'     AND user_id=(SELECT id FROM users WHERE username='szabo_reka'))),
  ((SELECT id FROM users WHERE username='kovacs_anna'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak'   AND user_id=(SELECT id FROM users WHERE username='horvath_nora')));

-- nagy_peter menti: Algoritmusok kvízt, Sejtbiológia tesztet, SQL parancsok paklit
INSERT INTO user_favorites (user_id, item_type, item_id) VALUES
  ((SELECT id FROM users WHERE username='nagy_peter'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Algoritmusok kvíz')),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Sejtbiológia teszt')),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok'        AND user_id=(SELECT id FROM users WHERE username='kovacs_anna'))),
  ((SELECT id FROM users WHERE username='nagy_peter'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Fizika képletek'      AND user_id=(SELECT id FROM users WHERE username='toth_balazs')));

-- szabo_reka menti: Pszichológia kvízt, Közgazdaságtan kvízt, Kognitív fogalmak paklit
INSERT INTO user_favorites (user_id, item_type, item_id) VALUES
  ((SELECT id FROM users WHERE username='szabo_reka'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Pszichológia kvíz')),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Közgazdaságtan alapjai')),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Kognitív fogalmak'    AND user_id=(SELECT id FROM users WHERE username='horvath_nora'))),
  ((SELECT id FROM users WHERE username='szabo_reka'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Algoritmusok fogalmai' AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')));

-- toth_balazs menti: Algoritmusok kvízt, Pszichológia kvízt, Pénzügyi kifejezések paklit
INSERT INTO user_favorites (user_id, item_type, item_id) VALUES
  ((SELECT id FROM users WHERE username='toth_balazs'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Algoritmusok kvíz')),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Pszichológia kvíz')),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Pénzügyi kifejezések' AND user_id=(SELECT id FROM users WHERE username='nagy_peter'))),
  ((SELECT id FROM users WHERE username='toth_balazs'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Biokémia anyagcsere'  AND user_id=(SELECT id FROM users WHERE username='szabo_reka')));

-- horvath_nora menti: Sejtbiológia tesztet, Algoritmusok kvízt, Mikroökonómia fogalmak paklit
INSERT INTO user_favorites (user_id, item_type, item_id) VALUES
  ((SELECT id FROM users WHERE username='horvath_nora'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Sejtbiológia teszt')),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'quiz',      (SELECT quiz_id FROM quizzes WHERE title='Algoritmusok kvíz')),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='Mikroökonómia fogalmak' AND user_id=(SELECT id FROM users WHERE username='nagy_peter'))),
  ((SELECT id FROM users WHERE username='horvath_nora'), 'flashcard', (SELECT deck_id FROM flashcard_deck WHERE deck_name='SQL parancsok'           AND user_id=(SELECT id FROM users WHERE username='kovacs_anna')));