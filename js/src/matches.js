(function() {

  var USER_WON_BECAUSE_BYE = 'user_won_because_bye',
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
    idAttribute: 'Id',
    toRender: function() {
      var data = this.toJSON();

      var when = moment(data.played_on);
      data.date = when ? when.format('YYYY-MM-DD') : '';
      data.time = when ? when.format('HH:mm') : '';

      !data.user || (data.user.title = _.shortName(data.user.name));
      !data.user_partner || (data.user_partner.title = _.shortName(data.user_partner.name));
      data.user_title = _.compact([data.user ? data.user.title : null, data.user_partner ? data.user_partner.title : null]).join('<br/>');
      data.user_tooltip = _.compact([data.user ? data.user.name : null, data.user_partner ? data.user_partner.name : null]).join(' &amp; ');

      !data.other || (data.other.title = _.shortName(data.other.name));
      !data.other_partner || (data.other_partner.title = _.shortName(data.other_partner.name));
      data.other_title = _.compact([data.other ? data.other.title : null, data.other_partner ? data.other_partner.title : null]).join('<br/>');
      data.other_tooltip = _.compact([data.other ? data.other.name : null, data.other_partner ? data.other_partner.name : null]).join(' &amp; ');

      data.score = this.getScore();

      var winners = this.getWinners();

      return data;
    },
    getScore: function() {
      var score = '',
          match = this.toJSON();

      if (!match.winner_id) return score;

      if (match['winner_id'] == match['user_id']) {
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
          score += (score.length ? ' ' : '') + 'default';
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
          score += (score.length ? ' ' : '') + 'default';
      }

      return score;
    },
    // Returns the user ids of the winner(s) of a match. Returns an
    // empty array if the match was not played.
    // Argument match can be a match record, or a match id.
    getWinners: function() {
      var match = this.toJSON(),
          user_ids = _.pick(match, 'user_id', 'user_partner_id'),
          other_ids = _.pick(match, 'other_id', 'other_partner_id');
      
      // Look at the exceptional cases
      if (match['exception'] == INCOMPLETE) return {};
      if (match['exception'] !== null) {
        if (match['exception'] == USER_WON_BECAUSE_BYE ||
          match['exception'] == USER_WON_BECAUSE_FORFEIT)
          return user_ids;
        if (match['exception'] == OTHER_WON_BECAUSE_BYE ||
          match['exception'] == OTHER_WON_BECAUSE_FORFEIT)
          return other_ids;
      }
      
      // Look at sets
      var user_sets_won = 0,
          other_sets_won = 0;
      for (var set = 1; set <= 5; set++) {
        winner_keys = _.keys(this.getWinnersOfSet(set));
        if (_.indexOf(winner_keys, match.user_id)) user_sets_won += 1;
        if (_.indexOf(winner_keys, match.other_id)) other_sets_won += 1;
      }
      if (user_sets_won > other_sets_won) return user_ids;
      if (other_sets_won > user_sets_won) return other_ids;
      
      // Look at points
      if (!match['user_points'] && !match['other_points']) return [];
      if (!match['user_points'] || match['other_points'] > match['user_points']) return other_ids;
      if (!match['other_points'] || match['user_points'] > match['other_points']) return user_ids;
      
      return {};
    },
    // Returns the stats on sets played and won.
    // Argument match can be a match record, or a match id.
    getSetStats: function() {
      var match = this.toJSON(),
          sets_played = 0,
          user_sets_won = 0,
          other_sets_won = 0;
      for (var set = 1; set <= 5; set++) {
        winner_keys = _.keys(this.getWinnersOfSet(set));
        if (_.indexOf(winner_keys, match.user_id)) user_sets_won += 1;
        if (_.indexOf(winner_keys, match.other_id)) other_sets_won += 1;
      }
      return {
        sets_played: sets_played,
        user_sets_won: user_sets_won,
        other_sets_won: other_sets_won
      };
    },
    // Returns a hash of the winners of a set. Returns an empty object if there is no winner.
    getWinnersOfSet: function(set) {
      if (set != 1 && set != 2 && set != 3 && set != 4 && set != 5) return {};
      var match = this.toJSON(),
          user_ids = _.pick(match, 'user_id', 'user_partner_id'),
          other_ids = _.pick(match, 'other_id', 'other_partner_id');
      
      if (!match['user_set'+set] && !match['other_set'+set]) return {};
      if (!match['user_set'+set]) return other_ids;
      if (!match['other_set'+set]) return user_ids;
      if (match['user_set'+set] > match['other_set'+set]) return user_ids;
      if (match['user_set'+set] < match['other_set'+set]) return other_ids;
      return {};
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
      'blur input': 'saveInputToModel',
      'focus input[readonly]': 'onReadonlyInputFocus'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change:winner_id', this.renderMarker);
    },
    render: function(options) {
      var data = this.model.toRender();
      data.editable = options && options.editMatches;
      data.tabindex = options && options.tabindex ? options.tabindex : 100;

      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .find('input').attr('readonly', !data.editable);

      this.renderMarker();
      return this;
    },
    renderMarker: function() {

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
          isNumber = $input.hasClass('set') || $input.hasClass('points'),
          value = isNumber ? parseInt($input.val(), 10) : $input.val();
      this.model.set(attr, value);
    }
  });
  $('document').ready(function() {
    Backbone.MatchView.prototype.template = _.template($('#match-template').html());
  });

  Backbone.MatchesView = Backbone.View.extend({
    className: 'match',
    initialize: function(options) {
      this.onResize = _.bind(_.debounce(this.onResize, 100), this);
      this.listenTo(this.model, 'change:editMatches', this.render);
      $(window).on('resize', this.onResize);
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
        var view = new Backbone.MatchView({
          model: model
        });
        self.$el.append(view.render(options).$el);
        self.views.push(view);
        options.tabindex += 100;
      });
      return this;
    }
  });

}.call(this));