const pool = require("../db");

const empresa = async (req, res) => {
    try{
        const resultado = await pool.query(
            "select count (*) as total_atividades from atividades"
        );

        res.json({
            nome: "SAEP Saúde",
            logo: "https://ava.sesisenai.org.br/pluginfile.php/1/theme_senai/logocompact/300x300/1787916997/logo-nova.png",
            total_atividades: Number(resultado.rows[0].total_atividades)
        });
    } catch (erro){
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar os dados da empresa.",
            erro: erro.message
        });
    }
};

module.exports = { empresa };