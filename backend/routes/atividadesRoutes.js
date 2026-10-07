const express = require("express");
const router = express.Router();

const { atividades, criar } = require("../controllers/atividadesController");

router.get("/atividades", atividades);
router.post("/atividades", criar);

module.exports = router;