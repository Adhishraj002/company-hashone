const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();

/* ================= CONFIG (env-ready for Render) ================= */
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "hashone_secure_secret_2026";
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

/* ================= MIDDLEWARE ================= */
const corsOptions = {
  origin: FRONTEND_URL === "*" ? true : FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));

/* ================= DATABASE ================= */
const dbPath = path.join(__dirname, "hashone.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    job_type TEXT NOT NULL,
    description TEXT NOT NULL,
    formUrl TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );


  db.run(`
    CREATE TABLE IF NOT EXISTS site_content (
    section_key TEXT PRIMARY KEY,
    content TEXT
    )`
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    photo TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

/* ================= AUTH MIDDLEWARE ================= */
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

/* ================= AUTH ROUTES ================= */

// Verify token (for admin page load)
app.get("/api/admin/me", auth, (req, res) => {
  res.json({ ok: true, id: req.user.id });
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM admins WHERE username = ?",
    [username],
    (err, admin) => {
      if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
        expiresIn: "12h",
      });

      res.json({ token });
    }
  );
});

// SETUP or RESET ADMIN
app.post("/api/admin/setup", (req, res) => {
  db.get("SELECT COUNT(*) AS count FROM admins", (err, row) => {
    if (row.count > 0 && !req.query.reset) {
      return res.status(403).json({ message: "Admin already set" });
    }

    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.serialize(() => {
      db.run("DELETE FROM admins");
      db.run(
        "INSERT INTO admins (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        () => res.json({ success: true })
      );
    });
  });
});

/* ================= SITE CONTENT ROUTES ================= */

// PUBLIC – Get all site content (home, about, contact)
app.get("/api/site-content", (req, res) => {
  db.all("SELECT section_key, content FROM site_content", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    const out = {};
    (rows || []).forEach((r) => {
      try {
        out[r.section_key] = r.content ? JSON.parse(r.content) : {};
      } catch (e) {
        out[r.section_key] = {};
      }
    });
    res.json(out);
  });
});

// ADMIN – Update site content section
app.put("/api/site-content", auth, (req, res) => {
  const { section, data } = req.body;
  if (!section || typeof data !== "object") {
    return res.status(400).json({ message: "section and data required" });
  }
  const content = JSON.stringify(data);
  db.run(
    "INSERT INTO site_content (section_key, content) VALUES (?, ?) ON CONFLICT(section_key) DO UPDATE SET content = excluded.content",
    [section, content],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ success: true });
    }
  );
});

/* ================= TEAM MEMBERS ROUTES ================= */

// PUBLIC – Get all team members
app.get("/api/team-members", (req, res) => {
  db.all(
    "SELECT id, name, role, bio, photo FROM team_members ORDER BY sort_order ASC, id ASC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(rows || []);
    }
  );
});

// ADMIN – Create team member
app.post("/api/team-members", auth, (req, res) => {
  const { name, role, bio, photo } = req.body;
  if (!name || !role) {
    return res.status(400).json({ message: "name and role required" });
  }
  db.run(
    "INSERT INTO team_members (name, role, bio, photo, sort_order) VALUES (?, ?, ?, ?, ?)",
    [name, role || "", bio || "", photo || "", 0],
    function (err) {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ success: true, id: this.lastID });
    }
  );
});

// ADMIN – Update team member
app.put("/api/team-members/:id", auth, (req, res) => {
  const { name, role, bio, photo } = req.body;
  const id = req.params.id;
  db.run(
    "UPDATE team_members SET name=?, role=?, bio=?, photo=? WHERE id=?",
    [name || "", role || "", bio || "", photo || "", id],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ success: true });
    }
  );
});

// ADMIN – Delete team member
app.delete("/api/team-members/:id", auth, (req, res) => {
  db.run("DELETE FROM team_members WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ success: true });
  });
});

/* ================= JOB ROUTES ================= */

// PUBLIC – Get all jobs
app.get("/api/jobs", (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows || []);
  });
});

// ADMIN – Create job
app.post("/api/jobs", auth, (req, res) => {
  const { title, location, experience, type, description, formUrl } = req.body;

  if (!title || !location || !experience || !type || !description || !formUrl) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.run(
    `INSERT INTO jobs (title, location, experience, job_type, description, formUrl)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [title, location, experience, type, description, formUrl],
    function (err) {
      if (err) {
        console.error(err);
 
        return res.status(500).json({ message: err.message });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// ADMIN – Update job
app.put("/api/jobs/:id", auth, (req, res) => {
  const { title, location, experience, type, description, formUrl } = req.body;

  
  db.run(
    `UPDATE jobs
    SET title=?, location=?, experience=?, job_type=?, description=?, formUrl=?
    WHERE id=?`,
    [title, location, experience, type, description, formUrl, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ success: true });
    }
  );
});

// ADMIN – Delete job
app.delete("/api/jobs/:id", auth, (req, res) => {
  db.run("DELETE FROM jobs WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ success: true });
  });
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`✅ Hashone backend running at http://localhost:${PORT}`);
});
