require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

/* ================= CONFIG ================= */
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "hashonecareers1234";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}


/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

/* ================= DATABASE ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ================= INIT TABLES ================= */
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        location TEXT NOT NULL,
        experience TEXT NOT NULL,
        job_type TEXT NOT NULL,
        description TEXT NOT NULL,
        formurl TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_content (
        section_key TEXT PRIMARY KEY,
        content JSONB
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        photo TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ PostgreSQL database ready");
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
  }
}

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

/* ================= ADMIN AUTH ================= */

// Admin login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM admins WHERE username=$1",
    [username]
  );

  const admin = result.rows[0];
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

// Verify admin
app.get("/api/admin/me", auth, (req, res) => {
  res.json({ ok: true, id: req.user.id });
});

// One-time admin setup
app.post("/api/admin/setup", async (req, res) => {
  const count = await pool.query("SELECT COUNT(*) FROM admins");
  if (parseInt(count.rows[0].count) > 0) {
    return res.status(403).json({ message: "Admin already set" });
  }

  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  await pool.query(
    "INSERT INTO admins (username, password) VALUES ($1,$2)",
    [username, hash]
  );

  res.json({ success: true });
});

// Manual password change (SAFE)
app.put("/api/admin/change-password", auth, async (req, res) => {
  const { newPassword } = req.body;
  const hash = bcrypt.hashSync(newPassword, 10);

  await pool.query(
    "UPDATE admins SET password=$1 WHERE id=$2",
    [hash, req.user.id]
  );

  res.json({ success: true });
});

/* ================= JOBS ================= */

// Get jobs
app.get("/api/jobs", async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      title,
      location,
      experience,
      job_type AS type,
      description,
      formurl AS "formUrl"
    FROM jobs
    ORDER BY created_at DESC
  `);

  res.json(result.rows);
});


// Create job
app.post("/api/jobs", auth, async (req, res) => {
  const { title, location, experience, type, description, formUrl } = req.body;

  await pool.query(
    `INSERT INTO jobs (title, location, experience, job_type, description, formurl)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [title, location, experience, type, description, formUrl]
  );

  res.json({ success: true });
});

// Update job
app.put("/api/jobs/:id", auth, async (req, res) => {
  const { title, location, experience, type, description, formUrl } = req.body;

  await pool.query(
    `UPDATE jobs
     SET title=$1, location=$2, experience=$3, job_type=$4, description=$5, formurl=$6
     WHERE id=$7`,
    [title, location, experience, type, description, formUrl, req.params.id]
  );

  res.json({ success: true });
});

// Delete job
app.delete("/api/jobs/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM jobs WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

/* ================= SITE CONTENT ================= */

app.get("/api/site-content", async (req, res) => {
  const result = await pool.query("SELECT * FROM site_content");
  const out = {};
  result.rows.forEach(r => out[r.section_key] = r.content || {});
  res.json(out);
});

app.put("/api/site-content", auth, async (req, res) => {
  const { section, data } = req.body;

  await pool.query(
    `INSERT INTO site_content (section_key, content)
     VALUES ($1,$2)
     ON CONFLICT (section_key)
     DO UPDATE SET content=EXCLUDED.content`,
    [section, data]
  );

  res.json({ success: true });
});

/* ================= TEAM MEMBERS ================= */

app.get("/api/team-members", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM team_members ORDER BY sort_order ASC, id ASC"
  );
  res.json(result.rows);
});

app.post("/api/team-members", auth, async (req, res) => {
  const { name, role, bio, photo } = req.body;

  await pool.query(
    `INSERT INTO team_members (name, role, bio, photo)
     VALUES ($1,$2,$3,$4)`,
    [name, role, bio || "", photo || ""]
  );

  res.json({ success: true });
});

app.put("/api/team-members/:id", auth, async (req, res) => {
  const { name, role, bio, photo } = req.body;

  await pool.query(
    `UPDATE team_members
     SET name=$1, role=$2, bio=$3, photo=$4
     WHERE id=$5`,
    [name, role, bio || "", photo || "", req.params.id]
  );

  res.json({ success: true });
});

app.delete("/api/team-members/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM team_members WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

initDB();

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/api/enquiry", async (req, res) => {

  console.log("🔥 ENQUIRY HIT:", req.body);

  const { name, email, phone, message } = req.body;

  try {

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "adhishr61@gmail.com",
      subject: "New Website Enquiry",
      html: `
        <h2>New Enquiry</h2>
        <b>Name:</b> ${name}<br>
        <b>Email:</b> ${email}<br>
        <b>Phone:</b> ${phone}<br>
        <b>Message:</b> ${message}
      `
    });

    console.log("📧 RESEND RESULT:", result);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    res.status(500).json({ error: "Email failed" });
  }

});


/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});