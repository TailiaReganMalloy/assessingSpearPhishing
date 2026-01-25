const path = require("path");
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const helmet = require("helmet");
const csrf = require("csurf");
const bcrypt = require("bcrypt");
const {
  initDb,
  getUserByEmail,
  getUserById,
  getInboxMessages,
  getMessageById
} = require("./db");

const PORT = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.db", dir: path.join(__dirname, "data") }),
    secret: "replace-this-with-a-secure-random-secret",
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

app.use(async (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  if (req.session.userId) {
    const user = await getUserById(app.locals.db, req.session.userId);
    res.locals.currentUser = user || null;
  } else {
    res.locals.currentUser = null;
  }
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }
  next();
}

app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/inbox");
    return;
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null, email: "" });
});

app.post("/login", async (req, res) => {
  const { email, password, deviceType } = req.body;
  const user = await getUserByEmail(app.locals.db, email.trim().toLowerCase());

  if (!user) {
    res.status(401).render("login", {
      error: "Invalid credentials.",
      email
    });
    return;
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    res.status(401).render("login", {
      error: "Invalid credentials.",
      email
    });
    return;
  }

  req.session.userId = user.id;
  if (deviceType === "public") {
    req.session.cookie.maxAge = 1000 * 60 * 20;
  } else {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 8;
  }

  res.redirect("/inbox");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.get("/inbox", requireAuth, async (req, res) => {
  const messages = await getInboxMessages(app.locals.db, req.session.userId);
  res.render("inbox", { messages });
});

app.get("/messages/:id", requireAuth, async (req, res) => {
  const message = await getMessageById(
    app.locals.db,
    Number(req.params.id),
    req.session.userId
  );

  if (!message) {
    res.status(404).render("message", { message: null });
    return;
  }

  res.render("message", { message });
});

app.use((err, req, res, next) => {
  if (err && err.code === "EBADCSRFTOKEN") {
    res.status(403).send("Invalid CSRF token.");
    return;
  }
  next(err);
});

initDb()
  .then((db) => {
    app.locals.db = db;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
