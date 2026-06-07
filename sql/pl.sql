-- The OSU Record Store
-- Jesse Stover, Bookkeeper and Coordinator
-- Ryan Matta, Developer
-- Team Jess & Ryan
--
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to create stored procedures in sql/pl.sql for create, update, and delete operations on every table defined in sql/ddl.sql.
-- - Prompted to follow existing delete_* naming conventions and return insertId from create procedures and rows_affected from update/delete procedures.
-- - Prompted to move all procedure definitions out of sql/ddl.sql so pl.sql is the single source of truth, including the reset_db utility procedure.
--
-- Procedure conventions:
-- - create_* procedures insert non-PK columns and SELECT LAST_INSERT_ID() AS insertId.
-- - update_* procedures SET all editable columns and SELECT ROW_COUNT() AS rows_affected.
-- - delete_* procedures remove by primary key and SELECT ROW_COUNT() AS rows_affected.
-- - Nullable VARCHAR parameters accept SQL NULL for optional schema columns.
-- - Items.type uses ENUM('record', 'CD') to match the Items table definition in ddl.sql.

DELIMITER //

-- Customers
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to add create_customer, update_customer, and delete_customer procedures for the Customers table (firstName, lastName, email, shippingAddress).

CREATE PROCEDURE create_customer(
    IN p_firstName VARCHAR(100),
    IN p_lastName VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_shippingAddress VARCHAR(100)
)
BEGIN
    INSERT INTO Customers (firstName, lastName, email, shippingAddress)
    VALUES (p_firstName, p_lastName, p_email, p_shippingAddress);
    SELECT LAST_INSERT_ID() AS insertId;
END //

CREATE PROCEDURE update_customer(
    IN p_customerId INT,
    IN p_firstName VARCHAR(100),
    IN p_lastName VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_shippingAddress VARCHAR(100)
)
BEGIN
    UPDATE Customers
    SET
        firstName = p_firstName,
        lastName = p_lastName,
        email = p_email,
        shippingAddress = p_shippingAddress
    WHERE customerId = p_customerId;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_customer(IN p_id INT)
BEGIN
    DELETE FROM Customers WHERE customerId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

-- Artists
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to add create_artist, update_artist, and delete_artist procedures.
-- - Prompted to allow NULL country and bio inputs to match nullable Artists columns.

CREATE PROCEDURE create_artist(
    IN p_name VARCHAR(255),
    IN p_country VARCHAR(100),
    IN p_bio VARCHAR(1000)
)
BEGIN
    INSERT INTO Artists (name, country, bio)
    VALUES (p_name, p_country, p_bio);
    SELECT LAST_INSERT_ID() AS insertId;
END //

CREATE PROCEDURE update_artist(
    IN p_artistId INT,
    IN p_name VARCHAR(255),
    IN p_country VARCHAR(100),
    IN p_bio VARCHAR(1000)
)
BEGIN
    UPDATE Artists
    SET
        name = p_name,
        country = p_country,
        bio = p_bio
    WHERE artistId = p_artistId;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_artist(IN p_id INT)
BEGIN
    DELETE FROM Artists WHERE artistId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

-- Genres
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to add create_genre, update_genre, and delete_genre procedures.
-- - Prompted to allow NULL description inputs to match nullable Genres.description.

CREATE PROCEDURE create_genre(
    IN p_name VARCHAR(100),
    IN p_description VARCHAR(1000)
)
BEGIN
    INSERT INTO Genres (name, description)
    VALUES (p_name, p_description);
    SELECT LAST_INSERT_ID() AS insertId;
END //

CREATE PROCEDURE update_genre(
    IN p_genreId INT,
    IN p_name VARCHAR(100),
    IN p_description VARCHAR(1000)
)
BEGIN
    UPDATE Genres
    SET
        name = p_name,
        description = p_description
    WHERE genreId = p_genreId;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_genre(IN p_id INT)
BEGIN
    DELETE FROM Genres WHERE genreId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

-- Items
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to add create_item, update_item, and delete_item procedures.
-- - Prompted to include artistId and genreId foreign keys and nullable description/image fields.

CREATE PROCEDURE create_item(
    IN p_type ENUM ('record', 'CD'),
    IN p_title VARCHAR(255),
    IN p_price DECIMAL(10, 2),
    IN p_description VARCHAR(1000),
    IN p_image VARCHAR(255),
    IN p_artistId INT,
    IN p_genreId INT
)
BEGIN
    INSERT INTO Items (type, title, price, description, image, artistId, genreId)
    VALUES (p_type, p_title, p_price, p_description, p_image, p_artistId, p_genreId);
    SELECT LAST_INSERT_ID() AS insertId;
END //

CREATE PROCEDURE update_item(
    IN p_itemId INT,
    IN p_type ENUM ('record', 'CD'),
    IN p_title VARCHAR(255),
    IN p_price DECIMAL(10, 2),
    IN p_description VARCHAR(1000),
    IN p_image VARCHAR(255),
    IN p_artistId INT,
    IN p_genreId INT
)
BEGIN
    UPDATE Items
    SET
        type = p_type,
        title = p_title,
        price = p_price,
        description = p_description,
        image = p_image,
        artistId = p_artistId,
        genreId = p_genreId
    WHERE itemId = p_itemId;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_item(IN p_id INT)
BEGIN
    DELETE FROM Items WHERE itemId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

-- Orders
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to add create_order, update_order, and delete_order procedures.
-- - Prompted to use orderTimestamp rather than timestamp to match the Orders schema in ddl.sql.

CREATE PROCEDURE create_order(
    IN p_customerId INT,
    IN p_statusId INT,
    IN p_orderTimestamp DATETIME,
    IN p_orderTotal DECIMAL(10, 2)
)
BEGIN
    INSERT INTO Orders (customerId, statusId, orderTimestamp, orderTotal)
    VALUES (p_customerId, p_statusId, p_orderTimestamp, p_orderTotal);
    SELECT LAST_INSERT_ID() AS insertId;
END //

CREATE PROCEDURE update_order(
    IN p_orderId INT,
    IN p_customerId INT,
    IN p_statusId INT,
    IN p_orderTimestamp DATETIME,
    IN p_orderTotal DECIMAL(10, 2)
)
BEGIN
    UPDATE Orders
    SET
        customerId = p_customerId,
        statusId = p_statusId,
        orderTimestamp = p_orderTimestamp,
        orderTotal = p_orderTotal
    WHERE orderId = p_orderId;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_order(IN p_id INT)
BEGIN
    DELETE FROM Orders WHERE orderId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

-- OrderItems
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to add create_order_item, update_order_item, and delete_order_item procedures.
-- - Prompted to persist historical price and lineTotal values for monthly sales analysis.

CREATE PROCEDURE create_order_item(
    IN p_orderId INT,
    IN p_itemId INT,
    IN p_quantity INT,
    IN p_price DECIMAL(10, 2),
    IN p_lineTotal DECIMAL(10, 2)
)
BEGIN
    INSERT INTO OrderItems (orderId, itemId, quantity, price, lineTotal)
    VALUES (p_orderId, p_itemId, p_quantity, p_price, p_lineTotal);
    SELECT LAST_INSERT_ID() AS insertId;
END //

CREATE PROCEDURE update_order_item(
    IN p_orderItemId INT,
    IN p_orderId INT,
    IN p_itemId INT,
    IN p_quantity INT,
    IN p_price DECIMAL(10, 2),
    IN p_lineTotal DECIMAL(10, 2)
)
BEGIN
    UPDATE OrderItems
    SET
        orderId = p_orderId,
        itemId = p_itemId,
        quantity = p_quantity,
        price = p_price,
        lineTotal = p_lineTotal
    WHERE orderItemId = p_orderItemId;
    SELECT ROW_COUNT() AS rows_affected;
END //

CREATE PROCEDURE delete_order_item(IN p_id INT)
BEGIN
    DELETE FROM OrderItems WHERE orderItemId = p_id;
    SELECT ROW_COUNT() AS rows_affected;
END //

-- Database reset
-- Date: 06/07/2026
-- AI tools were used to generate this code (Cursor Composer 2.5).
--
-- Summary of prompts:
-- - Prompted to move reset_db from sql/ddl.sql into pl.sql with the other procedures.
-- - Prompted to truncate and reinsert seed data for POST /reset and the MCP reset_db tool.
-- - Prompted to add TRUNCATE TABLE Statuses so reset_db does not fail with duplicate primary-key errors when reinserting fixed statusId values 1-4.

CREATE PROCEDURE reset_db()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE OrderItems;
    TRUNCATE TABLE Orders;
    TRUNCATE TABLE Items;
    TRUNCATE TABLE Artists;
    TRUNCATE TABLE Genres;
    TRUNCATE TABLE Customers;
    TRUNCATE TABLE Statuses;
    SET FOREIGN_KEY_CHECKS = 1;

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
END //

DELIMITER ;
