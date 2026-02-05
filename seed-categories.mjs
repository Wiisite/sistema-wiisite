import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { financialCategories } from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🔍 Verificando categorias financeiras...');

try {
  // Verificar se existem categorias
  const existing = await db.select().from(financialCategories);
  console.log(`📊 Categorias encontradas: ${existing.length}`);
  
  if (existing.length === 0) {
    console.log('➕ Criando categorias padrão...');
    
    const defaultCategories = [
      // Despesas
      { name: 'Salários e Encargos', type: 'expense', color: '#ef4444', createdBy: 1 },
      { name: 'Aluguel', type: 'expense', color: '#f97316', createdBy: 1 },
      { name: 'Energia Elétrica', type: 'expense', color: '#f59e0b', createdBy: 1 },
      { name: 'Água', type: 'expense', color: '#3b82f6', createdBy: 1 },
      { name: 'Internet e Telefone', type: 'expense', color: '#8b5cf6', createdBy: 1 },
      { name: 'Material de Escritório', type: 'expense', color: '#ec4899', createdBy: 1 },
      { name: 'Manutenção', type: 'expense', color: '#6366f1', createdBy: 1 },
      { name: 'Marketing e Publicidade', type: 'expense', color: '#14b8a6', createdBy: 1 },
      { name: 'Impostos', type: 'expense', color: '#dc2626', createdBy: 1 },
      { name: 'Fornecedores', type: 'expense', color: '#059669', createdBy: 1 },
      { name: 'Outras Despesas', type: 'expense', color: '#64748b', createdBy: 1 },
      
      // Receitas
      { name: 'Vendas de Produtos', type: 'income', color: '#10b981', createdBy: 1 },
      { name: 'Prestação de Serviços', type: 'income', color: '#06b6d4', createdBy: 1 },
      { name: 'Assinaturas', type: 'income', color: '#8b5cf6', createdBy: 1 },
      { name: 'Outras Receitas', type: 'income', color: '#22c55e', createdBy: 1 },
    ];
    
    for (const category of defaultCategories) {
      await db.insert(financialCategories).values(category);
      console.log(`  ✅ ${category.name} (${category.type})`);
    }
    
    console.log(`\n✨ ${defaultCategories.length} categorias criadas com sucesso!`);
  } else {
    console.log('✅ Categorias já existem no banco de dados');
    existing.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.type})`);
    });
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.error(error);
} finally {
  await connection.end();
}
