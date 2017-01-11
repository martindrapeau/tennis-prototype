(function() {

  _.extend(Backbone, {
    USER_WON_BECAUSE_BYE: 'user_won_because_bye',
    OTHER_WON_BECAUSE_BYE: 'other_won_because_bye',
    USER_WON_BECAUSE_FORFEIT: 'user_won_because_forfeit',
    OTHER_WON_BECAUSE_FORFEIT: 'other_won_because_forfeit',
    INCOMPLETE: 'incomplete',
    SINGLES: 'singles',
    DOUBLES: 'doubles'
  });

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
      comment: null
    },
    initialize: function(options) {
      this.user = null;
      this.user_partner = null;
      this.other = null;
      this.other_partner = null;
      this.on('change:user_id', _.partial(this.bindPlayer, 'user'));
      this.on('change:user_partner_id', _.partial(this.bindPlayer, 'user_partner'));
      this.on('change:other_id', _.partial(this.bindPlayer, 'other'));
      this.on('change:other_partner_id', _.partial(this.bindPlayer, 'other_partner'));
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

      !data.user || (data.user.title = _.shortName(data.user.name), data.user.initials = _.initials(data.user.name));
      !data.user_partner || (data.user_partner.title = _.shortName(data.user_partner.name), data.user_partner.initials = _.initials(data.user_partner.name));
      data.user_title = _.compact([data.user ? data.user.title : null, data.user_partner ? data.user_partner.title : null]).join('<br/>');
      data.user_title_inline = _.compact([data.user ? data.user.title : null, data.user_partner ? data.user_partner.title : null]).join(' &amp; ');
      data.user_initials_inline = _.compact([data.user ? data.user.initials : null, data.user_partner ? data.user_partner.initials : null]).join(' &amp; ');
      data.user_short_inline = data.user && data.user_partner ? data.user_initials_inline : data.user_title_inline;
      data.user_tooltip = _.compact([data.user ? data.user.name : null, data.user_partner ? data.user_partner.name : null]).join(' &amp; ');

      !data.other || (data.other.title = _.shortName(data.other.name), data.other.initials = _.initials(data.other.name));
      !data.other_partner || (data.other_partner.title = _.shortName(data.other_partner.name), data.other_partner.initials = _.initials(data.other_partner.name));
      data.other_title = _.compact([data.other ? data.other.title : null, data.other_partner ? data.other_partner.title : null]).join('<br/>');
      data.other_title_inline = _.compact([data.other ? data.other.title : null, data.other_partner ? data.other_partner.title : null]).join(' &amp; ');
      data.other_initials_inline = _.compact([data.other ? data.other.initials : null, data.other_partner ? data.other_partner.initials : null]).join(' &amp; ');
      data.other_short_inline = data.other && data.other_partner ? data.other_initials_inline : data.other_title_inline;
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
        if (match['exception'] == Backbone.USER_WON_BECAUSE_FORFEIT)
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
        if (match['exception'] == Backbone.OTHER_WON_BECAUSE_FORFEIT)
          score += (score.length ? ' ' : '') + _lang('forfeit');
      }

      return score;
    },
    // Returns the winner of the match. Either user, other or null.
    getWinner: function() {
      var match = this.toJSON();
      
      // Look at the exceptional cases
      if (match['exception'] == Backbone.INCOMPLETE) return null;
      if (match['exception'] !== null) {
        if (match['exception'] == Backbone.USER_WON_BECAUSE_BYE ||
          match['exception'] == Backbone.USER_WON_BECAUSE_FORFEIT)
          return 'user';
        if (match['exception'] == Backbone.OTHER_WON_BECAUSE_BYE ||
          match['exception'] == Backbone.OTHER_WON_BECAUSE_FORFEIT)
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
      return this.get(key + '_id') == player_id || this.get(key + '_partner_id') == player_id;
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

}.call(this));