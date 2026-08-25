const express = require("express");
const router = express.Router();

const { status } = require("../controllers/statusController.js");

router.get("/status", status);

module.exports = router;

