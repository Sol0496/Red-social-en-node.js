const { Router } = require("express");
const router = Router();

const { renderIndex, renderAbout } = require("../controllers/index.controller");

router.get("/", renderIndex);




module.exports = router;
