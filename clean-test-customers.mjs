import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { customers } from "./drizzle/schema.js";
import { like, or } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não encontrada");
  process.exit(1);
}

async function cleanTestCustomers() {
  console.log("🧹 Iniciando limpeza de clientes de teste...\n");

  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Remover clientes de teste (que contêm "Test" ou "Teste" no nome)
    const result = await db
      .delete(customers)
      .where(
        or(
          like(customers.name, "%Test%"),
          like(customers.name, "%Teste%")
        )
      );

    console.log(`✅ ${result[0].affectedRows} clientes de teste removidos com sucesso!`);
    console.log("\n✨ Banco de dados limpo e pronto para uso em produção!\n");
  } catch (error) {
    console.error("❌ Erro ao limpar clientes:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

cleanTestCustomers();
