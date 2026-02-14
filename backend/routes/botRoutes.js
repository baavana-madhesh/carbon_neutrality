const router = require("express").Router();
const { chatWithBot } = require("../controllers/botController");

// for now keep it without auth (after UI works we can add auth)
router.post("/chat", chatWithBot);

module.exports = router;
