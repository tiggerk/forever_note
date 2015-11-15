var express = require('express');
var _ = require('underscore');
var router = express.Router();

var User = bookshelf.Model.extend({
  tableName: 'user',
  hasTimestamps: ['created_at', 'updated_at']
});

var Login = bookshelf.Model.extend({
    tableName: 'user'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users');
});

router.get('/join', function(req, res, next) {
  //console.log('get',req.body);
})

router.post('/join', function(req, res, next) {
  console.log(req.body);
  var user = User.forge(req.body);
  user.save()
      .then(function() {
        //console.log(user);
        res.redirect('back');
      })
});

router.post('/login', function(req, res, next) {
    var user = new User();
    var login = req.body;
    user.query(function(query) {
        //query.where('user_id', 'like', '123')
        query.where({
            user_id: login.user_id,
            user_pw: login.user_pw
        });
    })
        .fetch()
        .then(function() {
            console.log(user);
            //res.json(user);
        })
});

module.exports = router;
