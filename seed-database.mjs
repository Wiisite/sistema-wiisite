import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as schema from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Limpar tabelas existentes
    console.log("🧹 Limpando tabelas existentes...");
    await db.execute(sql`DELETE FROM calendar_events`);
    await db.execute(sql`DELETE FROM recurring_expenses`);
    await db.execute(sql`DELETE FROM contract_items`);
    await db.execute(sql`DELETE FROM contracts`);
    await db.execute(sql`DELETE FROM proposal_items`);
    await db.execute(sql`DELETE FROM proposals`);
    await db.execute(sql`DELETE FROM lead_activities`);
    await db.execute(sql`DELETE FROM leads`);
    await db.execute(sql`DELETE FROM project_checklists`);
    await db.execute(sql`DELETE FROM projects`);
    await db.execute(sql`DELETE FROM accountsReceivable`);
    await db.execute(sql`DELETE FROM accountsPayable`);
    await db.execute(sql`DELETE FROM orderItems`);
    await db.execute(sql`DELETE FROM orders`);
    await db.execute(sql`DELETE FROM products`);
    await db.execute(sql`DELETE FROM suppliers`);
    await db.execute(sql`DELETE FROM customers`);
    console.log("✅ Tabelas limpas");

    // 1. Clientes
    console.log("📋 Criando clientes...");
    const customerIds = [];
    const customers = [
      { name: "Tech Solutions Ltda", email: "contato@techsolutions.com.br", phone: "(11) 98765-4321", address: "Av. Paulista, 1000 - São Paulo, SP" },
      { name: "Comércio Digital ME", email: "vendas@comerciodigital.com", phone: "(21) 97654-3210", address: "Rua das Flores, 250 - Rio de Janeiro, RJ" },
      { name: "Indústria Moderna S.A.", email: "compras@industriamoderna.com.br", phone: "(41) 96543-2109", address: "Av. Industrial, 500 - Curitiba, PR" },
      { name: "Serviços Profissionais", email: "admin@servicospro.com", phone: "(31) 95432-1098", address: "Rua Comercial, 123 - Belo Horizonte, MG" },
      { name: "Startup Inovadora", email: "contato@startupinovadora.io", phone: "(48) 94321-0987", address: "Centro Empresarial, 789 - Florianópolis, SC" },
    ];

    for (const customer of customers) {
      const result = await db.insert(schema.customers).values({ ...customer, createdBy: 1 });
      customerIds.push(result[0].insertId);
    }
    console.log(`✅ ${customerIds.length} clientes criados`);

    // 2. Fornecedores
    console.log("🏭 Criando fornecedores...");
    const supplierIds = [];
    const suppliers = [
      { name: "Fornecedor de Materiais Ltda", email: "vendas@materiais.com.br", phone: "(11) 93210-9876", address: "Rua dos Fornecedores, 100 - São Paulo, SP" },
      { name: "Distribuidora Nacional", email: "comercial@distribuidora.com", phone: "(21) 92109-8765", address: "Av. Logística, 300 - Rio de Janeiro, RJ" },
      { name: "Importadora Global", email: "importacao@global.com.br", phone: "(11) 91098-7654", address: "Porto de Santos, 50 - Santos, SP" },
    ];

    for (const supplier of suppliers) {
      const result = await db.insert(schema.suppliers).values({ ...supplier, createdBy: 1 });
      supplierIds.push(result[0].insertId);
    }
    console.log(`✅ ${supplierIds.length} fornecedores criados`);

    // 3. Produtos
    console.log("📦 Criando produtos...");
    const productIds = [];
    const products = [
      { name: "Website Institucional", description: "Desenvolvimento de website institucional responsivo", price: "5000.00", category: "Serviços Web" },
      { name: "E-commerce Completo", description: "Loja virtual com gateway de pagamento integrado", price: "12000.00", category: "Serviços Web" },
      { name: "Sistema Web Personalizado", description: "Desenvolvimento de sistema web sob medida", price: "25000.00", category: "Desenvolvimento" },
      { name: "Consultoria em TI", description: "Consultoria especializada em tecnologia", price: "200.00", category: "Consultoria" },
      { name: "Hospedagem Anual", description: "Hospedagem web com 99.9% uptime", price: "1200.00", category: "Infraestrutura" },
      { name: "Manutenção Mensal", description: "Manutenção e suporte técnico mensal", price: "800.00", category: "Suporte" },
      { name: "Design de Identidade Visual", description: "Criação de logotipo e identidade visual", price: "3500.00", category: "Design" },
      { name: "Marketing Digital", description: "Gestão de redes sociais e campanhas", price: "2500.00", category: "Marketing" },
    ];

    for (const product of products) {
      const result = await db.insert(schema.products).values({ ...product, stock: 100, createdBy: 1 });
      productIds.push(result[0].insertId);
    }
    console.log(`✅ ${productIds.length} produtos criados`);

    // 4. Pedidos e Itens
    console.log("🛒 Criando pedidos...");
    const orderIds = [];
    const orders = [
      { customerId: customerIds[0], orderNumber: "PED-2025-001", status: "completed", totalAmount: "17000.00", orderDate: new Date("2025-01-15") },
      { customerId: customerIds[1], orderNumber: "PED-2025-002", status: "in_production", totalAmount: "12000.00", orderDate: new Date("2025-02-10") },
      { customerId: customerIds[2], orderNumber: "PED-2025-003", status: "completed", totalAmount: "28500.00", orderDate: new Date("2025-03-05") },
      { customerId: customerIds[3], orderNumber: "PED-2025-004", status: "pending", totalAmount: "5000.00", orderDate: new Date("2025-12-15") },
      { customerId: customerIds[4], orderNumber: "PED-2025-005", status: "completed", totalAmount: "8000.00", orderDate: new Date("2025-11-20") },
    ];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const result = await db.insert(schema.orders).values({ ...order, createdBy: 1 });
      const orderId = result[0].insertId;
      orderIds.push(orderId);

      // Adicionar itens ao pedido
      if (i === 0) {
        await db.insert(schema.orderItems).values([
          { orderId, productId: productIds[0], quantity: 1, unitPrice: "5000.00", subtotal: "5000.00" },
          { orderId, productId: productIds[1], quantity: 1, unitPrice: "12000.00", subtotal: "12000.00" },
        ]);
      } else if (i === 1) {
        await db.insert(schema.orderItems).values([
          { orderId, productId: productIds[1], quantity: 1, unitPrice: "12000.00", subtotal: "12000.00" },
        ]);
      } else if (i === 2) {
        await db.insert(schema.orderItems).values([
          { orderId, productId: productIds[2], quantity: 1, unitPrice: "25000.00", subtotal: "25000.00" },
          { orderId, productId: productIds[6], quantity: 1, unitPrice: "3500.00", subtotal: "3500.00" },
        ]);
      } else if (i === 3) {
        await db.insert(schema.orderItems).values([
          { orderId, productId: productIds[0], quantity: 1, unitPrice: "5000.00", subtotal: "5000.00" },
        ]);
      } else if (i === 4) {
        await db.insert(schema.orderItems).values([
          { orderId, productId: productIds[7], quantity: 1, unitPrice: "2500.00", subtotal: "2500.00" },
          { orderId, productId: productIds[3], quantity: 25, unitPrice: "200.00", subtotal: "5000.00" },
          { orderId, productId: productIds[5], quantity: 1, unitPrice: "800.00", subtotal: "800.00" },
        ]);
      }
    }
    console.log(`✅ ${orderIds.length} pedidos criados`);

    // 5. Contas a Receber
    console.log("💰 Criando contas a receber...");
    await db.insert(schema.accountsReceivable).values([
      { customerId: customerIds[0], orderId: orderIds[0], description: "Pagamento Website + E-commerce", amount: "17000.00", dueDate: new Date("2025-02-15"), receivedDate: new Date("2025-02-10"), status: "received", createdBy: 1 },
      { customerId: customerIds[1], orderId: orderIds[1], description: "Pagamento E-commerce", amount: "12000.00", dueDate: new Date("2025-03-10"), status: "pending", createdBy: 1 },
      { customerId: customerIds[2], orderId: orderIds[2], description: "Pagamento Sistema + Design", amount: "28500.00", dueDate: new Date("2025-04-05"), receivedDate: new Date("2025-03-30"), status: "received", createdBy: 1 },
      { customerId: customerIds[3], orderId: orderIds[3], description: "Pagamento Website", amount: "5000.00", dueDate: new Date("2025-12-20"), status: "overdue", createdBy: 1 },
      { customerId: customerIds[4], orderId: orderIds[4], description: "Pagamento Marketing + Consultoria", amount: "8000.00", dueDate: new Date("2025-12-20"), receivedDate: new Date("2025-11-25"), status: "received", createdBy: 1 },
    ]);
    console.log("✅ Contas a receber criadas");

    // 6. Contas a Pagar
    console.log("💸 Criando contas a pagar...");
    await db.insert(schema.accountsPayable).values([
      { supplierId: supplierIds[0], description: "Licenças de Software", amount: "3000.00", dueDate: new Date("2025-01-30"), paymentDate: new Date("2025-01-28"), status: "paid", category: "Software", createdBy: 1 },
      { supplierId: supplierIds[1], description: "Servidores Cloud", amount: "5000.00", dueDate: new Date("2025-02-28"), paymentDate: new Date("2025-02-25"), status: "paid", category: "Infraestrutura", createdBy: 1 },
      { supplierId: supplierIds[2], description: "Equipamentos de TI", amount: "8000.00", dueDate: new Date("2025-03-30"), status: "pending", category: "Equipamentos", createdBy: 1 },
      { supplierId: supplierIds[0], description: "Renovação de Certificados SSL", amount: "500.00", dueDate: new Date("2025-12-25"), status: "pending", category: "Segurança", createdBy: 1 },
    ]);
    console.log("✅ Contas a pagar criadas");

    // 7. Projetos
    console.log("📊 Criando projetos...");
    const projectIds = [];
    const projects = [
      { customerId: customerIds[0], name: "Redesign E-commerce de Moda", description: "Redesign completo da loja online", status: "development", progress: 65, value: "25000.00", deadline: new Date("2025-05-30"), createdBy: 1 },
      { customerId: customerIds[1], name: "Dashboard UI para SaaS Acadêmico", description: "Interface de dashboard para plataforma educacional", status: "design", progress: 30, value: "12500.00", deadline: new Date("2025-05-31"), createdBy: 1 },
      { customerId: customerIds[2], name: "Site Institucional Jurídico", description: "Website para escritório de advocacia", status: "launched", progress: 100, value: "8000.00", deadline: new Date("2025-03-09"), createdBy: 1 },
      { customerId: customerIds[3], name: "Sistema de Gestão Interna", description: "ERP customizado para gestão empresarial", status: "development", progress: 15, value: "45000.00", deadline: new Date("2025-08-30"), createdBy: 1 },
    ];

    for (const project of projects) {
      const result = await db.insert(schema.projects).values(project);
      projectIds.push(result[0].insertId);
    }
    console.log(`✅ ${projectIds.length} projetos criados`);









    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\n📊 Resumo:");
    console.log(`   - ${customerIds.length} clientes`);
    console.log(`   - ${supplierIds.length} fornecedores`);
    console.log(`   - ${productIds.length} produtos`);
    console.log(`   - ${orderIds.length} pedidos`);
    console.log(`   - 5 contas a receber`);
    console.log(`   - 4 contas a pagar`);
    console.log(`   - ${projectIds.length} projetos`);


  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
