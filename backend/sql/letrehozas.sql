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

CREATE TABLE IF NOT EXISTS flashcard_deck(
  deck_id int not null AUTO_INCREMENT PRIMARY KEY,
  deck_name varchar(200),
  create_date TIMESTAMP,
  position int not null,
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

CREATE TABLE IF NOT EXISTS todo_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_name VARCHAR(100) NOT NULL,
  task_description TEXT,
  importance ENUM ('high', 'medium', 'low', 'done') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
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
  position INT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id) ON DELETE CASCADE
);

INSERT INTO `users` (username, email, password, profil_pic_url) VALUES
  ('teszt1', 'teszt1@gmail.com', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/oroszlan.webp');
-- Teszt1$