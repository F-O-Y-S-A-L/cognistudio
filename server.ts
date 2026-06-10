import { app } from "./src/server/app";
export { app };
import path from "path";
import express from "express";

const PORT = 3000;

// Vite middleware setup
if (process.env.NODE_ENV !== "production") {
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
      console.log("[DEBUG] Vite dev server middleware mounted successfully.");
    }).catch(err => {
      console.error("Failed to start Vite server:", err);
    });
  }).catch(err => {
    console.error("Failed to dynamically load Vite:", err);
  });
} else if (!process.env.VERCEL) {
  // Standard Node.js environment: serve built static assets
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log("[DEBUG] Static client assets middleware mounted for standard node environment.");
}

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
