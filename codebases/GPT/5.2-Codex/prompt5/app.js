const path = require("path");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const csrf = require("csurf");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const inboxRoutes = require("./routes/inbox");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:"]
      }
    }
  })
);
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: "bluemind.sid",
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 30
    }
  })
);

app.use(csrf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use("/", authRoutes);
app.use("/", inboxRoutes);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).render("error", {
      message: "Invalid or missing security token. Please refresh and try again."
    });
  }
  return next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", {
    message: "Unexpected error. Please try again."
  });
});

app.listen(PORT, () => {
  console.log(`BlueMind demo running on http://localhost:${PORT}`);
});
