const express = require("express");
const router = express.Router();

const { atividades } = require("../controllers/atividadesController");

router.get("/atividades", atividades);

module.exports = router;