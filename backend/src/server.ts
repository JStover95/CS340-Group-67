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

import dotenv from "dotenv";
import express from "express";
import { pool } from "./db.js";
import { queries } from "./queries.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json());

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getRowCountFromProcedureResult(rows: unknown): number {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 0;
  }

  const firstResultSet = rows[0];
  if (!Array.isArray(firstResultSet) || firstResultSet.length === 0) {
    return 0;
  }

  const firstRow = firstResultSet[0] as Record<string, unknown>;
  const firstValue = Object.values(firstRow)[0];
  const rowCount = Number(firstValue);

  return Number.isFinite(rowCount) ? rowCount : 0;
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

  const [rows] = await pool.query(`CALL ${procedureName}(?)`, [id]);
  const rowCount = getRowCountFromProcedureResult(rows);

  if (rowCount > 0) {
    return res.status(204).send();
  }

  return res.status(404).json({ message: "Resource not found." });
}

app.get("/artist/", async (_req, res) => {
  const [rows] = await pool.query(queries.artists);
  return res.status(200).json(rows);
});

app.delete("/artist/:id", async (req, res) => {
  return handleDelete("delete_artist", req.params.id, res);
});

app.get("/genre/", async (_req, res) => {
  const [rows] = await pool.query(queries.genres);
  return res.status(200).json(rows);
});

app.delete("/genre/:id", async (req, res) => {
  return handleDelete("delete_genre", req.params.id, res);
});

app.get("/customer/", async (_req, res) => {
  const [rows] = await pool.query(queries.customers);
  return res.status(200).json(rows);
});

app.delete("/customer/:id", async (req, res) => {
  return handleDelete("delete_customer", req.params.id, res);
});

app.get("/item/", async (_req, res) => {
  const [rows] = await pool.query(queries.items);
  return res.status(200).json(rows);
});

app.delete("/item/:id", async (req, res) => {
  return handleDelete("delete_item", req.params.id, res);
});

app.get("/order/", async (_req, res) => {
  const [rows] = await pool.query(queries.orders);
  return res.status(200).json(rows);
});

app.delete("/order/:id", async (req, res) => {
  return handleDelete("delete_order", req.params.id, res);
});

app.get("/order-item/", async (_req, res) => {
  const [rows] = await pool.query(queries.orderItems);
  return res.status(200).json(rows);
});

app.delete("/order-item/:id", async (req, res) => {
  return handleDelete("delete_order_item", req.params.id, res);
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
