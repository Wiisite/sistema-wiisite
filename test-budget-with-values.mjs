import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";
const { budgets } = schema;

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Criar orçamento de teste com valores reais
const year = new Date().getFullYear();
const budgetNumber = `ORC-${year}-999`;

const testBudget = {
  budgetNumber,
  title: "Manutenção do site Apefi",
  description: "Manutenção para temporada 2026",
  customerName: "Apefi Assessoria Esportiva",
  customerEmail: "apefi@apefi.com.br",
  customerPhone: "11997610088",
  customerAddress: "Rua Olho Dágua do Borges,90 Apto 44 bl 05",
  laborCost: "300.00",
  laborHours: "10.00",
  materialCost: "0.00",
  thirdPartyCost: "0.00",
  otherDirectCosts: "10.00",
  totalDirectCosts: "310.00",
  indirectCostsTotal: "10.00",
  totalCosts: "320.00",
  profitMargin: "25.00",
  grossValue: "400.00",
  cbsRate: "12.00",
  cbsAmount: "48.00",
  ibsRate: "5.00",
  ibsAmount: "20.00",
  irpjRate: "0.00",
  irpjAmount: "1.80",
  csllRate: "0.00",
  csllAmount: "1.08",
  totalTaxes: "70.88",
  netValue: "329.12",
  netProfit: "9.12",
  effectiveMargin: "2.77",
  status: "approved",
  userId: 1,
};

try {
  const result = await db.insert(budgets).values(testBudget);
  console.log("✅ Orçamento de teste criado com sucesso!");
  console.log("ID:", result[0].insertId);
  console.log("Número:", budgetNumber);
  console.log("Valor Total:", testBudget.netValue);
} catch (error) {
  console.error("❌ Erro ao criar orçamento:", error.message);
} finally {
  await connection.end();
}
