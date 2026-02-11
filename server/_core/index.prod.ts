import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { logger } from "./logger";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function serveStatic(app: express.Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Criar diretório de uploads se não existir
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Servir arquivos estáticos de uploads
  app.use("/uploads", express.static(uploadsDir));

  // Rota de upload de logo
  app.post("/api/upload-logo", async (req, res) => {
    try {
      const { logo } = req.body;
      if (!logo || typeof logo !== "string") {
        return res.status(400).json({ error: "Logo é obrigatório" });
      }

      // Extrair dados do base64
      const matches = logo.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Formato de imagem inválido" });
      }

      const ext = matches[1] === "svg+xml" ? "svg" : matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Gerar nome único para o arquivo
      const filename = `company-logo-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      // Salvar arquivo
      fs.writeFileSync(filepath, buffer);

      // Retornar URL do arquivo
      const logoUrl = `/uploads/${filename}`;
      logger.info("Logo saved:", logoUrl);

      res.json({ logoUrl });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ error: "Erro ao fazer upload do logo" });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Production mode uses static files
  serveStatic(app);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.info(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
