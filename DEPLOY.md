# Guia de Deploy para cPanel

## Pré-requisitos

1. **Node.js 18+** instalado no servidor
2. **MySQL 8.0+** configurado
3. Acesso SSH ao cPanel

---

## Passo 1: Preparar o Banco de Dados

### 1.1 Criar banco de dados no cPanel
1. Acesse **MySQL Databases** no cPanel
2. Crie um novo banco de dados (ex: `erp_wiisite`)
3. Crie um usuário MySQL
4. Adicione o usuário ao banco com **ALL PRIVILEGES**

### 1.2 Limpar dados de teste (se necessário)
Execute o script `scripts/clear-database.sql` no phpMyAdmin ou via SSH:
```bash
mysql -u usuario -p nome_banco < scripts/clear-database.sql
```

---

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` no servidor com as configurações de produção:

```env
# Database Configuration (MySQL)
DATABASE_URL=mysql://usuario:senha@localhost:3306/nome_banco

# Authentication
JWT_SECRET=sua-chave-secreta-forte-aqui
OAUTH_SERVER_URL=https://seu-servidor-oauth.com
OWNER_OPEN_ID=seu-open-id

# Application
VITE_APP_ID=erp_wiisite
PORT=3000
NODE_ENV=production
```

---

## Passo 3: Upload dos Arquivos

### Via Git (recomendado)
```bash
cd ~/public_html
git clone seu-repositorio.git erp
cd erp
```

### Via FTP/File Manager
1. Faça upload de todos os arquivos para `public_html/erp`
2. Certifique-se de incluir:
   - `dist/` (arquivos compilados)
   - `drizzle/` (migrações)
   - `package.json`
   - `pnpm-lock.yaml`
   - `.env` (configurações)

---

## Passo 4: Instalar Dependências

```bash
cd ~/public_html/erp
npm install --production
# ou
pnpm install --prod
```

---

## Passo 5: Executar Migrações

```bash
npx drizzle-kit migrate
```

---

## Passo 6: Configurar Node.js no cPanel

### Opção A: Setup Node.js App (cPanel)
1. Vá em **Setup Node.js App**
2. Clique em **Create Application**
3. Configure:
   - **Node.js version**: 18.x ou superior
   - **Application mode**: Production
   - **Application root**: erp
   - **Application URL**: seu-dominio.com/erp
   - **Application startup file**: dist/index.js
4. Clique em **Create**
5. Execute: **Run NPM Install**

### Opção B: PM2 (via SSH)
```bash
npm install -g pm2
pm2 start dist/index.js --name "erp-system"
pm2 save
pm2 startup
```

---

## Passo 7: Configurar Proxy Reverso (opcional)

Se estiver usando Apache, adicione ao `.htaccess`:

```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

---

## Passo 8: Verificar Deploy

1. Acesse `https://seu-dominio.com/erp`
2. Verifique se a página carrega
3. Teste o login
4. Verifique os logs: `pm2 logs erp-system`

---

## Comandos Úteis

```bash
# Ver logs
pm2 logs erp-system

# Reiniciar aplicação
pm2 restart erp-system

# Parar aplicação
pm2 stop erp-system

# Ver status
pm2 status
```

---

## Troubleshooting

### Erro de conexão com banco
- Verifique as credenciais no `.env`
- Confirme que o usuário tem permissões no banco

### Erro 502 Bad Gateway
- Verifique se a aplicação está rodando: `pm2 status`
- Verifique os logs: `pm2 logs`

### Erro de permissão
```bash
chmod -R 755 ~/public_html/erp
chmod 600 ~/public_html/erp/.env
```

---

## Estrutura de Arquivos para Deploy

```
erp/
├── dist/
│   ├── index.js          # Servidor compilado
│   └── public/           # Frontend compilado
│       ├── index.html
│       └── assets/
├── drizzle/
│   ├── schema.ts
│   └── *.sql             # Migrações
├── node_modules/
├── .env                  # Configurações (NÃO versionar)
├── package.json
└── pnpm-lock.yaml
```

---

## Segurança

1. **Nunca** versione o arquivo `.env`
2. Use senhas fortes para o banco de dados
3. Configure HTTPS no cPanel
4. Mantenha o Node.js atualizado
5. Configure backups automáticos do banco
