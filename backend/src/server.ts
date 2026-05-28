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

app.get("/artist/", async (_req, res) => {
  const [rows] = await pool.query(queries.artists);
  return res.status(200).json(rows);
});

app.get("/genre/", async (_req, res) => {
  const [rows] = await pool.query(queries.genres);
  return res.status(200).json(rows);
});

app.get("/customer/", async (_req, res) => {
  const [rows] = await pool.query(queries.customers);
  return res.status(200).json(rows);
});

app.get("/item/", async (_req, res) => {
  const [rows] = await pool.query(queries.items);
  return res.status(200).json(rows);
});

app.get("/order/", async (_req, res) => {
  const [rows] = await pool.query(queries.orders);
  return res.status(200).json(rows);
});

app.get("/order-item/", async (_req, res) => {
  const [rows] = await pool.query(queries.orderItems);
  return res.status(200).json(rows);
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
