const pool = require("../db");

const atividades = async (req, res) => {
    try{
        const pagina = Number(req.query.page) || 1;
        const limite = 4;
        const offset = (pagina - 1) * limite;

        const tipo = req.query.tipo

        let consulta = `
            SELECT
                id_atividade,
                usuario_id,
                tipo_atividade,
                distancia_km,
                duracao_min,
                data_atividade,
                descricao
            FROM atividades
        `;

        const valores = [];

        if (tipo) {
            consulta += ` WHERE LOWER(tipo_atividade) = LOWER($1)`;
            valores.push(tipo);
        }

        consulta += ` ORDER BY data_atividade DESC
                      LIMIT $${valores.length + 1}
                      OFFSET $${valores.length + 2}`;

        valores.push(limite, offset);

        const resultado = await pool.query(consulta, valores);

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

module.exports = { atividades };
