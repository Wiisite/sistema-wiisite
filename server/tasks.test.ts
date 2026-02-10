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

describe("tasks procedures", () => {
  it("should list tasks without filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list tasks with status filter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.list({ status: "todo" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((task) => {
      expect(task.task.status).toBe("todo");
    });
  });

  it("should list in-progress tasks", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.list({ status: "in_progress" });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list tasks by project", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get projects first
    const projects = await caller.projects.list();
    
    if (projects.length > 0) {
      const projectId = projects[0].project.id;
      const result = await caller.tasks.list({ projectId });

      expect(Array.isArray(result)).toBe(true);
      result.forEach((task) => {
        expect(task.task.projectId).toBe(projectId);
      });
    }
  });
});

describe("tickets procedures", () => {
  it("should list tickets without filters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tickets.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should list open tickets", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tickets.list({ status: "open" });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((ticket) => {
      expect(ticket.ticket.status).toBe("open");
    });
  });
});
