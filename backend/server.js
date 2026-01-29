const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const SECRET = "hashonecareers1234";

// ---------------- DATABASE ----------------
const db = new sqlite3.Database("./hashone.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      location TEXT,
      experience TEXT,
      type TEXT,
      description TEXT
    )
  `);

  // Create default admin (once)
  const hashed = bcrypt.hashSync("admin123", 10);
  db.run(
    `INSERT OR IGNORE INTO admin (id, username, password)
     VALUES (1, 'admin', ?)`,
    [hashed]
  );
});

// ---------------- AUTH ----------------
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(" ")[1], SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ---------------- LOGIN ----------------
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM admin WHERE username=?",
    [username],
    (err, admin) => {
      if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ message: "Invalid login" });
      }

      const token = jwt.sign({ id: admin.id }, SECRET, {
        expiresIn: "12h",
      });

      res.json({ token });
    }
  );
});

// ---------------- JOB CRUD ----------------

// GET jobs
app.get("/jobs", (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY id DESC", [], (err, rows) => {
    res.json(rows);
  });
});

// CREATE job
app.post("/jobs", auth, (req, res) => {
  const { title, location, experience, type, description } = req.body;

  db.run(
    `INSERT INTO jobs (title, location, experience, type, description)
     VALUES (?, ?, ?, ?, ?)`,
    [title, location, experience, type, description],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

// UPDATE job
app.put("/jobs/:id", auth, (req, res) => {
  const { title, location, experience, type, description } = req.body;

  db.run(
    `UPDATE jobs SET title=?, location=?, experience=?, type=?, description=? WHERE id=?`,
    [title, location, experience, type, description, req.params.id],
    () => res.json({ success: true })
  );
});

// DELETE job
app.delete("/jobs/:id", auth, (req, res) => {
  db.run("DELETE FROM jobs WHERE id=?", [req.params.id], () =>
    res.json({ success: true })
  );
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});

