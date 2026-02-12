# Guia Completo de Deploy - ERP WiiSite na VPS

Este guia cobre a instalação completa do sistema ERP em uma VPS com Docker.

---

## Pré-requisitos

- VPS com Ubuntu 22.04+ ou Debian 11+
- Mínimo 2GB RAM, 2 vCPUs
- Acesso root ou sudo
- Domínio apontando para o IP da VPS (opcional, mas recomendado)

---

## Passo 1: Preparar a VPS

### 1.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Docker

```bash
# Instalar dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker (opcional)
sudo usermod -aG docker $USER
```

### 1.3 Instalar Git

```bash
sudo apt install -y git
```

---

## Passo 2: Clonar o Repositório

```bash
# Criar diretório para aplicação
sudo mkdir -p /opt/erp
cd /opt/erp

# Clonar repositório
sudo git clone https://github.com/Wiisite/sistema-wiisite.git .

# Ajustar permissões
sudo chown -R $USER:$USER /opt/erp
```

---

## Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo .env

```bash
cp .env.example .env
nano .env
```

### 3.2 Editar o arquivo .env

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=SuaSenhaRootSegura123!
MYSQL_DATABASE=erp_wiisite
MYSQL_USER=erp_user
MYSQL_PASSWORD=SuaSenhaDBSegura456!

# Application
JWT_SECRET=SuaChaveSecretaJWTMuitoLonga789!
OWNER_OPEN_ID=seu-owner-id-aqui
APP_PORT=3000
```

**⚠️ IMPORTANTE:** Substitua todas as senhas por valores seguros e únicos!

---

## Passo 4: Build e Deploy

### 4.1 Construir e iniciar os containers

```bash
cd /opt/erp

# Build e start (primeira vez - pode demorar 5-10 minutos)
docker compose up -d --build

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

### 4.2 Verificar se está funcionando

```bash
# Verificar containers
docker ps

# Testar aplicação
curl http://localhost:3000
```

---

## Passo 5: Executar Migrações do Banco

Após os containers estarem rodando:

```bash
# Entrar no container da aplicação
docker compose exec app sh

# Executar migrações
npx drizzle-kit migrate

# Sair do container
exit
```

---

## Passo 6: Configurar Nginx (Proxy Reverso)

### 6.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 6.2 Criar configuração

```bash
sudo nano /etc/nginx/sites-available/erp
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout para uploads grandes
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Tamanho máximo de upload
        client_max_body_size 50M;
    }
}
```

### 6.3 Ativar configuração

```bash
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Passo 7: Configurar SSL (HTTPS)

### 7.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obter certificado

```bash
sudo certbot --nginx -d seu-dominio.com.br
```

---

## Comandos Úteis

### Gerenciamento dos Containers

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f app
docker compose logs -f db

# Reiniciar
docker compose restart

# Parar
docker compose down

# Parar e remover volumes (CUIDADO: apaga dados!)
docker compose down -v

# Rebuild após alterações
docker compose up -d --build
```

### Backup do Banco de Dados

```bash
# Criar backup
docker compose exec db mysqldump -u root -p erp_wiisite > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T db mysql -u root -p erp_wiisite < backup.sql
```

### Atualizar Aplicação

```bash
cd /opt/erp

# Baixar atualizações
git pull origin master

# Rebuild e restart
docker compose up -d --build

# Executar migrações se necessário
docker compose exec app npx drizzle-kit migrate
```

---

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs app

# Verificar se o banco está pronto
docker compose logs db
```

### Erro de conexão com banco

- Verifique se o container do MySQL está rodando: `docker compose ps`
- Verifique as credenciais no arquivo `.env`
- Aguarde o MySQL inicializar completamente (pode levar 1-2 minutos na primeira vez)

### Erro de permissão

```bash
# Ajustar permissões
sudo chown -R $USER:$USER /opt/erp
```

### Porta já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :3000

# Alterar a porta no .env
APP_PORT=3001
```

### Limpar tudo e recomeçar

```bash
cd /opt/erp
docker compose down -v
docker system prune -af
docker compose up -d --build
```

---

## Estrutura de Arquivos

```
/opt/erp/
├── .env                 # Variáveis de ambiente (criar a partir do .env.example)
├── Dockerfile           # Configuração do container da aplicação
├── docker-compose.yml   # Orquestração dos containers
├── dist/                # Build da aplicação (gerado automaticamente)
├── drizzle/             # Migrações do banco de dados
├── uploads/             # Arquivos enviados (volume persistente)
└── ...
```

---

## Portas Utilizadas

| Serviço | Porta Interna | Porta Externa |
|---------|---------------|---------------|
| App     | 3000          | 3000 (ou APP_PORT) |
| MySQL   | 3306          | Não exposta   |

---

## Suporte

Em caso de problemas:
1. Verifique os logs: `docker compose logs -f`
2. Verifique o status: `docker compose ps`
3. Consulte este guia na seção Troubleshooting
