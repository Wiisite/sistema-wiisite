import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada');
  process.exit(1);
}

async function cleanDatabase() {
  console.log('🧹 Iniciando limpeza do banco de dados...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // Desabilitar checagem de foreign keys temporariamente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Deletar dados de todas as tabelas (exceto user e financialCategories)
    const tablesToClean = [
      'productSubscriptions',
      'recurringExpenses',
      'tickets',
      'ticketComments',
      'tasks',
      'contracts',
      'leads',
      'orderItems',
      'orders',
      'accountsReceivable',
      'accountsPayable',
      'projectTasks',
      'projects',
      'products',
      'customers',
      'suppliers',
    ];

    for (const table of tablesToClean) {
      try {
        const result = await connection.query(`DELETE FROM ${table}`);
        console.log(`✅ Tabela ${table} limpa`);
      } catch (error) {
        console.log(`⚠️  Tabela ${table}: ${error.message}`);
      }
    }

    // Reabilitar checagem de foreign keys
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✨ Limpeza concluída com sucesso!');
    console.log('📝 Mantidos: usuários e categorias financeiras');
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

cleanDatabase();
