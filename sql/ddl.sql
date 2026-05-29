/**
The OSU Record Store
Jesse Stover, Bookkeeper and Coordinator
Ryan Matta, Developer
Team Jess & Ryan
 */
-- Create the Customers table
CREATE TABLE Customers (
    customerId int NOT NULL AUTO_INCREMENT,
    firstName varchar(100) NOT NULL,
    lastName varchar(100) NOT NULL,
    email varchar(100) NOT NULL,
    shippingAddress varchar(100) NOT NULL,
    PRIMARY KEY (customerId)
);

-- Create the Statuses table
CREATE TABLE Statuses (
    statusId int NOT NULL AUTO_INCREMENT,
    statusCode varchar(50) NOT NULL,
    description varchar(1000) NOT NULL,
    PRIMARY KEY (statusId)
);

-- Create the Orders table
CREATE TABLE Orders (
    orderId int NOT NULL AUTO_INCREMENT,
    customerId int NOT NULL,
    statusId int NOT NULL,
    orderTimestamp datetime NOT NULL,
    orderTotal decimal(10, 2) NOT NULL,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES Customers (customerId) ON DELETE CASCADE,
    FOREIGN KEY (statusId) REFERENCES Statuses (statusId) ON DELETE CASCADE
);

-- Create the Artists table
CREATE TABLE Artists (
    artistId int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    country varchar(100),
    bio varchar(1000),
    PRIMARY KEY (artistId)
);

-- Create the Genres table
CREATE TABLE Genres (
    genreId int NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    description varchar(1000),
    PRIMARY KEY (genreId)
);

-- Create the Items table
CREATE TABLE Items (
    itemId int NOT NULL AUTO_INCREMENT,
    type enum ('record', 'CD') NOT NULL,
    title varchar(255) NOT NULL,
    price decimal(10, 2) NOT NULL,
    description varchar(1000),
    image varchar(255),
    artistId int NOT NULL,
    genreId int NOT NULL,
    PRIMARY KEY (itemId),
    FOREIGN KEY (artistId) REFERENCES Artists (artistId) ON DELETE CASCADE,
    FOREIGN KEY (genreId) REFERENCES Genres (genreId) ON DELETE CASCADE
);

-- Create the OrderItems table
CREATE TABLE OrderItems (
    orderItemId int NOT NULL AUTO_INCREMENT,
    orderId int NOT NULL,
    itemId int NOT NULL,
    quantity int NOT NULL,
    price decimal(10, 2) NOT NULL,
    lineTotal decimal(10, 2) NOT NULL,
    PRIMARY KEY (orderItemId),
    FOREIGN KEY (orderId) REFERENCES Orders (orderId) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES Items (itemId) ON DELETE CASCADE
);

-- Insert into the Customers table
INSERT INTO
    Customers (
        customerId,
        firstName,
        lastName,
        email,
        shippingAddress
    )
VALUES
    (
        1,
        'Ava',
        'Martinez',
        'ava.martinez@example.com',
        '101 Maple St Portland OR'
    ),
    (
        2,
        'Liam',
        'Nguyen',
        'liam.nguyen@example.com',
        '202 Oak Ave Seattle WA'
    ),
    (
        3,
        'Noah',
        'Johnson',
        'noah.johnson@example.com',
        '303 Pine Rd Austin TX'
    ),
    (
        4,
        'Emma',
        'Davis',
        'emma.davis@example.com',
        '404 Cedar Ln Denver CO'
    ),
    (
        5,
        'Sophia',
        'Brown',
        'sophia.brown@example.com',
        '505 Birch Dr Miami FL'
    );

-- Insert into the Statuses table
INSERT INTO
    Statuses (statusId, statusCode, description)
VALUES
    (
        1,
        'IN_PROGRESS',
        'Order has been placed and is awaiting payment confirmation.'
    ),
    (
        2,
        'ORDERED',
        'Payment has been received and order is queued for fulfillment.'
    ),
    (
        3,
        'EN_ROUTE',
        'Order has left the warehouse and is in transit.'
    ),
    (
        4,
        'SHIPPED',
        'Order has been delivered to the customer.'
    );

-- Insert into the Artists table
INSERT INTO
    Artists (artistId, name, country, bio)
VALUES
    (
        1,
        'The Northern Lights',
        'Canada',
        'Indie rock quartet known for atmospheric live sessions.'
    ),
    (
        2,
        'Velvet Frequency',
        'UK',
        'Synthwave duo blending retro textures with modern pop hooks.'
    ),
    (
        3,
        'Sierra Blue',
        'USA',
        'Singer-songwriter with roots in folk and acoustic storytelling.'
    ),
    (4, 'Monochrome Pulse', NULL, NULL);

-- Insert into the Genres table
INSERT INTO
    Genres (genreId, name, description)
VALUES
    (
        1,
        'Indie Rock',
        'Guitar-driven alternative rock with melodic emphasis.'
    ),
    (
        2,
        'Synthwave',
        'Electronic style inspired by 1980s film and arcade soundtracks.'
    ),
    (
        3,
        'Folk',
        'Acoustic arrangements centered on lyrical narratives.'
    ),
    (4, 'Jazz', NULL);

-- Insert into the Items table
INSERT INTO
    Items (
        itemId,
        type,
        title,
        price,
        description,
        image,
        artistId,
        genreId
    )
VALUES
    (
        1,
        'record',
        'Skylines at Dawn',
        24.99,
        'Debut vinyl pressing with two bonus tracks',
        '/images/skylines-at-dawn.jpg',
        (
            SELECT
                artistId
            FROM
                Artists
            WHERE
                name = 'The Northern Lights'
        ),
        (
            SELECT
                genreId
            FROM
                Genres
            WHERE
                name = 'Indie Rock'
        )
    ),
    (
        2,
        'CD',
        'Neon Ghosts',
        27.50,
        'Expanded CD edition with remix booklet',
        NULL,
        (
            SELECT
                artistId
            FROM
                Artists
            WHERE
                name = 'Velvet Frequency'
        ),
        (
            SELECT
                genreId
            FROM
                Genres
            WHERE
                name = 'Synthwave'
        )
    ),
    (
        3,
        'CD',
        'Quiet Fires',
        14.50,
        NULL,
        '/images/quiet-fires.jpg',
        (
            SELECT
                artistId
            FROM
                Artists
            WHERE
                name = 'Sierra Blue'
        ),
        (
            SELECT
                genreId
            FROM
                Genres
            WHERE
                name = 'Folk'
        )
    ),
    (
        4,
        'record',
        'Static Hearts',
        12.00,
        'Limited run live session recording',
        '/images/static-hearts.jpg',
        (
            SELECT
                artistId
            FROM
                Artists
            WHERE
                name = 'Velvet Frequency'
        ),
        (
            SELECT
                genreId
            FROM
                Genres
            WHERE
                name = 'Synthwave'
        )
    ),
    (
        5,
        'CD',
        'Paper Trails',
        18.00,
        'Acoustic EP with alternate takes',
        NULL,
        (
            SELECT
                artistId
            FROM
                Artists
            WHERE
                name = 'Sierra Blue'
        ),
        (
            SELECT
                genreId
            FROM
                Genres
            WHERE
                name = 'Folk'
        )
    ),
    (
        6,
        'record',
        'City Echoes',
        31.25,
        '180g audiophile pressing',
        '/images/city-echoes.jpg',
        (
            SELECT
                artistId
            FROM
                Artists
            WHERE
                name = 'The Northern Lights'
        ),
        (
            SELECT
                genreId
            FROM
                Genres
            WHERE
                name = 'Indie Rock'
        )
    );

-- Insert into the Orders table
INSERT INTO
    Orders (
        orderId,
        customerId,
        statusId,
        orderTimestamp,
        orderTotal
    )
VALUES
    (
        1,
        (
            SELECT
                customerId
            FROM
                Customers
            WHERE
                firstName = 'Ava'
        ),
        (
            SELECT
                statusId
            FROM
                Statuses
            WHERE
                statusCode = 'SHIPPED'
        ),
        '2026-03-14 10:15:00',
        53.99
    ),
    (
        2,
        (
            SELECT
                customerId
            FROM
                Customers
            WHERE
                firstName = 'Ava'
        ),
        (
            SELECT
                statusId
            FROM
                Statuses
            WHERE
                statusCode = 'EN_ROUTE'
        ),
        '2026-03-21 14:42:00',
        45.50
    ),
    (
        3,
        (
            SELECT
                customerId
            FROM
                Customers
            WHERE
                firstName = 'Liam'
        ),
        (
            SELECT
                statusId
            FROM
                Statuses
            WHERE
                statusCode = 'ORDERED'
        ),
        '2026-04-02 09:05:00',
        36.00
    ),
    (
        4,
        (
            SELECT
                customerId
            FROM
                Customers
            WHERE
                firstName = 'Noah'
        ),
        (
            SELECT
                statusId
            FROM
                Statuses
            WHERE
                statusCode = 'SHIPPED'
        ),
        '2026-04-05 19:33:00',
        31.25
    ),
    (
        5,
        (
            SELECT
                customerId
            FROM
                Customers
            WHERE
                firstName = 'Emma'
        ),
        (
            SELECT
                statusId
            FROM
                Statuses
            WHERE
                statusCode = 'IN_PROGRESS'
        ),
        '2026-04-12 11:20:00',
        58.97
    ),
    (
        6,
        (
            SELECT
                customerId
            FROM
                Customers
            WHERE
                firstName = 'Sophia'
        ),
        (
            SELECT
                statusId
            FROM
                Statuses
            WHERE
                statusCode = 'ORDERED'
        ),
        '2026-04-18 16:47:00',
        52.00
    );

-- Insert into the OrderItems table
INSERT INTO
    OrderItems (
        orderItemId,
        orderId,
        itemId,
        quantity,
        price,
        lineTotal
    )
VALUES
    (
        1,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Ava'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'SHIPPED'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Skylines at Dawn'
        ),
        1,
        24.99,
        24.99
    ),
    (
        2,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Ava'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'EN_ROUTE'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Quiet Fires'
        ),
        2,
        14.50,
        29.00
    ),
    (
        3,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Liam'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'ORDERED'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Neon Ghosts'
        ),
        1,
        27.50,
        27.50
    ),
    (
        4,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Liam'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'ORDERED'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Paper Trails'
        ),
        1,
        18.00,
        18.00
    ),
    (
        5,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Noah'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'SHIPPED'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Static Hearts'
        ),
        3,
        12.00,
        36.00
    ),
    (
        6,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Noah'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'SHIPPED'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'City Echoes'
        ),
        1,
        31.25,
        31.25
    ),
    (
        7,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Emma'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'IN_PROGRESS'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Quiet Fires'
        ),
        1,
        13.99,
        13.99
    ),
    (
        8,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Emma'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'IN_PROGRESS'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Skylines at Dawn'
        ),
        2,
        22.49,
        44.98
    ),
    (
        9,
        (
            SELECT
                orderId
            FROM
                Orders
            WHERE
                customerId = (
                    SELECT
                        customerId
                    FROM
                        Customers
                    WHERE
                        firstName = 'Sophia'
                )
                AND statusId = (
                    SELECT
                        statusId
                    FROM
                        Statuses
                    WHERE
                        statusCode = 'ORDERED'
                )
        ),
        (
            SELECT
                itemId
            FROM
                Items
            WHERE
                title = 'Neon Ghosts'
        ),
        2,
        26.00,
        52.00
    );
-- Stored procedures for delete operations
DELIMITER //

CREATE PROCEDURE delete_artist(IN p_id INT)
BEGIN
    DELETE FROM Artists WHERE artistId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_genre(IN p_id INT)
BEGIN
    DELETE FROM Genres WHERE genreId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_customer(IN p_id INT)
BEGIN
    DELETE FROM Customers WHERE customerId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_item(IN p_id INT)
BEGIN
    DELETE FROM Items WHERE itemId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_order(IN p_id INT)
BEGIN
    DELETE FROM Orders WHERE orderId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_order_item(IN p_id INT)
BEGIN
    DELETE FROM OrderItems WHERE orderItemId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE reset_db()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE OrderItems;
    TRUNCATE TABLE Orders;
    TRUNCATE TABLE Items;
    TRUNCATE TABLE Artists;
    TRUNCATE TABLE Genres;
    TRUNCATE TABLE Customers;
    SET FOREIGN_KEY_CHECKS = 1;

    INSERT INTO Customers (customerId, firstName, lastName, email, shippingAddress) VALUES
        (1, 'Ava', 'Martinez', 'ava.martinez@example.com', '101 Maple St Portland OR'),
        (2, 'Liam', 'Nguyen', 'liam.nguyen@example.com', '202 Oak Ave Seattle WA'),
        (3, 'Noah', 'Johnson', 'noah.johnson@example.com', '303 Pine Rd Austin TX'),
        (4, 'Emma', 'Davis', 'emma.davis@example.com', '404 Cedar Ln Denver CO'),
        (5, 'Sophia', 'Brown', 'sophia.brown@example.com', '505 Birch Dr Miami FL');

    INSERT INTO Statuses (statusId, statusCode, description) VALUES
        (1, 'IN_PROGRESS', 'Order has been placed and is awaiting payment confirmation.'),
        (2, 'ORDERED', 'Payment has been received and order is queued for fulfillment.'),
        (3, 'EN_ROUTE', 'Order has left the warehouse and is in transit.'),
        (4, 'SHIPPED', 'Order has been delivered to the customer.');

    INSERT INTO Artists (artistId, name, country, bio) VALUES
        (1, 'The Northern Lights', 'Canada', 'Indie rock quartet known for atmospheric live sessions.'),
        (2, 'Velvet Frequency', 'UK', 'Synthwave duo blending retro textures with modern pop hooks.'),
        (3, 'Sierra Blue', 'USA', 'Singer-songwriter with roots in folk and acoustic storytelling.'),
        (4, 'Monochrome Pulse', NULL, NULL);

    INSERT INTO Genres (genreId, name, description) VALUES
        (1, 'Indie Rock', 'Guitar-driven alternative rock with melodic emphasis.'),
        (2, 'Synthwave', 'Electronic style inspired by 1980s film and arcade soundtracks.'),
        (3, 'Folk', 'Acoustic arrangements centered on lyrical narratives.'),
        (4, 'Jazz', NULL);

    INSERT INTO Items (itemId, type, title, price, description, image, artistId, genreId) VALUES
        (1, 'record', 'Skylines at Dawn', 24.99, 'Debut vinyl pressing with two bonus tracks', '/images/skylines-at-dawn.jpg', 1, 1),
        (2, 'CD', 'Neon Ghosts', 27.50, 'Expanded CD edition with remix booklet', NULL, 2, 2),
        (3, 'CD', 'Quiet Fires', 14.50, NULL, '/images/quiet-fires.jpg', 3, 3),
        (4, 'record', 'Static Hearts', 12.00, 'Limited run live session recording', '/images/static-hearts.jpg', 2, 2),
        (5, 'CD', 'Paper Trails', 18.00, 'Acoustic EP with alternate takes', NULL, 3, 3),
        (6, 'record', 'City Echoes', 31.25, '180g audiophile pressing', '/images/city-echoes.jpg', 1, 1);

    INSERT INTO Orders (orderId, customerId, statusId, orderTimestamp, orderTotal) VALUES
        (1, 1, 4, '2026-03-14 10:15:00', 53.99),
        (2, 1, 3, '2026-03-21 14:42:00', 45.50),
        (3, 2, 2, '2026-04-02 09:05:00', 36.00),
        (4, 3, 4, '2026-04-05 19:33:00', 31.25),
        (5, 4, 1, '2026-04-12 11:20:00', 58.97),
        (6, 5, 2, '2026-04-18 16:47:00', 52.00);

    INSERT INTO OrderItems (orderItemId, orderId, itemId, quantity, price, lineTotal) VALUES
        (1, 1, 1, 1, 24.99, 24.99),
        (2, 2, 3, 2, 14.50, 29.00),
        (3, 3, 2, 1, 27.50, 27.50),
        (4, 3, 5, 1, 18.00, 18.00),
        (5, 4, 4, 3, 12.00, 36.00),
        (6, 4, 6, 1, 31.25, 31.25),
        (7, 5, 3, 1, 13.99, 13.99),
        (8, 5, 1, 2, 22.49, 44.98),
        (9, 6, 2, 2, 26.00, 52.00);
END //

DELIMITER ;
