# Guia de Deploy em VPS (Docker)

Rodar em VPS é geralmente **melhor** pois oferece:
1. Ambiente isolado e controlado.
2. Maior performance.
3. Facilidade de atualização com Docker.

## Pré-requisitos na VPS
- Ubuntu 20.04 ou superior.
- Docker e Docker Compose instalados.

## Passo a Passo

1. **Clone o projeto na VPS**:
   ```bash
   git clone seu-repositorio.git app
   cd app
   ```

2. **Configure o ambiente**:
   Crie o arquivo `.env` (se não for usar as variáveis do docker-compose):
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Suba os containers**:
   ```bash
   docker-compose up -d --build
   ```
   Isso irá:
   - Construir a imagem do servidor.
   - Iniciar o banco de dados MySQL.
   - Iniciar a aplicação na porta 3000.

4. **Prepare o Banco de Dados**:
   Como o banco está rodando dentro do Docker, você executa a migração via container:
   ```bash
   docker-compose exec app npx drizzle-kit migrate
   ```

5. **Acesse**:
   `http://seu-ip-vps:3000`

## Dicas de Produção
- Use um proxy reverso (Nginx ou Traefik) na frente do container da aplicação para lidar com SSL (HTTPS) e domínio.
- Não exponha a porta do banco de dados (3306) para a internet (o docker-compose atual não expõe, o que é seguro).
