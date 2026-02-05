import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Usuário de desenvolvimento para testes sem OAuth
const devUser: User = {
  id: 1,
  openId: "dev-user-001",
  name: "Desenvolvedor",
  email: "dev@wiisite.com.br",
  loginMethod: "development",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Em modo de desenvolvimento sem OAuth configurado, usar usuário de dev
  const isDev = process.env.NODE_ENV === "development";
  const hasOAuth = Boolean(process.env.OAUTH_SERVER_URL);

  if (isDev && !hasOAuth) {
    user = devUser;
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
