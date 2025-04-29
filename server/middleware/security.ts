import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { validationResult } from "express-validator";
import { logger } from "../utils/logger";
import { SECURITY_CONFIG } from "../../client/src/config/security";

// Rate limiting middleware
export const rateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.rateLimiting.windowMs,
  max: SECURITY_CONFIG.rateLimiting.maxRequests,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      ...SECURITY_CONFIG.csp,
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation failed", {
      path: req.path,
      errors: errors.array(),
      ip: req.ip,
    });
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  
  if (!apiKey) {
    logger.warn("Missing API key", {
      path: req.path,
      ip: req.ip,
    });
    return res.status(401).json({ error: "API key required" });
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn("Invalid API key", {
      path: req.path,
      ip: req.ip,
    });
    return res.status(401).json({ error: "Invalid API key" });
  }

  next();
};

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(500).json({
    error: "An unexpected error occurred",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
}; 