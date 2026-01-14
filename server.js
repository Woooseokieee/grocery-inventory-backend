const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // VERY IMPORTANT

// Database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Database error:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create table
db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL,
  stock INTEGER,
  expiry TEXT
)
`);

// GET all products
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

// ADD product (FIXED)
app.post("/products", (req, res) => {
  const { name, price, stock, expiry } = req.body;

  console.log("Received:", req.body); // DEBUG LOG

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Product name is required" });
  }

  db.run(
    "INSERT INTO products (name, price, stock, expiry) VALUES (?,?,?,?)",
    [name, price || 0, stock || 0, expiry || ""],
    function () {
      res.json({
        message: "Product added",
        id: this.lastID
      });
    }
  );
});

// UPDATE stock
app.put("/products/:id", (req, res) => {
  const { stock } = req.body;

  if (stock === undefined) {
    return res.status(400).json({ error: "Stock is required" });
  }

  db.run(
    "UPDATE products SET stock=? WHERE id=?",
    [stock, req.params.id],
    () => res.json({ message: "Stock updated" })
  );
});

// DELETE product
app.delete("/products/:id", (req, res) => {
  db.run(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Product removed" })
  );
});

// Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
