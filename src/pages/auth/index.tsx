app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed =
        origin.startsWith("http://localhost") ||
        origin.includes("netlify.app") ||
        origin.includes("vercel.app");

      if (allowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);