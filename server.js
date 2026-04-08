const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy API requests to the backend
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:4000",
    changeOrigin: true,
  }),
);

if (isDev) {
  // In development, proxy to Vite dev servers
  app.use(
    "/issuer/",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
      ws: true,
    }),
  );

  app.use(
    "/verifier/",
    createProxyMiddleware({
      target: "http://localhost:3002",
      changeOrigin: true,
      ws: true,
    }),
  );

  // Redirect root to verifier or issuer
  app.get("/", (req, res) => {
    res.send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>CredChain | Blockchain Credentials</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet" />
          <style>
            :root {
              --bg: #0f172a;
              --bg-soft: #111f3a;
              --text: #f8fafc;
              --muted: #cbd5e1;
              --line: rgba(148, 163, 184, 0.35);
              --issuer: #3b82f6;
              --issuer-soft: rgba(59, 130, 246, 0.22);
              --verifier: #22c55e;
              --verifier-soft: rgba(34, 197, 94, 0.22);
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              font-family: "Inter", "Segoe UI", sans-serif;
              color: var(--text);
              background:
                radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.2), transparent 34%),
                radial-gradient(circle at 90% 15%, rgba(34, 197, 94, 0.18), transparent 30%),
                radial-gradient(circle at 50% 120%, rgba(99, 102, 241, 0.16), transparent 50%),
                var(--bg);
              display: grid;
              place-items: center;
              padding: 30px 20px;
            }

            .shell {
              width: min(1120px, 100%);
              border: 1px solid var(--line);
              border-radius: 30px;
              background: linear-gradient(170deg, rgba(15, 23, 42, 0.94), rgba(17, 31, 58, 0.9));
              box-shadow: 0 28px 80px rgba(2, 6, 23, 0.55);
              overflow: hidden;
              position: relative;
              isolation: isolate;
            }

            .shell::before {
              content: "";
              position: absolute;
              inset: 0;
              background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
              background-size: 28px 28px;
              opacity: 0.22;
              pointer-events: none;
              z-index: -1;
            }

            .header {
              padding: 52px 40px 24px;
              text-align: center;
            }

            .badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 7px 14px;
              border-radius: 999px;
              border: 1px solid rgba(148, 163, 184, 0.45);
              background: rgba(30, 41, 59, 0.7);
              color: #dbeafe;
              font-size: 11px;
              letter-spacing: 0.09em;
              text-transform: uppercase;
              font-weight: 800;
            }

            .title {
              margin: 16px 0 12px;
              font-family: "Playfair Display", Georgia, serif;
              font-size: clamp(34px, 6vw, 60px);
              line-height: 1.08;
              letter-spacing: -0.02em;
              text-wrap: balance;
            }

            .subtitle {
              margin: 0 auto;
              max-width: 760px;
              color: var(--muted);
              font-size: clamp(15px, 2vw, 18px);
              line-height: 1.75;
            }

            .actions {
              padding: 24px 24px 30px;
              display: grid;
              grid-template-columns: repeat(2, minmax(260px, 1fr));
              gap: 18px;
            }

            .card-link {
              text-decoration: none;
              color: inherit;
              border-radius: 24px;
              border: 1px solid rgba(148, 163, 184, 0.3);
              padding: 24px 24px 22px;
              display: flex;
              flex-direction: column;
              gap: 14px;
              min-height: 245px;
              position: relative;
              overflow: hidden;
              transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
            }

            .card-link::before {
              content: "";
              position: absolute;
              top: -80px;
              right: -80px;
              width: 180px;
              height: 180px;
              border-radius: 50%;
              filter: blur(4px);
            }

            .card-link:hover {
              transform: translateY(-6px);
              border-color: rgba(248, 250, 252, 0.45);
            }

            .card-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-weight: 800;
              font-size: 22px;
              letter-spacing: -0.01em;
            }

            .dot {
              width: 10px;
              height: 10px;
              border-radius: 999px;
              box-shadow: 0 0 0 8px rgba(248, 250, 252, 0.08);
            }

            .issuer {
              background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), var(--issuer-soft));
              box-shadow: 0 14px 36px rgba(30, 64, 175, 0.25);
            }

            .issuer::before {
              background: rgba(59, 130, 246, 0.25);
            }

            .issuer .dot {
              background: var(--issuer);
            }

            .verifier {
              background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), var(--verifier-soft));
              box-shadow: 0 14px 36px rgba(20, 83, 45, 0.25);
            }

            .verifier::before {
              background: rgba(34, 197, 94, 0.25);
            }

            .verifier .dot {
              background: var(--verifier);
            }

            .copy {
              color: var(--muted);
              line-height: 1.72;
              font-size: 14px;
            }

            .cta {
              margin-top: auto;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              opacity: 0.98;
            }

            .issuer .cta {
              color: #93c5fd;
            }

            .verifier .cta {
              color: #86efac;
            }

            .foot {
              border-top: 1px solid rgba(148, 163, 184, 0.26);
              padding: 16px 24px 20px;
              color: #94a3b8;
              font-size: 12px;
              text-align: center;
              letter-spacing: 0.04em;
              text-transform: uppercase;
            }

            @media (max-width: 900px) {
              .header {
                padding: 34px 22px 12px;
              }

              .actions {
                grid-template-columns: 1fr;
                padding: 18px 16px 22px;
              }

              .card-link {
                min-height: 220px;
              }
            }
          </style>
        </head>
        <body>
          <main class="shell">
            <section class="header">
              <span class="badge">CredChain Unified Gateway</span>
              <h1 class="title">Blockchain Credential Verification System</h1>
              <p class="subtitle">
                A premium control surface for issuing and validating trusted credentials,
                blending institutional rigor with modern product design.
              </p>
            </section>

            <section class="actions">
              <a class="card-link issuer" href="/issuer/">
                <div class="card-top">
                  <span>Issuer Portal</span>
                  <span class="dot" aria-hidden="true"></span>
                </div>
                <p class="copy">
                  Register approved issuers, create verifiable records, and publish proofs to chain-backed storage.
                </p>
                <span class="cta">Launch Issuer Workspace</span>
              </a>

              <a class="card-link verifier" href="/verifier/">
                <div class="card-top">
                  <span>Verifier App</span>
                  <span class="dot" aria-hidden="true"></span>
                </div>
                <p class="copy">
                  Search credentials, compare on-chain hashes, and instantly detect tampering or missing records.
                </p>
                <span class="cta">Open Verification Console</span>
              </a>
            </section>

            <div class="foot">Issuer Blue + Verifier Green | One Trust Layer</div>
          </main>
        </body>
      </html>
    `);
  });
} else {
  // In production, serve static files
  app.use(
    "/issuer",
    express.static(path.join(__dirname, "issuer-portal/dist")),
  );
  app.use(
    "/verifier",
    express.static(path.join(__dirname, "verifier-app/dist")),
  );

  app.get("/issuer/*", (req, res) => {
    res.sendFile(path.join(__dirname, "issuer-portal/dist/index.html"));
  });

  app.get("/verifier/*", (req, res) => {
    res.sendFile(path.join(__dirname, "verifier-app/dist/index.html"));
  });

  app.get("/", (req, res) => {
    res.redirect("/verifier");
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Root server running on http://localhost:${PORT}`);
  console.log(`- API proxied to http://localhost:4000`);
  if (isDev) {
    console.log(`- Issuer Portal proxied to http://localhost:3001`);
    console.log(`- Verifier App proxied to http://localhost:3002`);
  }
});
