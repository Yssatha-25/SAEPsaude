const pool = require("../db");

const status = async (req, res) => {
    try{
        await pool.query("SELECT 1");

        res.json({
            servidor: "online",
            banco: "conectado"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            servidor: "online",
            banco: "desconectado"
        });
    }
};

module.exports = { status };