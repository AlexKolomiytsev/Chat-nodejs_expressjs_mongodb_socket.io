/**
 * Created by sanya on 20.02.2016.
 */
module.exports = function(req,res,next) {
	res.sendHttpError = function(error) {
		res.status(error.status);
		if(res.req.headers['x-requested-with'] == 'XMLHttpRequest') { //ajax request
			res.json(error);
			//res.render('error', {
			//	message: error.message,
			//	error: error
			//});
		}
		else {
			res.render('error', {
				message: error.message,
				error: error
			});
		}
	};

	next();
};
