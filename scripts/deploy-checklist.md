# Checklist de Deploy - cPanel

## Antes do Deploy

- [ ] Verificar se o build local funciona: `pnpm run build:prod`
- [ ] Testar a aplicação localmente: `pnpm run start`
- [ ] Verificar se todas as variáveis de ambiente estão documentadas
- [ ] Fazer backup do banco de dados de produção (se existir)

---

## No cPanel

### 1. Banco de Dados
- [ ] Criar banco de dados MySQL
- [ ] Criar usuário MySQL
- [ ] Dar permissões ALL PRIVILEGES ao usuário
- [ ] Anotar: nome do banco, usuário e senha

### 2. Upload de Arquivos
- [ ] Fazer upload via Git ou FTP para `public_html/erp` (ou subdomínio)
- [ ] Verificar se todos os arquivos foram enviados

### 3. Configuração do Node.js
- [ ] Acessar "Setup Node.js App" no cPanel
- [ ] Criar nova aplicação:
  - Node.js version: 18.x ou superior
  - Application mode: Production
  - Application root: caminho da pasta
  - Application startup file: `dist/index.js`
- [ ] Clicar em "Run NPM Install"

### 4. Variáveis de Ambiente
- [ ] Criar arquivo `.env` no servidor com:
  ```
  DATABASE_URL=mysql://usuario:senha@localhost:3306/banco
  JWT_SECRET=chave-secreta-forte
  NODE_ENV=production
  PORT=3000
  ```
- [ ] Verificar permissões do arquivo: `chmod 600 .env`

### 5. Migrações do Banco
- [ ] Executar via SSH: `npx drizzle-kit migrate`
- [ ] Verificar se as tabelas foram criadas

### 6. Iniciar Aplicação
- [ ] No cPanel Node.js App, clicar em "Start App"
- [ ] Ou via SSH: `pm2 start dist/index.js --name erp-system`

---

## Verificação Pós-Deploy

- [ ] Acessar a URL da aplicação
- [ ] Testar login
- [ ] Verificar se os dados carregam corretamente
- [ ] Testar criação de um registro
- [ ] Verificar logs: `pm2 logs erp-system`

---

## Troubleshooting

### Erro 502 Bad Gateway
1. Verificar se a aplicação está rodando: `pm2 status`
2. Verificar logs: `pm2 logs`
3. Reiniciar: `pm2 restart erp-system`

### Erro de Conexão com Banco
1. Verificar credenciais no `.env`
2. Testar conexão: `mysql -u usuario -p banco`
3. Verificar se o usuário tem permissões

### Página em Branco
1. Verificar se o build do frontend existe: `ls dist/public/`
2. Verificar configuração do .htaccess
3. Limpar cache do navegador

### Erro de Permissão
```bash
chmod -R 755 ~/public_html/erp
chmod 600 ~/public_html/erp/.env
```

---

## Comandos Úteis (SSH)

```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs erp-system --lines 100

# Reiniciar aplicação
pm2 restart erp-system

# Parar aplicação
pm2 stop erp-system

# Deletar aplicação do PM2
pm2 delete erp-system

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
```

---

## Atualizações Futuras

1. Fazer backup do banco de dados
2. Fazer pull das alterações: `git pull origin main`
3. Instalar dependências: `pnpm install --prod`
4. Executar build: `pnpm run build`
5. Executar migrações: `npx drizzle-kit migrate`
6. Reiniciar aplicação: `pm2 restart erp-system`
