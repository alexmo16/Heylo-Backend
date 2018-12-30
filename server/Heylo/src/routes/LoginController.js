let express = require('express');
let router = express.Router();

router.get('/login', function(req, res, next) {
  res.sendFile('C:/Users/Morel/Documents/dev/Heylo/server/Heylo/public/login.html');
});

module.exports = router;
