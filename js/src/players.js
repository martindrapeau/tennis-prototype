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
      match_ids: []
    },
    initialize: function() {
      this.matches = [];
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

  Backbone.EditPlayersView = Backbone.View.extend({
    formTemplate: _.template(`
      <form class="bootbox-form">
        <div class="form-group">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group">
          <input name="email" type="email" placeholder="<%=_lang('email')%>" value="<%=email%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group">
          <input name="phone" type="text" placeholder="<%=_lang('telephone')%>" value="<%=phone%>" class="form-control" autocomplete="off" />
        </div>
      </form>
    `),
    initialize: function(options) {
      this.onSave = options.onSave;
      this.onDelete = options.onDelete;
    },
    render: function() {
      bootbox.dialog({
        title: _lang('playerInformation'),
        message: this.formTemplate(this.model.toJSON()),
        size: 'small',
        buttons: {
          cancel: {
            label: _lang('cancel')
          },
          confirm: {
            label: _lang('save'),
            callback: this.onClickSave.bind(this)
          }
        }
      });
      this.$el = $('.bootbox.modal');
      this.$form = this.$('form');

      if (typeof this.onDelete == 'function')
        this.$form.append(new Backbone.ConfirmDeleteInlineFormControl({
          message: _lang('deleteThisPlayer'),
          callback: this.onClickDelete.bind(this),
          actionLabel: _lang('delete'),
          confirmLabel: _lang('yes'),
          cancelLabel: _lang('no')
        }).render().$el);

      return this;
    },
    onClickDelete: function() {
      bootbox.hideAll();
      this.onDelete();
    },
    onClickSave: function() {
      bootbox.hideAll();
      var data = this.$form.serializeObject();
      this.model.set(data);
      if (typeof this.onSave == 'function') this.onSave();
    }
  });

  Backbone.PlayerView = Backbone.View.extend({
    template: _.template(`
      <tbody>
        <tr>
          <td class="picture">
            <div class="wrapper">
              <div class="initials"><%=initials%></div>
            </div>
          </td>
          <td class="info">
            <div class="name"><%=name%></div>
            <div class="email"><%=email%></div>
            <div class="phone"><%=phone%></div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2">
            <div class="matches pull-left"></div>
          </th>
        </tr>
      </tfoot>
    `),
    className: 'player',
    tagName: 'table',
    events: {
      'click ': 'onPlayerClick'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      var data = this.model.toRender();

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid);

      this.$('.initials').text(data.initials);
      this.$('.matches').text(data.match_ids.length + ' ' + _lang(data.match_ids.length == 1 ? 'match' : 'matches').toLowerCase());

      return this;
    },
    onPlayerClick: function(e) {
      new Backbone.EditPlayersView({
        model: this.model,
        onSave: this.onSave.bind(this),
        onDelete: this.onDelete.bind(this)
      }).render();
    },
    onSave: function() {
      this.model.save(null, {wait: true});
    },
    onDelete: function() {
      this.$('tbody').animate({backgroundColor: '#ffdddd'}, 100);
      setTimeout(function() {
        this.$el.animate({
          opacity: 0
        }, 750, function() {
          this.model.collection.remove(this.model);
          this.model.destroy();
        }.bind(this));
      }.bind(this), 100);
    }
  });

  Backbone.PlayersView = Backbone.View.extend({
    className: 'player',
    events: {
      'click .add-player': 'onAddPlayer'
    },
    initialize: function(options) {
      this.listenTo(this.collection, 'add remove', this.render);
      this.onResize = _.debounce(this._onResize.bind(this), 100);
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $(window).on('resize.players', this.onResize);
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      $(window).off('resize.players');
    },
    onAddPlayer: function(e) {
      var model = new Backbone.PlayerModel();

      new Backbone.EditPlayersView({
        model: model,
        onSave: function() {
          this.collection.add(model, {sort: false});
          var view = this.views[this.views.length-1];
          view.$('tbody').css({backgroundColor: '#ddffdd'});

          model.save(null, {wait: true}).done(function() {
            $('html, body').animate({
              scrollTop: view.$el.offset().top
            }, 500);

            view.$('tbody').animate({
              backgroundColor: '#fff'
            }, 750, function() {
              view.$('tbody').css({backgroundColor:''});
            });
            
          }.bind(this));
          
        }.bind(this)
      }).render();
    },
    remove: function() {
      $(window).off('resize', this.onResize);
      return Backbone.View.prototype.remove.apply(this, arguments);
    },
    _onResize: function() {
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