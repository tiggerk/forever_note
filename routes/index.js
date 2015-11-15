var express = require('express');
var _ = require('underscore');
var router = express.Router();

var Note = bookshelf.Model.extend({
    tableName: 'note',
    hasTimestamps: ['created_at', 'updated_at']
});

var Notes = bookshelf.Collection.extend({
    model: Note
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/notes', function(req, res, next) {
    var notes = new Notes();

    if (req.query.keyword) {
        var keyword = req.query.keyword;
        notes
            .query(function(query) {
                query.where('title', 'like', '%' + keyword + '%');
                query.orWhere('content', 'like', '%' + keyword + '%');
                query.orderBy('id');
            })
            .fetch()
            .then(function() {
                res.json(notes);
            });
    } else {
        notes
            .query(function(query) {
                query.orderBy('id');
            })
            .fetch()
            .then(function() {
                res.json(notes);
            });
    }
});

router.post('/notes', function(req, res, next) {
    var note = Note.forge(req.body);
    note.save().then(function() {
        res.json(note);
    });
});

router.put('/notes/:note_id', function(req, res, next) {
    Note.forge(req.body)
        .save()
        .then(function(note) {
            res.json(note);
        });
});

router.delete('/notes/:note_id', function(req, res, next) {
    Note.forge({'id': req.params.note_id})
        .destroy()
        .then(function() {
            res.json({});
        });
});

module.exports = router;
