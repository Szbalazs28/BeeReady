CREATE DATABASE IF NOT EXISTS BeeReady_db
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE BeeReady_db;

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture_url TEXT DEFAULT NUll
);

-- Tesztalanyok - mindegtyiknek -----> Teszt_0 <----- a jelszo 
-- elso ketto ket kulonbozo szoba tulajdonos
-- masodik ketto csak egyik egyik szobaba tagok
-- harmadik ketto mindket szobaba tartozik
INSERT INTO Users (id, username, email, password, profile_picture_url) VALUES
(1, 'Bela', 'bela@example.com', '$2a$12$CUADn2MwHVMtWcoq1wA.WuUbYcg5fSge.oNwXyA8Ctv56CTnbcCWy', '../img/allatos_profilkepek/farkas.webp'),
(2, 'Anna', 'anna@example.com', '$2a$12$CUADn2MwHVMtWcoq1wA.WuUbYcg5fSge.oNwXyA8Ctv56CTnbcCWy', '../img/allatos_profilkepek/bagoly.webp'),
(3, 'Csaba', 'csaba@example.com', '$2a$12$CUADn2MwHVMtWcoq1wA.WuUbYcg5fSge.oNwXyA8Ctv56CTnbcCWy', '../img/allatos_profilkepek/hollo.webp'),
(4, 'Dora', 'dora@example.com', '$2a$12$CUADn2MwHVMtWcoq1wA.WuUbYcg5fSge.oNwXyA8Ctv56CTnbcCWy', '../img/allatos_profilkepek/medve.webp'),
(5, 'Edit', 'edit@example.com', '$2a$12$CUADn2MwHVMtWcoq1wA.WuUbYcg5fSge.oNwXyA8Ctv56CTnbcCWy', '../img/allatos_profilkepek/oroszlan.webp'),
(6, 'Feri', 'feri@example.com', '$2a$12$CUADn2MwHVMtWcoq1wA.WuUbYcg5fSge.oNwXyA8Ctv56CTnbcCWy', '../img/allatos_profilkepek/roka.webp');

CREATE TABLE IF NOT EXISTS Flip_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_front TEXT NOT NULL,
    card_back TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users (id) 
);

CREATE TABLE IF NOT EXISTS Chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users (id) 
);

CREATE TABLE IF NOT EXISTS Rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    maker_id INT NOT NULL,
    task_id INT,
    FOREIGN KEY (maker_id) REFERENCES Users (id) 
);

CREATE TABLE IF NOT EXISTS Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    headLine VARCHAR(255),
    description TEXT,
    FOREIGN KEY (room_id) REFERENCES Rooms (id) 
);

CREATE TABLE IF NOT EXISTS Switch_User_Room (
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    PRIMARY KEY (user_id, room_id),
    FOREIGN KEY (user_id) REFERENCES Users (id),
    FOREIGN KEY (room_id) REFERENCES Rooms (id)
);



INSERT INTO Rooms (id, name, maker_id, task_id) VALUES
(1, 'Szoba1', 2, NULL),  -- Anna a maker (id=2)
(2, 'Szoba2', 1, NULL);  -- Bela a maker (id=1)

INSERT INTO Switch_User_Room (user_id, room_id) VALUES
-- Szoba1 (id=1): maker Anna(2), Csaba(3) (közös), Edit(5) (csak Szoba1)
(2,1),
(3,1),
(5,1),

-- Szoba2 (id=2): maker Bela(1), Csaba(3) (közös), Feri(6) (csak Szoba2)
(1,2),
(3,2),
(6,2);