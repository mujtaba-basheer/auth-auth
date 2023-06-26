const express = require("express");
const { googleCallback, getAuthUrl, getInfo } = require("./controller");

const router = express.Router();

router.get("/oauthurl", getAuthUrl);
router.get("/google-callback", googleCallback);
router.get("/info", getInfo);

module.exports = router;
