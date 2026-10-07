const pool = require("../db");

const atividades = async (req, res) => {
    try {
        const pagina = Number(req.query.page) || 1;
        const limite = 4;
        const offset = (pagina - 1) * limite;

        const tipo = req.query.tipo;

        const usuarioLogado = Number(req.query.usuario_id) || 0;

        let consulta = `
            SELECT
                a.id_atividade, a.usuario_id, a.tipo_atividade, a.distancia_km,
                a.duracao_min, a.calorias, a.data_atividade, a.descricao,
                u.nome AS nome_usuario, u.foto AS foto_usuario,
                (SELECT COUNT(*) FROM curtidas c WHERE c.atividade_id = a.id_atividade) AS total_curtidas,
                (SELECT COUNT(*) FROM comentarios m WHERE m.atividade_id = a.id_atividade) AS total_comentarios,
                EXISTS (SELECT 1 FROM curtidas c WHERE c.atividade_id = a.id_atividade AND c.usuario_id = $1) AS curtiu
            FROM atividades a
            JOIN usuarios u ON u.id_usuario = a.usuario_id
        `;

        const valores = [usuarioLogado];

        if (tipo) {
            consulta += ` WHERE LOWER(a.tipo_atividade) = LOWER($2) `;
            valores.push(tipo);
        }

        consulta += ` ORDER BY a.data_atividade DESC, a.id_atividade DESC
                      LIMIT $${valores.length + 1}
                      OFFSET $${valores.length + 2}`;

        valores.push(limite, offset);

        const resultado = await pool.query(consulta, valores);

        // NOVO: contar o total (sem LIMIT/OFFSET), respeitando o mesmo filtro
        let consultaTotal = `SELECT COUNT(*) AS total FROM atividades`;
        const valoresTotal = [];
        if (tipo) {
            consultaTotal += ` WHERE LOWER(tipo_atividade) = LOWER($1)`;
            valoresTotal.push(tipo);
        }
        const totalResultado = await pool.query(consultaTotal, valoresTotal);
        const total = Number(totalResultado.rows[0].total);

        const atividades = resultado.rows.map((atividade) => {
            const data = new Date(atividade.data_atividade);

            const hora = String(data.getHours()).padStart(2, "0");
            const minuto = String(data.getMinutes()).padStart(2, "0");

            const dia = String(data.getDate()).padStart(2, "0");
            const mes = String(data.getMonth() + 1).padStart(2, "0");
            const ano = String(data.getFullYear()).slice(-2);

            return {
                ...atividade,
                data_atividade: `${hora}:${minuto} - ${dia}/${mes}/${ano}`
            };
        });

        res.json({
            pagina: pagina,
            quantidade: atividades.length,
            total: total,
            atividades: atividades
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar atividades.",
            erro: erro.message
        });
    }
};

const criar = async (req, res) => {
    try {
        const {
            usuario_id,
            tipo,
            distancia,
            duracao
        } = req.body;
        const tiposValidos = ["corrida", "caminhada", "trilha"];

        if (!usuario_id || !tiposValidos.includes(String(tipo).toLowerCase()) ||
            !(Number(distancia) > 0) || !(Number(duracao) > 0)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Dados inválidos."
            });
        }

        const km = Number(distancia) / 1000; // metros -> km
        const fator = {
            corrida: 10,
            caminhada: 5,
            trilha: 7
        }; // kcal por minuto
        const calorias = Math.round(Number(duracao) * fator[tipo.toLowerCase()]);
        
        await pool.query(
            `INSERT INTO atividades (usuario_id, tipo_atividade, distancia_km, duracao_min, calorias, data_atividade, descricao)
             VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
            [usuario_id, tipo.toLowerCase(), km, Number(duracao), calorias, tipo]
        );

        res.status(201).json({
            sucesso: true
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao criar atividade.",
            erro: erro.message
        });
    }
};

module.exports = {
    atividades,
    criar
};