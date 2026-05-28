-- OSU Record Store
-- Data Definition Queries (DDL) + Sample Data

DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Statuses;
DROP TABLE IF EXISTS Artists;
DROP TABLE IF EXISTS Genres;

CREATE TABLE Artists (
    artistId INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    bio VARCHAR(1000),
    PRIMARY KEY (artistId)
);

CREATE TABLE Genres (
    genreId INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    PRIMARY KEY (genreId)
);

CREATE TABLE Customers (
    customerId INT AUTO_INCREMENT NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    shippingAddress VARCHAR(100) NOT NULL,
    PRIMARY KEY (customerId)
);

CREATE TABLE Statuses (
    statusId INT AUTO_INCREMENT NOT NULL,
    statusCode VARCHAR(50) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    PRIMARY KEY (statusId)
);

CREATE TABLE Items (
    itemId INT AUTO_INCREMENT NOT NULL,
    type ENUM('record', 'CD') NOT NULL,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description VARCHAR(1000),
    image VARCHAR(255),
    artistId INT NOT NULL,
    genreId INT NOT NULL,
    PRIMARY KEY (itemId),
    FOREIGN KEY (artistId) REFERENCES Artists(artistId),
    FOREIGN KEY (genreId) REFERENCES Genres(genreId)
);

CREATE TABLE Orders (
    orderId INT AUTO_INCREMENT NOT NULL,
    customerId INT NOT NULL,
    statusId INT NOT NULL,
    timestamp DATETIME NOT NULL,
    orderTotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES Customers(customerId),
    FOREIGN KEY (statusId) REFERENCES Statuses(statusId)
);

CREATE TABLE OrderItems (
    orderItemId INT AUTO_INCREMENT NOT NULL,
    orderId INT NOT NULL,
    itemId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    lineTotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (orderItemId),
    FOREIGN KEY (orderId) REFERENCES Orders(orderId) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES Items(itemId)
);

INSERT INTO Artists (name, country, bio) VALUES
('The Northern Lights', 'Canada', 'Indie rock quartet known for atmospheric live sessions.'),
('Velvet Frequency', 'UK', 'Synthwave duo blending retro textures with modern pop hooks.'),
('Sierra Blue', 'USA', 'Singer-songwriter with roots in folk and acoustic storytelling.'),
('Monochrome Pulse', NULL, NULL);

INSERT INTO Genres (name, description) VALUES
('Indie Rock', 'Guitar-driven alternative rock with melodic emphasis.'),
('Synthwave', 'Electronic style inspired by 1980s film and arcade soundtracks.'),
('Folk', 'Acoustic arrangements centered on lyrical narratives.'),
('Jazz', NULL);

INSERT INTO Customers (firstName, lastName, email, password, shippingAddress) VALUES
('Ava', 'Martinez', 'ava.martinez@example.com', 'hash_pw_ava_01', '101 Maple St Portland OR'),
('Liam', 'Nguyen', 'liam.nguyen@example.com', 'hash_pw_liam_02', '202 Oak Ave Seattle WA'),
('Noah', 'Johnson', 'noah.johnson@example.com', 'hash_pw_noah_03', '303 Pine Rd Austin TX'),
('Emma', 'Davis', 'emma.davis@example.com', 'hash_pw_emma_04', '404 Cedar Ln Denver CO'),
('Sophia', 'Brown', 'sophia.brown@example.com', 'hash_pw_sophia_05', '505 Birch Dr Miami FL');

INSERT INTO Statuses (statusCode, description) VALUES
('IN_PROGRESS', 'Order has been placed and is awaiting payment confirmation.'),
('ORDERED', 'Payment has been received and order is queued for fulfillment.'),
('EN_ROUTE', 'Order has left the warehouse and is in transit.'),
('SHIPPED', 'Order has been delivered to the customer.');

INSERT INTO Items (type, title, price, description, image, artistId, genreId) VALUES
('record', 'Skylines at Dawn', 24.99, 'Debut vinyl pressing with two bonus tracks', '/images/skylines-at-dawn.jpg', 1, 1),
('CD', 'Neon Ghosts', 27.50, 'Expanded CD edition with remix booklet', NULL, 2, 2),
('CD', 'Quiet Fires', 14.50, NULL, '/images/quiet-fires.jpg', 3, 3),
('record', 'Static Hearts', 12.00, 'Limited run live session recording', '/images/static-hearts.jpg', 2, 2),
('CD', 'Paper Trails', 18.00, 'Acoustic EP with alternate takes', NULL, 3, 3),
('record', 'City Echoes', 31.25, '180g audiophile pressing', '/images/city-echoes.jpg', 1, 1);

INSERT INTO Orders (customerId, statusId, timestamp, orderTotal) VALUES
(1, 4, '2026-03-14 10:15:00', 53.99),
(1, 3, '2026-03-21 14:42:00', 45.50),
(2, 2, '2026-04-02 09:05:00', 36.00),
(3, 4, '2026-04-05 19:33:00', 31.25),
(4, 1, '2026-04-12 11:20:00', 58.97),
(2, 2, '2026-04-18 16:47:00', 52.00);

INSERT INTO OrderItems (orderId, itemId, quantity, price, lineTotal) VALUES
(1, 1, 1, 24.99, 24.99),
(1, 3, 2, 14.50, 29.00),
(2, 2, 1, 27.50, 27.50),
(2, 5, 1, 18.00, 18.00),
(3, 4, 3, 12.00, 36.00),
(4, 6, 1, 31.25, 31.25),
(5, 3, 1, 13.99, 13.99),
(5, 1, 2, 22.49, 44.98),
(6, 2, 2, 26.00, 52.00);
