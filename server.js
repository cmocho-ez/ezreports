import express from "express";
import helmet from "helmet";
import appcache from "apicache-extra";
import expressLayouts from "express-ejs-layouts";
import chalk from "chalk";
import pino from "pino";
import { rateLimit } from "express-rate-limit";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";

import webRoutes from "./routes/web.js";
import apiRoutes from "./routes/api.js";

import { httpLogger } from "./middleware/logger.js";

/**
 * @class Server
 */
export default class Server {
  constructor() {
    this.server = express();
    this.logger = pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
    });

    (async () => {
      await this.#settings();
      await this.#middlewares();

      this.#routes();
    })();

    this.port = Number(process.env.WEB_PORT) || 3000;
  }

  async #settings() {
    this.logger.info("📝 Loading settings...");

    const packJsonText = await readFile(resolve("package.json"), "utf-8");
    const packJsonParsed = JSON.parse(packJsonText);

    // Config
    const config = {
      version: packJsonParsed.version,
      env: process.env.NODE_ENV || "development",
      database: {
        host: process.env.DB_SERVER || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "",
        port: process.env.DB_PORT || 3306,
      },
    };

    // User preferences. TODO: Load from a database.
    const userPrefs = {
      theme: "light",
      lang: "en",
    };

    this.server.set("config", config);
    this.server.set("userPrefs", userPrefs);

    this.server.set("view engine", "ejs");
    this.server.set("views", "views");
    this.server.set("layout", "layouts/private.ejs");
  }

  async #middlewares() {
    this.logger.info("🛠️ Loading middlewares...");

    // Logger
    this.server.use(httpLogger);

    // Layout
    this.server.use(expressLayouts);

    // Cache
    let cache = appcache.middleware;
    this.server.use(cache("15 minutes"));

    // Rate limiter
    const limiter = rateLimit({
      windowMs: (Number(process.env.WEB_RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
      limit: Number(process.env.WEB_RATE_LIMIT_MAX_REQUESTS) || 100,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      skipFailedRequests: true,
      skip: (req, res) => {
        const skip = req.path.startsWith("/style") || req.path.startsWith("/scripts") || req.path.startsWith("/assets");
        return skip;
      },
      handler: (req, res) => {
        const config = res.app.get("config") ?? {};
        const userPrefs = res.app.get("userPrefs") ?? {};

        res.status(429).render("errors/429", {
          config,
          userPrefs,
          layout: "layouts/public.ejs",
          error: { message: "Woah! You're hammering our server, hang in there a minute, cowboy..." },
        });
      },
    });

    this.server.use(limiter);

    // Static files
    this.server.use(express.static(resolve(import.meta.dirname, "www")));

    // Body parser
    this.server.use(express.json({ limit: process.env.MAX_FILE_SIZE || "100MB" }));

    this.server.use(
      express.urlencoded({
        extended: false,
        limit: process.env.MAX_FILE_SIZE || "100MB",
      })
    );

    // Security
    this.server.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
  }

  #routes() {
    this.logger.info("🚦 Configuring routes...");

    this.server.use("/", webRoutes);
    this.server.use("api/", apiRoutes);

    // Error handling: 400, 403, 404, 429, 500
    this.server.use((err, req, res, next) => {
      const config = res.app.get("config") ?? {};
      const userPrefs = res.app.get("userPrefs") ?? {};

      const error = {
        message: err.message ?? "Something went wrong. Please try again later.",
        code: err.code,
        stack: err.stack,
      };

      if ([400, 403, 404, 429].includes(error.code)) {
        return res.status(error.code).render(`errors/${error.code}`, {
          layout: "layouts/public.ejs",
          config,
          userPrefs,
          error,
        });
      }

      return res.status(500).render("errors/500", {
        layout: "layouts/public.ejs",
        config,
        userPrefs,
        error,
      });
    });

    // 404
    this.server.use("*", (req, res) => {
      const config = res.app.get("config") ?? {};
      const userPrefs = res.app.get("userPrefs") ?? {};

      return res.status(404).render("errors/404.ejs", {
        layout: "layouts/public.ejs",
        config,
        userPrefs,
      });
    });
  }

  start() {
    try {
      this.server.listen(this.port, () => {
        this.logger.info(`✅ ${chalk.yellow("WEB Server")} is up at ${chalk.blue(`http://localhost:${this.port}`)}`);
      });
    } catch (error) {
      this.logger.error(`❌ ${chalk.red("Error starting WEB Server")}`);
      this.logger.error(error);
    }
  }
}
