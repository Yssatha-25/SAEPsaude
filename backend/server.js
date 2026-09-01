const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const statusRoute = require("./routes/statusRoute");
const empresaRoute = require("./routes/empresaRoute");
const atividadesRoute = require("./routes/atividadesRoutes");

app.use(cors());
app.use(express.json());
app.use(statusRoute);
app.use(empresaRoute);
app.use(atividadesRoute);

app.get("/", (req, res) =>{
    res.json({
        mensagem: "API SAEPsaude funcionando."
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
});