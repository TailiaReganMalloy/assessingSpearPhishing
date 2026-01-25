import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import helmet from "helmet";
import csrf from "csurf";
import expressLayouts from "express-ejs-layouts";

import { sessionConfig } from "./config/session.js";
import { attachUserToLocals } from "./middleware/attachUser.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/base");

app.use(expressLayouts);

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    ...sessionConfig,
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: path.join(__dirname, "..", "data"),
    }),
  })
);

app.use(csrf());
app.use(attachUserToLocals);

app.use(express.static(path.join(__dirname, "public")));

app.use(authRoutes);
app.use(messageRoutes);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).render("error", {
      title: "Security Error",
      message: "Invalid CSRF token. Please try again.",
    });
  }

  console.error(err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Unexpected error encountered.",
  });
});

export default app;
