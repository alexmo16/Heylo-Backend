let express = require('express');
let validator = require('../authentification/Validator');
let router = express.Router();

router.all('/users', validator);

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.send('test');
});

module.exports = router;
