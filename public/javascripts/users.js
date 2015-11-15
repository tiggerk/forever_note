$('document').ready(function() {

    var User = Backbone.Model.extend({
        urlRoot: 'users/join',

        defaults: function () {
            return {
                user_id: '',
                user_pw: ''
            };
        }
    });

    var LoginUser = Backbone.Model.extend({
        urlRoot: 'users/login',
        defaults: function () {
            return {
                user_id: '',
                user_pw: ''
            };
        }
    });

    var Join = Backbone.View.extend({});

    var JoinLogin = Backbone.View.extend({
        model: new User(),

        el: $('#sidebar'),

        events: {
            'click #joinBtn' : 'join',
            'click #loginBtn' : 'login'
        },

        join: function() {
            console.log('join', this.model);
            this.model.save({
                user_id: this.$el.find('#user-id').val(),
                user_pw: this.$el.find('#user-pw').val()
            }).then(function() {
                console.log(this.model);
            })
        },

        login: function() {
            var loginUser = new LoginUser({
                user_id: this.$('#user-id').val(),
                user_pw: this.$('#user-pw').val()
            });
            loginUser.save().then(function() {
                console.log(loginUser);
            })
        }
    });

    var Login = Backbone.View.extend({
        model: LoginUser,

        el: '#main',

        events: {
            'click .login' : 'login'
        },

        login: function() {
            var loginUser = new LoginUser({
                user_id: this.$('#user-id').val(),
                user_pw: this.$('#user-pw').val()
            });
            loginUser.save().then(function() {
                console.log(loginUser);
            });
        }

    });

    new JoinLogin();
    new Login();






    var JoinForm = Backbone.View.extend({
        el: '#main',

        template: Handlebars.compile('<p><input id="user-id" type="text" placeholder="id"></p>\
                                <p><input id="user-pw" type="password" placeholder="password"></p>\
                                <p><input id="user-name" type="text" placeholder="name"></p>\
                                <button class="join" type="submit">Join</button>\
                                <button class="cancel" type="reset">Cancel</button>'),

        events: {
            'click .join' : 'join'
        },

        join: function() {
            var user = new User({
                user_id: this.$('#user-id').val(),
                user_pw: this.$('#user-pw').val(),
                User_name: this.$('#user-name').val()
            });
            user.save().then(function() {
                console.log(user);
            });
        },

        render: function() {
            this.$el.html(this.template());
            console.log('joinForm render')
        }
    });

    //var joinForm = new JoinForm();

    //joinForm.render();

    //notebook.fetch();

    //window.notebook = notebook;

});
