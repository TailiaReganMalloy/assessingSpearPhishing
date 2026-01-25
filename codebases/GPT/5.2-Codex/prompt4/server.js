const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const helmet = require("helmet");
const csrf = require("csurf");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const initDb = async () => {
  await runAsync(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

  await runAsync(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(recipient_id) REFERENCES users(id)
    )`
  );

  const count = await getAsync("SELECT COUNT(*) AS count FROM users");
  if (count.count === 0) {
    const now = new Date().toISOString();
    const aliceHash = await bcrypt.hash("Password123!", 12);
    const bobHash = await bcrypt.hash("Password123!", 12);

    const alice = await runAsync(
      "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
      ["alice@bluemind.net", "Alice", aliceHash, now]
    );

    const bob = await runAsync(
      "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
      ["bob@bluemind.net", "Bob", bobHash, now]
    );

    await runAsync(
      "INSERT INTO messages (sender_id, recipient_id, subject, body, created_at) VALUES (?, ?, ?, ?, ?)",
      [
        alice.lastID,
        bob.lastID,
        "Welcome to BlueMind",
        "This is a demo message showing how user-to-user messaging works.",
        now
      ]
    );
  }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.db", dir: dataDir }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  next();
});

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  return next();
};

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/inbox");
  }
  return res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null, email: "" });
});

app.post("/login", async (req, res) => {
  const { email, password, device } = req.body;
  if (!email || !password) {
    return res.render("login", {
      error: "Email and password are required.",
      email: email || ""
    });
  }

  const user = await getAsync("SELECT * FROM users WHERE email = ?", [
    email.toLowerCase()
  ]);

  if (!user) {
    return res.render("login", {
      error: "Invalid credentials.",
      email
    });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.render("login", {
      error: "Invalid credentials.",
      email
    });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name
  };

  req.session.cookie.maxAge = device === "public" ? 1000 * 60 * 30 : 1000 * 60 * 60 * 8;

  return res.redirect("/inbox");
});

app.get("/register", (req, res) => {
  res.render("register", { error: null, values: {} });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const values = { name, email };

  if (!name || !email || !password) {
    return res.render("register", {
      error: "All fields are required.",
      values
    });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.render("register", {
      error: "Enter a valid email address.",
      values
    });
  }

  if (password.length < 10) {
    return res.render("register", {
      error: "Use at least 10 characters for the password.",
      values
    });
  }

  const existing = await getAsync("SELECT id FROM users WHERE email = ?", [
    email.toLowerCase()
  ]);

  if (existing) {
    return res.render("register", {
      error: "An account with that email already exists.",
      values
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();

  await runAsync(
    "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)",
    [email.toLowerCase(), name, passwordHash, now]
  );

  return res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/inbox", requireAuth, async (req, res) => {
  const messages = await allAsync(
    `SELECT m.id, m.subject, m.created_at, u.name AS sender_name, u.email AS sender_email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.recipient_id = ?
     ORDER BY m.created_at DESC`,
    [req.session.user.id]
  );

  res.render("inbox", { messages });
});

app.get("/message/:id", requireAuth, async (req, res) => {
  const message = await getAsync(
    `SELECT m.id, m.subject, m.body, m.created_at, u.name AS sender_name, u.email AS sender_email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = ? AND m.recipient_id = ?`,
    [req.params.id, req.session.user.id]
  );

  if (!message) {
    return res.status(404).render("not-found");
  }

  res.render("message", { message });
});

app.get("/compose", requireAuth, async (req, res) => {
  const recipients = await allAsync(
    "SELECT id, name, email FROM users WHERE id <> ? ORDER BY name",
    [req.session.user.id]
  );

  res.render("compose", { error: null, recipients, values: {} });
});

app.post("/compose", requireAuth, async (req, res) => {
  const { recipientId, subject, body } = req.body;
  const recipients = await allAsync(
    "SELECT id, name, email FROM users WHERE id <> ? ORDER BY name",
    [req.session.user.id]
  );
  const values = { recipientId, subject, body };

  if (!recipientId || !subject || !body) {
    return res.render("compose", {
      error: "All fields are required.",
      recipients,
      values
    });
  }

  await runAsync(
    "INSERT INTO messages (sender_id, recipient_id, subject, body, created_at) VALUES (?, ?, ?, ?, ?)",
    [req.session.user.id, recipientId, subject.trim(), body.trim(), new Date().toISOString()]
  );

  res.redirect("/inbox");
});

app.use((req, res) => {
  res.status(404).render("not-found");
});

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).render("error", {
      title: "Session expired",
      message: "Your session expired. Please refresh and try again."
    });
  }

  return next(err);
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database", err);
    process.exit(1);
  });
