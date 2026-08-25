const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const statusRoute = require("./routes/statusRoute");

app.use(cors());
app.use(express.json());
app.use(statusRoute)

app.get("/", (req, res) =>{
    res.json({
        mensagem: "API SAEPsaude funcionando."
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
});