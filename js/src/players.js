(function() {

  Backbone.PlayerModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
      email: null,
      image: null,
      match_ids: []
    },
    initialize: function() {
      this.matches = [];
    },
    bindMatches: function(matches) {
      if (!this.collection || !this.collection.matchesCollection) return;
      this.matches = matches || this.collection.matchesCollection.getMatchesForPlayer(this.id);
      this.set({match_ids: _.pluck(this.matches, ['id'])});
      console.log('bindMatches', this.id, this.matches.length);
    },
    toRender: function() {
      var data = this.toJSON();

      data.title = data.name ? _.shortName(data.name) : null;
      data.initials = data.name ? _.initials(data.name) : null;

      return data;
    }
  });

  Backbone.PlayerCollection = Backbone.Collection.extend({
    model: Backbone.PlayerModel,
    initialize: function(models, options) {
      this.matchesCollection = options.matchesCollection;
      _.defer(this.bindMatches.bind(this));
    },
    bindMatches: function() {
      this.stopListening();
      if (!this.matchesCollection) return;
      var matches = this.matchesCollection;

      this.each(function(match) {
        match.bindMatches();
      });

      this.listenTo(matches, 'add', function(match) {
        _.each(match.getPlayerIds(), function(id) {
          var player = this.get(id);
          if (player) player.bindMatches([match]);
        }.bind(this));
      });

      this.listenTo(matches, 'remove', function(match) {
        _.each(match.getPlayerIds(), function(id) {
          var player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != id;}));
        }.bind(this));
      });

      this.listenTo(matches, 'change', function(match) {
        var id, player;
        if (match.hasChanged('user_id')) {
          id = match.previous('user_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != id;}));
          id = match.get('user_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
        if (match.hasChanged('user_partner_id')) {
          id = match.previous('user_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != id;}));
          id = match.get('user_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
        if (match.hasChanged('other_id')) {
          id = match.previous('other_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != id;}));
          id = match.get('other_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
        if (match.hasChanged('other_partner_id')) {
          id = match.previous('other_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != id;}));
          id = match.get('other_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
      });

    }
  });

  Backbone.PlayerView = Backbone.View.extend({
    className: 'player',
    tagName: 'table',
    events: {
      'keydown input': 'onInputKeydown',
      'blur input': 'saveInputToModel',
      'click .dropdown-menu a.delete': 'onClickDelete'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.onChange);
    },
    onChange: function() {
      this.renderPicture(this.model.toRender());
    },
    render: function(options) {
      var data = this.model.toRender();
      data.editable = options && options.editPlayers;
      data.tabindex = options && options.tabindex ? options.tabindex : 100;

      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .find('input').prop('readonly', !data.editable);

      this.renderPicture(data);

      return this;
    },
    renderPicture: function(data) {
      this.$('.initials').text(data.initials);
      return this;
    },
    onClickDelete: function(e) {
      e.preventDefault();
      var view = this;
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);
      setTimeout(function() {
        if (!confirm(_lang('areYouSure'))) {
          view.$el.animate({backgroundColor: 'transparent'}, 100);
          return;
        }
        view.$el.animate({
          opacity: 0
        }, 750, function() {
          view.model.collection.remove(view.model);
          //view.model.destroy();
        });
      }, 100);
    },
    onInputKeydown: function(e) {
      if (e.keyCode == 13) this.saveInputToModel.apply(this, arguments);
    },
    saveInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          type = $input.attr('type'),
          value = $input.val();
      this.model.set(attr, value);
    }
  });
  $('document').ready(function() {
    Backbone.PlayerView.prototype.template = _.template($('#player-template').html());
  });

  Backbone.PlayersView = Backbone.View.extend({
    className: 'player',
    events: {
      'click .add-player': 'onAddPlayer'
    },
    initialize: function(options) {
      this.onResize = _.debounce(this.onResize.bind(this), 100);
      this.listenTo(this.model, 'change:editPlayers', this.render);
      this.listenTo(this.collection, 'add remove', this.render);
      $(window).on('resize', this.onResize);
    },
    onAddPlayer: function(e) {
      var model = new Backbone.PlayerModel();
      this.collection.add(model);
      var view = this.views[this.views.length-1];
      view.$el.css({
        backgroundColor: '#ddffdd'
      });
      $('html, body').animate({
        scrollTop: view.$el.offset().top
      }, 500);
      view.$el.animate({
        backgroundColor: 'transparent'
      }, 750);
    },
    remove: function() {
      $(window).off('resize', this.onResize);
      return Backbone.View.prototype.remove.apply(this, arguments);
    },
    onResize: function() {
      this.render();
    },
    render: function() {
      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];
      this.$el.empty();

      var self = this,
          options = _.extend(this.model.toJSON(), {tabindex: 100});
      this.collection.each(function(model) {
        var view = new Backbone.PlayerView({
          model: model
        });
        self.$el.append(view.render(options).$el);
        self.views.push(view);
        options.tabindex += 100;
      });

      if (options.editPlayers) {
        var $add = $('<button class="btn btn-default add-player">' + _lang('addAPlayer') + '...</button>');
        this.$el.append($add);
        if (self.views.length) $add.css('width', self.views[0].$el.css('width'));
      }
      
      return this;
    }
  });

}.call(this));