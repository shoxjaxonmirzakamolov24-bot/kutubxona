import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { join } from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve static frontend files when built (for Render.com single-service deployment)
const staticDir = process.env.STATIC_DIR
  || join(process.cwd(), "artifacts/medical-learning/dist/public");

if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  // Fallback to index.html for React Router client-side routing
  app.get("*", (_req, res) => {
    res.sendFile(join(staticDir, "index.html"));
  });
}

export default app;
