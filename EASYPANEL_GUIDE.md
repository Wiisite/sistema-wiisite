# Guia de Deploy no EasyPanel

O EasyPanel é perfeito para este projeto pois ele gerencia o Docker automaticamente.

## 1. Preparar o Código (GitHub - Recomendado)
Execute os passos do arquivo **`GITHUB_SETUP.md`** para enviar seu código para o GitHub. É muito melhor que fazer upload manual.

## 2. Criar o Banco de Dados (MySQL)
1. No seu Painel do EasyPanel, crie um novo **Service**.
2. Escolha **MySQL**.
3. Defina um nome (ex: `erp-db`).
4. **Importante**: Anote a `PASSWORD` e o `Internal Host` (geralmente é o nome do serviço, ex: `erp-db`).
5. Crie um banco de dados chamado `erp_wiisite` (geralmente via PHPMyAdmin ou CLI do EasyPanel).

## 3. Criar a Aplicação (App)
1. Crie um novo **Service** > **App**.
2. **Source**: Conecte seu repositório Git.
3. **Build Method**: Escolha **Dockerfile** (o arquivo já está na raiz do projeto).
4. **Env Vars** (Variáveis de Ambiente):
   Adicione as seguintes variáveis:
   ```env
   DATABASE_URL=mysql://root:SUA_SENHA_DO_MYSQL@erp-db:3306/erp_wiisite
   JWT_SECRET=crie-uma-senha-segura
   OWNER_OPEN_ID=seu-id
   NODE_ENV=production
   PORT=3000
   ```
   *Nota: Ajuste `erp-db` para o nome do seu serviço de banco.*

5. **Networking / Ports**:
   - Container Port: 3000
   - HTTP Port: 80 (ou o que você quiser expor)

## 4. Deploy
1. Clique em **Deploy**.
2. O EasyPanel vai ler o `Dockerfile`, baixar as dependências e iniciar o servidor.

## 5. Rodar Migrações
Após o deploy ter sucesso (a bolinha ficar verde):
1. Abra o **Console** do serviço da aplicação no EasyPanel.
2. Digite:
   ```bash
   npx drizzle-kit migrate
   ```
3. Pronto! O banco está criado e o sistema rodando.
