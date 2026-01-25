const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "demo-session-secret-change-me";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  return next();
}

function setAuthLocals(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
}

app.use(setAuthLocals);

let db;

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/inbox");
  }
  return res.render("login", { error: null, form: { email: "", device: "private" } });
});

app.post(
  "/login",
  loginLimiter,
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("device").isIn(["private", "public"]),
  async (req, res) => {
    const errors = validationResult(req);
    const { email, password, device } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).render("login", {
        error: "Please enter a valid email and password.",
        form: { email, device },
      });
    }

    const user = await db.get("SELECT id, email, display_name, password_hash FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).render("login", {
        error: "Invalid login credentials.",
        form: { email, device },
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).render("login", {
        error: "Invalid login credentials.",
        form: { email, device },
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
    };

    req.session.cookie.maxAge = device === "public" ? 30 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    return res.redirect("/inbox");
  }
);

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.get("/inbox", requireAuth, async (req, res) => {
  const messages = await db.all(
    `
      SELECT messages.id, messages.subject, messages.body, messages.created_at,
             sender.display_name as from_name, sender.email as from_email
      FROM messages
      JOIN users sender ON sender.id = messages.from_user_id
      WHERE messages.to_user_id = ?
      ORDER BY messages.created_at DESC
    `,
    [req.session.user.id]
  );

  res.render("inbox", { messages });
});

initDb()
  .then((database) => {
    db = database;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
