/**
 * Created by sanya on 17.02.2016.
 */
var crypto = require('crypto');
var mongoose = require('../libs/mongoose');
var async = require('async');
var util = require('util');

var Schema = mongoose.Schema;

var schema  = new Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	hashedPassword: {
		type: String,
		required: true
	},
	salt: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

schema.methods.encryptPassword = function (password) {
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password') //виртуальное поле(на самом деле не добавляется в БД)
		.set(function(password) {
			this._plainPassword = password;
			this.salt = Math.random() + "";
			this.hashedPassword = this.encryptPassword(password);
		})
		.get(function () { return this._plainPassword; });

schema.methods.checkPassword = function(password) {
	return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
	var User = this;

	async.waterfall([
		function(callback) {
			User.findOne({username: username}, callback); //передаст результаты в следующую функцию
		},
		function(user, callback) { //первый аргумент - найденный user. Если такого не нашлось то null
			if(user) {
				if(user.checkPassword(password)) {
					callback(null, user); //при успешной проверке передаем user'а дальше по цепочке
				} else {
					callback(new AuthError("Password is incorrect"));
				}
			} else {
				var user = new User({username: username, password: password});
				user.save(function(err) {
					if (err) return callback(err);
					callback(null, user);
				});
			}
		}
	], callback);
};

exports.User = mongoose.model('User', schema);


function AuthError(message) {
	Error.apply(this, arguments);
	Error.captureStackTrace(this, AuthError);

	this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;