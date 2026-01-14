const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database("./database.db");

db.run(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price REAL,
  stock INTEGER,
  expiry TEXT
)
`);

app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/products", (req, res) => {
  const { name, price, stock, expiry } = req.body;
  db.run(
    "INSERT INTO products (name, price, stock, expiry) VALUES (?,?,?,?)",
    [name, price, stock, expiry],
    () => res.json({ message: "Product added" })
  );
});

app.put("/products/:id", (req, res) => {
  const { stock } = req.body;
  db.run(
    "UPDATE products SET stock=? WHERE id=?",
    [stock, req.params.id],
    () => res.json({ message: "Stock updated" })
  );
});

app.delete("/products/:id", (req, res) => {
  db.run(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    () => res.json({ message: "Product removed" })
  );
});

// IMPORTANT for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});


