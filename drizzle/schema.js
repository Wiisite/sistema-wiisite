import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
/**
 * Clientes
 */
export const customers = mysqlTable("customers", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    document: varchar("document", { length: 50 }), // CPF/CNPJ
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zipCode: varchar("zipCode", { length: 20 }),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Produtos/Serviços
 */
export const products = mysqlTable("products", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: mysqlEnum("type", ["product", "service"]).default("product").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 20 }).default("un").notNull(), // un, kg, m, h, etc
    category: varchar("category", { length: 100 }),
    active: mysqlEnum("active", ["yes", "no"]).default("yes").notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Pedidos
 */
export const orders = mysqlTable("orders", {
    id: int("id").autoincrement().primaryKey(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
    customerId: int("customerId").notNull(),
    status: mysqlEnum("status", ["pending", "approved", "in_production", "completed", "cancelled"]).default("pending").notNull(),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    orderDate: timestamp("orderDate").defaultNow().notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Itens do Pedido
 */
export const orderItems = mysqlTable("orderItems", {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    productId: int("productId").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
/**
 * Fornecedores
 */
export const suppliers = mysqlTable("suppliers", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    document: varchar("document", { length: 50 }), // CPF/CNPJ
    address: text("address"),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Categorias Financeiras
 */
export const financialCategories = mysqlTable("financialCategories", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    type: mysqlEnum("type", ["expense", "income"]).notNull(),
    color: varchar("color", { length: 7 }).default("#6366f1"), // hex color
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
/**
 * Contas a Pagar
 */
export const accountsPayable = mysqlTable("accountsPayable", {
    id: int("id").autoincrement().primaryKey(),
    supplierId: int("supplierId").notNull(),
    categoryId: int("categoryId"),
    description: varchar("description", { length: 255 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp("dueDate").notNull(),
    paymentDate: timestamp("paymentDate"),
    status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Contas a Receber
 */
export const accountsReceivable = mysqlTable("accountsReceivable", {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId"),
    customerId: int("customerId").notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    dueDate: timestamp("dueDate").notNull(),
    receivedDate: timestamp("receivedDate"),
    status: mysqlEnum("status", ["pending", "received", "overdue", "cancelled"]).default("pending").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Projects table for managing client projects
 */
export const projects = mysqlTable("projects", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    customerId: int("customerId").references(() => customers.id),
    status: mysqlEnum("status", ["development", "design", "launched", "cancelled"]).default("development").notNull(),
    progress: int("progress").default(0).notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    deadline: timestamp("deadline").notNull(),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Calendar events table for meetings and visits
 */
export const calendarEvents = mysqlTable("calendar_events", {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    eventType: mysqlEnum("eventType", ["meeting", "visit", "call", "other"]).default("meeting").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    customerId: int("customerId").references(() => customers.id),
    projectId: int("projectId").references(() => projects.id),
    location: varchar("location", { length: 255 }),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Leads table for CRM/Commercial module
 */
export const leads = mysqlTable("leads", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    company: varchar("company", { length: 255 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    source: mysqlEnum("source", ["website", "referral", "cold_call", "social_media", "event", "other"]).default("other").notNull(),
    stage: mysqlEnum("stage", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
    estimatedValue: decimal("estimatedValue", { precision: 10, scale: 2 }),
    assignedTo: int("assignedTo").references(() => users.id),
    notes: text("notes"),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Lead activities table for tracking interactions
 */
export const leadActivities = mysqlTable("lead_activities", {
    id: int("id").autoincrement().primaryKey(),
    leadId: int("leadId").notNull().references(() => leads.id, { onDelete: "cascade" }),
    activityType: mysqlEnum("activityType", ["call", "meeting", "email", "follow_up", "note"]).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description"),
    scheduledDate: timestamp("scheduledDate"),
    completedDate: timestamp("completedDate"),
    status: mysqlEnum("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Proposals table for commercial proposals
 */
export const proposals = mysqlTable("proposals", {
    id: int("id").autoincrement().primaryKey(),
    leadId: int("leadId").references(() => leads.id),
    customerId: int("customerId").references(() => customers.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull(),
    estimatedTax: decimal("estimatedTax", { precision: 10, scale: 2 }),
    validUntil: timestamp("validUntil"),
    status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Proposal items table
 */
export const proposalItems = mysqlTable("proposal_items", {
    id: int("id").autoincrement().primaryKey(),
    proposalId: int("proposalId").notNull().references(() => proposals.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 500 }).notNull(),
    quantity: int("quantity").default(1).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
/**
 * Contracts table for recurring services
 */
export const contracts = mysqlTable("contracts", {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull().references(() => customers.id),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    contractType: mysqlEnum("contractType", ["maintenance", "hosting", "support", "other"]).default("other").notNull(),
    monthlyValue: decimal("monthlyValue", { precision: 10, scale: 2 }).notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    renewalDate: timestamp("renewalDate"),
    adjustmentRate: decimal("adjustmentRate", { precision: 5, scale: 2 }),
    status: mysqlEnum("status", ["active", "suspended", "cancelled", "expired"]).default("active").notNull(),
    billingDay: int("billingDay").default(1).notNull(),
    notes: text("notes"),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Contract items table
 */
export const contractItems = mysqlTable("contract_items", {
    id: int("id").autoincrement().primaryKey(),
    contractId: int("contractId").notNull().references(() => contracts.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 500 }).notNull(),
    quantity: int("quantity").default(1).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
/**
 * Tasks table for task management
 */
export const tasks = mysqlTable("tasks", {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    projectId: int("projectId").references(() => projects.id),
    assignedTo: int("assignedTo").references(() => users.id),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
    status: mysqlEnum("status", ["todo", "in_progress", "review", "done", "cancelled"]).default("todo").notNull(),
    estimatedHours: decimal("estimatedHours", { precision: 5, scale: 2 }),
    dueDate: timestamp("dueDate"),
    completedDate: timestamp("completedDate"),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Time entries table for timesheet
 */
export const timeEntries = mysqlTable("time_entries", {
    id: int("id").autoincrement().primaryKey(),
    taskId: int("taskId").references(() => tasks.id),
    projectId: int("projectId").references(() => projects.id),
    userId: int("userId").notNull().references(() => users.id),
    description: text("description"),
    hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Support tickets table
 */
export const tickets = mysqlTable("tickets", {
    id: int("id").autoincrement().primaryKey(),
    customerId: int("customerId").notNull().references(() => customers.id),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: mysqlEnum("category", ["bug", "adjustment", "content", "financial", "other"]).default("other").notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
    sla: mysqlEnum("sla", ["4h", "24h", "72h"]).default("24h").notNull(),
    status: mysqlEnum("status", ["open", "in_progress", "waiting_customer", "resolved", "closed"]).default("open").notNull(),
    assignedTo: int("assignedTo").references(() => users.id),
    dueDate: timestamp("dueDate"),
    resolvedDate: timestamp("resolvedDate"),
    closedDate: timestamp("closedDate"),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Ticket comments table
 */
export const ticketComments = mysqlTable("ticket_comments", {
    id: int("id").autoincrement().primaryKey(),
    ticketId: int("ticketId").notNull().references(() => tickets.id, { onDelete: "cascade" }),
    comment: text("comment").notNull(),
    isInternal: int("isInternal").default(0).notNull(),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
/**
 * Project checklists table
 */
export const projectChecklists = mysqlTable("project_checklists", {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    completed: int("completed").default(0).notNull(),
    order: int("order").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Recurring expenses table for operational costs
 */
export const recurringExpenses = mysqlTable("recurring_expenses", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: mysqlEnum("category", [
        "electricity",
        "water",
        "phone",
        "internet",
        "rent",
        "insurance",
        "software",
        "maintenance",
        "other"
    ]).default("other").notNull(),
    supplierId: int("supplierId").references(() => suppliers.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    frequency: mysqlEnum("frequency", ["monthly", "quarterly", "yearly"]).default("monthly").notNull(),
    dayOfMonth: int("dayOfMonth").default(1).notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
    lastGenerated: timestamp("lastGenerated"),
    notes: text("notes"),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
/**
 * Product subscriptions for recurring revenue
 */
export const productSubscriptions = mysqlTable("product_subscriptions", {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull().references(() => products.id),
    customerId: int("customerId").notNull().references(() => customers.id),
    frequency: mysqlEnum("frequency", ["monthly", "quarterly", "yearly"]).default("monthly").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
    lastBilled: timestamp("lastBilled"),
    nextBillingDate: timestamp("nextBillingDate").notNull(),
    createdBy: int("createdBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
