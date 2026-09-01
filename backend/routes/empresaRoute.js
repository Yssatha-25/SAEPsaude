const express = require("express");
const router = express.Router();

const { empresa } = require("../controllers/empresaController.js");

router.get("/empresa", empresa);

module.exports = router;