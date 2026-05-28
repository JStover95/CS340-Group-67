/** Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to implement SQL query constants for backend GET list endpoints using `sql/dml.sql`.
 * - Prompted to avoid `SELECT *` for `Artists`, `Genres`, and `Customers` by explicitly selecting schema columns from `sql/ddl.sql`.
 */

// Based on sql/dml.sql; artists/genres/customers use explicit columns.
export const queries = {
  artists: `
    SELECT
      artistId,
      name,
      country,
      bio
    FROM Artists;
  `,
  genres: `
    SELECT
      genreId,
      name,
      description
    FROM Genres;
  `,
  customers: `
    SELECT
      customerId,
      firstName,
      lastName,
      email,
      shippingAddress
    FROM Customers;
  `,
  items: `
    SELECT
      Items.itemId,
      Items.type,
      Items.title,
      Items.price,
      Items.description,
      Items.image,
      Artists.name AS artistName,
      Genres.name AS genreName
    FROM Items
    JOIN Artists ON Items.artistId = Artists.artistId
    JOIN Genres ON Items.genreId = Genres.genreId;
  `,
  orders: `
    SELECT
      Orders.orderId,
      Customers.firstName,
      Customers.lastName,
      Statuses.statusCode,
      Orders.orderTimestamp,
      Orders.orderTotal
    FROM Orders
    JOIN Customers ON Orders.customerId = Customers.customerId
    JOIN Statuses ON Orders.statusId = Statuses.statusId;
  `,
  orderItems: `
    SELECT
      OrderItems.orderItemId,
      OrderItems.orderId,
      Items.title,
      OrderItems.quantity,
      OrderItems.price,
      OrderItems.lineTotal
    FROM OrderItems
    JOIN Items ON OrderItems.itemId = Items.itemId;
  `,
} as const;
