var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('./main/MC-UI-S0120-after.html');
});

module.exports = router;