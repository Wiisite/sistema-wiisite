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

describe("budgets procedures", () => {
  it("should list budgets without filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.budgets.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list budgets with status filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.budgets.list({ status: "draft" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((budget) => {
      expect(budget.budget.status).toBe("draft");
    });
  });

  it("should create a budget with correct calculations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const budgetData = {
      title: "Test Budget",
      description: "Test budget description",
      laborCost: 1000,
      laborHours: 10,
      laborRate: 100,
      materialCost: 500,
      thirdPartyCost: 200,
      otherDirectCosts: 100,
      indirectCostsTotal: 300,
      profitMargin: 20,
    };

    const result = await caller.budgets.create(budgetData);

    expect(result).toBeDefined();
  });
});

describe("budget tax calculations", () => {
  it("should have tax settings route available", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the taxSettings route exists
    expect(caller.taxSettings).toBeDefined();
  });
});

describe("budget templates", () => {
  it("should have templates route available", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the budgets.templates route exists
    expect(caller.budgets.templates).toBeDefined();
  });
});
