const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const notFound = require("./common/middlewares/not-found");
const errorHandler = require("./common/middlewares/error-handler");

const app = express();

const rawCorsOrigins = process.env.CORS_ORIGINS || "";
const allowedOrigins = rawCorsOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = allowedOrigins.length
  ? {
      origin(origin, callback) {
        // Allow non-browser requests (no origin header) and explicit allowlist.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
    }
  : {};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
