const express = require("express")
const router = express.Router()
const { sendAnnouncement } = require("../controllers/announcement")

router.post("/send", sendAnnouncement)

module.exports = router