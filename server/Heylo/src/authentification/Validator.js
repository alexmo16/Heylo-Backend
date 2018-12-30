let validator = function(req, res, next) {
    if (req.headers.jwt && req.headers.jwt == '123') {
        return next();
    } else {
        return res.sendStatus(403);
    }
  };

module.exports = validator;
