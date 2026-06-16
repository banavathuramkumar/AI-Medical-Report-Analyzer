const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors());

// Rate limiting to secure API Gateway endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  message: { error: "Too many requests from this IP, please try again later." }
});
app.use(limiter);

// Service endpoint targets from env variables (with local dev fallbacks)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL || "http://localhost:5002";

// Reverse proxy setups
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "", // strip /api/auth
    },
    onError: (err, req, res) => {
      console.error("Auth proxy error:", err);
      res.status(502).json({ error: "Auth service is currently unavailable" });
    }
  })
);

app.use(
  "/api/reports",
  createProxyMiddleware({
    target: REPORT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/reports": "", // strip /api/reports
    },
    onError: (err, req, res) => {
      console.error("Report proxy error:", err);
      res.status(502).json({ error: "Report service is currently unavailable" });
    }
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "API Gateway" });
});

// Catch-all fallback
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found on Gateway" });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
