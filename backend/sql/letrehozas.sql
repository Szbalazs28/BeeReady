-- CREATE DATABASE belepesadatok;
-- CREATE TABLE adatok(username TEXT, email TEXT, password TEXT, profil_pic_url TEXT);
-- INSERT INTO adatok (username, email, password, profil_pic_url) VALUES("admin","admin@admin.com", "admin01");
CREATE DATABASE IF NOT EXISTS "belepesadatok" DEFAULT CHARACTER
SET utf8mb4 COLLATE utf8mb4_general_ci;

USE "belepesadatok";

CREATE TABLE
  IF NOT EXISTS "adatok" (
    "id" INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "profil_pic_url" TEXT DEFAULT NULL
  )
INSERT INTO
  "adatok" (username, email, password, profil_pic_url)
VALUES
  ("admin", "admin@admin.com", "admin01", NULL),
  ("teszt1", "teszt1@gmail.com", "$2b$12$14cE7UK9Xgcs54wLmJ1t7.CY2fEOONiz.Z1MU3.TIdmFIYZIYucOC", "../img/allatos_profilkepek/oroszlan.webp");
--Teszt1$