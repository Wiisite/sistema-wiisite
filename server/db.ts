import { and, desc, eq, gte, inArray, lt, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  customers,
  InsertCustomer,
  products,
  InsertProduct,
  orders,
  InsertOrder,
  orderItems,
  InsertOrderItem,
  suppliers,
  InsertSupplier,
  financialCategories,
  InsertFinancialCategory,
  accountsPayable,
  InsertAccountPayable,
  accountsReceivable,
  InsertAccountReceivable,
  projects,
  InsertProject,
  calendarEvents,
  InsertCalendarEvent,
  leads,
  InsertLead,
  leadActivities,
  InsertLeadActivity,
  proposals,
  InsertProposal,
  proposalItems,
  InsertProposalItem,
  contracts,
  InsertContract,
  contractItems,
  tasks,
  InsertTask,
  timeEntries,
  InsertTimeEntry,
  tickets,
  InsertTicket,
  ticketComments,
  InsertTicketComment,
  projectChecklists,
  InsertProjectChecklist,
  taskChecklists,
  InsertTaskChecklist,
  recurringExpenses,
  InsertRecurringExpense,
  productSubscriptions,
  InsertProductSubscription,
  budgets,
  InsertBudget,
  budgetItems,
  InsertBudgetItem,
  budgetTemplates,
  InsertBudgetTemplate,
  taxSettings,
  InsertTaxSetting,
  companySettings,
  InsertCompanySetting,
  OrderStatus,
  AccountPayableStatus,
  AccountReceivableStatus,
  ProjectStatus,
  LeadStage,
  ProposalStatus,
  ContractStatus,
  TaskStatus,
  TicketStatus,
  RecurringExpenseStatus,
  RecurringExpenseCategory,
  SubscriptionStatus,
  BudgetStatus
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Adicionar configuração para suportar pacotes maiores
      const connectionUrl = process.env.DATABASE_URL;
      _db = drizzle(connectionUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "password", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return await db.select().from(users);
}

// ============ CUSTOMER HELPERS ============

export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customers).values(customer);
  return result;
}

export async function getCustomers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(customers).where(eq(customers.createdBy, userId)).orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Desvincular registros que referenciam este cliente
  await db.update(orders).set({ customerId: null }).where(eq(orders.customerId, id));
  await db.update(budgets).set({ customerId: null }).where(eq(budgets.customerId, id));
  await db.update(projects).set({ customerId: null }).where(eq(projects.customerId, id));
  await db.update(calendarEvents).set({ customerId: null }).where(eq(calendarEvents.customerId, id));
  await db.update(proposals).set({ customerId: null }).where(eq(proposals.customerId, id));
  await db.delete(accountsReceivable).where(eq(accountsReceivable.customerId, id));
  await db.delete(contracts).where(eq(contracts.customerId, id));
  await db.delete(tickets).where(eq(tickets.customerId, id));
  await db.delete(productSubscriptions).where(eq(productSubscriptions.customerId, id));

  return await db.delete(customers).where(eq(customers.id, id));
}

// ============ PRODUCT HELPERS ============

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values(product);
  return result;
}

export async function getProducts(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  if (activeOnly) {
    return await db.select().from(products).where(eq(products.active, "yes")).orderBy(desc(products.createdAt));
  }

  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(products).where(eq(products.id, id));
}

// ============ ORDER HELPERS ============

export async function createOrder(order: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const orderResult = await db.insert(orders).values(order);
  const orderId = Number(orderResult[0].insertId);

  const itemsWithOrderId = items.map(item => ({ ...item, orderId }));
  await db.insert(orderItems).values(itemsWithOrderId);

  return orderId;
}

export async function getOrders(filters?: { status?: OrderStatus; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }
  if (filters?.startDate) {
    conditions.push(gte(orders.orderDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(orders.orderDate, filters.endDate));
  }

  const baseQuery = db.select({
    order: orders,
    customer: customers
  }).from(orders).leftJoin(customers, eq(orders.customerId, customers.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(orders.createdAt));
  }

  return await baseQuery.orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const orderResult = await db.select({
    order: orders,
    customer: customers
  }).from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (orderResult.length === 0) return undefined;

  const items = await db.select({
    item: orderItems,
    product: products
  }).from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));

  return {
    ...orderResult[0],
    items
  };
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrder(
  id: number,
  orderData: Partial<InsertOrder>,
  items?: Omit<InsertOrderItem, 'orderId'>[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Atualizar dados do pedido
  if (Object.keys(orderData).length > 0) {
    await db.update(orders).set(orderData).where(eq(orders.id, id));
  }

  // Se items foram fornecidos, atualizar itens
  if (items && items.length > 0) {
    // Deletar itens antigos
    await db.delete(orderItems).where(eq(orderItems.orderId, id));

    // Inserir novos itens
    const itemsWithOrderId = items.map(item => ({ ...item, orderId: id }));
    await db.insert(orderItems).values(itemsWithOrderId);
  }

  return id;
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar itens do pedido primeiro (foreign key)
  await db.delete(orderItems).where(eq(orderItems.orderId, id));

  // Deletar o pedido
  await db.delete(orders).where(eq(orders.id, id));

  return { success: true };
}

// ============ SUPPLIER HELPERS ============

export async function createSupplier(supplier: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(suppliers).values(supplier);
  return result;
}

export async function getSuppliers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0];
}

export async function updateSupplier(id: number, data: Partial<InsertSupplier>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

// ============ FINANCIAL CATEGORY HELPERS ============

export async function createFinancialCategory(category: InsertFinancialCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(financialCategories).values(category);
  return result;
}

export async function getFinancialCategories(type?: "expense" | "income") {
  const db = await getDb();
  if (!db) return [];

  if (type) {
    return await db.select().from(financialCategories).where(eq(financialCategories.type, type));
  }

  return await db.select().from(financialCategories);
}

// ============ ACCOUNTS PAYABLE HELPERS ============

export async function createAccountPayable(account: InsertAccountPayable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(accountsPayable).values(account);
  return result;
}

export async function createAccountPayableWithInstallments(data: InsertAccountPayable & { installments?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const installments = data.installments || 1;

  // Se for apenas 1 parcela, cria normalmente
  if (installments === 1) {
    return await createAccountPayable(data);
  }

  // Calcula o valor de cada parcela
  const totalAmount = parseFloat(data.amount);
  const installmentAmount = totalAmount / installments;
  const roundedInstallmentAmount = Math.floor(installmentAmount * 100) / 100; // Arredonda para baixo
  const lastInstallmentAmount = totalAmount - (roundedInstallmentAmount * (installments - 1)); // Última parcela compensa diferença

  // Cria as parcelas
  const payablesToCreate = [];
  let firstPayableId: number | null = null;

  for (let i = 0; i < installments; i++) {
    const dueDate = new Date(data.dueDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const isLastInstallment = i === installments - 1;
    const amount = isLastInstallment ? lastInstallmentAmount.toFixed(2) : roundedInstallmentAmount.toFixed(2);

    const payable: InsertAccountPayable = {
      ...data,
      amount,
      dueDate,
      description: `${data.description} (${i + 1}/${installments})`,
      installmentNumber: i + 1,
      totalInstallments: installments,
      parentPayableId: firstPayableId,
    };

    const result: any = await db.insert(accountsPayable).values(payable);

    // Guarda o ID da primeira parcela para usar nas próximas
    if (i === 0) {
      firstPayableId = Number(result[0].insertId);
    }
  }

  return { success: true, installmentsCreated: installments };
}

export async function getAccountsPayable(filters?: { status?: AccountPayableStatus; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(accountsPayable.status, filters.status));
  }
  if (filters?.startDate) {
    conditions.push(gte(accountsPayable.dueDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(accountsPayable.dueDate, filters.endDate));
  }

  const baseQuery = db.select({
    account: accountsPayable,
    supplier: suppliers,
    category: financialCategories
  }).from(accountsPayable)
    .leftJoin(suppliers, eq(accountsPayable.supplierId, suppliers.id))
    .leftJoin(financialCategories, eq(accountsPayable.categoryId, financialCategories.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(accountsPayable.dueDate));
  }

  return await baseQuery.orderBy(desc(accountsPayable.dueDate));
}

export async function updateAccountPayable(id: number, data: Partial<InsertAccountPayable>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(accountsPayable).set(data).where(eq(accountsPayable.id, id));
}

export async function markAccountPayableAsPaid(id: number, paymentDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(accountsPayable).set({ status: "paid", paymentDate }).where(eq(accountsPayable.id, id));
}

export async function deleteAccountPayable(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(accountsPayable).where(eq(accountsPayable.id, id));
}

export async function deleteAllAccountsPayable() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(accountsPayable);
}

// ============ ACCOUNTS RECEIVABLE HELPERS ============

export async function createAccountReceivable(account: InsertAccountReceivable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(accountsReceivable).values(account);
  return result;
}

export async function createAccountReceivableWithInstallments(data: InsertAccountReceivable & { installments?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const installments = data.installments || 1;
  const totalAmount = parseFloat(data.amount as string);
  const installmentAmount = (totalAmount / installments).toFixed(2);

  // Se for apenas 1 parcela, criar normalmente
  if (installments === 1) {
    return await db.insert(accountsReceivable).values({
      ...data,
      installmentNumber: 1,
      totalInstallments: 1,
      parentReceivableId: null,
    });
  }

  // Criar múltiplas parcelas
  const accounts: any[] = [];
  let firstAccountId: number | null = null;

  for (let i = 1; i <= installments; i++) {
    // Calcular data de vencimento (adicionar meses)
    const dueDate = new Date(data.dueDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));

    // Ajustar última parcela para evitar diferenças de arredondamento
    const amount = i === installments
      ? (totalAmount - (parseFloat(installmentAmount) * (installments - 1))).toFixed(2)
      : installmentAmount;

    const accountData: any = {
      ...data,
      amount: amount,
      dueDate: dueDate,
      description: `${data.description} (${i}/${installments})`,
      installmentNumber: i,
      totalInstallments: installments,
      parentReceivableId: i === 1 ? null : firstAccountId,
    };

    const result: any = await db.insert(accountsReceivable).values(accountData);

    // Guardar ID da primeira parcela
    if (i === 1) {
      firstAccountId = result.insertId as number;
    }

    accounts.push(result);
  }

  return { success: true, installmentsCreated: installments };
}

export async function getAccountsReceivable(filters?: { status?: AccountReceivableStatus; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(accountsReceivable.status, filters.status));
  }
  if (filters?.startDate) {
    conditions.push(gte(accountsReceivable.dueDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(accountsReceivable.dueDate, filters.endDate));
  }

  const baseQuery = db.select({
    account: accountsReceivable,
    customer: customers,
    order: orders
  }).from(accountsReceivable)
    .leftJoin(customers, eq(accountsReceivable.customerId, customers.id))
    .leftJoin(orders, eq(accountsReceivable.orderId, orders.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(accountsReceivable.dueDate));
  }

  return await baseQuery.orderBy(desc(accountsReceivable.dueDate));
}

export async function updateAccountReceivable(id: number, data: Partial<InsertAccountReceivable>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(accountsReceivable).set(data).where(eq(accountsReceivable.id, id));
}

export async function markAccountReceivableAsReceived(id: number, receivedDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(accountsReceivable).set({ status: "received", receivedDate }).where(eq(accountsReceivable.id, id));
}

export async function deleteAccountReceivable(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(accountsReceivable).where(eq(accountsReceivable.id, id));
}

export async function deleteAllAccountsReceivable() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(accountsReceivable);
}

// ============ DASHBOARD HELPERS ============

export async function getDashboardStats(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [];
  if (startDate) conditions.push(gte(orders.orderDate, startDate));
  if (endDate) conditions.push(lte(orders.orderDate, endDate));

  // Total de vendas
  const salesQuery = db.select({
    total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`
  }).from(orders).where(and(...conditions, eq(orders.status, "completed")));

  // Contas a pagar
  const payableQuery = db.select({
    pending: sql<string>`COALESCE(SUM(CASE WHEN ${accountsPayable.status} = 'pending' THEN ${accountsPayable.amount} ELSE 0 END), 0)`,
    paid: sql<string>`COALESCE(SUM(CASE WHEN ${accountsPayable.status} = 'paid' THEN ${accountsPayable.amount} ELSE 0 END), 0)`,
  }).from(accountsPayable);

  // Contas a receber
  const receivableQuery = db.select({
    pending: sql<string>`COALESCE(SUM(CASE WHEN ${accountsReceivable.status} = 'pending' THEN ${accountsReceivable.amount} ELSE 0 END), 0)`,
    received: sql<string>`COALESCE(SUM(CASE WHEN ${accountsReceivable.status} = 'received' THEN ${accountsReceivable.amount} ELSE 0 END), 0)`,
  }).from(accountsReceivable);

  const [salesResult, payableResult, receivableResult] = await Promise.all([
    salesQuery,
    payableQuery,
    receivableQuery
  ]);

  return {
    totalSales: parseFloat(salesResult[0]?.total || "0"),
    accountsPayable: {
      pending: parseFloat(payableResult[0]?.pending || "0"),
      paid: parseFloat(payableResult[0]?.paid || "0"),
    },
    accountsReceivable: {
      pending: parseFloat(receivableResult[0]?.pending || "0"),
      received: parseFloat(receivableResult[0]?.received || "0"),
    }
  };
}

// ============ PROJECT HELPERS ============

export async function getProjects(filters?: { status?: ProjectStatus }) {
  const db = await getDb();
  if (!db) return [];

  const baseQuery = db.select({
    project: projects,
    customer: customers,
  }).from(projects).leftJoin(customers, eq(projects.customerId, customers.id));

  if (filters?.status) {
    return await baseQuery.where(eq(projects.status, filters.status)).orderBy(desc(projects.createdAt));
  }

  return await baseQuery.orderBy(desc(projects.createdAt));
}

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values(project);
  return result;
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(projects).where(eq(projects.id, id));
}

// ============ CALENDAR EVENT HELPERS ============

export async function getCalendarEvents(filters?: { startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  // Buscar eventos do calendário
  const eventsBaseQuery = db.select({
    event: calendarEvents,
    customer: customers,
    project: projects,
  }).from(calendarEvents)
    .leftJoin(customers, eq(calendarEvents.customerId, customers.id))
    .leftJoin(projects, eq(calendarEvents.projectId, projects.id));

  const events = filters?.startDate && filters?.endDate
    ? await eventsBaseQuery.where(and(
      gte(calendarEvents.startDate, filters.startDate),
      lte(calendarEvents.endDate, filters.endDate)
    )).orderBy(calendarEvents.startDate)
    : await eventsBaseQuery.orderBy(calendarEvents.startDate);

  // Buscar tarefas com prazo
  const tasksBaseQuery = db.select({
    task: tasks,
    project: projects,
  }).from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id));

  const tasksData = filters?.startDate && filters?.endDate
    ? await tasksBaseQuery.where(and(
      gte(tasks.dueDate, filters.startDate),
      lte(tasks.dueDate, filters.endDate)
    )).orderBy(tasks.dueDate)
    : await tasksBaseQuery.orderBy(tasks.dueDate);

  // Buscar contas a pagar com vencimento
  const payablesBaseQuery = db.select({
    payable: accountsPayable,
    supplier: suppliers,
    category: financialCategories,
  }).from(accountsPayable)
    .leftJoin(suppliers, eq(accountsPayable.supplierId, suppliers.id))
    .leftJoin(financialCategories, eq(accountsPayable.categoryId, financialCategories.id));

  const payables = filters?.startDate && filters?.endDate
    ? await payablesBaseQuery.where(and(
      gte(accountsPayable.dueDate, filters.startDate),
      lte(accountsPayable.dueDate, filters.endDate)
    )).orderBy(accountsPayable.dueDate)
    : await payablesBaseQuery.orderBy(accountsPayable.dueDate);

  // Buscar contas a receber com vencimento
  const receivablesBaseQuery = db.select({
    receivable: accountsReceivable,
    customer: customers,
    order: orders,
  }).from(accountsReceivable)
    .leftJoin(customers, eq(accountsReceivable.customerId, customers.id))
    .leftJoin(orders, eq(accountsReceivable.orderId, orders.id));

  const receivables = filters?.startDate && filters?.endDate
    ? await receivablesBaseQuery.where(and(
      gte(accountsReceivable.dueDate, filters.startDate),
      lte(accountsReceivable.dueDate, filters.endDate)
    )).orderBy(accountsReceivable.dueDate)
    : await receivablesBaseQuery.orderBy(accountsReceivable.dueDate);

  // Buscar despesas recorrentes ativas
  const recurringExpensesData = await db.select({
    expense: recurringExpenses,
    supplier: suppliers,
  }).from(recurringExpenses)
    .leftJoin(suppliers, eq(recurringExpenses.supplierId, suppliers.id))
    .where(eq(recurringExpenses.status, "active"));

  // Consolidar todos os eventos
  const allEvents: any[] = [];

  // Adicionar eventos do calendário
  events.forEach(e => {
    allEvents.push({
      type: 'event',
      id: e.event.id,
      title: e.event.title,
      description: e.event.description,
      startDate: e.event.startDate,
      endDate: e.event.endDate,
      eventType: e.event.eventType,
      customerId: e.event.customerId,
      projectId: e.event.projectId,
      customer: e.customer,
      project: e.project,
      location: e.event.location,
    });
  });

  // Adicionar tarefas
  tasksData.forEach(t => {
    if (t.task.dueDate) {
      allEvents.push({
        type: 'task',
        id: `task-${t.task.id}`,
        title: `[Tarefa] ${t.task.title}`,
        description: t.task.description,
        startDate: t.task.dueDate,
        endDate: t.task.dueDate,
        status: t.task.status,
        priority: t.task.priority,
        project: t.project,
      });
    }
  });

  // Adicionar contas a pagar
  payables.forEach(p => {
    allEvents.push({
      type: 'payable',
      id: `payable-${p.payable.id}`,
      title: `[A Pagar] ${p.supplier?.name || 'Fornecedor'} - ${p.category?.name || ''}`,
      description: p.payable.description,
      startDate: p.payable.dueDate,
      endDate: p.payable.dueDate,
      amount: p.payable.amount,
      status: p.payable.status,
      supplier: p.supplier,
      category: p.category,
    });
  });

  // Adicionar contas a receber
  receivables.forEach(r => {
    allEvents.push({
      type: 'receivable',
      id: `receivable-${r.receivable.id}`,
      title: `[A Receber] ${r.customer?.name || 'Cliente'}`,
      description: r.receivable.description,
      startDate: r.receivable.dueDate,
      endDate: r.receivable.dueDate,
      amount: r.receivable.amount,
      status: r.receivable.status,
      customer: r.customer,
      order: r.order,
    });
  });

  // Adicionar despesas recorrentes (gerar eventos para os próximos meses)
  if (filters?.startDate && filters?.endDate) {
    recurringExpensesData.forEach(re => {
      const startMonth = filters.startDate!.getMonth();
      const startYear = filters.startDate!.getFullYear();
      const endMonth = filters.endDate!.getMonth();
      const endYear = filters.endDate!.getFullYear();

      // Gerar evento para cada mês no período
      for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 0;
        const monthEnd = year === endYear ? endMonth : 11;

        for (let month = monthStart; month <= monthEnd; month++) {
          const dayOfMonth = typeof re.expense.dayOfMonth === 'string' ? parseInt(re.expense.dayOfMonth) : re.expense.dayOfMonth;
          const eventDate = new Date(year, month, dayOfMonth);

          // Verificar se a data está no período
          if (eventDate >= filters.startDate! && eventDate <= filters.endDate!) {
            allEvents.push({
              type: 'recurring',
              id: `recurring-${re.expense.id}-${year}-${month}`,
              title: `[Despesa Recorrente] ${re.expense.name}`,
              description: `${re.supplier?.name || ''} - ${re.expense.frequency}`,
              startDate: eventDate,
              endDate: eventDate,
              amount: re.expense.amount,
              supplier: re.supplier,
              frequency: re.expense.frequency,
            });
          }
        }
      }
    });
  }

  // Ordenar todos os eventos por data
  allEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return allEvents;
}

export async function createCalendarEvent(event: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(calendarEvents).values(event);
  return result;
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

export async function getMonthlyCashFlow(year: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const receivables = await db.execute(sql`
      SELECT MONTH(receivedDate) as month, SUM(amount) as amount
      FROM accountsReceivable
      WHERE status = 'received'
        AND receivedDate IS NOT NULL
        AND YEAR(receivedDate) = ${year}
      GROUP BY MONTH(receivedDate)
    `);

    const payables = await db.execute(sql`
      SELECT MONTH(paymentDate) as month, SUM(amount) as amount
      FROM accountsPayable
      WHERE status = 'paid'
        AND paymentDate IS NOT NULL
        AND YEAR(paymentDate) = ${year}
      GROUP BY MONTH(paymentDate)
    `);

    interface MonthlyAmount { month: number; amount: string }
    const receivablesData = (receivables[0] as unknown) as MonthlyAmount[];
    const payablesData = (payables[0] as unknown) as MonthlyAmount[];

    const cashFlow = [];
    for (let month = 1; month <= 12; month++) {
      const income = receivablesData.find((r) => r.month === month);
      const expense = payablesData.find((p) => p.month === month);

      cashFlow.push({
        month,
        income: parseFloat(income?.amount || "0"),
        expense: parseFloat(expense?.amount || "0"),
        balance: parseFloat(income?.amount || "0") - parseFloat(expense?.amount || "0")
      });
    }

    return cashFlow;
  } catch (error) {
    console.error("Error in getMonthlyCashFlow:", error);
    // Return empty data for all months instead of failing
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      balance: 0
    }));
  }
}

export async function getPaymentsDueToday() {
  const db = await getDb();
  if (!db) return { accounts: [], totalAmount: 0, count: 0 };

  try {
    // Pegar data de hoje (início e fim do dia)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar contas a pagar que vencem hoje e estão pendentes
    const accounts = await db.select({
      account: accountsPayable,
      supplier: suppliers,
      category: financialCategories
    })
      .from(accountsPayable)
      .leftJoin(suppliers, eq(accountsPayable.supplierId, suppliers.id))
      .leftJoin(financialCategories, eq(accountsPayable.categoryId, financialCategories.id))
      .where(
        and(
          eq(accountsPayable.status, 'pending'),
          gte(accountsPayable.dueDate, today),
          lt(accountsPayable.dueDate, tomorrow)
        )
      );

    // Calcular total
    const totalAmount = accounts.reduce((sum, row) => {
      return sum + parseFloat(row.account.amount);
    }, 0);

    return {
      accounts,
      totalAmount,
      count: accounts.length
    };
  } catch (error) {
    console.error("Error in getPaymentsDueToday:", error);
    return { accounts: [], totalAmount: 0, count: 0 };
  }
}

export async function getRecurringExpensesDueToday() {
  const db = await getDb();
  if (!db) return { expenses: [], totalAmount: 0, count: 0 };

  try {
    const today = new Date();
    const currentDay = today.getDate();

    // Buscar despesas recorrentes ativas que vencem hoje
    const expenses = await db.select({
      expense: recurringExpenses,
      supplier: suppliers
    })
      .from(recurringExpenses)
      .leftJoin(suppliers, eq(recurringExpenses.supplierId, suppliers.id))
      .where(
        and(
          eq(recurringExpenses.status, 'active'),
          eq(recurringExpenses.dayOfMonth, currentDay)
        )
      );

    // Calcular total
    const totalAmount = expenses.reduce((sum, row) => {
      return sum + parseFloat(row.expense.amount);
    }, 0);

    return {
      expenses,
      totalAmount,
      count: expenses.length
    };
  } catch (error) {
    console.error("Error in getRecurringExpensesDueToday:", error);
    return { expenses: [], totalAmount: 0, count: 0 };
  }
}

export async function markRecurringExpenseAsPaid(recurringExpenseId: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Buscar a despesa recorrente
    const [expense] = await db.select()
      .from(recurringExpenses)
      .where(eq(recurringExpenses.id, recurringExpenseId));

    if (!expense) {
      throw new Error("Despesa recorrente não encontrada");
    }

    // Criar conta a pagar com status "paid"
    const today = new Date();
    await db.insert(accountsPayable).values({
      supplierId: expense.supplierId || undefined,
      description: `${expense.name} - ${today.toLocaleDateString('pt-BR')}`,
      amount: expense.amount,
      dueDate: today,
      status: 'paid',
      paymentDate: today,
      createdBy: userId || expense.createdBy,
    });

    return { success: true };
  } catch (error) {
    console.error("Error in markRecurringExpenseAsPaid:", error);
    throw error;
  }
}

export async function getMonthlyFinancialAlerts(year: number, month: number) {
  const db = await getDb();
  if (!db) return { payables: [], receivables: [] };

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const payables = await db.select({
    accountPayable: accountsPayable,
    supplier: suppliers,
    category: financialCategories,
  })
    .from(accountsPayable)
    .leftJoin(suppliers, eq(accountsPayable.supplierId, suppliers.id))
    .leftJoin(financialCategories, eq(accountsPayable.categoryId, financialCategories.id))
    .where(and(
      eq(accountsPayable.status, "pending"),
      gte(accountsPayable.dueDate, startDate),
      lte(accountsPayable.dueDate, endDate)
    ))
    .orderBy(accountsPayable.dueDate);

  const receivables = await db.select({
    accountReceivable: accountsReceivable,
    order: orders,
    customer: customers,
  })
    .from(accountsReceivable)
    .leftJoin(orders, eq(accountsReceivable.orderId, orders.id))
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(and(
      eq(accountsReceivable.status, "pending"),
      gte(accountsReceivable.dueDate, startDate),
      lte(accountsReceivable.dueDate, endDate)
    ))
    .orderBy(accountsReceivable.dueDate);

  return { payables, receivables };
}

// ============ LEADS / CRM ============

export async function getLeads(filters?: { stage?: LeadStage; assignedTo?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.stage) conditions.push(eq(leads.stage, filters.stage));
  if (filters?.assignedTo) conditions.push(eq(leads.assignedTo, filters.assignedTo));

  const baseQuery = db.select({
    lead: leads,
    assignedUser: users,
  })
    .from(leads)
    .leftJoin(users, eq(leads.assignedTo, users.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(leads.createdAt));
  }

  return await baseQuery.orderBy(desc(leads.createdAt));
}

export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leads).values(data);
  return result;
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(leads).set(data).where(eq(leads.id, id));
  return { success: true };
}

export async function deleteAllLeads() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar todas as atividades de leads primeiro (relacionamento)
  await db.delete(leadActivities);

  // Deletar todos os leads
  await db.delete(leads);

  return { success: true, message: "Todos os leads foram exclu\u00eddos" };
}

export async function getLeadActivities(leadId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    activity: leadActivities,
    creator: users,
  })
    .from(leadActivities)
    .leftJoin(users, eq(leadActivities.createdBy, users.id))
    .where(eq(leadActivities.leadId, leadId))
    .orderBy(desc(leadActivities.createdAt));
}

export async function createLeadActivity(data: InsertLeadActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leadActivities).values(data);
  return result;
}

// ============ PROPOSALS ============

export async function getProposals(filters?: { status?: ProposalStatus }) {
  const db = await getDb();
  if (!db) return [];

  const baseQuery = db.select({
    proposal: proposals,
    lead: leads,
    customer: customers,
    creator: users,
  })
    .from(proposals)
    .leftJoin(leads, eq(proposals.leadId, leads.id))
    .leftJoin(customers, eq(proposals.customerId, customers.id))
    .leftJoin(users, eq(proposals.createdBy, users.id));

  if (filters?.status) {
    return await baseQuery.where(eq(proposals.status, filters.status)).orderBy(desc(proposals.createdAt));
  }

  return await baseQuery.orderBy(desc(proposals.createdAt));
}

export async function createProposal(data: InsertProposal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(proposals).values(data);
  return result;
}

export async function getProposalItems(proposalId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(proposalItems)
    .where(eq(proposalItems.proposalId, proposalId));
}

export async function createProposalItem(data: InsertProposalItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(proposalItems).values(data);
  return result;
}

// ============ CONTRACTS ============

export async function getContracts(filters?: { status?: ContractStatus; customerId?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(contracts.status, filters.status));
  if (filters?.customerId) conditions.push(eq(contracts.customerId, filters.customerId));

  const baseQuery = db.select({
    contract: contracts,
    customer: customers,
    creator: users,
  })
    .from(contracts)
    .leftJoin(customers, eq(contracts.customerId, customers.id))
    .leftJoin(users, eq(contracts.createdBy, users.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(contracts.createdAt));
  }

  return await baseQuery.orderBy(desc(contracts.createdAt));
}

export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contracts).values(data);
  return result;
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contracts).set(data).where(eq(contracts.id, id));
  return { success: true };
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Primeiro deletar os itens do contrato
  await db.delete(contractItems).where(eq(contractItems.contractId, id));
  // Depois deletar o contrato
  await db.delete(contracts).where(eq(contracts.id, id));
  return { success: true };
}

export async function getContractItems(contractId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(contractItems)
    .where(eq(contractItems.contractId, contractId));
}

// ============ TASKS ============

export async function getTasks(filters?: { status?: TaskStatus; projectId?: number; assignedTo?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(tasks.status, filters.status));
  if (filters?.projectId) conditions.push(eq(tasks.projectId, filters.projectId));
  if (filters?.assignedTo) conditions.push(eq(tasks.assignedTo, filters.assignedTo));

  const baseQuery = db.select({
    task: tasks,
    project: projects,
    assignedUser: users,
    creator: users,
  })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .leftJoin(users, eq(tasks.assignedTo, users.id));

  // Ordenar por data de vencimento (mais próximas primeiro), depois por data de criação
  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(tasks.dueDate, desc(tasks.createdAt));
  }

  return await baseQuery.orderBy(tasks.dueDate, desc(tasks.createdAt));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values(data);
  return result;
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return { success: true };
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(tasks).where(eq(tasks.id, id));
  return { success: true };
}

// ============ TIME ENTRIES ============

export async function getTimeEntries(filters?: { userId?: number; projectId?: number; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.userId) conditions.push(eq(timeEntries.userId, filters.userId));
  if (filters?.projectId) conditions.push(eq(timeEntries.projectId, filters.projectId));
  if (filters?.startDate) conditions.push(gte(timeEntries.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(timeEntries.date, filters.endDate));

  const baseQuery = db.select({
    timeEntry: timeEntries,
    task: tasks,
    project: projects,
    user: users,
  })
    .from(timeEntries)
    .leftJoin(tasks, eq(timeEntries.taskId, tasks.id))
    .leftJoin(projects, eq(timeEntries.projectId, projects.id))
    .leftJoin(users, eq(timeEntries.userId, users.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(timeEntries.date));
  }

  return await baseQuery.orderBy(desc(timeEntries.date));
}

export async function createTimeEntry(data: InsertTimeEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(timeEntries).values(data);
  return result;
}

// ============ TICKETS / SUPPORT ============

export async function getTickets(filters?: { status?: TicketStatus; customerId?: number; assignedTo?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(tickets.status, filters.status));
  if (filters?.customerId) conditions.push(eq(tickets.customerId, filters.customerId));
  if (filters?.assignedTo) conditions.push(eq(tickets.assignedTo, filters.assignedTo));

  const baseQuery = db.select({
    ticket: tickets,
    customer: customers,
    assignedUser: users,
    creator: users,
  })
    .from(tickets)
    .leftJoin(customers, eq(tickets.customerId, customers.id))
    .leftJoin(users, eq(tickets.assignedTo, users.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(tickets.createdAt));
  }

  return await baseQuery.orderBy(desc(tickets.createdAt));
}

export async function createTicket(data: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate due date based on SLA
  const now = new Date();
  let dueDate = new Date(now);

  switch (data.sla) {
    case "4h":
      dueDate.setHours(dueDate.getHours() + 4);
      break;
    case "24h":
      dueDate.setHours(dueDate.getHours() + 24);
      break;
    case "72h":
      dueDate.setHours(dueDate.getHours() + 72);
      break;
  }

  const result = await db.insert(tickets).values({ ...data, dueDate });
  return result;
}

export async function updateTicket(id: number, data: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tickets).set(data).where(eq(tickets.id, id));
  return { success: true };
}

export async function getTicketComments(ticketId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    comment: ticketComments,
    creator: users,
  })
    .from(ticketComments)
    .leftJoin(users, eq(ticketComments.createdBy, users.id))
    .where(eq(ticketComments.ticketId, ticketId))
    .orderBy(ticketComments.createdAt);
}

export async function createTicketComment(data: InsertTicketComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(ticketComments).values(data);
  return result;
}

// ============ PROJECT CHECKLISTS ============

export async function getProjectChecklists(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(projectChecklists)
    .where(eq(projectChecklists.projectId, projectId))
    .orderBy(projectChecklists.order);
}

export async function createProjectChecklist(data: InsertProjectChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projectChecklists).values(data);
  return result;
}

export async function updateProjectChecklist(id: number, data: Partial<InsertProjectChecklist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projectChecklists).set(data).where(eq(projectChecklists.id, id));
  return { success: true };
}

export async function deleteProjectChecklist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(projectChecklists).where(eq(projectChecklists.id, id));
  return { success: true };
}

export async function updateProjectProgressFromChecklists(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todos os checklists do projeto
  const checklists = await db.select()
    .from(projectChecklists)
    .where(eq(projectChecklists.projectId, projectId));

  if (checklists.length === 0) {
    return { progress: 0 };
  }

  // Calcular progresso baseado nos itens completados
  const completedCount = checklists.filter(c => c.completed === 1).length;
  const progress = Math.round((completedCount / checklists.length) * 100);

  // Atualizar progresso do projeto
  await db.update(projects).set({ progress }).where(eq(projects.id, projectId));

  return { progress, total: checklists.length, completed: completedCount };
}

// ============ TASK CHECKLISTS ============

export async function getTaskChecklists(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(taskChecklists)
    .where(eq(taskChecklists.taskId, taskId))
    .orderBy(taskChecklists.order);
}

export async function createTaskChecklist(data: InsertTaskChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(taskChecklists).values(data);
  return result;
}

export async function updateTaskChecklist(id: number, data: Partial<InsertTaskChecklist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(taskChecklists).set(data).where(eq(taskChecklists.id, id));
  return { success: true };
}

export async function deleteTaskChecklist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(taskChecklists).where(eq(taskChecklists.id, id));
  return { success: true };
}

export async function getTaskChecklistProgress(taskId: number) {
  const db = await getDb();
  if (!db) return { progress: 0, total: 0, completed: 0 };

  const checklists = await db.select()
    .from(taskChecklists)
    .where(eq(taskChecklists.taskId, taskId));

  if (checklists.length === 0) {
    return { progress: 0, total: 0, completed: 0 };
  }

  const completedCount = checklists.filter(c => c.completed === 1).length;
  const progress = Math.round((completedCount / checklists.length) * 100);

  return { progress, total: checklists.length, completed: completedCount };
}

// ============ RECURRING EXPENSES ============

export async function getRecurringExpenses(filters?: { status?: RecurringExpenseStatus; category?: RecurringExpenseCategory }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(recurringExpenses.status, filters.status));
  if (filters?.category) conditions.push(eq(recurringExpenses.category, filters.category));

  const baseQuery = db.select({
    expense: recurringExpenses,
    supplier: suppliers,
    creator: users,
  })
    .from(recurringExpenses)
    .leftJoin(suppliers, eq(recurringExpenses.supplierId, suppliers.id))
    .leftJoin(users, eq(recurringExpenses.createdBy, users.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(recurringExpenses.createdAt));
  }

  return await baseQuery.orderBy(desc(recurringExpenses.createdAt));
}

export async function createRecurringExpense(data: InsertRecurringExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(recurringExpenses).values(data);
  return result;
}

export async function updateRecurringExpense(id: number, data: Partial<InsertRecurringExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(recurringExpenses).set(data).where(eq(recurringExpenses.id, id));
  return { success: true };
}

export async function deleteRecurringExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
  return { success: true };
}

export async function deleteAllRecurringExpenses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar todas as despesas recorrentes
  await db.delete(recurringExpenses);

  return { success: true, message: "Todas as despesas recorrentes foram excluídas" };
}

export async function generateRecurringExpensePayments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const currentDay = now.getDate();

  // Get active recurring expenses that should be generated today
  const expensesToGenerate = await db.select()
    .from(recurringExpenses)
    .where(and(
      eq(recurringExpenses.status, "active"),
      eq(recurringExpenses.dayOfMonth, currentDay)
    ));

  const generated = [];

  for (const expense of expensesToGenerate) {
    // Check if already generated this month
    if (expense.lastGenerated) {
      const lastGen = new Date(expense.lastGenerated);
      if (lastGen.getMonth() === now.getMonth() && lastGen.getFullYear() === now.getFullYear()) {
        continue; // Already generated this month
      }
    }

    // Create account payable
    const dueDate = new Date(now.getFullYear(), now.getMonth(), expense.dayOfMonth);

    const payableData: any = {
      amount: expense.amount,
      dueDate,
      status: "pending",
      description: `${expense.name} - ${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      notes: `Gerado automaticamente de despesa recorrente #${expense.id}`,
      createdBy: expense.createdBy,
    };

    if (expense.supplierId) {
      payableData.supplierId = expense.supplierId;
    }

    await db.insert(accountsPayable).values(payableData);

    // Update last generated date
    await db.update(recurringExpenses)
      .set({ lastGenerated: now })
      .where(eq(recurringExpenses.id, expense.id));

    generated.push(expense.id);
  }

  return { generated: generated.length, ids: generated };
}

export async function generateRecurringExpensesBills(userId: number, month?: number, year?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();

  // Buscar todas as despesas recorrentes ativas
  const activeExpenses = await db.select()
    .from(recurringExpenses)
    .where(eq(recurringExpenses.status, "active"));

  const generated = [];
  const skipped = [];

  for (const expense of activeExpenses) {
    // Verificar se já foi gerada para este mês
    const existingBill = await db.select()
      .from(accountsPayable)
      .where(
        and(
          sql`${accountsPayable.description} LIKE ${`%despesa recorrente #${expense.id}%`}`,
          sql`MONTH(${accountsPayable.dueDate}) = ${targetMonth + 1}`,
          sql`YEAR(${accountsPayable.dueDate}) = ${targetYear}`
        )
      );

    if (existingBill.length > 0) {
      skipped.push({ id: expense.id, name: expense.name, reason: "Já gerada" });
      continue;
    }

    // Criar conta a pagar
    const dueDate = new Date(targetYear, targetMonth, expense.dayOfMonth);
    const monthName = dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const payableData: any = {
      amount: expense.amount,
      dueDate,
      status: "pending",
      description: `${expense.name} - ${monthName}`,
      notes: `Gerado automaticamente de despesa recorrente #${expense.id}`,
      createdBy: userId,
    };

    if (expense.supplierId) {
      payableData.supplierId = expense.supplierId;
    }

    await db.insert(accountsPayable).values(payableData);

    // Atualizar data da última geração
    await db.update(recurringExpenses)
      .set({ lastGenerated: now })
      .where(eq(recurringExpenses.id, expense.id));

    generated.push({ id: expense.id, name: expense.name });
  }

  return {
    success: true,
    generated: generated.length,
    skipped: skipped.length,
    details: { generated, skipped }
  };
}

// ============ PRODUCT SUBSCRIPTIONS ============

export async function getProductSubscriptions(filters?: { status?: SubscriptionStatus; customerId?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(productSubscriptions.status, filters.status));
  if (filters?.customerId) conditions.push(eq(productSubscriptions.customerId, filters.customerId));

  const baseQuery = db.select({
    subscription: productSubscriptions,
    product: products,
    customer: customers,
    creator: users,
  })
    .from(productSubscriptions)
    .leftJoin(products, eq(productSubscriptions.productId, products.id))
    .leftJoin(customers, eq(productSubscriptions.customerId, customers.id))
    .leftJoin(users, eq(productSubscriptions.createdBy, users.id));

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions)).orderBy(desc(productSubscriptions.createdAt));
  }

  return await baseQuery.orderBy(desc(productSubscriptions.createdAt));
}

export async function createProductSubscription(data: InsertProductSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(productSubscriptions).values(data);
  return result;
}

export async function updateProductSubscription(id: number, data: Partial<InsertProductSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(productSubscriptions).set(data).where(eq(productSubscriptions.id, id));
  return { success: true };
}

export async function generateSubscriptionInvoices() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();

  // Get active subscriptions where next billing date is today or past
  const subscriptionsToBill = await db.select({
    subscription: productSubscriptions,
    customer: customers,
    product: products,
  })
    .from(productSubscriptions)
    .leftJoin(customers, eq(productSubscriptions.customerId, customers.id))
    .leftJoin(products, eq(productSubscriptions.productId, products.id))
    .where(and(
      eq(productSubscriptions.status, "active"),
      lte(productSubscriptions.nextBillingDate, now)
    ));

  const generated = [];

  for (const item of subscriptionsToBill) {
    const sub = item.subscription;
    const customer = item.customer;
    const product = item.product;

    if (!customer || !product) continue;

    // Create order for this subscription
    const orderNumber = `SUB-${sub.id}-${now.getTime()}`;
    const orderId = await createOrder(
      {
        orderNumber,
        customerId: sub.customerId,
        totalAmount: sub.price,
        status: "pending",
        orderDate: now,
        createdBy: sub.createdBy,
      },
      [
        {
          productId: sub.productId,
          quantity: "1",
          unitPrice: sub.price,
          subtotal: sub.price,
        },
      ]
    );

    // Create account receivable
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7); // 7 days to pay

    await db.insert(accountsReceivable).values({
      customerId: sub.customerId,
      amount: sub.price,
      dueDate,
      status: "pending",
      description: `Assinatura ${product.name} - ${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      notes: `Gerado automaticamente de assinatura #${sub.id}`,
      createdBy: sub.createdBy,
    });

    // Calculate next billing date
    let nextBilling = new Date(sub.nextBillingDate);
    switch (sub.frequency) {
      case "monthly":
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case "quarterly":
        nextBilling.setMonth(nextBilling.getMonth() + 3);
        break;
      case "yearly":
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
    }

    // Update subscription
    await db.update(productSubscriptions)
      .set({
        lastBilled: now,
        nextBillingDate: nextBilling,
      })
      .where(eq(productSubscriptions.id, sub.id));

    generated.push(sub.id);
  }

  return { generated: generated.length, ids: generated };
}

// ============ TAX SETTINGS ============

export async function getTaxSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const settings = await db.select().from(taxSettings).where(eq(taxSettings.isActive, true)).limit(1);
  return settings[0] || null;
}

export async function updateTaxSettings(id: number, data: Partial<InsertTaxSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(taxSettings).set(data).where(eq(taxSettings.id, id));
}

// ============ COMPANY SETTINGS ============

export async function getCompanySettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const settings = await db.select().from(companySettings).where(eq(companySettings.isActive, true)).limit(1);
  return settings[0] || null;
}

export async function createCompanySettings(data: InsertCompanySetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(companySettings).values(data);
}

export async function updateCompanySettings(id: number, data: Partial<InsertCompanySetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(companySettings).set(data).where(eq(companySettings.id, id));
  return result;
}

// ============ BUDGETS ============

export async function getBudgets(filters?: { status?: BudgetStatus; customerId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const baseQuery = db.select({
    budget: budgets,
    customer: customers,
    order: orders,
  }).from(budgets)
    .leftJoin(customers, eq(budgets.customerId, customers.id))
    .leftJoin(orders, eq(budgets.id, orders.budgetId));

  if (filters?.status && filters?.customerId) {
    return await baseQuery
      .where(and(
        eq(budgets.status, filters.status),
        eq(budgets.customerId, filters.customerId)
      ))
      .orderBy(desc(budgets.createdAt));
  } else if (filters?.status) {
    return await baseQuery
      .where(eq(budgets.status, filters.status))
      .orderBy(desc(budgets.createdAt));
  } else if (filters?.customerId) {
    return await baseQuery
      .where(eq(budgets.customerId, filters.customerId))
      .orderBy(desc(budgets.createdAt));
  }

  return await baseQuery.orderBy(desc(budgets.createdAt));
}

export async function getBudgetById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select({
    budget: budgets,
    customer: customers,
  }).from(budgets)
    .leftJoin(customers, eq(budgets.customerId, customers.id))
    .where(eq(budgets.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createBudget(budget: Omit<InsertBudget, 'budgetNumber'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar número do orçamento no formato ORC-AAAA-NNN
  const year = new Date().getFullYear();
  const existingBudgets = await db.select({ budgetNumber: budgets.budgetNumber })
    .from(budgets)
    .where(sql`${budgets.budgetNumber} LIKE ${`ORC-${year}-%`}`);

  const nextNumber = existingBudgets.length + 1;
  const budgetNumber = `ORC-${year}-${nextNumber.toString().padStart(3, '0')}`;

  const result = await db.insert(budgets).values({
    ...budget,
    budgetNumber,
  });
  return result;
}

export async function updateBudget(id: number, data: Partial<InsertBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(budgets).set(data).where(eq(budgets.id, id));
}

export async function deleteBudget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(budgets).where(eq(budgets.id, id));
}

export async function saveBudgetItems(budgetId: number, selectedProducts: Array<{ productId: number; quantity: number; price: number }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar nomes dos produtos
  const productIds = selectedProducts.map(p => p.productId);
  const productList = await db.select().from(products).where(inArray(products.id, productIds));

  // Criar items do orçamento
  for (const sp of selectedProducts) {
    const product = productList.find(p => p.id === sp.productId);
    await db.insert(budgetItems).values({
      budgetId,
      productId: sp.productId,
      type: "service",
      description: product?.name || "Serviço",
      quantity: sp.quantity.toString(),
      unitPrice: sp.price.toString(),
      totalPrice: (sp.quantity * sp.price).toString(),
    });
  }
}

export async function getBudgetItems(budgetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select({
    item: budgetItems,
    product: products,
  }).from(budgetItems)
    .leftJoin(products, eq(budgetItems.productId, products.id))
    .where(eq(budgetItems.budgetId, budgetId));
}

export async function deleteAllBudgets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar todos os orçamentos
  await db.delete(budgets);

  return { success: true, message: "Todos os orçamentos foram excluídos" };
}

export async function convertBudgetToOrder(budgetId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const budgetResult = await getBudgetById(budgetId);
  if (!budgetResult) throw new Error("Orçamento não encontrado");

  const budget = budgetResult.budget;

  if (budget.status !== "approved") {
    throw new Error("Apenas orçamentos aprovados podem ser convertidos em pedidos");
  }

  let customerId = budget.customerId;

  // Se não tem customerId mas tem dados do cliente, criar o cliente automaticamente
  if (!customerId && budget.customerName) {
    const customerResult = await db.insert(customers).values({
      name: budget.customerName,
      email: budget.customerEmail || null,
      phone: budget.customerPhone || null,
      document: budget.customerDocument || null,
      address: budget.customerAddress || null,
      neighborhood: budget.customerNeighborhood || null,
      city: budget.customerCity || null,
      state: budget.customerState || null,
      zipCode: budget.customerZipCode || null,
      createdBy: userId,
    });
    customerId = Number(customerResult[0].insertId);

    // Atualizar o orçamento com o customerId
    await db.update(budgets).set({ customerId }).where(eq(budgets.id, budgetId));
  }

  // Gerar número do pedido
  const year = new Date().getFullYear();
  const countResult = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  const count = Number(countResult[0]?.count || 0) + 1;
  const orderNumber = `PED-${year}-${count.toString().padStart(4, '0')}`;

  // Criar pedido
  const orderResult = await db.insert(orders).values({
    orderNumber,
    customerId: customerId || null,
    customerName: budget.customerName || null,
    customerEmail: budget.customerEmail || null,
    customerPhone: budget.customerPhone || null,
    customerAddress: budget.customerAddress || null,
    budgetId: budgetId,
    status: "pending",
    totalAmount: budget.finalPrice,
    notes: `Convertido do orçamento #${budget.id}: ${budget.title}`,
    createdBy: userId,
  });

  const orderId = Number(orderResult[0].insertId);

  // Criar item do pedido com o valor total
  // Buscar ou criar um produto genérico para orçamentos
  let genericProductId = 1;
  const genericProduct = await db.select().from(products).where(eq(products.name, "Serviço de Orçamento")).limit(1);
  if (genericProduct.length === 0) {
    const newProduct = await db.insert(products).values({
      name: "Serviço de Orçamento",
      description: "Produto genérico para conversão de orçamentos",
      price: "0",
      category: "Serviços",
      createdBy: userId,
    });
    genericProductId = Number(newProduct[0].insertId);
  } else {
    genericProductId = genericProduct[0].id;
  }

  await db.insert(orderItems).values({
    orderId,
    productId: genericProductId,
    quantity: "1",
    unitPrice: budget.finalPrice,
    subtotal: budget.finalPrice,
  });

  // Atualizar status do orçamento para "converted"
  await db.update(budgets).set({ status: "converted" }).where(eq(budgets.id, budgetId));

  return { orderId, orderNumber, budget, customerId };
}

export async function createProjectFromBudget(budgetId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const budgetResult = await getBudgetById(budgetId);
  if (!budgetResult) throw new Error("Orçamento não encontrado");

  const budget = budgetResult.budget;

  if (budget.status !== "approved" && budget.status !== "converted") {
    throw new Error("Apenas orçamentos aprovados podem gerar projetos");
  }

  // Verificar se já existe projeto para este orçamento
  const existingProject = await db.select()
    .from(projects)
    .where(sql`${projects.name} LIKE ${`%Orçamento #${budgetId}%`}`)
    .limit(1);

  if (existingProject.length > 0) {
    throw new Error("Já existe um projeto criado para este orçamento");
  }

  // Calcular deadline (30 dias a partir de hoje por padrão)
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  // Criar projeto
  const projectResult = await db.insert(projects).values({
    name: `${budget.title} - Orçamento #${budgetId}`,
    description: budget.description || `Projeto gerado a partir do orçamento #${budgetId}`,
    customerId: budget.customerId || null,
    status: "project",
    progress: 0,
    value: budget.finalPrice,
    deadline,
    createdBy: userId,
  });

  const projectId = Number(projectResult[0].insertId);

  return {
    projectId,
    message: `Projeto criado com sucesso a partir do orçamento #${budgetId}`
  };
}

// ============================================
// BUDGET TEMPLATES
// ============================================

export async function getBudgetTemplates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(budgetTemplates).orderBy(budgetTemplates.name);
}

export async function getBudgetTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(budgetTemplates).where(eq(budgetTemplates.id, id));
  return result[0] || null;
}

export async function createBudgetTemplate(template: InsertBudgetTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(budgetTemplates).values(template);
  const id = Number(result[0].insertId);
  return await getBudgetTemplateById(id);
}

export async function updateBudgetTemplate(id: number, data: Partial<InsertBudgetTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(budgetTemplates).set(data).where(eq(budgetTemplates.id, id));
  return await getBudgetTemplateById(id);
}

export async function deleteBudgetTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(budgetTemplates).where(eq(budgetTemplates.id, id));
}
