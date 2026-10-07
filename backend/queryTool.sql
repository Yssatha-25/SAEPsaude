-- =====================================================
-- SAEPSaúde - script completo (estrutura + dados)
-- Como usar: crie um banco vazio (o mesmo nome do DB_NAME no .env),
-- abra o Query Tool NESSE banco, cole este script e execute (F5).
-- Pode rodar quantas vezes quiser: ele apaga e recria tudo.
-- Login de teste: qualquer e-mail da tabela usuarios + senha 123456
-- =====================================================

DROP TABLE IF EXISTS comentarios, curtidas, atividades, usuarios, empresa CASCADE;

CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    logo TEXT NOT NULL
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tipo_usuario VARCHAR(20) NOT NULL
        CHECK (tipo_usuario IN ('funcionario', 'cliente')),
    data_cadastro DATE NOT NULL,
    senha VARCHAR(100) NOT NULL DEFAULT '123456',
    foto TEXT DEFAULT 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
);

CREATE TABLE atividades (
    id_atividade SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id_usuario),
    tipo_atividade VARCHAR(20) NOT NULL,
    distancia_km NUMERIC(8,3) NOT NULL,
    duracao_min INT NOT NULL,
    data_atividade TIMESTAMP NOT NULL DEFAULT NOW(),
    descricao TEXT,
    calorias INT NOT NULL DEFAULT 0
);

CREATE TABLE curtidas (
    id_curtida SERIAL PRIMARY KEY,
    atividade_id INT NOT NULL REFERENCES atividades(id_atividade) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id_usuario),
    UNIQUE (atividade_id, usuario_id)
);

CREATE TABLE comentarios (
    id_comentario SERIAL PRIMARY KEY,
    atividade_id INT NOT NULL REFERENCES atividades(id_atividade) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id_usuario),
    texto VARCHAR(255) NOT NULL,
    data_comentario TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO empresa (nome, logo) VALUES
('SAEPSaúde', 'https://ava.sesisenai.org.br/pluginfile.php/1/theme_senai/logocompact/300x300/1787916997/logo-nova.png');

-- Usuários (importados do usuarios.csv)
INSERT INTO usuarios (id_usuario, nome, email, tipo_usuario, data_cadastro) VALUES
(1, 'Carlos Eduardo Silva', 'carlos.silva@saepsaude.com.br', 'funcionario', '2026-01-10'),
(2, 'Mariana Oliveira Santos', 'mariana.oliveira@saepsaude.com.br', 'funcionario', '2026-01-12'),
(3, 'Roberto Souza Lima', 'roberto.souza@saepsaude.com.br', 'funcionario', '2026-01-15'),
(4, 'Fernanda Costa Pereira', 'fernanda.costa@saepsaude.com.br', 'funcionario', '2026-01-20'),
(5, 'Lucas Mendes Rocha', 'lucas.mendes@saepsaude.com.br', 'funcionario', '2026-01-22'),
(6, 'Camila Rodrigues Alves', 'camila.rodrigues@gmail.com', 'cliente', '2026-02-01'),
(7, 'Gabriel Martins Barbosa', 'gabriel.martins@outlook.com', 'cliente', '2026-02-02'),
(8, 'Beatriz Almeida Carvalho', 'beatriz.almeida@yahoo.com.br', 'cliente', '2026-02-03'),
(9, 'Thiago Ferreira Ramos', 'thiago.ramos@gmail.com', 'cliente', '2026-02-05'),
(10, 'Juliana Ribeiro Castro', 'juliana.castro@hotmail.com', 'cliente', '2026-02-06'),
(11, 'Rafael Gomes Araujo', 'rafael.gomes@gmail.com', 'cliente', '2026-02-07'),
(12, 'Patricia Cardoso Dias', 'patricia.dias@outlook.com', 'cliente', '2026-02-08'),
(13, 'Rodrigo Fernandes Melo', 'rodrigo.melo@gmail.com', 'cliente', '2026-02-10'),
(14, 'Aline Correia Azevedo', 'aline.azevedo@yahoo.com.br', 'cliente', '2026-02-11'),
(15, 'Bruno Nunes Marques', 'bruno.marques@gmail.com', 'cliente', '2026-02-12'),
(16, 'Vanessa Teixeira Cavalcanti', 'vanessa.teixeira@outlook.com', 'cliente', '2026-02-14'),
(17, 'Diego Monteiro Barros', 'diego.barros@gmail.com', 'cliente', '2026-02-15'),
(18, 'Amanda Moreira Guimaraes', 'amanda.guimaraes@hotmail.com', 'cliente', '2026-02-16'),
(19, 'Leonardo Pinto Cunha', 'leonardo.cunha@gmail.com', 'cliente', '2026-02-18'),
(20, 'Leticia Moura Freitas', 'leticia.freitas@outlook.com', 'cliente', '2026-02-20');

-- Atividades (importadas do Arquivo_atividades.csv)
-- Hora definida aqui (o CSV só tinha a data) e calorias = minutos x kcal/min do tipo
INSERT INTO atividades (id_atividade, usuario_id, tipo_atividade, distancia_km, duracao_min, data_atividade, descricao, calorias) VALUES
(1, 1, 'corrida', 5.20, 30, '2026-02-01 11:17:00', 'Corrida matinal na praça central', 300),
(2, 2, 'ciclismo', 18.50, 55, '2026-02-01 16:34:00', 'Pedalada na ciclovia à beira-mar', 440),
(3, 1, 'caminhada', 3.10, 35, '2026-02-02 07:51:00', 'Caminhada leve pós-expediente', 175),
(4, 3, 'natação', 1.50, 45, '2026-02-03 12:08:00', 'Treino de nado livre na piscina club', 405),
(5, 4, 'musculação', 0.00, 60, '2026-02-03 17:25:00', 'Treino A - Membros inferiores', 360),
(6, 5, 'corrida', 8.00, 48, '2026-02-04 08:42:00', 'Treino de tiro e ritmo acelerado', 480),
(7, 6, 'corrida', 4.00, 28, '2026-02-05 13:59:00', 'Primeira corrida utilizando a plataforma', 280),
(8, 7, 'ciclismo', 25.00, 75, '2026-02-05 18:16:00', 'Pedal longo de final de tarde', 600),
(9, 8, 'caminhada', 5.00, 50, '2026-02-06 09:33:00', 'Caminhada no parque da cidade', 250),
(10, 9, 'futebol', 0.00, 90, '2026-02-06 14:50:00', 'Partida semanal com amigos', 810),
(11, 10, 'musculação', 0.00, 50, '2026-02-07 19:07:00', 'Treino B - Superiores e core', 300),
(12, 2, 'corrida', 6.50, 38, '2026-02-08 10:24:00', 'Corrida de rua ritmada', 380),
(13, 11, 'natação', 2.00, 50, '2026-02-08 15:41:00', 'Treino de resistência e borboleta', 450),
(14, 12, 'ciclismo', 12.30, 40, '2026-02-09 06:58:00', 'Deslocamento urbano de bicicleta', 320),
(15, 13, 'corrida', 10.00, 58, '2026-02-10 11:15:00', 'Preparatório para prova de 10k', 580),
(16, 14, 'caminhada', 4.20, 42, '2026-02-11 16:32:00', 'Caminhada ao ar livre', 210),
(17, 15, 'musculação', 0.00, 65, '2026-02-12 07:49:00', 'Treino de hipertrofia', 390),
(18, 16, 'corrida', 3.00, 20, '2026-02-14 12:06:00', 'Corrida rápida de aquecimento', 200),
(19, 17, 'ciclismo', 30.00, 90, '2026-02-15 17:23:00', 'Pedal de longa distância na estrada', 720),
(20, 18, 'natação', 1.20, 40, '2026-02-16 08:40:00', 'Treino técnico de braçadas', 360);

-- Acerta os contadores automáticos (evita erro de chave duplicada ao inserir pela API)
SELECT setval(pg_get_serial_sequence('usuarios', 'id_usuario'), (SELECT MAX(id_usuario) FROM usuarios));
SELECT setval(pg_get_serial_sequence('atividades', 'id_atividade'), (SELECT MAX(id_atividade) FROM atividades));

-- Conferência
SELECT (SELECT COUNT(*) FROM usuarios) AS usuarios,
(SELECT COUNT(*) FROM atividades) AS atividades;