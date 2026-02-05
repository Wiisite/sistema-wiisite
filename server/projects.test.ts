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

describe("projects procedures", () => {
  it("should create a project successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projectData = {
      name: "Redesign E-commerce",
      description: "Projeto de redesign completo",
      status: "development" as const,
      progress: 25,
      value: "15000.00",
      deadline: new Date("2025-06-30"),
    };

    const result = await caller.projects.create(projectData);
    expect(result).toBeDefined();
  });

  it("should list projects", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter projects by status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.list({ status: "development" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update a project successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Primeiro cria um projeto
    const projectData = {
      name: "Projeto Teste Delete",
      description: "Projeto para testar atualização",
      status: "development" as const,
      progress: 10,
      value: "5000.00",
      deadline: new Date("2025-12-31"),
    };

    const created = await caller.projects.create(projectData);
    const projectId = (created as any).insertId || 1;

    // Atualiza o projeto
    const updateResult = await caller.projects.update({
      id: projectId,
      name: "Projeto Atualizado",
      progress: 50,
      status: "design" as const,
    });

    expect(updateResult).toBeDefined();
  });

  it("should delete a project successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Primeiro cria um projeto para deletar
    const projectData = {
      name: "Projeto Teste Delete",
      description: "Projeto para testar exclusão",
      status: "development" as const,
      progress: 10,
      value: "5000.00",
      deadline: new Date("2025-12-31"),
    };

    const created = await caller.projects.create(projectData);
    const projectId = (created as any).insertId || 1;

    // Deleta o projeto
    const deleteResult = await caller.projects.delete({ id: projectId });
    expect(deleteResult).toBeDefined();
  });
});

describe("calendar procedures", () => {
  it("should create a calendar event successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      title: "Reunião com cliente",
      description: "Apresentação do projeto",
      eventType: "meeting" as const,
      startDate: new Date("2025-01-20T10:00:00"),
      endDate: new Date("2025-01-20T11:00:00"),
      location: "Escritório",
    };

    const result = await caller.calendar.create(eventData);
    expect(result).toBeDefined();
  });

  it("should list calendar events for a date range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calendar.events({
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
