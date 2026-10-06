const pool = require("../db");

const curtir = async (req, res) => {
    try {
        const atividadeId = req.params.id;
        const {
            usuario_id
        } = req.body;

        // tenta descurtir; se não apagou nada, é porque não tinha curtido -> curte
        const apagou = await pool.query(
            "DELETE FROM curtidas WHERE atividade_id = $1 AND usuario_id = $2",
            [atividadeId, usuario_id]
        );
        let curtiu = false;
        if (apagou.rowCount === 0) {
            await pool.query(
                "INSERT INTO curtidas (atividade_id, usuario_id) VALUES ($1, $2)",
                [atividadeId, usuario_id]
            );
            curtiu = true;
        }

        const total = await pool.query(
            "SELECT COUNT(*) AS total FROM curtidas WHERE atividade_id = $1", [atividadeId]
        );
        res.json({
            curtiu,
            total: Number(total.rows[0].total)
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao curtir.",
            erro: erro.message
        });
    }
};

const comentar = async (req, res) => {
    try {
        const atividadeId = req.params.id;
        const {
            usuario_id
        } = req.body;
        const texto = (req.body.texto || "").trim();

        if (texto.length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "não é possível enviar um comentário vazio"
            });
        }
        if (texto.length <= 2) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O comentário precisa ter mais de 2 caracteres"
            });
        }

        await pool.query(
            "INSERT INTO comentarios (atividade_id, usuario_id, texto) VALUES ($1, $2, $3)",
            [atividadeId, usuario_id, texto]
        );
        const total = await pool.query(
            "SELECT COUNT(*) AS total FROM comentarios WHERE atividade_id = $1", [atividadeId]
        );
        res.status(201).json({
            sucesso: true,
            total: Number(total.rows[0].total)
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao comentar.",
            erro: erro.message
        });
    }
};

module.exports = {
    curtir,
    comentar
};