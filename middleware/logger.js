import pino from "pino";

const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});

const httpLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    if (res.statusCode >= 400) {
      logger.error({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

      return;
    }

    // Ignore if coming from static assets
    if (
      req.originalUrl.includes("/assets/") ||
      req.originalUrl.includes("/scripts/") ||
      req.originalUrl.includes("/styles/")
    ) {
      return;
    }

    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

export { httpLogger };
