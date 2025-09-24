import dotenv from "dotenv";

// Load demo configuration
dotenv.config({ path: '.env.demo' });
dotenv.config(); // Still load regular .env as fallback

// Demo mode security middleware
const isDemoMode = process.env.DEMO_MODE === 'true';
const demoPassword = process.env.DEMO_PASSWORD || 'demo123';

console.log('🎪 DEMO MODE ENABLED - Limited functionality for security');
console.log('📧 Contact: your-email@company.com for full version access');

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./server/routes";
import { setupVite, serveStatic, log } from "./server/vite";

const app = express();

// Demo authentication middleware
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    // Skip auth for health check
    if (req.path === '/health') return next();

    const authHeader = req.headers.authorization;
    const providedPassword = authHeader?.replace('Bearer ', '') || req.query.demo_key;

    if (isDemoMode && providedPassword !== demoPassword) {
        return res.status(401).json({
            error: 'Demo access required',
            message: 'This is a protected demo. Contact us for access.',
            contact: 'your-email@company.com'
        });
    }

    next();
});

// Security headers for demo
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Demo-Mode', 'true');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
});

// Rate limiting for demo
const requestCounts = new Map();
app.use((req: Request, res: Response, next: NextFunction) => {
    if (!isDemoMode) return next();

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const count = requestCounts.get(ip) || 0;

    if (count > 100) { // 100 requests per session
        return res.status(429).json({ error: 'Demo rate limit exceeded' });
    }

    requestCounts.set(ip, count + 1);
    next();
});

// Rest of your server code...
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyObj, ...args) {
        capturedJsonResponse = bodyObj;
        return originalResJson.apply(res, [bodyObj, ...args]);
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

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        // Don't expose stack traces in demo mode
        if (isDemoMode) {
            res.status(status).json({ message: "Demo error - contact support" });
        } else {
            res.status(status).json({ message });
        }

        console.error(err); // Still log for debugging
    });

    // Setup Vite only in development mode
    if (app.get("env") === "development") {
        await setupVite(app, server);
    } else {
        serveStatic(app);
    }

    const port = 5000;
    server.listen(
        {
            port,
            host: "0.0.0.0",
            reusePort: true,
        },
        () => {
            log(`🎪 DEMO SERVER serving on port ${port}`);
            log(`Local access: http://localhost:${port}`);
            log(`Network access: http://10.0.0.214:${port}`);
            if (isDemoMode) {
                log(`🔒 Demo password: ${demoPassword}`);
                log(`📧 Contact for full access: your-email@company.com`);
            }
        }
    );
})();