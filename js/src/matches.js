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

  Backbone.MatchModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      type: "singles",
      created_on: null,
      played_on: null,
      user_id: null,
      user_partner_id: null,
      other_id: null,
      other_partner_id: null,
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
      user: null,
      user_partner: null,
      other: null,
      other_partner: null,
      location: null,
      comment: null
    },
    toRender: function() {
      var data = this.toJSON();

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
          score += (score.length ? ' ' : '') + 'forfeit';
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
          score += (score.length ? ' ' : '') + 'forfeit';
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
    }
  });

  Backbone.MatchCollection = Backbone.Collection.extend({
    model: Backbone.MatchModel
  });


  Backbone.MatchView = Backbone.View.extend({
    template: undefined,
    className: 'match',
    tagName: 'table',
    events: {
      'keydown input': 'onInputKeydown',
      'blur input:not([name=date])': 'saveInputToModel',
      'focus input[readonly]:not(.editing)': 'onReadonlyInputFocus',
      'click .dropdown-menu a.exception': 'onClickException',
      'click .dropdown-menu a.delete': 'onClickDelete',
      'click .dropdown-menu.time a': 'onClickTime'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.onMatchChange);
    },
    onMatchChange: function() {
      this.renderMarker(this.model.toRender());
    },
    onClickException: function(e) {
      e.preventDefault();
      var exception = $(e.currentTarget).data('exception');
      this.model.set('exception', exception);
    },
    onClickDelete: function(e) {
      e.preventDefault();
      var view = this;
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);
      setTimeout(function() {
        if (!confirm('Are you sure?')) {
          view.$el.animate({backgroundColor: 'transparent'}, 100);
          return;
        }
        view.$el.animate({
          opacity: 0
        }, 750, function() {
          view.model.collection.remove(view.model);
        });
      }, 100);
    },
    onClickTime: function(e) {
      e.preventDefault();
      var time = $(e.currentTarget).text();
      this.$('input[name=time]').val(time);
      var value = moment(this.$('input[name=date]').val() + ' ' + time).format('YYYY-MM-DD HH:mm:ss');
      this.model.set('played_on', value);
    },
    onInputKeydown: function(e) {
      if (e.keyCode == 13) this.saveInputToModel.apply(this, arguments);
    },
    onReadonlyInputFocus: function(e) {
      $(e.currentTarget).blur();
    },
    saveInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          type = $input.attr('type'),
          value = $input.val();
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
      this.model.set(attr, value);
    },
    render: function(options) {
      var data = this.model.toRender();
      data.editable = options && options.editMatches;
      data.tabindex = options && options.tabindex ? options.tabindex : 100;

      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .find('input').prop('readonly', !data.editable);

      if (data.editable) {
        var $dateInput = this.$('input[name=date]')
        $dateInput.datetimepicker({
            format: 'YYYY-MM-DD',
            widgetPositioning: {
              horizontal: 'right',
              vertical: 'auto'
            }
          })
          .on('dp.change', _.bind(this.saveInputToModel, this))
          .on('focus', function(e) {
            setTimeout(function() {
              if ($dateInput.is(':focus') && !$dateInput.siblings('.dropdown-menu').is(':visible'))
                $dateInput.data('DateTimePicker').hide().show();
            }, 100);
          })
          .on("dp.show", function() {
            var el = $dateInput.siblings(".dropdown-menu")[0];
            if (el.scrollIntoView) el.scrollIntoView({smooth: true});
          });

        this.$(".dropdown.more").on("shown.bs.dropdown", function() {
          var el = $(this).find(".dropdown-menu")[0];
          if (el.scrollIntoView) el.scrollIntoView({smooth: true});
        });

        var $timeInput = this.$('input[name=time]')
        $timeInput
          .on('focus', function(e) {
            setTimeout(function() {
              if ($timeInput.is(':focus') && !$timeInput.siblings('.dropdown-menu').is(':visible'))
                $timeInput.dropdown('toggle');
            }, 100);
            $timeInput.dropdown().show();
          })
          .on('blur', function(e) {
            $timeInput.dropdown('toggle');
          })
          .on("shown.bs.dropdown", function() {
            var el = $dateInput.siblings(".dropdown-menu")[0];
            if (el.scrollIntoView) el.scrollIntoView({smooth: true});
          });
      }

      this.renderMarker(data);
      return this;
    },
    renderMarker: function(data) {
      this.$('.marker').removeClass('exception').prop('title', undefined).empty();
      this.$('.dropdown-menu .exception').removeClass('strong');

      if (data.winner != null) this.$('.'+data.winner+' .marker').text('✓');

      if (data.exception == INCOMPLETE) {
        this.$('.marker').addClass('exception').text('?').attr('title', 'Match incomplete');
        this.$('.dropdown-menu .incomplete').addClass('strong');
      }

      if (data.exception == USER_WON_BECAUSE_FORFEIT) {
        this.$('.other .marker').addClass('exception').text('forfeit');
        this.$('.dropdown-menu .user-forfeited').addClass('strong');
      }

      if (data.exception == OTHER_WON_BECAUSE_FORFEIT) {
        this.$('.user .marker').addClass('exception').text('forfeit');
        this.$('.dropdown-menu .other-forfeited').addClass('strong');
      }
    }
  });
  $('document').ready(function() {
    Backbone.MatchView.prototype.template = _.template($('#match-template').html());
  });

  Backbone.MatchesView = Backbone.View.extend({
    className: 'match',
    events: {
      'click .add-match': 'onAddMatch'
    },
    initialize: function(options) {
      this.onResize = _.bind(_.debounce(this.onResize, 100), this);
      this.listenTo(this.model, 'change:editMatches', this.render);
      this.listenTo(this.collection, 'add remove', this.render);
      $(window).on('resize', this.onResize);
    },
    onAddMatch: function(e) {
      var lastMatch = this.collection.last(),
          newMatch = new Backbone.MatchModel(lastMatch ? lastMatch.pick(['location', 'played_on']) : undefined);
      this.collection.add(newMatch);
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
      console.log('MatchesView.render');
      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];
      this.$el.empty();

      var self = this,
          options = _.extend(this.model.toJSON(), {tabindex: 100});
      this.collection.each(function(model) {
        var view = new Backbone.MatchView({
          model: model
        });
        self.$el.append(view.render(options).$el);
        self.views.push(view);
        options.tabindex += 100;
      });

      if (options.editMatches) {
        var $add = $('<button class="btn btn-default add-match">Add a match...</button>');
        this.$el.append($add);
        if (self.views.length) $add.css('width', self.views[0].$el.css('width'));
      }
      
      return this;
    }
  });

}.call(this));
