# Guia de Deploy no EasyPanel

O EasyPanel é perfeito para este projeto pois ele gerencia o Docker automaticamente.

## 1. Preparar o Código (GitHub - Recomendado)
Execute os passos do arquivo **`GITHUB_SETUP.md`** para enviar seu código para o GitHub. É muito melhor que fazer upload manual.

---

## Passo 1: Criar Projeto no EasyPanel

1. Acesse o EasyPanel
2. Clique em **"Create Project"**
3. Nome: `erp-wiisite`

---
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
