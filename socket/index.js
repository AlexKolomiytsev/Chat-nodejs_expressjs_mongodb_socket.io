var config = require('../config');
var connect = require('connect');
var async = require('async');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var sessionStore = require('../libs/sessionStore');
var HttpError = require('../error').HttpError;
var User = require('../models/user').User;


function loadSession(sid, callback) {
	sessionStore.load(sid, function(err, session) {
		if(arguments.length == 0) {
			return callback(null, null);
		}
		else {
			return callback(null, session);
		}
	});
}
function loadUser(session, callback) {
	if(!session.user) {
		console.log("Session %s is anonymous", session.id);
		return callback(null, null);
	}

	console.log("retrieving user", session.user);

	User.findById(session.user, function(err, user) {
		if (err) return callback(err);

		if(!user) {
			return callback(null, null);
		}
		console.log("User findById result: " + user);
		callback(null, user);
	})
}

module.exports = function(io) {

	var secret = config.get('session:secret');
	var sessionKey = config.get('session:key');

	//var io = require('socket.io').listen(server);

	var disconnectRoom = function (name) {
		name = '/' + name;

		var users = io.manager.rooms[name];

		for (var i = 0; i < users.length; i++) {
			io.sockets.socket(users[i]).disconnect();
		}

		return this;
	};

	io.set('origins', 'localhost:*');
	//io.set('logger', log);

	io.use(function (socket, next) {
		var handshakeData = socket.request;

		async.waterfall([
			function (callback) {
				//получить sid
				var parser = cookieParser(secret);
				parser(handshakeData, {}, function (err) {
					if (err) return callback(err);

					var sid = handshakeData.signedCookies[sessionKey];

					loadSession(sid, callback);
				});
			},
			function (session, callback) {
				if (!session) {
					return callback(new HttpError(401, "No session"));
				}

				socket.handshake.session = session;
				loadUser(session, callback);
			},
			function (user, callback) {
				if (!user) {
					return callback(new HttpError(403, "Anonymous session may not connect"));
				}
				callback(null, user);
			}
		], function (err, user) {

			if (err) {
				if (err instanceof HttpError) {
					return next(new Error('not authorized'));
				}
				next(err);
			}

			socket.handshake.user = user;
			next();

		});

	});
	//io.set('origins', 'localhost:*');
	//io.set('logger', logger);

	/*
	io.use(function(socket, next) {
		var handshake = socket.request;

			async.waterfall([
				function(callback) {
					handshake.cookie = cookie.parse(handshake.headers.cookie || '');
					var sidCookie = handshake.cookies[config.get('session:key')];
					var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));

					loadSession(sid, callback);
				},
				function(session, callback) {
					if(!session) {
						callback(new HttpError(401, "No session "));
					}
					handshake.session = session;
					loadUser(session, callback);
				},
				function(user, callback) {
					if(!user) {
						callback(new HttpError(403, "Anonymous session may not correct"));
					}
					handshake.user = user;
					callback(null);
				}
			], function(err) {
				if(!err) {
					return callback(null, true);
				}

				if (err instanceof HttpError) {
					return callback(null, false);
				}

				callback(err);
			})


	});
	*/

	//io.set('authorization', function(handshake, callback) {
	//	//загрузить сессию по sid из handshake.cookie
	//	//если есть сессия авторизованного польователя - пустить
	//	//иначе - отказать во входе
	//
	//	async.waterfall([
	//		function(callback) {
	//			handshake.cookie = cookie.parse(handshake.headers.cookie || '');
	//			var sidCookie = handshake.cookies[config.get('session:key')];
	//			var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));
//
	//			loadSession(sid, callback);
	//		},
	//		function(session, callback) {
	//			if(!session) {
	//				callback(new HttpError(401, "No session "));
	//			}
	//			handshake.session = session;
	//			loadUser(session, callback);
	//		},
	//		function(user, callback) {
	//			if(!user) {
	//				callback(new HttpError(403, "Anonymous session may not correct"));
	//			}
	//			handshake.user = user;
	//			callback(null);
	//		}
	//	], function(err) {
	//		if(!err) {
	//			return callback(null, true);
	//		}
//
	//		if (err instanceof HttpError) {
	//			return callback(null, false);
	//		}
//
	//		callback(err);
	//	})
	//});

	io.on('connection', function (socket) {

		var userRoom = "user:room:" + socket.handshake.user.username;
		socket.join(userRoom);

		var username = socket.handshake.user.username;

		socket.broadcast.emit('join', username);

		socket.on('message', function (text, callback) {
			socket.broadcast.emit('message', username, text);
			callback && callback();
		});

		socket.on('disconnect', function () {
			socket.broadcast.emit('leave', username);
		});
		/*
		var username = socket.handshake.user.get('username');

		socket.broadcast.emit('join', username);
		socket.on('message', function(text, cb) {
			socket.broadcast.emit('message', text);
			cb && cb();
		});

		socket.on('disconnect', function() {
			socket.broadcast.emit('leave', username);
		});
		*/
	});

	return io;
};