/**
 * Created by sanya on 21.02.2016.
 */
var express = require('express');
var router = express.Router();
var checkAuth = require('../middleware/checkAuth');

/* GET home page. */
router.get('/', checkAuth, function(req, res, next) {
	res.render('chat', {
		title: 'Chat'
		//userId: req.session.user
		//user: req.user
	});
});

module.exports = router;
