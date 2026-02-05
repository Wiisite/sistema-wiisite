import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada');
  process.exit(1);
}

async function seedTaxSettings() {
  console.log('🏛️  Criando configurações fiscais padrão...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // Verificar se já existe configuração
    const existing = await connection.query('SELECT COUNT(*) as count FROM tax_settings');
    const count = existing[0][0].count;

    if (count > 0) {
      console.log('⚠️  Configurações fiscais já existem. Pulando...');
      return;
    }

    // Inserir configuração padrão
    await connection.query(`
      INSERT INTO tax_settings (
        cbsRate, ibsRate, irpjRate, csllRate, minimumMargin, taxRegime, isActive
      ) VALUES (
        12.00, 5.00, 15.00, 9.00, 20.00, 'new', 1
      )
    `);

    console.log('✅ Configurações fiscais criadas:');
    console.log('   CBS: 12%');
    console.log('   IBS: 5%');
    console.log('   IRPJ: 15%');
    console.log('   CSLL: 9%');
    console.log('   Margem mínima: 20%');
    console.log('   Regime: Novo (CBS/IBS)');
    
  } catch (error) {
    console.error('❌ Erro ao criar configurações:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedTaxSettings();
