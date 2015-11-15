$('document').ready(function() {

    Handlebars.registerHelper('ifEqual', function(a, b, options) {
        return a == b ? options.fn(this) : options.inverse(this);
    });

    var currentView = null;

    var Note = Backbone.Model.extend({
        urlRoot: 'group/notes',
        defaults: function () {
            return {
                title: '제목을 입력하세요.',
                content: '내용을 입력하세요.'
            };
        }
    });

    var Notebook = Backbone.Collection.extend({
        url: 'group/notes',
        model: Note
    });

    var Group = Backbone.Model.extend({
        urlRoot: 'group/group',

        defaults: function() {
            return {
                name: 'group'
            };
        }
    });

    var Groups = Backbone.Collection.extend({
        url: 'group/group',
        model: Group
    });

    var CreateGroup = Backbone.View.extend({
        el: $('#sidebar'),

        initialize: function() {
            this.showAllNotes();
        },

        events: {
            'click #createBtn': 'createGroup',
            'click #allBtn': 'showAllNotes',
            'keyup .search': 'search'
        },

        search: function() {
            if (currentView.$el.attr('group_id')) {
                notebook.fetch({
                    data: {
                        keyword: $('.search').val(),
                        group_id: currentView.$el.attr('group_id')
                    }
                });
            } else if ($('.search').val()){
                notebook.fetch({
                    data: { keyword: $('.search').val() }
                });
            } else {
                notebook.fetch();
            }
        },

        showAllNotes: function() {
            console.log('전체보기');
            $('.group').removeClass('selected');
            if (currentView) {
                currentView.$el.removeAttr('group_id');
                currentView.$el.html('<button id="addBtn">+</button>');
            }
            notebook.fetch();
        },

        createGroup: function () {
            var group = new Group();
            group.save().then(_.bind(function() {
                this.collection.add(group);
            }, this));
        }
    });


    var GroupView = Backbone.View.extend({
        tagName: 'ul',

        initialize: function() {
            this.listenTo(this.collection, 'reset', this.fetchList);
            this.listenTo(this.collection, 'add', this.groupList);
            console.log(this.cid);
        },

        fetchList: function() {
            this.collection.each(_.bind(function(group) {
                var eachGroup = new EachGroup({model: group}).render();
                eachGroup.$el.appendTo(this.$el);
            }, this));
        },

        groupList: function(group) {
            var eachGroup = new EachGroup({model: group}).render();
            eachGroup.$el.appendTo(this.$el);
        }
    });


    var EachGroup = Backbone.View.extend({
        tagName: 'li',

        template: Handlebars.compile('<div class="group">\
                                <button class="groupXBtn">X</button>\
                                <div class="groupName">{{name}}</div>\
                                <textarea class="groupNameInput">{{name}}</textarea>\
                                </div>'),

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.destroyGroup);
            console.log(this.cid);
        },

        events: {
            'click .group': function(e) {
                this.showMain(e);
                this.selectedNote(e);
            },
            'click .groupXBtn': 'deleteGroup',
            'focusout .groupNameInput': 'groupUpdate'
        },

        destroyGroup: function() {
            this.remove();
        },

        deleteGroup: function(e) {
            console.log('delete');
            e.stopPropagation();
            this.model.destroy({success: function(){console.log('aaaaaaaaa')}});
        },

        groupUpdate: function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();

            this.$('.groupNameInput').css('display','');
            this.$('.groupName').off();

            if (this.model.get('name') == this.$('.groupNameInput').val()) return;

            this.model.save({
                name: this.$('.groupNameInput').val()
            }).then(_.bind(function() {
                console.log(this.model);
                currentView.render();
            }, this));
        },

        showMain: function(e) {
            //var group_id =  this.model.id;
            var group = this.model;

            //if (group_id == currentView.$el.attr('group_id')) return;
            if (group.id == currentView.$el.attr('group_id')) return;

            currentView.remove();
            currentView = new MainView({
                collection: notebook
            }).render(group);

            notebook.fetch({
                data: {
                    group_id: group.id
                }
            });
        },

        selectedNote: function(e) {
            $('.groupName').off();
            e.stopPropagation();
            $('.group').removeClass('selected');
            this.$el.children('.group').addClass('selected');
            this.$('.groupName').on('click', _.bind(function(e) {
                e.preventDefault();
                this.$('.groupNameInput').show().focus();
            }, this));
        },

        render: function() {
            //this.$el.attr('id', this.model.get('name'));
            this.$el.attr('id', 'group' + this.model.id);
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var MainView = Backbone.View.extend({
        id: 'main-top',

        template: Handlebars.compile('{{name}} <button id="addBtn">+</button>'),

        initialize: function() {
            this.$el.data('view', this);
            this.listenTo(this.collection, 'add', this.showNotes);
            console.log(this.cid);
        },

        events: {
            'click #addBtn': 'clickAdd'
        },

        showNotes: function(note) {
            //var group_id = note.get('group_id');
            //_.without($('#main').children('.note'), this.group_id), function(div) {
            //    console.log(div);
            //    $(div).data('view').remove();
            //};
            //console.log('main-top => ', this.cid);
            var mainViewNote = new MainViewNote({
                model: note
            }).render();
            mainViewNote.$el.appendTo('#main');

            //if (mainViewNote.$el.offset().top > 751)
            //    $('html, body').animate({scrollTop: mainViewNote.$el.offset().top}, 500);
        },

        clickAdd: function () {
            var group_id = this.$el.attr('group_id');
            var newNote = new Note();
            newNote.save({group_id: group_id}).then(_.bind(function() {
                this.collection.add(newNote);
            }, this));
        },

        render: function(group) {
            console.log(this.cid);

            if (group) {
                this.$el.attr('group_id', group.id);
                this.$el.html(this.template(group.toJSON())).appendTo('#main');
            } else {
                this.$el.html(this.template()).appendTo('#main');
            }
            return this;
        }
    });


    var MainViewNote = Backbone.View.extend({
        tagName: 'div',

        className: 'note',

        template: Handlebars.compile('<div><button class="xBtn">X</button></div>\
                                        <p><strong>[{{groups.name}}_N{{id}}] {{title}}</strong></p>\
                                        {{content}}\
                                        <p class="pDate">{{created_at}}</p>'),

        initialize: function () {
            this.$el.data('view', this);
            this.listenTo(this.model, 'remove', this.removeNote);
            this.listenTo(this.model, 'change', this.changedNote);
            console.log(this.cid);
        },

        events: {
            'click .xBtn': 'destroyNote',
            'click': 'showNoteView'
        },

        removeNote: function() {
            console.log('remove', this.cid);
            this.remove();
            //this.$el.data('view').remove();
            //this.$el.children('#' + this.model.id).data('view').remove();
        },

        changedNote: function() {
            console.log(arguments);
            this.render();
            console.log(this);
        },

        destroyNote: function (e) {
            if (!confirm('삭제하시겠습니까?')) return;
            //e.preventDefault();
            //e.stopImmediatePropagation();
            //e.stopPropagation();
            this.model.destroy({success: function(){console.log('success!');}});
        },

        showNoteView: function(e) {
            if (e.target == e.currentTarget) {
                var viewNote = new ViewNote({model: this.model}).render();
                viewNote.$el.appendTo('#main');
                //viewNote.render();
            }
        },

        render: function () {
            //console.log(this.cid);
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.attr('id', 'note_id' + this.model.id);
            this.$el.attr('group_id', this.model.get('group_id'));

            return this;
        }
    });

    var ViewNote = Backbone.View.extend({
        className: 'noteBg',

        template: Handlebars.compile('<div class="noteUpdate">[no.{{id}}]\
                                    <input type="text" class="noteTitle" value="{{title}}">\
                                    <span>{{created_at}}</span>\
                                    <select>\
                                    {{#if group_id}}\
                                        {{#each allGroup}}\
                                            <option value="{{this.id}}"\
                                            {{#ifEqual this.id ../group_id}}\
                                                selected\
                                            {{/ifEqual}}>{{this.name}}</option>\
                                        {{/each}}\
                                    {{else}}\
                                        null\
                                    {{/if}}\
                                    </select>\
                                    <button class="closeBtn">닫기</button>\
                                    <textarea class="noteContent">{{content}}</textarea>\
                                    <button class="update">Update</button>\
                                    <button class="delete">Delete</button>\
                                    <span>{{updated_at}}</span></div>'),

        initialize: function() {
            console.log(groups);
            this.listenTo(this.model, 'destroy', this.closeNote);
        },

        events: {
            'click': 'closeNote',
            'click .closeBtn' : 'closeNote',
            'click .update': 'updateNote',
            'click .delete': 'destroyNote'
        },

        closeNote: function(e) {
            if (e.target == e.currentTarget)
                this.remove();
        },

        updateNote: function() {
            console.log(groups.pluck('name'));
            if (this.model.get('title') == this.$('input').val() &&
                this.model.get('content') == this.$('textarea').val())
                return;

            this.model.save({
                title: this.$('input').val(),
                content: this.$('textarea').val()
            });
        },

        destroyNote: function() {
            if (!confirm('삭제하시겠습니까?')) return;
            this.model.destroy({success: function(){alert('success!');}});
        },

        render: function() {
            this.model.set({allGroup: groups.toJSON()});
            console.log(this.model.toJSON());
            console.log(this.model.get('allGroup'));

            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    var notebook = new Notebook();

    var groups = new Groups();

    new CreateGroup({collection: groups});

    var groupView = new GroupView({collection: groups});
    groupView.render().$el.appendTo('#sidebar');

    currentView = new MainView({
        collection: notebook
    }).render();

    groups.fetch({reset: true});

    //notebook.fetch();

    window.groups = groups;
    window.notebook = notebook;
    window.currentView = currentView;
});
