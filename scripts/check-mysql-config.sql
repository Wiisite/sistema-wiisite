-- Verificar configuração do MySQL
SHOW VARIABLES LIKE 'max_allowed_packet';

-- Para aumentar o limite, execute no MySQL:
-- SET GLOBAL max_allowed_packet = 16777216; -- 16MB
-- Ou adicione no my.ini/my.cnf:
-- [mysqld]
-- max_allowed_packet = 16M
