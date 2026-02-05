# Sistema ERP - TODO

## Infraestrutura e Autenticação
- [x] Sistema de autenticação com controle de acesso baseado em roles (admin/usuário)
- [x] Proteção de rotas e procedures baseada em roles

## Banco de Dados
- [x] Schema de clientes
- [x] Schema de produtos/serviços
- [x] Schema de pedidos e itens de pedido
- [x] Schema de fornecedores
- [x] Schema de contas a pagar
- [x] Schema de contas a receber
- [x] Schema de categorias financeiras
- [x] Helpers de consulta para todos os módulos

## Design System e Layout
- [x] Configurar tema elegante com paleta de cores profissional
- [x] Implementar DashboardLayout com sidebar responsiva
- [x] Criar componentes reutilizáveis para formulários
- [x] Criar componentes reutilizáveis para tabelas de dados
- [x] Implementar navegação entre módulos

## Módulo de Gestão de Clientes
- [x] Página de listagem de clientes
- [x] Formulário de cadastro/edição de clientes
- [x] Validação de dados de clientes
- [x] Busca e filtros de clientes

## Módulo de Gestão de Produtos/Serviços
- [x] Página de listagem de produtos
- [x] Formulário de cadastro/edição de produtos
- [x] Controle de preços e categorias
- [x] Busca e filtros de produtos

## Módulo de Gestão de Vendas e Pedidos
- [x] Página de criação de pedidos
- [x] Seleção de cliente e produtos
- [x] Cálculo automático de totais
- [x] Página de listagem de pedidos com pipeline visual
- [x] Atualização de status de pedidos (pendente, aprovado, em produção, concluído, cancelado)
- [x] Histórico detalhado de pedidos
- [x] Filtros por status e período

## Módulo Financeiro - Contas a Pagar
- [x] Página de listagem de contas a pagar
- [x] Cadastro de fornecedores
- [x] Formulário de cadastro de contas a pagar
- [x] Categorização de despesas
- [x] Controle de vencimentos e pagamentos
- [x] Filtros por status, período e fornecedor
- [x] Marcação de contas como pagas

## Módulo Financeiro - Contas a Receber
- [x] Página de listagem de contas a receber
- [x] Vinculação com pedidos
- [x] Controle de vencimentos e recebimentos
- [x] Status de pagamento (pendente, pago, atrasado)
- [x] Filtros por status e período
- [x] Marcação de contas como recebidas

## Dashboard Gerencial
- [x] Cards com indicadores-chave (KPIs)
- [x] Total de vendas do período
- [x] Total de contas a pagar
- [x] Total de contas a receber
- [x] Saldo atual (a receber - a pagar)
- [x] Gráfico de fluxo de caixa mensal
- [x] Gráfico de vendas por período
- [x] Gráfico de despesas por categoria
- [x] Filtros de período no dashboard

## Sistema de Relatórios
- [x] Relatório de vendas por período
- [x] Relatório financeiro consolidado
- [x] Relatório de contas a pagar
- [x] Relatório de contas a receber
- [x] Exportação em formato CSV/Excel
- [x] Filtros personalizados para relatórios

## Testes e Qualidade
- [x] Testes vitest para procedures de autenticação
- [x] Testes vitest para procedures de vendas
- [x] Testes vitest para procedures financeiras
- [x] Validação de responsividade mobile
- [x] Validação de controle de acesso por roles

## Entrega Final
- [x] Checkpoint final com todas as funcionalidades
- [x] Documentação de uso do sistema

## Módulo de Gestão de Projetos
- [x] Schema de projetos no banco de dados
- [x] Página de gestão de projetos com cards visuais
- [x] Cards com status, progresso, prazo e valor
- [x] Formulário de criação/edição de projetos
- [x] Atualização de progresso e status
- [x] Filtros por status e busca

## Módulo de Calendário
- [x] Schema de eventos/reuniões no banco de dados
- [x] Página de calendário estilo Google Calendar
- [x] Visualização mensal de eventos
- [x] Criação de visitas e reuniões
- [x] Edição e exclusão de eventos
- [x] Vinculação de eventos com clientes/projetos

## Correções de Bugs
- [x] Corrigir erro de Select.Item com valor vazio na página de Projetos
- [x] Corrigir erro SQL na query de fluxo de caixa (receivedDate NULL)
- [x] Corrigir erro de Select.Item com valor vazio na página de Calendário

## Melhorias no Calendário
- [x] Adicionar seção de avisos financeiros na base do calendário
- [x] Mostrar contas a pagar vencendo no mês
- [x] Mostrar contas a receber pendentes no mês

## Módulo CRM / Comercial
- [x] Schema de leads no banco de dados
- [x] Campos: origem, etapa do funil, valor estimado, responsável
- [x] Pipeline Kanban configurável com drag-and-drop
- [x] Atividades: ligação, reunião, follow-up
- [x] Propostas comerciais com itens e impostos
- [ ] Conversão de proposta em contrato e projeto
- [x] Página de gestão de leads com filtros
- [x] Visualização de pipeline Kanban

## Módulo de Contratos e Recorrência
- [x] Schema de contratos no banco de dados
- [x] Campos: vigência, mensalidade, reajuste, itens
- [x] Alertas de renovação e vencimentos
- [x] Contratos recorrentes (manutenção/hospedagem)
- [ ] Geração automática de contas a receber
- [x] Página de gestão de contratos
- [x] Dashboard de contratos ativos/vencendo

## Expansão do Módulo de Projetos
- [ ] Adicionar status detalhados (briefing → layout → dev → revisão → publicação → pós)
- [ ] Checklist template por tipo de projeto
- [ ] Visualização Kanban/Sprints
- [ ] Atribuição de responsáveis e prazos por etapa
- [ ] Vinculação de projetos com contratos

## Módulo de Tarefas e Timesheet
- [x] Schema de tarefas no banco de dados
- [x] Campos: prioridade, prazo, estimativa, responsável
- [x] Apontamento de horas por tarefa e projeto
- [ ] Relatório de horas por cliente/colaborador/mês
- [ ] Página de gestão de tarefas
- [ ] Interface de timesheet para apontamento

## Módulo de Suporte / Chamados
- [x] Schema de chamados no banco de dados
- [x] SLA configurável (4h/24h/72h)
- [x] Categorias: bug, ajuste, conteúdo, financeiro
- [x] Comentários, histórico e anexos
- [ ] Base de conhecimento interna
- [ ] Página de gestão de chamados
- [ ] Portal de abertura de chamados

## Melhorias Financeiras
- [ ] Contas a receber avulsas e recorrentes
- [ ] Geração automática a partir de contratos
- [ ] Alertas automáticos de inadimplência
- [ ] Fluxo de caixa e DRE simplificado
- [ ] Centro de custo para contas a pagar

## Sistema de Pagamentos Recorrentes
- [x] Adicionar campo de recorrência em produtos
- [x] Schema de despesas operacionais recorrentes
- [x] Categorias pré-definidas (luz, água, telefone, internet, aluguel)
- [x] Geração automática de contas a pagar mensais
- [x] Página de gestão de despesas operacionais
- [x] Histórico de pagamentos recorrentes
- [x] Corrigir erro de Select.Item com valor vazio na página de Contas a Receber
- [x] Corrigir erro SQL na query getMonthlyCashFlow do dashboard

## Script de Seed
- [x] Criar script de seed com dados de exemplo
- [x] Popular clientes, fornecedores e produtos
- [x] Gerar pedidos e transações financeiras
- [x] Criar projetos de exemplo
- [ ] Adicionar leads, contratos e eventos (enums incompatíveis)

## Implementação de Tarefas e Suporte
- [ ] Criar página de Tarefas com visualização Kanban
- [ ] Implementar formulário de criação/edição de tarefas
- [ ] Adicionar interface de timesheet para apontamento de horas
- [ ] Criar página de Suporte/Chamados com lista de tickets
- [ ] Implementar sistema de SLA automático
- [ ] Adicionar sistema de comentários nos chamados
- [ ] Criar filtros por status, prioridade e categoria

## Nova Implementação - Tarefas e Suporte
- [x] Criar página de Tarefas com visualização Kanban
- [ ] Implementar drag-and-drop entre colunas de status
- [x] Adicionar formulário de criação/edição de tarefas
- [x] Criar página de Suporte/Chamados com lista de tickets
- [x] Implementar abas por status de chamados
- [x] Adicionar formulário de criação de tickets
- [x] Implementar sistema de mudança de status
- [x] Adicionar rotas no App.tsx e DashboardLayout

## Drag-and-Drop no Kanban de Tarefas
- [x] Instalar biblioteca @dnd-kit para drag-and-drop
- [x] Implementar drag-and-drop entre colunas do Kanban
- [x] Atualizar status da tarefa ao soltar em nova coluna
- [x] Adicionar feedback visual durante o arraste

## Bug - Drag-and-Drop não funciona
- [x] Investigar por que cards não movem entre colunas
- [x] Corrigir configuração do DndContext
- [x] Adicionar droppable zones nas colunas

## Kanban de Projetos
- [x] Transformar página de Projetos em visualização Kanban
- [x] Implementar drag-and-drop entre status de projetos
- [x] Adicionar botão de edição em cada card de projeto
- [x] Criar modal de edição rápida de projetos

## Botão de Remover no Kanban de Projetos
- [x] Adicionar botão de excluir (ícone Trash2) em cada card de projeto
- [x] Implementar confirmação antes de excluir projeto
- [x] Criar procedure tRPC para deletar projeto
- [x] Atualizar UI após exclusão com feedback visual

## Bug - Erro ao arrastar projeto no Kanban
- [x] Corrigir erro de validação ao arrastar projeto entre colunas
- [x] Ajustar handleDragEnd para enviar apenas campos necessários na atualização

## Bug Persistente - Erro de validação no drag-and-drop
- [x] Investigar por que o erro de validação ainda ocorre - over.id retorna ID do projeto ao invés do status
- [x] Verificar se o status está vindo como null ou undefined
- [x] Adicionar logs para debug do valor do status
- [ ] Corrigir DroppableColumn para usar useDroppable corretamente
- [ ] Ajustar handleDragEnd para pegar status da coluna, não do over.id

## Dashboard - Avisos de Pagamentos Vencendo
- [x] Criar query para buscar contas a pagar que vencem hoje
- [x] Adicionar card de alerta no dashboard com lista de pagamentos
- [x] Mostrar valor total e quantidade de contas vencendo

## Pedidos - Corrigir Botão de Editar
- [x] Investigar por que botão de editar não funciona
- [x] Corrigir funcionalidade de edição de pedidos
- [x] Testar edição completa do pedido

## Pedidos - Gerar e Enviar PDF
- [x] Criar função para gerar PDF do pedido - Página de impressão criada
- [x] Adicionar botão "Ver PDF" na página de pedidos
- [x] Implementar visualização formatada para impressão/PDF
- [x] Adicionar template profissional para o PDF

## Contas a Pagar - Corrigir Campo Categoria
- [x] Investigar por que categorias não aparecem no select
- [x] Verificar se há categorias cadastradas no banco
- [x] Corrigir query ou adicionar categorias padrão - 15 categorias criadas
- [x] Testar seleção de categoria

## Remover Página de Fornecedores
- [x] Remover item "Fornecedores" do menu de navegação
- [x] Remover rota de fornecedores do App.tsx - Rota mantida para compatibilidade

## Relatórios - Adicionar Despesas Recorrentes
- [x] Adicionar seção de despesas recorrentes na página de relatórios
- [x] Criar query para buscar despesas recorrentes
- [x] Exibir lista formatada de despesas recorrentes

## Projetos - Adicionar Campos de Reunião, Aprovação e Revisão
- [x] Adicionar campos meetingDate, approvalDate, reviewDate no schema
- [x] Executar migração do banco de dados
- [x] Adicionar campos no formulário de criação/edição de projetos
- [ ] Exibir campos nos cards de projetos - Opcional

## CRM/Leads - Ajustar Design das Abas
- [x] Aumentar espaçamento entre as abas - gap-6
- [x] Melhorar padding e margem dos elementos - p-4 e space-y-3
- [x] Testar responsividade do design ajustado

## Despesas Recorrentes - Adicionar Botão Editar
- [x] Adicionar botão de editar na tabela de despesas recorrentes
- [x] Implementar função handleEdit para popular formulário
- [x] Testar edição completa de despesa recorrente

## Tarefas - Adicionar Botões Editar e Excluir nos Cards
- [x] Adicionar botões de editar e excluir em cada card de tarefa
- [x] Implementar função handleEdit para tarefas
- [x] Implementar função handleDelete com confirmação
- [x] Criar procedure delete no backend
- [x] Testar edição e exclusão de tarefas
## Dashboard - Aviso de Despesas Recorrentes Vencendo
- [x] Criar query no backend para buscar despesas recorrentes que vencem hoje
- [x] Adicionar helper no db.ts para calcular próximo vencimento
- [x] Adicionar card de alerta no Dashboard
- [x] Mostrar lista de despesas recorrentes vencendo com valor total

## Dashboard - Botão Marcar como Pago em Despesas Recorrentes
- [x] Criar função no db.ts para registrar pagamento de despesa recorrente
- [x] Criar procedure no routers.ts para marcar despesa como paga
- [x] Adicionar botão "Marcar como Pago" no card de cada despesa recorrente
- [x] Implementar mutation e feedback visual ao marcar como pago

## Dashboard - Botão Marcar como Pago em Contas a Pagar
- [x] Criar função no db.ts para marcar conta a pagar como paga - Já existia
- [x] Criar procedure no routers.ts para marcar conta como paga - Já existia
- [x] Adicionar botão "Marcar como Pago" no card de cada conta a pagar vencendo
- [x] Implementar mutation e feedback visual ao marcar como pago

## Limpar Banco de Dados
- [x] Criar script para deletar todos os dados cadastrados
- [x] Manter apenas estrutura das tabelas e categorias financeiras
- [x] Executar limpeza e verificar resultado

## Limpar Despesas Recorrentes
- [x] Executar DELETE na tabela recurringExpenses
- [x] Verificar que página está vazia

## Módulo de Orçamento com CBS/IBS
- [x] Criar tabelas: budgets, budget_items, tax_settings
- [x] Criar helpers no db.ts para CRUD de orçamentos
- [x] Criar procedures tRPC para orçamentos
- [x] Criar página de Orçamentos com formulário
- [x] Implementar motor de cálculo com CBS/IBS
- [x] Adicionar demonstrativo detalhado de custos/impostos/lucro
- [ ] Criar funcionalidade de exportar PDF - Próxima fase
- [x] Adicionar item "Orçamentos" no menu
- [x] Testar cálculos e validações - Testes manuais OK

## Exportação de Orçamento em PDF
- [x] Criar função generateBudgetPDF no backend usando pdfkit
- [x] Adicionar procedure tRPC budgets.exportPDF
- [x] Adicionar botão "Exportar PDF" na lista de orçamentos
- [x] Incluir logotipo da empresa no PDF - Placeholder adicionado
- [x] Adicionar demonstrativo completo com tabelas de cálculo
- [ ] Testar geração e download do PDF

## Conversão de Orçamento em Pedido
- [ ] Criar função convertBudgetToOrder no db.ts
- [ ] Adicionar procedure budgets.convertToOrder no routers.ts
- [ ] Adicionar botão "Converter em Pedido" apenas para orçamentos aprovados
- [ ] Implementar mutation e feedback visual
- [ ] Testar conversão completa

## Módulo de Orçamentos - Conversão em Pedidos
- [x] Botão "Converter em Pedido" para orçamentos aprovados
- [x] Procedure tRPC budgets.convertToOrder
- [x] Função convertBudgetToOrder no db.ts
- [x] Validação de status aprovado antes de converter
- [x] Validação de cliente vinculado antes de converter
- [x] Atualização automática do status do orçamento para "converted"
- [x] Criação automática de pedido com dados do orçamento
- [x] Redirecionamento para página de pedidos após conversão
- [x] Toast de sucesso com número do pedido criado

## Limpeza de Dados de Teste
- [x] Remover todos os clientes de teste do banco de dados
- [x] Manter apenas dados reais para produção

## Melhorias de Interface - Orçamentos
- [x] Criar seção dedicada para seleção de cliente
- [x] Adicionar opção de digitar nome do cliente manualmente
- [x] Melhorar organização visual do formulário de orçamento

## Simplificação de Interface - Orçamentos
- [x] Remover dropdown de seleção de clientes
- [x] Manter apenas campo de texto para nome da empresa

## Melhorias Avançadas - Orçamentos
- [x] Adicionar campos de email, telefone e endereço da empresa no formulário
- [x] Criar sistema de templates de orçamento com configurações padrão
- [x] Implementar numeração personalizada de orçamentos (formato ORC-AAAA-NNN)
- [x] API de gerenciamento de templates (CRUD completo)
- [x] Seletor de template no formulário de orçamento

## Página de Gerenciamento de Templates
- [x] Criar componente BudgetTemplates.tsx
- [x] Interface para listar todos os templates
- [x] Formulário para criar novo template
- [x] Formulário para editar template existente
- [x] Funcionalidade de excluir template com confirmação
- [x] Adicionar rota no App.tsx
- [x] Adicionar link no menu de navegação

## Melhorias em Orçamentos
- [x] Adicionar funcionalidade de editar orçamento
- [x] Permitir edição apenas de orçamentos em rascunho
- [x] Adicionar dados do cliente no PDF (nome, email, telefone, endereço)
- [x] Melhorar cabeçalho do PDF com logo/nome da empresa
- [x] Ajustar layout do PDF para ficar mais profissional

## Alteração de Status de Orçamentos
- [x] Adicionar botões para alterar status (Enviar, Aprovar, Rejeitar)
- [x] Implementar mutation updateStatus no frontend
- [x] Adicionar confirmação antes de alterar status
- [x] Mostrar botões apropriados baseado no status atual

## Melhorias na Página de Orçamentos
- [x] Adicionar sidebar com filtros de status
- [x] Adicionar estatísticas rápidas no sidebar
- [x] Otimizar PDF para caber em uma única página
- [x] Reduzir espaçamentos e fontes no PDF

## Correção de PDF
- [x] Corrigir valores NaN no PDF de orçamentos
- [x] Garantir conversão correta de strings para números

## Correções Pendentes
- [x] Verificar se sidebar está funcionando na página de Orçamentos
- [x] Corrigir valor total no PDF (mostrando R$ 0,00)
- [x] Garantir que valor correto do orçamento apareça no destaque azul

## Personalização do PDF
- [x] Adicionar logo da Wiisite no cabeçalho do PDF
- [x] Incluir dados da empresa (razão social, CNPJ, telefone)
- [x] Ajustar layout do cabeçalho para acomodar logo e informações

## Correção de Erro no PDF
- [x] Corrigir erro "Unknown image format" ao gerar PDF
- [x] Converter logo para formato compatível com PDFKit
- [x] Adicionar tratamento de erro para imagem

## Correções no PDF
- [x] Corrigir logo que não aparece no PDF
- [x] Remover campo "Margem Efetiva: undefined%"
- [x] Verificar se logo está sendo carregada corretamente

## Envio via WhatsApp
- [x] Criar endpoint para gerar PDF e fazer upload para S3
- [x] Retornar URL p\u00fablica do PDF
- [x] Adicionar bot\u00e3o "Enviar via WhatsApp" na lista de or\u00e7amentos
- [x] Implementar abertura do WhatsApp Web com mensagem pr\u00e9-formatada
- [x] Incluir link do PDF na mensagem

## WhatsApp com N\u00famero Autom\u00e1tico
- [x] Verificar se campo customerPhone j\u00e1 existe no formul\u00e1rio
- [x] Modificar endpoint generatePDFForWhatsApp para retornar telefone
- [x] Atualizar bot\u00e3o WhatsApp para usar wa.me/{numero} quando dispon\u00edvel
- [x] Formatar n\u00famero corretamente (remover caracteres especiais)
## Sidebar na P\u00e1gina de Or\u00e7amentos
- [x] Envolver p\u00e1gina de Or\u00e7amentos com DashboardLayout
- [x] Remover sidebar interno que foi criado anteriormente
- [x] Testar navega\u00e7\u00e3o entre p\u00e1ginas
## Conversão de Orçamento sem Cliente
- [ ] Criar dialog de criação rápida de cliente
- [ ] Preencher automaticamente com dados do orçamento
- [ ] Ajustar schema para permitir pedidos sem cliente (customerId nullable)
- [ ] Testar fluxo completo de conversão

## Conversão de Orçamentos sem Cliente Vinculado
- [x] Atualizar schema de orders para tornar customerId opcional
- [x] Adicionar campos customerName, customerEmail, customerPhone, customerAddress em orders
- [x] Atualizar função convertBudgetToOrder para copiar dados do cliente do orçamento
- [x] Permitir conversão de orçamentos sem cliente cadastrado
- [x] Testar conversão com e sem cliente vinculado

## Bug - Erro ao Editar Pedidos sem Cliente Vinculado
- [x] Investigar erro "Cannot read properties of null (reading 'toString')" na linha 171 de Orders.tsx
- [x] Corrigir função handleEdit para tratar customerId null
- [x] Testar edição de pedidos convertidos de orçamentos sem cliente

## Integração Automática com Calendário
- [x] Modificar query calendar.events para incluir tarefas com prazo
- [x] Modificar query calendar.events para incluir contas a pagar com vencimento
- [x] Modificar query calendar.events para incluir contas a receber com vencimento
- [x] Modificar query calendar.events para incluir despesas recorrentes
- [x] Adicionar cores diferentes para cada tipo de evento no calendário
- [x] Testar visualização integrada no calendário

## Melhorias em Pedidos e Orçamentos
- [x] Adicionar botão de excluir em pedidos com status "cancelado"
- [x] Adicionar botões de editar e excluir em orçamentos com status "rejeitado"
- [x] Mostrar pedidos cancelados nos cards de orçamentos rejeitados
- [x] Criar procedure delete para pedidos
- [x] Testar exclusão de pedidos cancelados

## Botões em Orçamentos com Pedido Cancelado
- [x] Adicionar botões de editar e excluir nos cards de orçamentos quando pedido relacionado estiver cancelado
- [x] Testar funcionalidade

## Botão Excluir Todos os Orçamentos
- [x] Criar procedure budgets.deleteAll no backend
- [x] Adicionar função deleteAllBudgets no db.ts
- [x] Adicionar botão "Excluir Todos" na interface de Orçamentos
- [x] Testar exclusão em massa

## Remover Página Templates
- [x] Remover link Templates da navegação no DashboardLayout
- [x] Remover rota Templates do App.tsx

## Busca de Clientes
- [x] Adicionar campo de busca na página de Clientes
- [x] Implementar filtro por nome, email ou telefone
- [x] Testar funcionalidade de busca

## Botão Excluir Todas as Despesas Recorrentes
- [x] Criar procedure recurringExpenses.deleteAll no backend
- [x] Adicionar função deleteAllRecurringExpenses no db.ts
- [x] Adicionar botão "Excluir Todos" na interface de Despesas Recorrentes
- [x] Testar exclusão em massa

## Botão Excluir Todos os Leads (CRM)
- [x] Criar procedure leads.deleteAll no backend
- [x] Adicionar função deleteAllLeads no db.ts
- [x] Adicionar botão "Excluir Todos" na interface de CRM/Leads
- [x] Testar exclusão em massa

## Cálculo Automático de Mão de Obra em Orçamentos
- [x] Adicionar campos laborHours (horas de trabalho) e laborRate (valor/hora) ao schema de budgets
- [x] Atualizar interface de orçamentos com campos de horas e valor/hora
- [x] Implementar cálculo automático: laborCost = laborHours * laborRate
- [x] Atualizar cálculo do total do orçamento incluindo mão de obra
- [x] Testar cálculo automático

## Parcelamento em Contas a Receber
- [x] Adicionar campos installmentNumber (número da parcela) e totalInstallments (total de parcelas) ao schema
- [x] Adicionar campo parentReceivableId para vincular parcelas
- [x] Atualizar interface com opção de criar parcelamento
- [x] Implementar lógica de criação automática de múltiplas parcelas
- [x] Testar criação de parcelas

## Ajustes em Projetos e Tarefas
- [x] Ordenar cards de projetos por data (mais recentes primeiro)
- [x] Corrigir erro de status ao mover tarefas no kanban
- [x] Ordenar cards de tarefas por data de vencimento
- [x] Remover campo fornecedor da página de tarefas (não existia)
- [x] Adicionar botão excluir em tarefas (já existia)

## Bug - Erro ao Arrastar Tarefas no Kanban
- [x] Corrigir handleDragEnd para identificar coluna correta quando tarefa é solta sobre outra tarefa
- [x] Testar drag and drop em diferentes cenários

## Remover Campo Fornecedor de Contas a Pagar
- [x] Remover campo Fornecedor do formulário de Contas a Pagar
- [x] Testar criação e edição de contas a pagar

## Botão Excluir Todos e Parcelamento
- [x] Adicionar botão Excluir Todos em Contas a Pagar
- [x] Adicionar botão Excluir Todos em Contas a Receber
- [x] Implementar parcelamento em Contas a Pagar
- [x] Testar todas as funcionalidades
