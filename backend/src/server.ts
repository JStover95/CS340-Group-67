/** Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to add `POST /reset` that calls stored procedure `reset_db()`.
 * - Prompted to return `200` with `{ message: "Database successfully reset." }` on success.
 */

/** Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to add `DELETE <slug>/{id}` endpoints for each table.
 * - Prompted to call `delete_<slug>` stored procedures and return `204` on successful delete or `404` with `{ message: "Resource not found." }` when no row was deleted.
 */

/** Date: 05/28/2026
 * AI tools were used to generate this code (Cursor Codex 5.3).
 *
 * Summary of prompts:
 * - Prompted to create six GET endpoints (`artist`, `genre`, `customer`, `item`, `order`, `order-item`) for returning full JSON row arrays.
 * - Prompted to build a backend-only integration layer for frontend consumption later, without wiring frontend calls yet.
 */

/** Date: 06/07/2026
 * AI tools were used to generate this code (Cursor Composer 2.5).
 *
 * Summary of prompts:
 * - Prompted to add `POST` and `PUT` endpoints for each create/update stored procedure.
 * - Prompted to add `GET /status/` for order form status dropdowns.
 * - Prompted to normalize order timestamps to MySQL `YYYY-MM-DD HH:MM:SS` before calling order stored procedures.
 */

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { pool } from "./db.js";
import { queries } from "./queries.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

function requiredString(value: unknown, field: string): string | null {
  const result = nullableString(value);
  return result == null ? null : result;
}

function parseDecimal(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parsePositiveInt(value: unknown): number | null {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function toMySqlDateTime(value: unknown): string | null {
  if (value == null) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ` +
      `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
    );
  }

  const str = String(value).trim();
  if (str === "") return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) return str;
  if (str.includes("T")) return str.slice(0, 19).replace("T", " ");

  return str;
}

function getProcedureScalar(rows: unknown): number {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 0;
  }

  const firstResultSet = rows[0];
  if (!Array.isArray(firstResultSet) || firstResultSet.length === 0) {
    return 0;
  }

  const firstRow = firstResultSet[0] as Record<string, unknown>;
  const firstValue = Object.values(firstRow)[0];
  const scalar = Number(firstValue);

  return Number.isFinite(scalar) ? scalar : 0;
}

function getRowCountFromProcedureResult(rows: unknown): number {
  return getProcedureScalar(rows);
}

function getInsertIdFromProcedureResult(rows: unknown): number | null {
  const insertId = getProcedureScalar(rows);
  return insertId > 0 ? insertId : null;
}

function callProcedure(name: string, args: unknown[]) {
  const placeholders = args.map(() => "?").join(", ");
  return pool.query(`CALL ${name}(${placeholders})`, args);
}

async function handleDelete(
  procedureName: string,
  idParam: string,
  res: express.Response
): Promise<express.Response> {
  const id = parseId(idParam);

  if (id === null) {
    return res.status(404).json({ message: "Resource not found." });
  }

  const [rows] = await callProcedure(procedureName, [id]);
  const rowCount = getRowCountFromProcedureResult(rows);

  if (rowCount > 0) {
    return res.status(204).send();
  }

  return res.status(404).json({ message: "Resource not found." });
}

async function handleCreate(
  procedureName: string,
  args: unknown[],
  res: express.Response
): Promise<express.Response> {
  const [rows] = await callProcedure(procedureName, args);
  const insertId = getInsertIdFromProcedureResult(rows);

  if (insertId != null) {
    return res.status(201).json({ insertId });
  }

  return res.status(500).json({ error: "Failed to create resource." });
}

async function handleUpdate(
  procedureName: string,
  args: unknown[],
  res: express.Response
): Promise<express.Response> {
  const [rows] = await callProcedure(procedureName, args);
  const rowCount = getRowCountFromProcedureResult(rows);

  if (rowCount > 0) {
    return res.status(200).json({ rowsAffected: rowCount });
  }

  return res.status(404).json({ message: "Resource not found." });
}

app.get("/artist/", async (_req, res) => {
  const [rows] = await pool.query(queries.artists);
  return res.status(200).json(rows);
});

app.post("/artist/", async (req, res) => {
  const name = requiredString(req.body.name, "name");
  if (name == null) {
    return res.status(400).json({ message: "name is required." });
  }

  return handleCreate("create_artist", [
    name,
    nullableString(req.body.country),
    nullableString(req.body.bio),
  ], res);
});

app.put("/artist/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const name = requiredString(req.body.name, "name");
  if (id == null || name == null) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_artist", [
    id,
    name,
    nullableString(req.body.country),
    nullableString(req.body.bio),
  ], res);
});

app.delete("/artist/:id", async (req, res) => {
  return handleDelete("delete_artist", req.params.id, res);
});

app.get("/genre/", async (_req, res) => {
  const [rows] = await pool.query(queries.genres);
  return res.status(200).json(rows);
});

app.post("/genre/", async (req, res) => {
  const name = requiredString(req.body.name, "name");
  if (name == null) {
    return res.status(400).json({ message: "name is required." });
  }

  return handleCreate("create_genre", [name, nullableString(req.body.description)], res);
});

app.put("/genre/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const name = requiredString(req.body.name, "name");
  if (id == null || name == null) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_genre", [id, name, nullableString(req.body.description)], res);
});

app.delete("/genre/:id", async (req, res) => {
  return handleDelete("delete_genre", req.params.id, res);
});

app.get("/customer/", async (_req, res) => {
  const [rows] = await pool.query(queries.customers);
  return res.status(200).json(rows);
});

app.post("/customer/", async (req, res) => {
  const firstName = requiredString(req.body.firstName, "firstName");
  const lastName = requiredString(req.body.lastName, "lastName");
  const email = requiredString(req.body.email, "email");
  const shippingAddress = requiredString(req.body.shippingAddress, "shippingAddress");

  if (firstName == null || lastName == null || email == null || shippingAddress == null) {
    return res.status(400).json({ message: "All customer fields are required." });
  }

  return handleCreate("create_customer", [
    firstName,
    lastName,
    email,
    shippingAddress,
  ], res);
});

app.put("/customer/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const firstName = requiredString(req.body.firstName, "firstName");
  const lastName = requiredString(req.body.lastName, "lastName");
  const email = requiredString(req.body.email, "email");
  const shippingAddress = requiredString(req.body.shippingAddress, "shippingAddress");

  if (id == null || firstName == null || lastName == null || email == null || shippingAddress == null) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_customer", [
    id,
    firstName,
    lastName,
    email,
    shippingAddress,
  ], res);
});

app.delete("/customer/:id", async (req, res) => {
  return handleDelete("delete_customer", req.params.id, res);
});

app.get("/status/", async (_req, res) => {
  const [rows] = await pool.query(queries.statuses);
  return res.status(200).json(rows);
});

app.post("/status/", async (req, res) => {
  const statusCode = requiredString(req.body.statusCode, "statusCode");
  const description = requiredString(req.body.description, "description");
  if (statusCode == null || description == null) {
    return res.status(400).json({ message: "statusCode and description are required." });
  }

  return handleCreate("create_status", [statusCode, description], res);
});

app.put("/status/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const statusCode = requiredString(req.body.statusCode, "statusCode");
  const description = requiredString(req.body.description, "description");
  if (id == null || statusCode == null || description == null) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_status", [id, statusCode, description], res);
});

app.delete("/status/:id", async (req, res) => {
  return handleDelete("delete_status", req.params.id, res);
});

app.get("/item/", async (_req, res) => {
  const [rows] = await pool.query(queries.items);
  return res.status(200).json(rows);
});

app.post("/item/", async (req, res) => {
  const type = requiredString(req.body.type, "type");
  const title = requiredString(req.body.title, "title");
  const price = parseDecimal(req.body.price);
  const artistId = parsePositiveInt(req.body.artistId);
  const genreId = parsePositiveInt(req.body.genreId);

  if (type == null || title == null || price == null || artistId == null || genreId == null) {
    return res.status(400).json({ message: "Invalid item payload." });
  }

  return handleCreate("create_item", [
    type,
    title,
    price,
    nullableString(req.body.description),
    nullableString(req.body.image),
    artistId,
    genreId,
  ], res);
});

app.put("/item/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const type = requiredString(req.body.type, "type");
  const title = requiredString(req.body.title, "title");
  const price = parseDecimal(req.body.price);
  const artistId = parsePositiveInt(req.body.artistId);
  const genreId = parsePositiveInt(req.body.genreId);

  if (id == null || type == null || title == null || price == null || artistId == null || genreId == null) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_item", [
    id,
    type,
    title,
    price,
    nullableString(req.body.description),
    nullableString(req.body.image),
    artistId,
    genreId,
  ], res);
});

app.delete("/item/:id", async (req, res) => {
  return handleDelete("delete_item", req.params.id, res);
});

app.get("/order/", async (_req, res) => {
  const [rows] = await pool.query(queries.orders);
  const normalized = (rows as Record<string, unknown>[]).map((row) => ({
    ...row,
    orderTimestamp: toMySqlDateTime(row.orderTimestamp),
  }));
  return res.status(200).json(normalized);
});

app.post("/order/", async (req, res) => {
  const customerId = parsePositiveInt(req.body.customerId);
  const statusId = parsePositiveInt(req.body.statusId);
  const orderTotal = parseDecimal(req.body.orderTotal);
  const orderTimestamp =
    toMySqlDateTime(req.body.orderTimestamp) ?? toMySqlDateTime(new Date());

  if (customerId == null || statusId == null || orderTotal == null) {
    return res.status(400).json({ message: "Invalid order payload." });
  }

  return handleCreate("create_order", [
    customerId,
    statusId,
    orderTimestamp,
    orderTotal,
  ], res);
});

app.put("/order/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const customerId = parsePositiveInt(req.body.customerId);
  const statusId = parsePositiveInt(req.body.statusId);
  const orderTotal = parseDecimal(req.body.orderTotal);
  const orderTimestamp = toMySqlDateTime(req.body.orderTimestamp);

  if (
    id == null ||
    customerId == null ||
    statusId == null ||
    orderTotal == null ||
    orderTimestamp == null
  ) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_order", [
    id,
    customerId,
    statusId,
    orderTimestamp,
    orderTotal,
  ], res);
});

app.delete("/order/:id", async (req, res) => {
  return handleDelete("delete_order", req.params.id, res);
});

app.get("/order-item/", async (_req, res) => {
  const [rows] = await pool.query(queries.orderItems);
  return res.status(200).json(rows);
});

app.post("/order-item/", async (req, res) => {
  const orderId = parsePositiveInt(req.body.orderId);
  const itemId = parsePositiveInt(req.body.itemId);
  const quantity = parsePositiveInt(req.body.quantity);
  const price = parseDecimal(req.body.price);
  const lineTotal = parseDecimal(req.body.lineTotal);

  if (orderId == null || itemId == null || quantity == null || price == null || lineTotal == null) {
    return res.status(400).json({ message: "Invalid order item payload." });
  }

  return handleCreate("create_order_item", [
    orderId,
    itemId,
    quantity,
    price,
    lineTotal,
  ], res);
});

app.put("/order-item/:id", async (req, res) => {
  const id = parseId(req.params.id);
  const orderId = parsePositiveInt(req.body.orderId);
  const itemId = parsePositiveInt(req.body.itemId);
  const quantity = parsePositiveInt(req.body.quantity);
  const price = parseDecimal(req.body.price);
  const lineTotal = parseDecimal(req.body.lineTotal);

  if (
    id == null ||
    orderId == null ||
    itemId == null ||
    quantity == null ||
    price == null ||
    lineTotal == null
  ) {
    return res.status(404).json({ message: "Resource not found." });
  }

  return handleUpdate("update_order_item", [
    id,
    orderId,
    itemId,
    quantity,
    price,
    lineTotal,
  ], res);
});

app.delete("/order-item/:id", async (req, res) => {
  return handleDelete("delete_order_item", req.params.id, res);
});

app.post("/reset", async (_req, res) => {
  await pool.query("CALL reset_db()");
  return res.status(200).json({ message: "Database successfully reset." });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
