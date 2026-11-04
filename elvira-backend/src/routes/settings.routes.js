const express = require("express");
const { getPublicSettings } = require("../controllers/settings.controller");

const router = express.Router();

router.get("/", getPublicSettings);

module.exports = router;
