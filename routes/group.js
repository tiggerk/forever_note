var express = require('express');
var _ = require('underscore');
var router = express.Router();

var Note = bookshelf.Model.extend({
    tableName: 'note',
    hasTimestamps: ['created_at', 'updated_at'],
    groups: function() {
        return this.belongsTo(Group);
    }
});

var Notes = bookshelf.Collection.extend({
    model: Note
});

var Group = bookshelf.Model.extend({
    tableName: 'group',
    notes: function() {
        return this.hasMany(Note);
    }
});

var Groups = bookshelf.Collection.extend({
  model: Group
});

var NoteGroup = bookshelf.Model.extend({
    notes: function() {
        return this.hasMany(Note);
    },
    group: function() {
        return this.belongsTo(Group);
    }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('group');
});

router.get('/notes', function(req, res, next) {
    var notes = new Notes();

    if (req.query.keyword && req.query.group_id) {
        var keyword = req.query.keyword;
        notes
            .query(function(query) {
                query.where('group_id', '=', req.query.group_id);
                query.where('title', 'like', '%' + keyword + '%');
                query.orWhere('content', 'like', '%' + keyword + '%');
                query.orderBy('id');
            })
            .fetch()
            .then(function() {
                res.json(notes);
            });

    } else if (req.query.keyword) {
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
    } else if (req.query.group_id) {
        //Group.forge({id: req.query.group_id})
        //    .related('notes')
        //    .fetch()
        //    .then(function(notes) {
        //        console.log('rerere', notes.toJSON());
        //        res.json(notes);
        //    });

        //notes
        //    .query(function (query) {
        //        query.where('group_id', '=', req.query.group_id);
        //        query.orderBy('id');
        //    })
        //    .fetch()
        //    .then(function () {
        //        res.json(notes);
        //    });

        //new Group({id: req.query.group_id})
        //    .fetch({
        //        withRelated: ['notes']
        //    })
        //    .then(function(result) {
        //        res.json(result);
        //    });

        new Note()
            .query(function(query) {
                query.where('group_id', '=', req.query.group_id);
                query.orderBy('id');
            })
            .fetchAll({
                withRelated: ['groups']
            }).then(function(result) {
                console.log(result.toJSON());
                res.json(result);
            });
    } else {
        //notes
        //    .query(function(query) {
        //        query.orderBy('id');
        //    })
        //    .fetch()
        //    .then(function() {
        //        res.json(notes);
        //    });
        new Note()
            .query(function(query) {
                query.orderBy('id');
            })
            .fetchAll({
                withRelated: ['groups']
            }).then(function(result) {
                //console.log(result.toJSON());
                res.json(result);
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

router.get('/group', function(req, res, next) {
  var groups = new Groups();
  groups
      .query(function(query) {
        query.orderBy('id');
      })
      .fetch()
      .then(function() {
        //console.log(groups);
        res.json(groups);
      });
});

router.post('/group', function(req, res, next) {
  Group.forge(req.body)
      .save()
      .then(function(group) {
        group.save({'name': 'Group' + group.id}).then(function(group) {
          //console.log(group);
          res.json(group);
        })
      });
});

router.put('/group/:group_id', function(req, res, next) {
    Group.forge(req.body)
        .save()
        .then(function(group) {
            res.json(group);
        });
});

router.delete('/group/:group_id', function(req, res, next) {
    Group.forge({'id': req.params.group_id})
        .destroy()
        .then(function() {
            console.log('destroy');
        });
});
module.exports = router;
