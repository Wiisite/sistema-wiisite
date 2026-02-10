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

describe("orders procedures", () => {
  it("should list orders without filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list orders with status filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list({ status: "pending" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((order) => {
      expect(order.order.status).toBe("pending");
    });
  });

  it("should list orders with date range filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-12-31");

    const result = await caller.orders.list({ startDate, endDate });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("order status transitions", () => {
  it("should update order status to approved", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get an existing order
    const orders = await caller.orders.list();
    
    if (orders.length > 0) {
      const orderId = orders[0].order.id;
      const result = await caller.orders.updateStatus({ 
        id: orderId, 
        status: "approved" 
      });

      expect(result).toBeDefined();
    }
  });
});
