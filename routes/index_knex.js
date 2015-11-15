var express = require('express');
var _ = require('underscore');
var router = express.Router();
//var notes = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/notes', function(req, res, next) {
  if (req.query.keyword) {
    var keyword = req.query.keyword;
    knex('noteTable')
        .where('title', 'like', '%' + keyword + '%')
        .orWhere('content', 'like', '%' + keyword + '%')
        .then(function(resultNote) {
          res.json(resultNote);
        })
  //  var result = _.filter(notes, function(note){
  //    return note.title.indexOf(keyword) != -1 || note.content.indexOf(keyword) != -1;
  //  });
  //  res.json(result);
  } else {
    knex.table('noteTable').select().then(function(resp) {
      console.log(resp);
      res.json(resp);
    }).catch(function(error) {
      console.log(error);
    });
  }
});

router.post('/notes', function(req, res, next) {
  var note = req.body;
  knex('noteTable').insert(note, '*').then(function(updatedNote){
    res.json(updatedNote[0]);
  }).catch(function(e) {
    console.log(e);
  });
});

router.put('/notes/:note_id', function(req, res, next) {
  var note = req.body;
  knex('noteTable')
      .where('id', note.id)
      .update(note, '*')
      .then(function(findNote){
        res.json(findNote[0]);
     });

  //var index = _.findIndex(notes, {id: note.id});
  //notes[index] = note;
  //res.json(note);
});

router.delete('/notes/:note_id', function(req, res, next) {
  knex('noteTable')
      .where('id', req.params.note_id)
      .del()
      .then(function(){
        res.json({});
      })
      .catch(function(error) {
        console.log(error);
      });
  //notes = _.reject(notes, {id: req.params.note_id});
});

router.post('/search', function(req, res, next) {
  var keyword = req.body.char;
  var result = _.filter(notes, function(note){
      return _.contains(note.title, keyword) || _.contains(note.content, keyword);
  });
  console.log(result);

  res.json(result);
});


module.exports = router;
