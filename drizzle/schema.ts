import { boolean, date, decimal, int, longtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 20 }),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

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

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Pedidos
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  customerAddress: text("customerAddress"),
  budgetId: int("budgetId"),
  status: mysqlEnum("status", ["pending", "approved", "in_production", "completed", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  orderDate: timestamp("orderDate").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

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

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

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

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

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

export type FinancialCategory = typeof financialCategories.$inferSelect;
export type InsertFinancialCategory = typeof financialCategories.$inferInsert;

/**
 * Contas a Pagar
 */
export const accountsPayable = mysqlTable("accountsPayable", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplierId"),
  categoryId: int("categoryId"),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paymentDate: timestamp("paymentDate"),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  
  // Campos de parcelamento
  installmentNumber: int("installmentNumber").default(1), // Número da parcela atual (ex: 1, 2, 3...)
  totalInstallments: int("totalInstallments").default(1), // Total de parcelas (ex: 12)
  parentPayableId: int("parentPayableId"), // ID da conta a pagar "pai" (primeira parcela)
  
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountPayable = typeof accountsPayable.$inferSelect;
export type InsertAccountPayable = typeof accountsPayable.$inferInsert;

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
  
  // Campos de parcelamento
  installmentNumber: int("installmentNumber").default(1), // Número da parcela atual (ex: 1, 2, 3...)
  totalInstallments: int("totalInstallments").default(1), // Total de parcelas (ex: 12)
  parentReceivableId: int("parentReceivableId"), // ID da conta a receber "pai" (primeira parcela)
  
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountReceivable = typeof accountsReceivable.$inferSelect;
export type InsertAccountReceivable = typeof accountsReceivable.$inferInsert;

/**
 * Projects table for managing client projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  customerId: int("customerId").references(() => customers.id),
  status: mysqlEnum("status", ["project", "development", "design", "review", "launched", "cancelled"]).default("project").notNull(),
  progress: int("progress").default(0).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp("deadline").notNull(),
  meetingDate: timestamp("meetingDate"),
  approvalDate: timestamp("approvalDate"),
  reviewDate: timestamp("reviewDate"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

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

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

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

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

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

export type LeadActivity = typeof leadActivities.$inferSelect;
export type InsertLeadActivity = typeof leadActivities.$inferInsert;

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

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

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

export type ProposalItem = typeof proposalItems.$inferSelect;
export type InsertProposalItem = typeof proposalItems.$inferInsert;

/**
 * Contracts table for recurring services
 */
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => customers.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contractType: mysqlEnum("contractType", ["maintenance", "hosting", "support", "software_license", "other"]).default("other").notNull(),
  contractContent: text("contractContent"),
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

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

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

export type ContractItem = typeof contractItems.$inferSelect;
export type InsertContractItem = typeof contractItems.$inferInsert;

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

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

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

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

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

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

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

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = typeof ticketComments.$inferInsert;

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

export type ProjectChecklist = typeof projectChecklists.$inferSelect;
export type InsertProjectChecklist = typeof projectChecklists.$inferInsert;

/**
 * Task checklists table
 */
export const taskChecklists = mysqlTable("task_checklists", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  completed: int("completed").default(0).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskChecklist = typeof taskChecklists.$inferSelect;
export type InsertTaskChecklist = typeof taskChecklists.$inferInsert;

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

export type RecurringExpense = typeof recurringExpenses.$inferSelect;
export type InsertRecurringExpense = typeof recurringExpenses.$inferInsert;

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

export type ProductSubscription = typeof productSubscriptions.$inferSelect;
export type InsertProductSubscription = typeof productSubscriptions.$inferInsert;

/**
 * Tax settings for budget calculations
 */
export const taxSettings = mysqlTable("tax_settings", {
  id: int("id").autoincrement().primaryKey(),
  // Tributos sobre consumo (novo sistema)
  cbsRate: decimal("cbsRate", { precision: 5, scale: 2 }).default("0.00").notNull(), // CBS - Contribuição sobre Bens e Serviços (Federal)
  ibsRate: decimal("ibsRate", { precision: 5, scale: 2 }).default("0.00").notNull(), // IBS - Imposto sobre Bens e Serviços (Estadual/Municipal)
  // Tributos sobre lucro
  irpjRate: decimal("irpjRate", { precision: 5, scale: 2 }).default("0.00").notNull(), // IRPJ
  csllRate: decimal("csllRate", { precision: 5, scale: 2 }).default("0.00").notNull(), // CSLL
  // Configurações
  minimumMargin: decimal("minimumMargin", { precision: 5, scale: 2 }).default("20.00").notNull(), // Margem mínima recomendada
  taxRegime: mysqlEnum("taxRegime", ["new", "old", "transition"]).default("new").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaxSetting = typeof taxSettings.$inferSelect;
export type InsertTaxSetting = typeof taxSettings.$inferInsert;

/**
 * Company settings - dados da empresa para contratos e documentos
 */
export const companySettings = mysqlTable("company_settings", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  tradeName: varchar("tradeName", { length: 255 }), // Nome fantasia
  logo: longtext("logo"), // Logo em base64 ou URL
  cnpj: varchar("cnpj", { length: 20 }).notNull(),
  stateRegistration: varchar("stateRegistration", { length: 50 }), // Inscrição estadual
  municipalRegistration: varchar("municipalRegistration", { length: 50 }), // Inscrição municipal
  address: text("address"),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  // Dados do responsável
  ownerName: varchar("ownerName", { length: 255 }),
  ownerCpf: varchar("ownerCpf", { length: 20 }),
  ownerRole: varchar("ownerRole", { length: 100 }), // Cargo (ex: Diretor, Sócio)
  ownerNationality: varchar("ownerNationality", { length: 50 }).default("brasileiro"),
  ownerMaritalStatus: varchar("ownerMaritalStatus", { length: 50 }),
  ownerProfession: varchar("ownerProfession", { length: 100 }),
  ownerAddress: text("ownerAddress"),
  // Configurações
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySetting = typeof companySettings.$inferSelect;
export type InsertCompanySetting = typeof companySettings.$inferInsert;

/**
 * Budgets table
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  budgetNumber: varchar("budgetNumber", { length: 50 }).notNull(),
  customerId: int("customerId").references(() => customers.id),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  customerDocument: varchar("customerDocument", { length: 50 }), // CPF/CNPJ
  customerAddress: text("customerAddress"),
  customerNeighborhood: varchar("customerNeighborhood", { length: 100 }),
  customerCity: varchar("customerCity", { length: 100 }),
  customerState: varchar("customerState", { length: 2 }),
  customerZipCode: varchar("customerZipCode", { length: 20 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Custos diretos
  laborCost: decimal("laborCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  laborHours: decimal("laborHours", { precision: 8, scale: 2 }).default("0.00").notNull(),
  laborRate: decimal("laborRate", { precision: 10, scale: 2 }).default("0.00").notNull(), // Valor por hora
  materialCost: decimal("materialCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  thirdPartyCost: decimal("thirdPartyCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  otherDirectCosts: decimal("otherDirectCosts", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Custos indiretos (rateados)
  indirectCostsTotal: decimal("indirectCostsTotal", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Margem e impostos
  profitMargin: decimal("profitMargin", { precision: 5, scale: 2 }).default("20.00").notNull(), // %
  cbsRate: decimal("cbsRate", { precision: 5, scale: 2 }).notNull(), // % usado no cálculo
  ibsRate: decimal("ibsRate", { precision: 5, scale: 2 }).notNull(), // % usado no cálculo
  irpjRate: decimal("irpjRate", { precision: 5, scale: 2 }).notNull(), // % usado no cálculo
  csllRate: decimal("csllRate", { precision: 5, scale: 2 }).notNull(), // % usado no cálculo
  
  // Valores calculados
  totalDirectCosts: decimal("totalDirectCosts", { precision: 10, scale: 2 }).notNull(),
  totalCosts: decimal("totalCosts", { precision: 10, scale: 2 }).notNull(),
  grossValue: decimal("grossValue", { precision: 10, scale: 2 }).notNull(),
  cbsAmount: decimal("cbsAmount", { precision: 10, scale: 2 }).notNull(),
  ibsAmount: decimal("ibsAmount", { precision: 10, scale: 2 }).notNull(),
  totalConsumptionTaxes: decimal("totalConsumptionTaxes", { precision: 10, scale: 2 }).notNull(),
  netRevenue: decimal("netRevenue", { precision: 10, scale: 2 }).notNull(),
  profitBeforeTaxes: decimal("profitBeforeTaxes", { precision: 10, scale: 2 }).notNull(),
  irpjAmount: decimal("irpjAmount", { precision: 10, scale: 2 }).notNull(),
  csllAmount: decimal("csllAmount", { precision: 10, scale: 2 }).notNull(),
  netProfit: decimal("netProfit", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("finalPrice", { precision: 10, scale: 2 }).notNull(),
  
  // Metadata
  taxRegime: mysqlEnum("taxRegime", ["new", "old", "transition"]).default("new").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "approved", "rejected", "converted"]).default("draft").notNull(),
  validUntil: timestamp("validUntil"),
  notes: text("notes"),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Budget items for detailed cost breakdown
 */
export const budgetItems = mysqlTable("budget_items", {
  id: int("id").autoincrement().primaryKey(),
  budgetId: int("budgetId").notNull().references(() => budgets.id, { onDelete: "cascade" }),
  productId: int("productId").references(() => products.id),
  type: mysqlEnum("type", ["labor", "material", "thirdparty", "indirect", "other", "service"]).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = typeof budgetItems.$inferInsert;

/**
 * Budget Templates table
 */
export const budgetTemplates = mysqlTable("budget_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Valores padrão
  laborCost: decimal("laborCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  laborHours: decimal("laborHours", { precision: 8, scale: 2 }).default("0.00").notNull(),
  materialCost: decimal("materialCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  thirdPartyCost: decimal("thirdPartyCost", { precision: 10, scale: 2 }).default("0.00").notNull(),
  otherDirectCosts: decimal("otherDirectCosts", { precision: 10, scale: 2 }).default("0.00").notNull(),
  indirectCostsTotal: decimal("indirectCostsTotal", { precision: 10, scale: 2 }).default("0.00").notNull(),
  profitMargin: decimal("profitMargin", { precision: 5, scale: 2 }).default("20.00").notNull(),
  
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetTemplate = typeof budgetTemplates.$inferSelect;
export type InsertBudgetTemplate = typeof budgetTemplates.$inferInsert;

// ============ ENUM TYPES ============
export type OrderStatus = "pending" | "approved" | "in_production" | "completed" | "cancelled";
export type AccountPayableStatus = "pending" | "paid" | "overdue" | "cancelled";
export type AccountReceivableStatus = "pending" | "received" | "overdue" | "cancelled";
export type ProjectStatus = "project" | "development" | "design" | "review" | "launched" | "cancelled";
export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type ContractStatus = "active" | "suspended" | "cancelled" | "expired";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "cancelled";
export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
export type RecurringExpenseStatus = "active" | "paused" | "cancelled";
export type RecurringExpenseCategory = "electricity" | "water" | "phone" | "internet" | "rent" | "insurance" | "software" | "maintenance" | "other";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type BudgetStatus = "draft" | "sent" | "approved" | "rejected" | "converted";
