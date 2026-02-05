-- Script para limpar todos os dados do banco de dados
-- Execute este script antes de ir para produção

SET FOREIGN_KEY_CHECKS = 0;

-- Limpar tabelas de checklist
TRUNCATE TABLE task_checklists;
TRUNCATE TABLE project_checklists;

-- Limpar tabelas de tarefas e projetos
TRUNCATE TABLE time_entries;
TRUNCATE TABLE tasks;
TRUNCATE TABLE projects;

-- Limpar tabelas de suporte
TRUNCATE TABLE ticket_comments;
TRUNCATE TABLE tickets;

-- Limpar tabelas de CRM/Leads
TRUNCATE TABLE lead_activities;
TRUNCATE TABLE leads;

-- Limpar tabelas de contratos
TRUNCATE TABLE contract_items;
TRUNCATE TABLE contracts;

-- Limpar tabelas de orçamentos e pedidos
TRUNCATE TABLE budget_items;
TRUNCATE TABLE budgets;
TRUNCATE TABLE orderItems;
TRUNCATE TABLE orders;

-- Limpar tabelas de propostas
TRUNCATE TABLE proposal_items;
TRUNCATE TABLE proposals;

-- Limpar tabelas financeiras
TRUNCATE TABLE accountsPayable;
TRUNCATE TABLE accountsReceivable;
TRUNCATE TABLE recurring_expenses;

-- Limpar tabelas de produtos e assinaturas
TRUNCATE TABLE product_subscriptions;
TRUNCATE TABLE products;

-- Limpar tabela de eventos do calendário
TRUNCATE TABLE calendar_events;

-- Limpar tabela de clientes
TRUNCATE TABLE customers;

-- Limpar categorias financeiras (opcional - pode manter)
-- TRUNCATE TABLE financialCategories;

-- Limpar templates de orçamento (opcional - pode manter)
-- TRUNCATE TABLE budget_templates;

-- NÃO limpar tabela de usuários (users) - necessário para autenticação
-- NÃO limpar tabela de configurações fiscais (tax_settings)

SET FOREIGN_KEY_CHECKS = 1;

-- Mensagem de confirmação
SELECT 'Banco de dados limpo com sucesso!' AS status;
