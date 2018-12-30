let express = require('express');
let router = express.Router();

router.get('/login', function(req, res, next) {
  res.send('log yourself');
});

module.exports = router;
