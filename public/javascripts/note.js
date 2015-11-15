$('document').ready(function() {

    //Backbone.sync = function(method, model) {
    //    alert(method + ": " + JSON.stringify(model));
    //};

    var currentNoteView = null;

    var Note = Backbone.Model.extend({
        urlRoot: '/notes',
        defaults: function () {
            return {
                title: '제목을 입력하세요.',
                content: '내용을 입력하세요.',
                created_at: moment().format('YYYY-MM-DD HH:mm:ss:ms')
            };
        }
    });

    var Word = Backbone.Model.extend({
        urlRoot: '/search'
    });

    var Notebook = Backbone.Collection.extend({
        url: '/notes',
        model: Note
    });

    var NotebookView = Backbone.View.extend({
        tagName: 'ul',

        initialize: function () {
            this.listenTo(this.collection, 'add', this.addNote);
            this.listenTo(this.collection, 'remove', this.removeNote);
            //this.listenTo(this.collection, 'change', this.changedNote);
            //this.listenTo(this.collection, 'reset', function() {
            //    console.log('reset')
            //});

        },

        addNote: function (note) {
            var notebookNoteView = new NotebookNoteView({model: note}).render();
            notebookNoteView.$el.appendTo(this.$el);
            notebookNoteView.showNoteView();
        },

        removeNote: function(note) {
            this.$el.children('#' + note.id).data('view').remove();
        },

        render: function () {
            this.collection.each(this.addNote, this);

            return this;
        }
    });

    var NotebookNoteView = Backbone.View.extend({
        tagName: 'li',

        template: Handlebars.compile('<div class="note">\
                                        <div><button class="xBtn">X</button></div>\
                                        <p><strong>[{{id}}]{{title}}</strong></p>\
                                        <p>{{content}}</p>\
                                        <p>{{created_at}}</p>\
                                        </div>'),

        initialize: function () {
            this.$el.data('view', this);

            this.listenTo(this.model, 'change', this.changedNote);
        },

        events: {
            'click .note': function(e) {
                this.showNoteView(e);
                this.selectedNote(e);
            },
            'click .xBtn': 'destroyNote'
        },

        changedNote: function() {
            this.render().showNoteView();
        },

        destroyNote: function () {
            this.model.destroy({success: function(){ currentNoteView.remove(); }});
        },

        selectedNote: function(e) {
            $('.note').removeClass('selected');
            this.$el.children('.note').addClass('selected');
        },

        showNoteView: function () {
            if (!currentNoteView) {
                currentNoteView = new NoteView({
                    model: this.model
                }).render();
            } else if (currentNoteView.model.id != this.model.id) {
                currentNoteView.remove();
                currentNoteView = new NoteView({
                    model: this.model
                }).render();
            }
        },

        render: function () {
            this.$el.attr('id', this.model.id);
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

    var NoteView = Backbone.View.extend({
        el: '#main-note',

        template: Handlebars.compile('[{{id}}]<input type="text" class="noteTitle" value="{{title}}">\
                                        <span>{{created_at}}</span>\
                                        <textarea class="noteContent">{{content}}</textarea>\
                                        <button class="update">Update</button>\
                                        <button class="delete">Delete</button>\
                                        <span>{{updated_at}}</span>'),

        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove);
        },

        events: {
            'focusout .noteTitle': 'updateNote',
            'focusout .noteContent': 'updateNote',
            'click .update' : 'updateNote',
            'click .delete' : 'destroyNote'
        },

        updateNote: function () {
            if (this.model.get('title') == this.$('input').val() &&
                this.model.get('content') == this.$('textarea').val())
                return;

            this.model.save({
                title: this.$('input').val(),
                content: this.$('textarea').val(),
                updated_at: moment().format('YYYY-MM-DD HH:mm:ss:ms')
            });

            this.render();
        },

        destroyNote: function () {
            if (!confirm('삭제하시겠습니까?')) return;
            this.model.destroy({success: function(){console.log('success');}});
        },

        remove: function () {
            this.undelegateEvents(this.events);
            this.stopListening();
            this.$el.html('');
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });


    var AddNote = Backbone.View.extend({
        events: {
            'click #addBtn': 'add',
            'keyup #search': 'search'
        },

        add: function () {
            var newNote = new Note();
            newNote.save().then(_.bind(function() {
                console.log(newNote);
                //console.log(newNote.toJSON(), newNote.id);
                this.collection.add(newNote);
            }, this));
        },

        search: function () {
            if ($('#search').val() == '') {
                this.collection.reset();
                $('#side-notebook ul').html('');
            }
            this.collection.fetch({
                data: { keyword: $('#search').val() }
            });
            //var word = new Word({char: $('#search').val()});
            //if (word != '') {
                //var searchNote = new Notebook();
                //word.save().then(function() {
                //        console.log(this)
                //        console.log(result)

                        //_.each(this.collection,
                    //})
            //}
        }
    });

    var CreateNote = Backbone.View.extend({
        el: '#main-note',

        template: Handlebars.compile(''),

        events: {
            'click .create': 'createNote'
        },

        createNote : function () {
            var noteTitle = $('.noteTitle').val();
            var noteContent = $('.noteContent').val();
            if (noteTitle && noteContent) {
                var newNote = new Note({
                    title: noteTitle,
                    content: noteContent
                });

                newNote.save().then(_.bind(function () {
                    this.collection.add(newNote);
                }, this));
            }
            return alert('둘다입력하시옹');
        }
    });

    var notebook = new Notebook();

    var nv = new NotebookView({collection: notebook});
    nv.render().$el.appendTo('#side-notebook');

    new AddNote({
        el: $('#side-notebook'),
        collection: notebook
    });

    new CreateNote({ collection: notebook });

    notebook.fetch();

    window.notebook = notebook;

});
