let express = require('express');
let validator = require('../middlewares/Validator');
let router = express.Router();

router.all('/user', validator);

/* GET users listing. */
router.get('/user', function(req, res, next) {
  res.send('test');
});

module.exports = router;
