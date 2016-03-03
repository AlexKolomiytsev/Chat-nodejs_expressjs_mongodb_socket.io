/**
 * Created by sanya on 22.02.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;