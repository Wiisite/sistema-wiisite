import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { createHash } from "crypto";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function registerAuthRoutes(app: Express) {
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Find user by email
      const user = await db.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      // Check password
      if (!user.password || !verifyPassword(password, user.password)) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Register route (only for first user or admin)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      // Check if this is the first user (will be admin)
      const allUsers = await db.getAllUsers();
      const isFirstUser = allUsers.length === 0;

      // Generate unique openId
      const openId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Create user
      await db.upsertUser({
        openId,
        name,
        email,
        password: hashPassword(password),
        loginMethod: "local",
        role: isFirstUser ? "admin" : "user",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByEmail(email);

      if (!user) {
        return res.status(500).json({ error: "Erro ao criar usuário" });
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ 
        success: true, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        isFirstUser 
      });
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Erro ao registrar usuário" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });

  // Check auth status
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ 
        authenticated: true, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      });
    } catch (error) {
      res.json({ authenticated: false, user: null });
    }
  });

  // Check if any users exist (for showing register vs login)
  app.get("/api/auth/has-users", async (req: Request, res: Response) => {
    try {
      const allUsers = await db.getAllUsers();
      res.json({ hasUsers: allUsers.length > 0 });
    } catch (error) {
      res.json({ hasUsers: false });
    }
  });
}
