import dotenv from "dotenv";
dotenv.config();

// Environment validation - make database optional for demo
const requiredEnvVars = ['MAPBOX_ACCESS_TOKEN'];
const optionalEnvVars = ['OPENAI_API_KEY', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  console.error('See .env.example for reference.');
  process.exit(1);
}

// Warn about optional environment variables
const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar] || process.env[envVar]?.includes('your-') || process.env[envVar]?.includes('username:password'));
if (missingOptionalVars.length > 0) {
  console.warn('⚠️  Warning: Some optional features may not work properly:');
  missingOptionalVars.forEach(envVar => {
    console.warn(`   - ${envVar} not configured`);
  });
  console.warn('   The app will run with limited functionality.');
  console.warn('');
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./server/routes";
import { setupVite, serveStatic, log } from "./server/vite";
import { setupSwagger } from "./server/swagger";



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Setup API documentation
  setupSwagger(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite only in development mode
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  const host = process.platform === 'win32' ? 'localhost' : '0.0.0.0';
  server.listen(
    {
      port,
      host,
      ...(process.platform !== 'win32' && { reusePort: true }),
    },
    () => {
      log(`serving on port ${port}`);
      log(`Local access: http://localhost:${port}`);
      if (process.platform !== 'win32') {
        log(`Network access: http://10.0.0.214:${port}`);
      }
    }
  );
})();
