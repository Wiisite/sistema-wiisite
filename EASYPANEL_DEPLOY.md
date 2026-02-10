# Deploy ERP WiiSite no EasyPanel

## Pré-requisitos
- VPS com EasyPanel instalado
- Domínio configurado apontando para o IP da VPS
- Código no GitHub (recomendado)

---

## Passo 1: Criar Projeto no EasyPanel

1. Acesse o EasyPanel (`http://seu-ip:3000`)
2. Clique em **"+ New Project"**
3. Nome: `erp-wiisite`
4. Clique em **"Create"**

---

## Passo 2: Adicionar Banco de Dados MySQL

1. Dentro do projeto, clique em **"+ New"**
2. Selecione **"Database" > "MySQL"**
3. Configure:
   - **Name**: `mysql`
   - **Root Password**: `sua-senha-root-segura`
   - **Database**: `erp_wiisite`
   - **User**: `erp_user`
   - **Password**: `sua-senha-db-segura`
4. Clique em **"Create"**
5. Aguarde o MySQL iniciar (status verde)

---

## Passo 3: Adicionar Aplicação

### Opção A: Via GitHub (Recomendado)

1. Clique em **"+ New" > "App"**
2. Configure:
   - **Name**: `app`
   - **Source**: `GitHub`
   - Conecte sua conta GitHub
   - Selecione o repositório `erp_system`
   - **Branch**: `master`
3. Clique em **"Create"**

### Opção B: Via Docker Compose

1. Clique em **"+ New" > "Docker Compose"**
2. Cole o conteúdo do `docker-compose.yml`
3. Clique em **"Create"**

---

## Passo 4: Configurar Variáveis de Ambiente

Na aplicação criada, vá em **"Environment"** e adicione:

```
DATABASE_URL=mysql://erp_user:sua-senha-db-segura@mysql:3306/erp_wiisite
JWT_SECRET=gere-uma-chave-secreta-de-32-caracteres-ou-mais
OWNER_OPEN_ID=seu-owner-id-aqui
PORT=3000
NODE_ENV=production
```

**⚠️ Importante**: Use a mesma senha do MySQL configurada no Passo 2.

---

## Passo 5: Configurar Volume para Uploads

Na aba **"Mounts"** ou **"Volumes"**:

1. Clique em **"Add Mount"**
2. Configure:
   - **Type**: Volume
   - **Name**: `uploads`
   - **Mount Path**: `/app/uploads`
3. Salve

---

## Passo 6: Configurar Domínio

Na aba **"Domains"**:

1. Clique em **"Add Domain"**
2. Configure:
   - **Domain**: `erp.seudominio.com.br`
   - **Port**: `3000`
   - **HTTPS**: Ativado
3. Salve

---

## Passo 7: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (5-10 minutos na primeira vez)
3. Verifique os logs se houver erro
4. Status verde = sucesso!

---

## Passo 8: Executar Migrações

Após o deploy com sucesso:

1. Vá na aba **"Console"** ou **"Terminal"**
2. Execute:
```bash
npx drizzle-kit migrate
```
3. Aguarde a mensagem de sucesso

---

## Passo 9: Testar

Acesse seu domínio: `https://erp.seudominio.com.br`

---

## Troubleshooting

### ❌ Erro de conexão com banco
- Verifique se o MySQL está rodando (status verde)
- Confirme que a DATABASE_URL usa `mysql` como host (nome do serviço)
- Verifique usuário e senha

### ❌ Erro no build
- Verifique os logs de build
- Confirme que o Dockerfile existe na raiz

### ❌ Aplicação não inicia
- Verifique os logs da aplicação
- Confirme as variáveis de ambiente

### ❌ Uploads não funcionam
- Verifique se o volume está montado em `/app/uploads`

---

## Comandos Úteis

No terminal da aplicação:

```bash
# Executar migrações
npx drizzle-kit migrate

# Ver estrutura do banco
npx drizzle-kit studio

# Verificar arquivos
ls -la /app/uploads
```

---

## Backup

### Banco de Dados
```bash
mysqldump -h mysql -u erp_user -p erp_wiisite > backup.sql
```

### Uploads
Os uploads estão no volume `uploads` e são persistentes.

---

## Atualizar Aplicação

1. Faça push das alterações para o GitHub
2. No EasyPanel, clique em **"Redeploy"**
3. Aguarde o novo build
