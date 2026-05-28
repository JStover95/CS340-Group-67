-- OSU Record Store
-- Data Manipulation Queries (DML)
-- Variables are denoted with @ symbol (e.g. @customerId)
-- These represent values passed in from the backend at runtime

-- ARTISTS

SELECT * FROM Artists;

INSERT INTO Artists (name, country, bio)
VALUES (@name, @country, @bio);

UPDATE Artists
SET name = @name, country = @country, bio = @bio
WHERE artistId = @artistId;

DELETE FROM Artists WHERE artistId = @artistId;

-- GENRES

SELECT * FROM Genres;

INSERT INTO Genres (name, description)
VALUES (@name, @description);

UPDATE Genres
SET name = @name, description = @description
WHERE genreId = @genreId;

DELETE FROM Genres WHERE genreId = @genreId;

-- CUSTOMERS

SELECT * FROM Customers;

INSERT INTO Customers (firstName, lastName, email, password, shippingAddress)
VALUES (@firstName, @lastName, @email, @password, @shippingAddress);

UPDATE Customers
SET firstName = @firstName, lastName = @lastName, email = @email,
    password = @password, shippingAddress = @shippingAddress
WHERE customerId = @customerId;

DELETE FROM Customers WHERE customerId = @customerId;

-- ITEMS

SELECT Items.itemId, Items.type, Items.title, Items.price,
       Items.description, Items.image,
       Artists.name AS artistName, Genres.name AS genreName
FROM Items
JOIN Artists ON Items.artistId = Artists.artistId
JOIN Genres ON Items.genreId = Genres.genreId;

INSERT INTO Items (type, title, price, description, image, artistId, genreId)
VALUES (@type, @title, @price, @description, @image, @artistId, @genreId);

UPDATE Items
SET type = @type, title = @title, price = @price,
    description = @description, image = @image,
    artistId = @artistId, genreId = @genreId
WHERE itemId = @itemId;

DELETE FROM Items WHERE itemId = @itemId;

-- ORDERS

SELECT Orders.orderId, Customers.firstName, Customers.lastName,
       Statuses.statusCode, Orders.timestamp, Orders.orderTotal
FROM Orders
JOIN Customers ON Orders.customerId = Customers.customerId
JOIN Statuses ON Orders.statusId = Statuses.statusId;

INSERT INTO Orders (customerId, statusId, timestamp, orderTotal)
VALUES (@customerId, @statusId, @timestamp, @orderTotal);

UPDATE Orders
SET statusId = @statusId, orderTotal = @orderTotal
WHERE orderId = @orderId;

DELETE FROM Orders WHERE orderId = @orderId;

-- ORDER ITEMS

SELECT OrderItems.orderItemId, Items.title, OrderItems.quantity,
       OrderItems.price, OrderItems.lineTotal
FROM OrderItems
JOIN Items ON OrderItems.itemId = Items.itemId
WHERE OrderItems.orderId = @orderId;

INSERT INTO OrderItems (orderId, itemId, quantity, price, lineTotal)
VALUES (@orderId, @itemId, @quantity, @price, @lineTotal);

UPDATE OrderItems
SET quantity = @quantity, lineTotal = @price * @quantity
WHERE orderItemId = @orderItemId;

DELETE FROM OrderItems WHERE orderItemId = @orderItemId;
