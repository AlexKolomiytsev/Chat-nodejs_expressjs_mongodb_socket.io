/**
 * Created by sanya on 22.02.2016.
 */
var User = require('../models/user').User;

module.exports = function(req,res,next) {
	req.user = res.locals.user = null; //res.locals.user делать user доступным во всех шаблонах.
	if(!req.session.user) return next();

	User.findById(req.session.user, function(err, user) {
		if (err) return next(err);

		req.user = res.locals.user = user; //res.locals.user делать user доступным во всех шаблонах.
		next();
	});
};