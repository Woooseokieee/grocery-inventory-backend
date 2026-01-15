const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err);
  else console.log("Connected to SQLite");
});

// PRODUCTS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL,
  stock INTEGER,
  expiry TEXT
)
`);

// HISTORY TABLE
db.run(`
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product TEXT,
  action TEXT,
  quantity INTEGER,
  date TEXT
)
`);

// GET PRODUCTS
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ADD PRODUCT
app.post("/products", (req, res) => {
  const { name, price, stock, expiry } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  db.run(
    "INSERT INTO products (name, price, stock, expiry) VALUES (?,?,?,?)",
    [name, price || 0, stock || 0, expiry || ""],
    function () {
      db.run(
        "INSERT INTO history (product, action, quantity, date) VALUES (?,?,?,?)",
        [name, "Added product", stock || 0, new Date().toLocaleString()]
      );
      res.json({ message: "Product added", id: this.lastID });
    }
  );
});

// UPDATE STOCK
app.put("/products/:id", (req, res) => {
  const { stock, action, quantity, name } = req.body;

  db.run(
    "UPDATE products SET stock=? WHERE id=?",
    [stock, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);

      db.run(
        "INSERT INTO history (product, action, quantity, date) VALUES (?,?,?,?)",
        [name, action, quantity, new Date().toLocaleString()]
      );
      res.json({ message: "Stock updated" });
    }
  );
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  const { name } = req.body;

  db.run(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);

      db.run(
        "INSERT INTO history (product, action, quantity, date) VALUES (?,?,?,?)",
        [name, "Removed product", 0, new Date().toLocaleString()]
      );
      res.json({ message: "Product removed" });
    }
  );
});

// GET HISTORY
app.get("/history", (req, res) => {
  db.all("SELECT * FROM history ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Server running on port " + PORT)
);
