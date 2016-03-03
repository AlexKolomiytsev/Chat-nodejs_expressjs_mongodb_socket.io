/**
 * Created by sanya on 17.02.2016.
 */
//create test db
var mongoose = require('./libs/mongoose');
//mongoose.set('debug', true);
//var User = require('./models/user').User;
var async = require("async"); //позволяет делать асинхронные последовательности вызовов

//  ... обычно используется для тестов
// 1. drop database //убить существующую базу
// 2. create & save 3 users //создать&сохранить 3 юзеров
// 3. close connection //закрыть соединение


async.series([
	open,
	dropDatabase,
	requireModels,
	createUsers
], function(err, results) {
	if (err) {
		process.exit(255);
		throw err;
	}
	console.log(results);
	mongoose.disconnect();

});
function open(callback) {
	mongoose.connection.on('open', callback);
}
function dropDatabase(callback) {
	var db = mongoose.connection.db;
	db.dropDatabase(callback);
}
function requireModels(callback) {
	require('./models/user');
	async.each(Object.keys(mongoose.models), function(modelName, callback) {
		mongoose.models[modelName].ensureIndexes(callback);
	}, callback);
}
function createUsers(callback) {
	require('./models/user');

	var users  = [
		{username: "Vasya", password: "supervasya"},

		{username: "admin", password: "thetruehero"}
	];

	async.each(users, function(userData, callback) {
		var user = new mongoose.models.User(userData);
		user.save(callback);
	}, callback);
}

//console.log(mongoose.connection.readyState); //-> 2: connecting
//mongoose.connection.on('open', function () {
//	var db = mongoose.connection.db;
//	db.dropDatabase(function (err) { //(если бы находилась вне функции)эта команда выполняется, когда соединение еще нету, поэтому ничего не выводит
//		if (err) throw err;
//
//		async.parallel([
//			function (callback) {
//				var vasya = new User({username: "Vasya", password: "supervasya"});
//				vasya.save(function(err) {
//					callback(err, vasya);
//				});
//			},
//			function (callback){
//				var petya = new User({username: "Petya", password: "123"});
//				petya.save(function(err) {
//					callback(err, petya);
//				});
//			},
//			function (callback) {
//				var admin = new User({username: "admin", password: "thetruehero"});
//				admin.save(function(err) {
//					callback(err, admin);
//				});
//			}
//		], function(err, results) {
//			console.log(arguments);
//			mongoose.disconnect();
//		});
//	});
////mongoose буферизует запросы, которые идут к базе
//});



//USING MONGOOSE
//var User = require('./models/user').User;
//var assert = require('assert');
//var user = new User({
//	username: "Tester2",
//	password: "secret2"
//});
//
//user.save(function(err, user, affected) {
//	//assert.equal(null, err);
//	if (err) throw err;
//
//	User.findOne({username: "Tester"}, function(err, tester) {
//		console.log(tester);
//	});
//});



/*
//USING MongoDB NATIVE DRIVER ::::::::::
//Connecting to the MongoDB
var MongoClient = require('mongodb').MongoClient
	, assert = require('assert');
var format = require('util').format();

// Connection URL
var url = 'mongodb://localhost:27017/chat';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	insertDocuments(db, function() {
		db.close();
	});
});

var insertDocuments = function(db, callback) {
	// Get the documents collection
	var collection = db.collection('documents');
	// Insert some documents
	collection.removeMany({}, function(err, affected) {
		//assert.equal(null, err);
		console.log("deleted count %s", affected.deletedCount);
	});
	collection.insertOne({a : 2}, function(err, result) {
		console.log("inserted count = %s", result.insertedCount);

		var cursor = collection.find();
		cursor.toArray(function(err, results) {
			console.log(result.ops);
		});
		assert.equal(err, null);
		//assert.equal(3, result.result.n);
		//assert.equal(3, result.ops.length);
		//console.log("Inserted 3 documents into the document collection");
		callback(result);
	});
};
*/
