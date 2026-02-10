import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("accounts payable procedures", () => {
  it("should list accounts payable without filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accountsPayable.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list accounts payable with status filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accountsPayable.list({ status: "pending" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((account) => {
      expect(account.account.status).toBe("pending");
    });
  });

  it("should list overdue accounts payable", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accountsPayable.list({ status: "overdue" });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("accounts receivable procedures", () => {
  it("should list accounts receivable without filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accountsReceivable.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list accounts receivable with status filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accountsReceivable.list({ status: "pending" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((account) => {
      expect(account.account.status).toBe("pending");
    });
  });

  it("should list received accounts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.accountsReceivable.list({ status: "received" });

    expect(Array.isArray(result)).toBe(true);
  });
});
