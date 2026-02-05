import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getMonthlyFinancialAlerts } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CUSTOMERS ============
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCustomers(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        document: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().max(2).optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const customer = {
          ...input,
          email: input.email || null,
          createdBy: ctx.user.id,
        };
        return await db.createCustomer(customer);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        document: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().max(2).optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        if (data.email === "") data.email = null as any;
        return await db.updateCustomer(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCustomer(input.id);
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: protectedProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getProducts(input?.activeOnly);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["product", "service"]),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/),
        unit: z.string().default("un"),
        category: z.string().optional(),
        active: z.enum(["yes", "no"]).default("yes"),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = {
          ...input,
          createdBy: ctx.user.id,
        };
        return await db.createProduct(product);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        type: z.enum(["product", "service"]).optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        unit: z.string().optional(),
        category: z.string().optional(),
        active: z.enum(["yes", "no"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateProduct(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProduct(input.id);
      }),
  }),

  // ============ SUPPLIERS ============
  suppliers: router({
    list: protectedProcedure.query(async () => {
      return await db.getSuppliers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupplierById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        document: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const supplier = {
          ...input,
          email: input.email || null,
          createdBy: ctx.user.id,
        };
        return await db.createSupplier(supplier);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        document: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        if (data.email === "") data.email = null as any;
        return await db.updateSupplier(id, data);
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getOrders(input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        orderNumber: z.string(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.string(),
          unitPrice: z.string(),
          subtotal: z.string(),
        })),
        totalAmount: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { items, ...orderData } = input;
        const order = {
          ...orderData,
          status: "pending" as const,
          createdBy: ctx.user.id,
        };
        return await db.createOrder(order, items);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        customerId: z.number().optional(),
        orderNumber: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.string(),
          unitPrice: z.string(),
          subtotal: z.string(),
        })).optional(),
        totalAmount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, items, ...orderData } = input;
        return await db.updateOrder(id, orderData, items);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "in_production", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        return await db.updateOrderStatus(input.id, input.status);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteOrder(input.id);
      }),
  }),

  // ============ FINANCIAL CATEGORIES ============
  financialCategories: router({
    list: protectedProcedure
      .input(z.object({ type: z.enum(["expense", "income"]).optional() }).optional())
      .query(async ({ input }) => {
        return await db.getFinancialCategories(input?.type);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["expense", "income"]),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const category = {
          ...input,
          createdBy: ctx.user.id,
        };
        return await db.createFinancialCategory(category);
      }),
  }),

  // ============ ACCOUNTS PAYABLE ============
  accountsPayable: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAccountsPayable(input);
      }),

    create: protectedProcedure
      .input(z.object({
        supplierId: z.number().optional(),
        categoryId: z.number().optional(),
        description: z.string().min(1),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        dueDate: z.date(),
        notes: z.string().optional(),
        installments: z.number().min(1).max(120).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAccountPayableWithInstallments({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        supplierId: z.number().optional(),
        categoryId: z.number().optional(),
        description: z.string().min(1).optional(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAccountPayable(id, data);
      }),

    markAsPaid: protectedProcedure
      .input(z.object({
        id: z.number(),
        paymentDate: z.date(),
      }))
      .mutation(async ({ input }) => {
        return await db.markAccountPayableAsPaid(input.id, input.paymentDate);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAccountPayable(input.id);
      }),

    deleteAll: protectedProcedure
      .mutation(async () => {
        return await db.deleteAllAccountsPayable();
      }),
  }),

  // ============ ACCOUNTS RECEIVABLE ============
  accountsReceivable: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAccountsReceivable(input);
      }),

    create: protectedProcedure
      .input(z.object({
        orderId: z.number().optional(),
        customerId: z.number(),
        description: z.string().min(1),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        dueDate: z.date(),
        notes: z.string().optional(),
        installments: z.number().min(1).max(120).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAccountReceivableWithInstallments({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        orderId: z.number().optional(),
        customerId: z.number().optional(),
        description: z.string().min(1).optional(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAccountReceivable(id, data);
      }),

    markAsReceived: protectedProcedure
      .input(z.object({
        id: z.number(),
        receivedDate: z.date(),
      }))
      .mutation(async ({ input }) => {
        return await db.markAccountReceivableAsReceived(input.id, input.receivedDate);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteAccountReceivable(input.id);
      }),

    deleteAll: protectedProcedure
      .mutation(async () => {
        return await db.deleteAllAccountsReceivable();
      }),
  }),

  // ============ PROJECTS ============
  projects: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getProjects(input);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        customerId: z.number().optional(),
        status: z.enum(["project", "development", "design", "review", "launched", "cancelled"]),
        progress: z.number().min(0).max(100),
        value: z.string().regex(/^\d+(\.\d{1,2})?$/),
        deadline: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = {
          ...input,
          createdBy: ctx.user.id,
        };
        return await db.createProject(project);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        customerId: z.number().optional(),
        status: z.enum(["project", "development", "design", "review", "launched", "cancelled"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        value: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        deadline: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateProject(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProject(input.id);
      }),

    // Checklist
    getChecklists: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectChecklists(input.projectId);
      }),

    createChecklist: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1),
        order: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProjectChecklist(input);
      }),

    updateChecklist: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        completed: z.number().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateProjectChecklist(id, data);
      }),

    deleteChecklist: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteProjectChecklist(input.id);
      }),

    updateProgress: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateProjectProgressFromChecklists(input.projectId);
      }),
  }),

  // ============ CALENDAR ============
  calendar: router({
      events: protectedProcedure
        .input(z.object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        }).optional())
        .query(async ({ input }) => {
          return await getCalendarEvents(input);
        }),
      financialAlerts: protectedProcedure
        .input(z.object({
          year: z.number(),
          month: z.number(),
        }))
        .query(async ({ input }) => {
          return await getMonthlyFinancialAlerts(input.year, input.month);
        }),
      create: protectedProcedure
        .input(z.object({
          title: z.string(),
          description: z.string().optional(),
          eventType: z.enum(["meeting", "visit", "call", "other"]),
          startDate: z.date(),
          endDate: z.date(),
          customerId: z.number().optional(),
          projectId: z.number().optional(),
          location: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          return await createCalendarEvent({ ...input, createdBy: ctx.user.id });
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            eventType: z.enum(["meeting", "visit", "call", "other"]).optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            customerId: z.number().optional(),
            projectId: z.number().optional(),
            location: z.string().optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          return await updateCalendarEvent(input.id, input.data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          return await deleteCalendarEvent(input.id);
        }),
    }),

  // ============ LEADS / CRM ============
  leads: router({
    list: protectedProcedure
      .input(z.object({
        stage: z.string().optional(),
        assignedTo: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getLeads(input);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        company: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        source: z.enum(["website", "referral", "cold_call", "social_media", "event", "other"]),
        stage: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new"),
        estimatedValue: z.string().optional(),
        assignedTo: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createLead({ ...input, createdBy: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          company: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          source: z.enum(["website", "referral", "cold_call", "social_media", "event", "other"]).optional(),
          stage: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
          estimatedValue: z.string().optional(),
          assignedTo: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateLead(input.id, input.data);
      }),
    activities: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLeadActivities(input.leadId);
      }),
    createActivity: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        activityType: z.enum(["call", "meeting", "email", "follow_up", "note"]),
        subject: z.string(),
        description: z.string().optional(),
        scheduledDate: z.date().optional(),
        status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createLeadActivity({ ...input, createdBy: ctx.user.id });
      }),
    deleteAll: protectedProcedure
      .mutation(async () => {
        return await db.deleteAllLeads();
      }),
  }),

  // ============ PROPOSALS ============
  proposals: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getProposals(input);
      }),
    create: protectedProcedure
      .input(z.object({
        leadId: z.number().optional(),
        customerId: z.number().optional(),
        title: z.string(),
        description: z.string().optional(),
        totalValue: z.string(),
        estimatedTax: z.string().optional(),
        validUntil: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createProposal({ ...input, status: "draft", createdBy: ctx.user.id });
      }),
    items: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProposalItems(input.proposalId);
      }),
  }),

  // ============ CONTRACTS ============
  contracts: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        customerId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getContracts(input);
      }),
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        contractType: z.enum(["maintenance", "hosting", "support", "other"]),
        monthlyValue: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        renewalDate: z.date().optional(),
        adjustmentRate: z.string().optional(),
        billingDay: z.number().default(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createContract({ ...input, status: "active", createdBy: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          customerId: z.number().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          contractType: z.enum(["maintenance", "hosting", "support", "software_license", "other"]).optional(),
          monthlyValue: z.string().optional(),
          startDate: z.date().optional(),
          status: z.enum(["active", "suspended", "cancelled", "expired"]).optional(),
          endDate: z.date().optional(),
          renewalDate: z.date().optional(),
          billingDay: z.number().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateContract(input.id, input.data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteContract(input.id);
      }),
    items: protectedProcedure
      .input(z.object({ contractId: z.number() }))
      .query(async ({ input }) => {
        return await db.getContractItems(input.contractId);
      }),
  }),

  // ============ TASKS ============
  tasks: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        projectId: z.number().optional(),
        assignedTo: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getTasks(input);
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        projectId: z.number().optional(),
        assignedTo: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        estimatedHours: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTask({ ...input, status: "todo", createdBy: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["todo", "in_progress", "review", "done", "cancelled"]).optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          assignedTo: z.number().optional(),
          dueDate: z.date().optional(),
          completedDate: z.date().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateTask(input.id, input.data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTask(input.id);
      }),

    // Checklist
    getChecklists: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskChecklists(input.taskId);
      }),

    createChecklist: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        title: z.string().min(1),
        order: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createTaskChecklist(input);
      }),

    updateChecklist: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        completed: z.number().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTaskChecklist(id, data);
      }),

    deleteChecklist: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTaskChecklist(input.id);
      }),

    getChecklistProgress: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTaskChecklistProgress(input.taskId);
      }),
  }),

  // ============ TIME ENTRIES ============
  timeEntries: router({
    list: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        projectId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getTimeEntries(input);
      }),
    create: protectedProcedure
      .input(z.object({
        taskId: z.number().optional(),
        projectId: z.number().optional(),
        description: z.string().optional(),
        hours: z.string(),
        date: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTimeEntry({ ...input, userId: ctx.user.id });
      }),
  }),

  // ============ TICKETS / SUPPORT ============
  tickets: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        customerId: z.number().optional(),
        assignedTo: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getTickets(input);
      }),
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        subject: z.string(),
        description: z.string(),
        category: z.enum(["bug", "adjustment", "content", "financial", "other"]),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        sla: z.enum(["4h", "24h", "72h"]).default("24h"),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTicket({ ...input, status: "open", createdBy: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]).optional(),
          assignedTo: z.number().optional(),
          resolvedDate: z.date().optional(),
          closedDate: z.date().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        return await db.updateTicket(input.id, input.data);
      }),
    comments: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTicketComments(input.ticketId);
      }),
    createComment: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        comment: z.string(),
        isInternal: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createTicketComment({ ...input, createdBy: ctx.user.id });
      }),
  }),

  // ============ RECURRING EXPENSES ============
  recurringExpenses: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getRecurringExpenses(input);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.enum(["electricity", "water", "phone", "internet", "rent", "insurance", "software", "maintenance", "other"]),
        supplierId: z.number().optional(),
        amount: z.string(),
        frequency: z.enum(["monthly", "quarterly", "yearly"]),
        dayOfMonth: z.number().min(1).max(31),
        startDate: z.date(),
        endDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createRecurringExpense({ ...input, createdBy: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "paused", "cancelled"]).optional(),
        amount: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateRecurringExpense(id, data);
      }),
    markAsPaid: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.markRecurringExpenseAsPaid(input.id, ctx.user.id);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteRecurringExpense(input.id);
      }),
    deleteAll: protectedProcedure
      .mutation(async () => {
        return await db.deleteAllRecurringExpenses();
      }),
    generateMonthlyBills: protectedProcedure
      .input(z.object({ month: z.number(), year: z.number() }).optional())
      .mutation(async ({ ctx }) => {
        return await db.generateRecurringExpensesBills(ctx.user.id);
      }),
  }),
  
  productSubscriptions: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), customerId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getProductSubscriptions(input);
      }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        customerId: z.number(),
        frequency: z.enum(["monthly", "quarterly", "yearly"]),
        price: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        nextBillingDate: z.date(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createProductSubscription({ ...input, createdBy: ctx.user.id, status: "active" });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "paused", "cancelled"]).optional(),
        price: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateProductSubscription(id, data);
      }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    stats: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getDashboardStats(input?.startDate, input?.endDate);
      }),

    cashFlow: protectedProcedure
      .input(z.object({ year: z.number() }))
      .query(async ({ input }) => {
        return await db.getMonthlyCashFlow(input.year);
      }),

    paymentsDueToday: protectedProcedure
      .query(async () => {
        return await db.getPaymentsDueToday();
      }),

    recurringExpensesDueToday: protectedProcedure
      .query(async () => {
        return await db.getRecurringExpensesDueToday();
      }),
  }),

  budgets: router({
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["draft", "sent", "approved", "rejected"]).optional(),
        customerId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getBudgets(input || {});
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBudgetById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number().optional(),
        customerName: z.string().optional(),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        customerDocument: z.string().optional(),
        customerAddress: z.string().optional(),
        customerCity: z.string().optional(),
        customerState: z.string().optional(),
        customerZipCode: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        laborCost: z.number(),
        laborHours: z.number(),
        laborRate: z.number().optional(),
        materialCost: z.number(),
        thirdPartyCost: z.number(),
        otherDirectCosts: z.number(),
        indirectCostsTotal: z.number(),
        profitMargin: z.number(),
        cbsRate: z.number().optional(),
        ibsRate: z.number().optional(),
        irpjRate: z.number().optional(),
        csllRate: z.number().optional(),
        notes: z.string().optional(),
        selectedProducts: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.number(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Buscar configurações fiscais
        const taxConfig = await db.getTaxSettings();
        if (!taxConfig) throw new TRPCError({ code: "NOT_FOUND", message: "Configurações fiscais não encontradas" });

        // Usar impostos do input se fornecidos, senão usar das configurações
        const cbsRate = input.cbsRate ?? Number(taxConfig.cbsRate);
        const ibsRate = input.ibsRate ?? Number(taxConfig.ibsRate);
        const irpjRate = input.irpjRate ?? Number(taxConfig.irpjRate);
        const csllRate = input.csllRate ?? Number(taxConfig.csllRate);

        // Calcular custos
        const totalDirectCosts = input.laborCost + input.materialCost + input.thirdPartyCost + input.otherDirectCosts;
        const totalCosts = totalDirectCosts + input.indirectCostsTotal;

        // Calcular preço bruto (custo + margem)
        const grossValue = input.profitMargin >= 100 ? totalCosts : totalCosts / (1 - (input.profitMargin / 100));

        // Calcular impostos sobre consumo
        const cbsAmount = grossValue * (cbsRate / 100);
        const ibsAmount = grossValue * (ibsRate / 100);
        const totalConsumptionTaxes = cbsAmount + ibsAmount;

        // Receita líquida após impostos de consumo
        const netRevenue = grossValue - totalConsumptionTaxes;

        // Lucro antes de IRPJ/CSLL
        const profitBeforeTaxes = netRevenue - totalCosts;

        // Simular IRPJ e CSLL
        const irpjAmount = profitBeforeTaxes * (irpjRate / 100);
        const csllAmount = profitBeforeTaxes * (csllRate / 100);

        // Lucro líquido final
        const netProfit = profitBeforeTaxes - irpjAmount - csllAmount;

        const budgetData = {
          ...input,
          cbsRate: cbsRate.toString(),
          ibsRate: ibsRate.toString(),
          irpjRate: irpjRate.toString(),
          csllRate: csllRate.toString(),
          totalDirectCosts,
          totalCosts,
          grossValue,
          cbsAmount,
          ibsAmount,
          totalConsumptionTaxes,
          netRevenue,
          profitBeforeTaxes,
          irpjAmount,
          csllAmount,
          netProfit,
          finalPrice: grossValue,
          taxRegime: taxConfig.taxRegime,
          createdBy: ctx.user.id,
        };

        const result = await db.createBudget(budgetData as any);
        
        // Salvar produtos selecionados como items do orçamento
        if (input.selectedProducts && input.selectedProducts.length > 0) {
          const budgetId = Number(result[0].insertId);
          await db.saveBudgetItems(budgetId, input.selectedProducts);
        }
        
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        customerId: z.number().optional(),
        customerName: z.string().optional(),
        customerEmail: z.string().optional(),
        customerPhone: z.string().optional(),
        customerDocument: z.string().optional(),
        customerAddress: z.string().optional(),
        customerCity: z.string().optional(),
        customerState: z.string().optional(),
        customerZipCode: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        laborCost: z.number().optional(),
        laborHours: z.number().optional(),
        laborRate: z.number().optional(),
        materialCost: z.number().optional(),
        thirdPartyCost: z.number().optional(),
        otherDirectCosts: z.number().optional(),
        indirectCostsTotal: z.number().optional(),
        profitMargin: z.number().optional(),
        cbsRate: z.number().optional(),
        ibsRate: z.number().optional(),
        irpjRate: z.number().optional(),
        csllRate: z.number().optional(),
        status: z.enum(["draft", "sent", "approved", "rejected"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        
        // Se estiver editando custos, recalcular tudo
        if (rest.laborCost !== undefined || rest.materialCost !== undefined || 
            rest.thirdPartyCost !== undefined || rest.otherDirectCosts !== undefined ||
            rest.indirectCostsTotal !== undefined || rest.profitMargin !== undefined) {
          
          const taxConfig = await db.getTaxSettings();
          if (!taxConfig) throw new TRPCError({ code: "NOT_FOUND", message: "Configurações fiscais não encontradas" });
          
          // Buscar orçamento atual para pegar valores não alterados
          const current = await db.getBudgetById(id);
          if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
          
          const laborCost = rest.laborCost !== undefined ? rest.laborCost : Number(current.budget.laborCost);
          const materialCost = rest.materialCost !== undefined ? rest.materialCost : Number(current.budget.materialCost);
          const thirdPartyCost = rest.thirdPartyCost !== undefined ? rest.thirdPartyCost : Number(current.budget.thirdPartyCost);
          const otherDirectCosts = rest.otherDirectCosts !== undefined ? rest.otherDirectCosts : Number(current.budget.otherDirectCosts);
          const indirectCostsTotal = rest.indirectCostsTotal !== undefined ? rest.indirectCostsTotal : Number(current.budget.indirectCostsTotal);
          const profitMargin = rest.profitMargin !== undefined ? rest.profitMargin : Number(current.budget.profitMargin);
          
          // Calcular custos
          const totalDirectCosts = laborCost + materialCost + thirdPartyCost + otherDirectCosts;
          const totalCosts = totalDirectCosts + indirectCostsTotal;
          const grossValue = totalCosts / (1 - (profitMargin / 100));
          const cbsAmount = grossValue * (Number(taxConfig.cbsRate) / 100);
          const ibsAmount = grossValue * (Number(taxConfig.ibsRate) / 100);
          const totalConsumptionTaxes = cbsAmount + ibsAmount;
          const netRevenue = grossValue - totalConsumptionTaxes;
          const profitBeforeTaxes = netRevenue - totalCosts;
          const irpjAmount = profitBeforeTaxes * (Number(taxConfig.irpjRate) / 100);
          const csllAmount = profitBeforeTaxes * (Number(taxConfig.csllRate) / 100);
          const netProfit = profitBeforeTaxes - irpjAmount - csllAmount;
          
          const data: any = {
            ...rest,
            totalDirectCosts,
            totalCosts,
            grossValue,
            cbsAmount,
            ibsAmount,
            totalConsumptionTaxes,
            netRevenue,
            profitBeforeTaxes,
            irpjAmount,
            csllAmount,
            netProfit,
            finalPrice: grossValue,
          };
          
          return await db.updateBudget(id, data);
        }
        
        // Converter campos numéricos para string se existirem
        const data: any = { ...rest };
        if (data.laborCost !== undefined) data.laborCost = data.laborCost.toString();
        if (data.laborHours !== undefined) data.laborHours = data.laborHours.toString();
        if (data.materialCost !== undefined) data.materialCost = data.materialCost.toString();
        if (data.thirdPartyCost !== undefined) data.thirdPartyCost = data.thirdPartyCost.toString();
        if (data.otherDirectCosts !== undefined) data.otherDirectCosts = data.otherDirectCosts.toString();
        if (data.indirectCostsTotal !== undefined) data.indirectCostsTotal = data.indirectCostsTotal.toString();
        if (data.profitMargin !== undefined) data.profitMargin = data.profitMargin.toString();
        
        return await db.updateBudget(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteBudget(input.id);
      }),

    deleteAll: protectedProcedure
      .mutation(async () => {
        return await db.deleteAllBudgets();
      }),

    exportPDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { generateBudgetPDF } = await import("./budgetPDF");
        const result = await db.getBudgetById(input.id);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Orçamento não encontrado" });
        
        // Buscar items do orçamento (produtos/serviços)
        const budgetItems = await db.getBudgetItems(input.id);
        const items = budgetItems.map(bi => ({
          productName: bi.product?.name || bi.item.description,
          description: bi.item.description,
        }));
        
        const pdfBuffer = await generateBudgetPDF({ ...result, items });
        return {
          pdf: pdfBuffer.toString("base64"),
          filename: `orcamento-${input.id.toString().padStart(6, "0")}.pdf`,
        };
      }),

    convertToOrder: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.convertBudgetToOrder(input.id, ctx.user.id);
      }),

    createProject: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await db.createProjectFromBudget(input.id, ctx.user.id);
      }),

    generatePDFForWhatsApp: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.getBudgetById(input.id);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Or\u00e7amento n\u00e3o encontrado" });
        }
        
        // Gerar PDF
        const { generateBudgetPDF } = await import("./budgetPDF");
        const pdfBuffer = await generateBudgetPDF(result);
        
        // Upload para S3
        const { storagePut } = await import("./storage");
        const filename = `orcamento-${result.budget.budgetNumber || input.id}.pdf`;
        const fileKey = `budgets/${ctx.user.id}/${Date.now()}-${filename}`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        
        return {
          url,
          filename,
          customerName: result.budget.customerName || "Cliente",
          budgetNumber: result.budget.budgetNumber || `#${input.id}`,
          customerPhone: result.budget.customerPhone || null,
        };
      }),
  }),

  budgetTemplates: router({
    list: protectedProcedure
      .query(async () => {
        return await db.getBudgetTemplates();
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBudgetTemplateById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        laborCost: z.number(),
        laborHours: z.number(),
        materialCost: z.number(),
        thirdPartyCost: z.number(),
        otherDirectCosts: z.number(),
        indirectCostsTotal: z.number(),
        profitMargin: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createBudgetTemplate({
          name: input.name,
          description: input.description,
          laborCost: input.laborCost.toString(),
          laborHours: input.laborHours.toString(),
          materialCost: input.materialCost.toString(),
          thirdPartyCost: input.thirdPartyCost.toString(),
          otherDirectCosts: input.otherDirectCosts.toString(),
          indirectCostsTotal: input.indirectCostsTotal.toString(),
          profitMargin: input.profitMargin.toString(),
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        laborCost: z.number().optional(),
        laborHours: z.number().optional(),
        materialCost: z.number().optional(),
        thirdPartyCost: z.number().optional(),
        otherDirectCosts: z.number().optional(),
        indirectCostsTotal: z.number().optional(),
        profitMargin: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        const data: any = {};
        if (rest.name !== undefined) data.name = rest.name;
        if (rest.description !== undefined) data.description = rest.description;
        if (rest.laborCost !== undefined) data.laborCost = rest.laborCost.toString();
        if (rest.laborHours !== undefined) data.laborHours = rest.laborHours.toString();
        if (rest.materialCost !== undefined) data.materialCost = rest.materialCost.toString();
        if (rest.thirdPartyCost !== undefined) data.thirdPartyCost = rest.thirdPartyCost.toString();
        if (rest.otherDirectCosts !== undefined) data.otherDirectCosts = rest.otherDirectCosts.toString();
        if (rest.indirectCostsTotal !== undefined) data.indirectCostsTotal = rest.indirectCostsTotal.toString();
        if (rest.profitMargin !== undefined) data.profitMargin = rest.profitMargin.toString();
        return await db.updateBudgetTemplate(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteBudgetTemplate(input.id);
      }),
  }),

  taxSettings: publicProcedure.query(async () => {
    return await db.getTaxSettings();
  }),
});





export type AppRouter = typeof appRouter;
