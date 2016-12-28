(function() {

  var dataStore = new BackboneLocalStorage('players');

  Backbone.PlayerModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: null,
      email: null,
      phone: null,
      image: null,
      // The following are ignored by the back-end
      match_ids: [],
      editable: false
    },
    initialize: function() {
      this.matches = [];
      this.set({editable: false}, {silent: true});
    },
    bindMatches: function(matches) {
      this.matches = matches || this.collection.matchesCollection.getMatchesForPlayer(this.id);
      this.set({match_ids: _.pluck(this.matches, ['id'])});
    },
    toRender: function() {
      var data = this.toJSON();
      data.tabindex = this.cid.replace('c', '') * 100;

      data.title = data.name ? _.shortName(data.name) : null;
      data.initials = data.name ? _.initials(data.name) : null;

      return data;
    }
  });

  Backbone.PlayerCollection = Backbone.Collection.extend({
    model: Backbone.PlayerModel,
    sync: dataStore.sync,
    comparator: function(model) {
      var words = (model.get('name') || '').split(/\s/),
          result = [];
      while (words.length) result.push(words.pop().toLowerCase());
      return result;
    },
    bindMatches: function(matches) {
      this.stopListening();
      this.matchesCollection = matches;

      this.each(function(player) {
        player.bindMatches();
      });

      this.listenTo(matches, 'add', function(match) {
        _.each(match.getPlayerIds(), function(id) {
          var player = this.get(id);
          if (player) player.bindMatches(model.matches.concat([match]));
        }.bind(this));
      });

      this.listenTo(matches, 'remove', function(match) {
        _.each(match.getPlayerIds(), function(id) {
          var player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != match.id;}));
        }.bind(this));
      });

      this.listenTo(matches, 'change', function(match) {
        var id, player;
        if (match.hasChanged('user_id')) {
          id = match.previous('user_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != match.id;}));
          id = match.get('user_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
        if (match.hasChanged('user_partner_id')) {
          id = match.previous('user_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != match.id;}));
          id = match.get('user_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
        if (match.hasChanged('other_id')) {
          id = match.previous('other_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != match.id;}));
          id = match.get('other_id');
          player = this.get(id);
          if (player) player.bindMatches(player.matches.concat([match]));
        }
        if (match.hasChanged('other_partner_id')) {
          id = match.previous('other_partner_id');
          player = this.get(id);
          if (player) player.bindMatches(_.filter(player.matches, function(o) {return o.id != match.id;}));
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
    onChange: function(model, options) {
      var data = this.model.toRender();
      if (options && options.renderAll) {
        this.render();
      } else {
        this.renderPicture(data);
        this.renderMatches(data);
      }
    },
    focus: function() {
      this.$el.find('input').first().focus();
    },
    render: function() {
      var data = this.model.toRender();

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
        .find('input').prop('readonly', !data.editable);

      this.renderPicture(data);
      this.renderMatches(data);

      return this;
    },
    renderPicture: function(data) {
      this.$('.initials').text(data.initials);
      return this;
    },
    renderMatches: function(data) {
      this.$('.matches').text(data.match_ids.length + ' ' + _lang(data.match_ids.length == 1 ? 'match' : 'matches').toLowerCase());
      return this;
    },
    onClickDelete: function(e) {
      e.preventDefault();
      var view = this;
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);
      setTimeout(function() {
        if (!confirm(_lang('areYouSure'))) {
          view.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
          return;
        }
        view.$el.animate({
          opacity: 0
        }, 750, function() {
          view.model.collection.remove(view.model);
          view.model.destroy();
        });
      }, 100);
    },
    onInputKeydown: function(e) {
      if (e.keyCode == 13) {
        e.exitEditMode = true;
        this.saveInputToModel.apply(this, arguments);
      }
    },
    saveInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          value = $input.val(),
          attributes = {},
          options = {wait: true};
      attributes[attr] = value;
      if (e.exitEditMode) {
        attributes.editable = false;
        options.renderAll = true;
        document.activeElement.blur();
      }
      this.model.save(attributes, options);
    }
  });
  $('document').ready(function() {
    Backbone.PlayerView.prototype.template = _.template($('#player-template').html());
  });

  Backbone.PlayersView = Backbone.View.extend({
    className: 'player',
    events: {
      'click .add-player': 'onAddPlayer',
      'click .player': 'onFocusPlayer',
      'focus .player': 'onFocusPlayer'
    },
    initialize: function(options) {
      this.listenTo(this.collection, 'add remove', this.render);
      this.onResize = _.debounce(this.onResize.bind(this), 100);
    },
    getModelInEdit: function() {
      return this.collection.findWhere({editable: true});
    },
    stopEditing: function(options) {
      var model = this.getModelInEdit();
      if (model) model.set({editable: false}, options);
      document.activeElement.blur();
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $(window).on('resize.players', this.onResize);
      $('body').on('click.players', this.onClickBody.bind(this));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      this.stopEditing();
      $(window).off('resize.players');
      $('body').off('click.players');
    },
    onFocusPlayer: function(e) {
      var $el = $(e.currentTarget);
      if ($el.is('.player')) {
        var cid = $el.data('cid'),
            modelInEdit = this.getModelInEdit();
        if (modelInEdit && cid == modelInEdit.cid) return;
        if (modelInEdit) modelInEdit.set({editable: false}, {renderAll: true});
        var model = this.collection.get(cid);
        if (model) model.set({editable: true}, {renderAll: true});
        e.stopPropagation();
      }
    },
    onClickBody: function(e) {
      var $el = $(e.target);
      if (this.model.get('view') != 'players' || $el.closest('.bootstrap-select').length) return;
      var modelInEdit = this.getModelInEdit();
      if (modelInEdit && !$el.is('.player') && !$el.closest('.player').is('.player')) {
        modelInEdit.set({editable: false}, {renderAll: true});
      }
    },
    onAddPlayer: function(e) {
      var model = new Backbone.PlayerModel({editable:true});
      this.collection.add(model, {sort: false});
      var view = this.views[this.views.length-1];
      view.$el.css({
        backgroundColor: '#ddffdd'
      });
      $('html, body').animate({
        scrollTop: view.$el.offset().top
      }, 500);
      view.$el.animate({
        backgroundColor: 'transparent'
      }, 750, function() {
        this.$el.css({backgroundColor:''});
        this.focus();
      }.bind(view));
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

      var state = this.model.toJSON();
      this.collection.each(function(model) {
        if (state.program_id) {
          if (!_.some(model.matches, function(match) {
            return match.get('program_id') == state.program_id;
          })) return true;
        }
        var view = new Backbone.PlayerView({
          model: model
        });
        this.$el.append(view.render().$el);
        this.views.push(view);
      }.bind(this));

      if (!state.program_id) {
        this.$add = $('<button class="btn btn-default add-player">' + _lang('addAPlayer') + '...</button>');
        this.$el.append(this.$add);
        _.defer(function() {
          if (this.views.length) this.$add.css('width', this.views[0].$el.css('width'));
        }.bind(this));
      }

      this.$el.append('<div class="spacer">&nbsp;</div>');
      
      return this;
    }
  });

}.call(this));