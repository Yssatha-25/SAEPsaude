const pool = require("../db");

const empresa = async (req, res) => {
    try {
        const dadosEmpresa = await pool.query("SELECT nome, logo FROM empresa LIMIT 1");

        let sql = "SELECT COUNT(*) AS total_atividades, COALESCE(SUM(calorias),0) AS total_calorias FROM atividades";
        const valores = [];
        if (req.query.usuario_id) {
            sql += " WHERE usuario_id = $1";
            valores.push(req.query.usuario_id);
        }
        const totais = await pool.query(sql, valores);

        res.json({
            nome: dadosEmpresa.rows[0].nome,
            logo: dadosEmpresa.rows[0].logo,
            total_atividades: Number(totais.rows[0].total_atividades),
            total_calorias: Number(totais.rows[0].total_calorias)
        });
    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar os dados da empresa.",
            erro: erro.message
        });
    }
};

module.exports = {
    empresa
};