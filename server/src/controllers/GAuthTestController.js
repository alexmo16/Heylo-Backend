let express = require('express');
let path = require('path');
let router = express.Router();

// TODO : We should allow this route to admins only.
router.get('/gauth', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../../public', 'gauth.html'));
});

module.exports = router;
