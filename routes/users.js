var express = require('express');
var router = express.Router();
var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var ObjectID = require('mongodb').ObjectID;

/* GET users listing. */
router.get('/', function(req, res, next) {
    User.find({}, function(err, users) {
      if(err) return next(err);
      res.json(users);
    });
});
router.get('/:id', function(req, res, next) { //:id -> req.params.id
  try {
    var id = new ObjectID(req.params.id);
  }
  catch(ex){
    return next(404);
  }
  User.findById(id, function(err, user) {
    if (err) return next(err);
    if(!user) {
      next(new HttpError(404, "User not found"));
    }
    else{
      res.send(user);
    }
  });
});

module.exports = router;
