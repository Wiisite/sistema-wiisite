# Guia de Integração com GitHub

Enviar o código para o GitHub é a melhor forma de fazer deploy no EasyPanel, pois permite atualizações automáticas sempre que você fizer mudanças.

## Passo 1: Criar Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Dê um nome para o repositório (ex: `sistema-erp`).
3. Deixe como **Private** (Privado) para segurança.
4. **Não** marque nenhuma opção de inicializar (README, .gitignore), pois já temos isso.
5. Clique em **Create repository**.

## Passo 2: Enviar o Código
Abra o terminal na pasta do projeto (onde já iniciei o git para você) e rode os comandos que o GitHub vai te mostrar na tela "…or push an existing repository from the command line".

Será algo parecido com isto:
```bash
git remote add origin https://github.com/SEU_USUARIO/sistema-erp.git
git branch -M main
git push -u origin main
```

## Passo 3: Conectar no EasyPanel
1. No EasyPanel, vá em **Project Settings** > **Git Provider**.
2. Conecte sua conta do GitHub.
3. Crie o App novamente (ou edite o existente):
   - **Source**: Selecione o repositório `sistema-erp`.
   - **Branch**: `main`.
   - **Build Method**: Dockerfile.

Agora, toda vez que você rodar `git push` no seu computador, o EasyPanel vai atualizar o site automaticamente!
