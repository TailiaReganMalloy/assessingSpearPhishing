require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const bcrypt = require("bcrypt");

const {
  db,
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  listInbox,
  sendMessage,
  ensureSeedData
} = require("./src/db");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"]
    }
  }
}));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(authLimiter);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use(csrf());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  return next();
}

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/inbox");
  }
  return res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    email: ""
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).render("login", {
      error: "Invalid email or password.",
      email
    });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).render("login", {
      error: "Invalid email or password.",
      email
    });
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  return res.redirect("/inbox");
});

app.get("/register", (req, res) => {
  res.render("register", { error: null, values: {} });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const values = { name, email };

  if (!name || !email || !password) {
    return res.status(400).render("register", {
      error: "All fields are required.",
      values
    });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).render("register", {
      error: "Email already registered.",
      values
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  createUser({ name, email, passwordHash });
  return res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.get("/inbox", requireAuth, (req, res) => {
  const inbox = listInbox(req.session.user.id);
  res.render("inbox", {
    messages: inbox,
    users: listUsers(req.session.user.id)
  });
});

app.post("/send", requireAuth, (req, res) => {
  const { recipientId, subject, body } = req.body;
  if (!recipientId || !subject || !body) {
    return res.status(400).redirect("/inbox");
  }
  sendMessage({
    senderId: req.session.user.id,
    recipientId: Number(recipientId),
    subject,
    body
  });
  return res.redirect("/inbox");
});

app.get("/message/:id", requireAuth, (req, res) => {
  const messageId = Number(req.params.id);
  const message = db
    .prepare(
      `SELECT m.id, m.subject, m.body, m.created_at,
              u.name AS sender_name, u.email AS sender_email
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = ? AND m.recipient_id = ?`
    )
    .get(messageId, req.session.user.id);

  if (!message) {
    return res.status(404).render("message", { message: null });
  }
  return res.render("message", { message });
});

ensureSeedData();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
