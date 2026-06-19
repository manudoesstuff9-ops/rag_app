const express = require("express");
const router = express.Router();

const {
  askQuestion
} = require("../controllers/ragController");

router.post("/query", askQuestion);

module.exports = router;