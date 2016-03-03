/**
 * Created by sanya on 21.02.2016.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('frontpage', {
		title: 'Home'
	});
});

module.exports = router;