(function() {

  var USER_WON_BECAUSE_BYE = 'user_won_because_bye',
      OTHER_WON_BECAUSE_BYE = 'other_won_because_bye',
      USER_WON_BECAUSE_FORFEIT = 'user_won_because_forfeit',
      OTHER_WON_BECAUSE_FORFEIT = 'other_won_because_forfeit',
      INCOMPLETE = 'incomplete',
      SINGLES = 'singles',
      DOUBLES = 'doubles';

  _.shortName = function(name) {
    var pieces = name.split(/\s+/);
    return _.map(pieces, function(v, i) {
      return i+1 < pieces.length ? v[0] : v;
    }).join(' ');
  };
  _.initials = function(name) {
    var pieces = name.split(/\s+/);
    return _.map(pieces, function(v, i) {
      return v[0].toUpperCase();
    }).join('');
  };

  var dataStore = new BackboneLocalStorage('matches');

  Backbone.MatchModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      type: "singles",
      created_on: null,
      played_on: null,
      user_id: null,
      user_partner_id: null,
      other_id: null,
      other_partner_id: null,
      user: null,
      user_partner: null,
      other: null,
      other_partner: null,
      user_points: null,
      other_points: null,
      user_set1: null,
      other_set1: null,
      user_tie1: null,
      other_tie1: null,
      user_set2: null,
      other_set2: null,
      user_tie2: null,
      other_tie2: null,
      user_set3: null,
      other_set3: null,
      user_tie3: null,
      other_tie3: null,
      user_set4: null,
      other_set4: null,
      user_tie4: null,
      other_tie4: null,
      user_set5: null,
      other_set5: null,
      user_tie5: null,
      other_tie5: null,
      exception: null,
      location: null,
      comment: null,
      // The following is ignored by the back-end
      editable: false
    },
    initialize: function() {
      this.user = null;
      this.user_partner = null;
      this.other = null;
      this.other_partner = null;
      this.on('change:user_id', _.partial(this.bindPlayer, 'user'));
      this.on('change:user_partner_id', _.partial(this.bindPlayer, 'user_partner'));
      this.on('change:other_id', _.partial(this.bindPlayer, 'other'));
      this.on('change:other_partner_id', _.partial(this.bindPlayer, 'other_partner'));
      this.set({editable: false}, {silent: true});
    },
    setPlayer: function(key, player) {
      var attrs = {};
      attrs[key] = player ? player.toJSON() : null;
      this.set(attrs, {renderAll: true});
    },
    bindPlayer: function(key) {
      if (this[key]) this.stopListening(this[key]);

      this[key] = this.collection.playersCollection.get(this.get(key+'_id')) || null;
      this.setPlayer(key, this[key]);
      if (this[key]) {
        this.listenTo(this[key], 'change:name change:image', _.partial(this.setPlayer, key));
        this.listenTo(this[key], 'remove', function() {
          var attrs = {};
          attrs[key] = null;
          attrs[key+'_id'] = null;
          this.set(attrs, {renderAll: true});
        });
      }

    },
    bindPlayers: function() {
      if (!this.collection || !this.collection.playersCollection) return;
      this.bindPlayer('user');
      this.bindPlayer('user_partner');
      this.bindPlayer('other');
      this.bindPlayer('other_partner');
    },
    toRender: function() {
      var data = this.toJSON();
      data.tabindex = this.cid.replace('c', '') * 100;

      var when = moment(data.played_on);
      data.date = when.isValid() ? when.format('YYYY-MM-DD') : '';
      data.time = when.isValid() ? when.format('HH:mm') : '';

      !data.user || (data.user.title = _.shortName(data.user.name));
      !data.user_partner || (data.user_partner.title = _.shortName(data.user_partner.name));
      data.user_title = _.compact([data.user ? data.user.title : null, data.user_partner ? data.user_partner.title : null]).join('<br/>');
      data.user_title_inline = _.compact([data.user ? data.user.title : null, data.user_partner ? data.user_partner.title : null]).join(' &amp; ');
      data.user_tooltip = _.compact([data.user ? data.user.name : null, data.user_partner ? data.user_partner.name : null]).join(' &amp; ');

      !data.other || (data.other.title = _.shortName(data.other.name));
      !data.other_partner || (data.other_partner.title = _.shortName(data.other_partner.name));
      data.other_title = _.compact([data.other ? data.other.title : null, data.other_partner ? data.other_partner.title : null]).join('<br/>');
      data.other_title_inline = _.compact([data.other ? data.other.title : null, data.other_partner ? data.other_partner.title : null]).join(' &amp; ');
      data.other_tooltip = _.compact([data.other ? data.other.name : null, data.other_partner ? data.other_partner.name : null]).join(' &amp; ');

      data.score = this.getScore();

      data.winner = this.getWinner();
      data.winner_id = data.winner ? data[data.winner + '_id'] : null;
      data.winner_partner_id = data.winner ? data[data.winner + '_partner_id'] : null;

      return data;
    },
    getScore: function() {
      var score = '',
          match = this.toJSON(),
          winner = this.getWinner();

      if (!winner) return score;

      if (winner == 'user') {
        if (match['user_set1'] || match['other_set1'])
          score = (match['user_set1']!==null?match['user_set1']:'?')+'-'+(match['other_set1']!==null?match['other_set1']:'?');
        if (score.length && (match['user_set2'] || match['other_set2'])) 
          score += ', '+(match['user_set2']!==null?match['user_set2']:'?')+'-'+(match['other_set2']!==null?match['other_set2']:'?');
        if (score.length && (match['user_set3'] || match['other_set3'])) 
          score += ', '+(match['user_set3']!==null?match['user_set3']:'?')+'-'+(match['other_set3']!==null?match['other_set3']:'?');
        if (score.length && (match['user_set4'] || match['other_set4'])) 
          score += ', '+(match['user_set4']!==null?match['user_set4']:'?')+'-'+(match['other_set4']!==null?match['other_set4']:'?');
        if (score.length && (match['user_set5'] || match['other_set5'])) 
          score += ', '+(match['user_set5']!==null?match['user_set5']:'?')+'-'+(match['other_set5']!==null?match['other_set5']:'?');
        /*if (match['user_points'] || match['other_points']) {
          if (score.length) score += ', ';
          score += (match['user_points']?match['user_points']:'?')+'-'+(match['other_points']?match['other_points']:'?').'pts';
        }*/
        if (match['exception'] == USER_WON_BECAUSE_FORFEIT)
          score += (score.length ? ' ' : '') + _lang('forfeit');
      } else {
        if (match['user_set1'] || match['other_set1'])
          score = (match['other_set1']!==null?match['other_set1']:'?')+'-'+(match['user_set1']!==null?match['user_set1']:'?');
        if (score.length && (match['user_set2'] || match['other_set2'])) 
          score += ', '+(match['other_set2']!==null?match['other_set2']:'?')+'-'+(match['user_set2']!==null?match['user_set2']:'?');
        if (score.length && (match['user_set3'] || match['other_set3'])) 
          score += ', '+(match['other_set3']!==null?match['other_set3']:'?')+'-'+(match['user_set3']!==null?match['user_set3']:'?');
        if (score.length && (match['user_set4'] || match['other_set4'])) 
          score += ', '+(match['other_set4']!==null?match['other_set4']:'?')+'-'+(match['user_set4']!==null?match['user_set4']:'?');
        if (score.length && (match['user_set5'] || match['other_set5'])) 
          score += ', '+(match['other_set5']!==null?match['other_set5']:'?')+'-'+(match['user_set5']!==null?match['user_set5']:'?');
        /*if (match['user_points'] || match['other_points']) {
          if (score.length) score += ', ';
          score += (match['other_points']?match['other_points']:'?')+'-'+(match['user_points']?match['user_points']:'?').'pts';
        }*/
        if (match['exception'] == OTHER_WON_BECAUSE_FORFEIT)
          score += (score.length ? ' ' : '') + _lang('forfeit');
      }

      return score;
    },
    // Returns the winner of the match. Either user, other or null.
    getWinner: function() {
      var match = this.toJSON();
      
      // Look at the exceptional cases
      if (match['exception'] == INCOMPLETE) return null;
      if (match['exception'] !== null) {
        if (match['exception'] == USER_WON_BECAUSE_BYE ||
          match['exception'] == USER_WON_BECAUSE_FORFEIT)
          return 'user';
        if (match['exception'] == OTHER_WON_BECAUSE_BYE ||
          match['exception'] == OTHER_WON_BECAUSE_FORFEIT)
          return 'other';
      }
      
      // Look at sets
      var user_sets_won = 0,
          other_sets_won = 0;
      for (var set = 1; set <= 5; set++) {
        var winner = this.getWinnerOfSet(set);
        if (winner == 'user') user_sets_won += 1;
        else if (winner == 'other') other_sets_won += 1;
      }
      if (user_sets_won > other_sets_won) return 'user';
      if (other_sets_won > user_sets_won) return 'other';
      
      // Look at points
      if (!match['user_points'] && !match['other_points']) return null;
      if (!match['user_points'] || match['other_points'] > match['user_points']) return 'other';
      if (!match['other_points'] || match['user_points'] > match['other_points']) return 'user';
      
      return null;
    },
    isPlayerWinner: function(player_id) {
      var key = this.getWinner();
      if (!key) return false;
      return this.get(key + '_id') == player_id || this.get(key + '_partner_id' == player_id);
    },
    isComplete: function() {
      return this.getWinner() != null;
    },
    // Returns the stats on sets played and won.
    getSetStats: function() {
      var match = this.toJSON(),
          sets_played = 0,
          user_sets_won = 0,
          other_sets_won = 0;
      for (var set = 1; set <= 5; set++) {
        var winner = this.getWinnerOfSet(set);
        if (winner == 'user') user_sets_won += 1;
        else if (winner == 'other') other_sets_won += 1;
      }
      return {
        sets_played: sets_played,
        user_sets_won: user_sets_won,
        other_sets_won: other_sets_won
      };
    },
    // Returns the winner of the set. Either user, other or null.
    getWinnerOfSet: function(set) {
      if (set != 1 && set != 2 && set != 3 && set != 4 && set != 5) return null;
      var match = this.toJSON();
      
      if (!match['user_set'+set] && !match['other_set'+set]) return null;
      if (!match['user_set'+set]) return 'other';
      if (!match['other_set'+set]) return 'user';
      if (match['user_set'+set] > match['other_set'+set]) return 'user';
      if (match['user_set'+set] < match['other_set'+set]) return 'other';
      return null;
    },
    hasPlayer: function(id) {
      return this.get('user_id') == id ||
        this.get('user_partner_id') == id ||
        this.get('other_id') == id ||
        this.get('other_partner_id') == id;
    },
    getPlayerIds: function() {
      return _.compact([this.get('user_id'), this.get('user_partner_id'), this.get('other_id'), this.get('other_partner_id')]);
    }
  });

  Backbone.MatchCollection = Backbone.Collection.extend({
    model: Backbone.MatchModel,
    sync: dataStore.sync,
    bindPlayers: function(players) {
      this.stopListening();
      this.playersCollection = players;
      this.each(function(match) {
        match.bindPlayers();
      });
    },
    getMatchesForPlayer: function(id) {
      if (!id) return [];
      return this.filter(function(model) {
        return model.hasPlayer.call(model, id);
      });
    },
    getPlayerIds: function() {
      var playerIds = []
      this.each(function(model) {
        playerIds = _.union(playerIds, model.getPlayerIds(model));
      });
      return _.unique(playerIds);
    },
    getMatchesForPlayers: function() {
      var map = {};
      this.each(function(model) {
        _.each(model.getPlayerIds(), function(id) {
          if (!map[id]) {
            map[id] = [model.id];
          }
          else if (map[id].indexOf(model.id) == -1) {
            map[id].push(model.id);
          }
        });
      });
      return map;
    },
    lastInProgram: function(program_id) {
      var index = this.findLastIndex({program_id: program_id});
      return index >= 0 ? this.at(index) : undefined;
    }
  });

  Backbone.EmptyMatchView = Backbone.View.extend({
    className: 'match empty',
    render: function() {
      this.$el.html(_lang("noMatches"));
      return this;
    }
  });

  Backbone.MatchView = Backbone.View.extend({
    template: undefined,
    className: 'match',
    tagName: 'table',
    events: {
      'keydown input': 'onInputKeydown',
      'blur input:not([name=date])': 'saveInputToModel',
      'focus input[readonly]:not(.editing)': 'onReadonlyInputFocus',
      'click .dropdown-menu a.type': 'onClickType',
      'click .dropdown-menu a.exception': 'onClickException',
      'click .dropdown-menu a.delete': 'onClickDelete',
      'click .dropdown-menu.time a': 'onClickTime',
      'changed.bs.select .player .selectpicker': 'onPlayerSelect'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.onChange);
    },
    onPlayerSelect: function(e) {
      var id = $(e.currentTarget).val();
      id = id ? parseInt(id, 10) : null;
      var key = $(e.currentTarget).attr('name'),
          attributes = {};
      attributes[key + '_id'] = id;
      this.model.save(attributes, {wait: true});
    },
    onChange: function(model, options) {
      if (options && options.renderAll)
        this.render();
      else
        this.renderMarker(this.model.toRender());
    },
    onClickType: function(e) {
      e.preventDefault();
      var type = $(e.currentTarget).data('type'),
          attributes = {type: type};
      if (type == SINGLES) _.extend(attributes, {user_partner_id: null, other_partner_id: null});
      this.model.save(attributes, {wait: true, renderAll: true}).done(function() {
        _.delay(function() {
          this.model.set({editable: true}, {renderAll: true});
        }.bind(this), 100);
      }.bind(this));
    },
    onClickException: function(e) {
      e.preventDefault();
      var exception = $(e.currentTarget).data('exception');
      this.model.save({exception: exception}, {wait: true});
    },
    onClickDelete: function(e) {
      e.preventDefault();
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);

      setTimeout(function() {
        bootbox.confirm(_lang('areYouSure'), function(result) {
          if (!result) {
            this.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
            return;
          }

          this.$el.animate({
            opacity: 0
          }, 750, function() {
            this.model.collection.remove(this.model);
            this.model.destroy();
          }.bind(this));
        }.bind(this));

      }.bind(this), 100);
      
    },
    onClickTime: function(e) {
      e.preventDefault();
      var time = $(e.currentTarget).text();
      this.$('input[name=time]').val(time);
      var value = moment(this.$('input[name=date]').val() + ' ' + time).format('YYYY-MM-DD HH:mm:ss');
      this.model.save({played_on: value}, {wait: true});
    },
    onInputKeydown: function(e) {
      if (e.keyCode == 13) {
        e.exitEditMode = true;
        this.saveInputToModel.apply(this, arguments);
      }
    },
    onReadonlyInputFocus: function(e) {
      $(e.currentTarget).blur();
    },
    saveInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          type = $input.attr('type'),
          value = $input.val(),
          attributes = {},
          options = {wait: true};
      if (type == 'number') {
        value = parseFloat(value, 10);
        if (isNaN(value)) value = null;
      }
      if (attr == 'date') {
        attr = 'played_on';
        value = moment(value + ' ' + this.$('input[name=time]').val()).format('YYYY-MM-DD HH:mm:ss');
      }
      if (attr == 'time') {
        attr = 'played_on';
        value = moment(this.$('input[name=date]').val() + ' ' + value).format('YYYY-MM-DD HH:mm:ss');
      }
      attributes[attr] = value;
      if (e.exitEditMode) {
        attributes.editable = false;
        options.renderAll = true;
        document.activeElement.blur();
      }
      this.model.save(attributes, options);
    },
    focus: function() {
      this.$el.find('input').first().focus();
    },
    render: function(options) {
      options || (options = this.lastRenderOptions);
      var data = this.model.toRender();
      var players = options.players;
      if (!players) {
        players = this.model.collection.playersCollection.toJSON();
        players.unshift({id: null, name: '--'});
      }
      this.lastRenderOptions = _.clone(options);

      data.user = function() {
        if (!data.editable) {
          return '<div title="' + data.user_tooltip + '">' + data.user_title + '</div>';
        }
        var html = this.playerSelectTemplate({
          key: 'user',
          id: data.user_id,
          players: players,
          match: data
        });
        if (data.type == DOUBLES) {
          html += '<br/>';
          html += this.playerSelectTemplate({
            key: 'user_partner',
            id: data.user_partner_id,
            players: players,
            match: data
          });
        }
        return html;
      }.bind(this);

      data.other = function() {
        if (!data.editable) {
          return '<div title="' + data.other_tooltip + '">' + data.other_title + '</div>';
        }
        var html = this.playerSelectTemplate({
          key: 'other',
          id: data.other_id,
          players: players,
          match: data
        });
        if (data.type == DOUBLES) {
          html += '<br/>';
          html += this.playerSelectTemplate({
            key: 'other_partner',
            id: data.other_partner_id,
            players: players,
            match: data
          });
        }
        return html;
      }.bind(this);

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
        .find('input').prop('readonly', !data.editable);

      if (data.editable) {
        var $dateInput = this.$('input[name=date]'),
            $timeInput = this.$('input[name=time]'),
            $timeDropdown = this.$('.dropdown-menu.time');

        $dateInput.datetimepicker({
            format: 'YYYY-MM-DD',
            widgetPositioning: {
              horizontal: 'right',
              vertical: 'bottom'
            }
          })
          .on('dp.change', _.bind(this.saveInputToModel, this))
          .on('focus', function(e) {
            setTimeout(function() {
              if ($dateInput.is(':focus') && !$dateInput.siblings('.dropdown-menu').is(':visible'))
                $dateInput.data('DateTimePicker').hide().show();
            }, 100);
          });

        this.$(".dropdown.more").on("shown.bs.dropdown", function() {
          var el = $(this).find(".dropdown-menu")[0];
          if (el.scrollIntoView) el.scrollIntoView({smooth: true});
        });

        $timeInput
          .on('focus', function(e) {
            setTimeout(function() {
              if ($timeInput.is(':focus') && !$timeInput.siblings('.dropdown-menu').is(':visible'))
                $timeInput.dropdown('toggle');
            }, 100);
            $timeInput.dropdown().show();
          });

        this.$('input:not([name=time])').on('focus', function(e) {
          if ($timeDropdown.is(':visible')) $timeInput.dropdown('toggle');
        });

        this.$('.selectpicker')
          .selectpicker({
            iconBase: 'fa',
            showTick: true,
            tickIcon: "fa-user"
          })
          .on('show.bs.select', this.onShowUserSelectPicker.bind(this));
      }

      this.renderMarker(data);
      return this;
    },
    onShowUserSelectPicker: function(e) {
      var $select = $(e.target),
          key = $select.attr('name');
      console.log('onShowUserSelectPicker', $select, key, this);
    },
    renderMarker: function(data) {
      this.$('.marker').removeClass('exception').prop('title', undefined).empty();
      this.$('.dropdown-menu .exception>i').removeClass('fa-check');

      if (data.winner != null) this.$('.'+data.winner+' .marker').text('✓');

      if (data.exception == INCOMPLETE) {
        this.$('.marker').addClass('exception').text('?').attr('title', 'Match incomplete');
        this.$('.dropdown-menu .incomplete>i').addClass('fa-check');
      }

      if (data.exception == USER_WON_BECAUSE_FORFEIT) {
        this.$('.other .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
        this.$('.dropdown-menu .user-forfeited>i').addClass('fa-check');
      }

      if (data.exception == OTHER_WON_BECAUSE_FORFEIT) {
        this.$('.user .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
        this.$('.dropdown-menu .other-forfeited>i').addClass('fa-check');
      }

      if (!data.exception) {
        this.$('.dropdown-menu .clear-exception>i').addClass('fa-check');
      }

      this.$('.dropdown-menu .type>i').removeClass('fa-check');
      this.$('.dropdown-menu .type[data-type=' + data.type + ']>i').addClass('fa-check');

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.MatchView.prototype.template = _.template($('#match-template').html());
    Backbone.MatchView.prototype.playerSelectTemplate = _.template($('#match-player-select-template').html());
  });

  Backbone.MatchesView = Backbone.View.extend({
    events: {
      'click .add-match': 'onAddMatch',
      'click .match': 'onFocusMatch',
      'focus .match': 'onFocusMatch',
      'changed.bs.select .selects select.selectpicker': 'onCategoryOrRoundSelect'
    },
    initialize: function(options) {
      this.programCollection = options.programCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
      this.listenTo(this.collection, 'add remove', this.render);
      this.onResize = _.debounce(this._onResize.bind(this), 100);
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
      $(window).on('resize.matches', this.onResize);
      $('body').on('click.matches', this.onClickBody.bind(this));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      this.stopEditing();
      $(window).off('resize.matches');
      $('body').off('click.matches');
    },
    onCategoryOrRoundSelect: function(e) {
      var id = $(e.currentTarget).val();
      id = id ? parseInt(id, 10) : null;
      var key = $(e.currentTarget).attr('name');
          attributes = {};
      attributes[key + '_id'] = id;
      this.model.set(attributes, {pushState: true});
    },
    onFocusMatch: function(e) {
      var $el = $(e.currentTarget);
      if ($el.is('.match')) {
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
      if (this.model.get('view') != 'matches' || $el.closest('.bootstrap-select').length) return;
      var modelInEdit = this.getModelInEdit();
      if (modelInEdit && !$el.is('.match') && !$el.closest('.match').is('.match')) {
        modelInEdit.set({editable: false}, {renderAll: true});
      }
    },
    onAddMatch: function(e) {
      var last = this.collection.lastInProgram(this.model.get('program_id')),
          model = new Backbone.MatchModel(_.extend({
            editable: true,
            program_id: this.model.get('program_id'),
            category_id: this.model.get('category_id'),
            round_id: this.model.get('round_id')
          }, last ? last.pick(['type', 'location', 'played_on', 'program_id']) : undefined));
      this.collection.add(model);
      model.bindPlayers();
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
        model.set({editable: true}, {renderAll: true});
      }.bind(view));
    },
    remove: function() {
      $(window).off('resize', this.onResize);
      return Backbone.View.prototype.remove.apply(this, arguments);
    },
    _onResize: function() {
      this.render();
    },
    render: function(options) {
      options || (options = {});

      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];
      this.$el.empty();

      this.renderSelects(options);

      var state = this.model.toJSON();

      var options = {players: this.collection.playersCollection.toJSON()};
      options.players.unshift({id: null, name: '--'});

      this.collection.each(function(model) {
        if (model.get('program_id') != state.program_id ||
            (state.category_id && model.get('category_id') != state.category_id) ||
            (state.round_id && model.get('round_id') != state.round_id)) return true;
        var view = new Backbone.MatchView({
          model: model
        });
        this.$el.append(view.render(options).$el);
        this.views.push(view);
      }.bind(this));

      if (this.views.length == 0) {
        var view = new Backbone.EmptyMatchView();
        this.$el.append(view.render().$el);
        this.views.push(view);
      }

      if (this.categoryCollection.findWhere({program_id: state.program_id}) && this.roundCollection.findWhere({program_id: state.program_id})) {
        this.$add = $('<button class="btn btn-default add-match">' + _lang('addAMatch') + '...</button>');
        this.$el.append(this.$add);
        _.defer(function() {
          if (this.views.length) this.$add.css('width', this.views[0].$el.css('width'));
        }.bind(this));
      } else {
        this.$('.match.empty').text(_lang('cannotCreateMatchWithoutCategorieAndRound'));
      }

      this.$el.append('<div class="spacer">&nbsp;</div>');
      
      return this;
    },
    renderSelects: function(options) {
      var program = this.programCollection.get(this.model.get('program_id'));
      if (!program) return this;

      var data = _.extend(
        program.toJSON(),
        this.model.pick('category_id', 'round_id'), {
          categories: this.categoryCollection.reduce(function(list, model) {
              if (model.get('program_id') == program.id) list.push(model.pick('id', 'name'));
              return list;
            }, []),
          rounds: this.roundCollection.reduce(function(list, model) {
              if (model.get('program_id') == program.id) list.push(model.pick('id', 'name'));
              return list;
            }, [])
        });

      var firstCategory = data.categories[0],
          firstRound = data.rounds[0];
      if (!_.findWhere(data.categories, {id: data.category_id})) data.category_id = firstCategory ? firstCategory.id : null;
      if (!_.findWhere(data.rounds, {id: data.round_id})) data.round_id = firstRound ? firstRound.id : null;

      if (data.category_id != this.model.get('category_id') || data.round_id != this.model.get('round_id')) {
        options.pushState = undefined;
        options.replaceState = true;
        this.model.set({
          category_id: data.category_id,
          round_id: data.round_id
        }, {quiet: true});
      }

      this.$selects = $(this.selectsTemplate(data));
      this.$el.append(this.$selects);

      this.$('.selects select[name=category]')
        .selectpicker({
          iconBase: 'fa',
          showTick: true,
          tickIcon: "fa-check-circle"
        });

      this.$('.selects select[name=round]')
        .selectpicker({
          iconBase: 'fa',
          showTick: true,
          tickIcon: "fa-check-circle"
        });

      _.defer(function() {
        if (this.views.length) this.$selects.css('width', this.views[0].$el.css('width'));
      }.bind(this));

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.MatchesView.prototype.selectsTemplate = _.template($('#matches-selects-template').html());
  });

}.call(this));
