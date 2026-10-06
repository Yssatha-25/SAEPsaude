const pool = require("../db");

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ sucesso: false, mensagem: "email ou senha obrigatório" });
        }

        const r = await pool.query(
            "SELECT id_usuario, nome, email, foto FROM usuarios WHERE email = $1 AND senha = $2",
            [email, senha]
        );

        if (r.rows.length === 0) {
            return res.status(401).json({ sucesso: false, mensagem: "email ou senha incorreta" });
        }

        res.json({ sucesso: true, usuario: r.rows[0] });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: "Erro no login.", erro: erro.message });
    }
};

module.exports = { login };