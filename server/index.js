const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "capacity",
  user: process.env.DB_USER || "capacity",
  password: process.env.DB_PASSWORD,
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET env var is required");
  process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

// GET /api/state — public
app.get("/api/state", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM app_state WHERE id = 'default'"
    );
    res.json(result.rows[0]?.data ?? null);
  } catch (err) {
    console.error("GET /api/state:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT /api/state — editors only
app.put("/api/state", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO app_state (id, data, updated_at)
       VALUES ('default', $1, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
      [req.body]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/state:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, email: user.email });
  } catch (err) {
    console.error("POST /api/auth/login:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ email: req.user.email });
});

// POST /api/auth/logout — client discards token; server is stateless
app.post("/api/auth/logout", (req, res) => {
  res.json({ ok: true });
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
