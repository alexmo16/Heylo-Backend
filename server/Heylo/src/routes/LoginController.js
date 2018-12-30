let express = require('express');
let validator = require('../authentification/Validator');
let router = express.Router();

router.all('/login', validator);

router.get('/login', function(req, res, next) {
  res.send('log yourself');
});

module.exports = router;
