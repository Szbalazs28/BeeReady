CREATE DATABASE IF NOT EXISTS `BeeReady_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `BeeReady_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `profil_pic_url` TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS 'flashcard_deck'(
deck_id int not null AUTO_INCREMENT PRIMARY KEY,
user_id int not null, FOREIGN KEY (user_id) REFERENCES users(id),
deck_name varchar(200),
create_date TIMESTAMP
);



INSERT INTO `users` (username, email, password, profil_pic_url) VALUES
  ('teszt1', 'teszt1@gmail.com', '$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC', '../img/allatos_profilkepek/oroszlan.webp');
--Teszt1$