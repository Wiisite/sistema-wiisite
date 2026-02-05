import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
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

describe("recurring expenses module", () => {
  it("should list recurring expenses", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.recurringExpenses.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a recurring expense successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.recurringExpenses.create({
      name: "Conta de Luz - Teste",
      category: "electricity",
      amount: "350.00",
      frequency: "monthly",
      dayOfMonth: 10,
      startDate: new Date(),
    });

    expect(result).toBeDefined();
  });
});

describe("product subscriptions module", () => {
  it("should list product subscriptions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.productSubscriptions.list();

    expect(Array.isArray(result)).toBe(true);
  });
});
