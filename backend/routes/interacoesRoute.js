const express = require("express");
const router = express.Router();
const { curtir, comentar } = require("../controllers/interacoesController");

router.post("/atividades/:id/curtir", curtir);
router.post("/atividades/:id/comentarios", comentar);

module.exports = router;