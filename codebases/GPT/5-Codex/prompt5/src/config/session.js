const oneDayMs = 1000 * 60 * 60 * 24;

export const sessionConfig = {
  name: "sid",
  secret: process.env.SESSION_SECRET || "development-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: oneDayMs,
  },
};
