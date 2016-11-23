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
    buildScore: function() {
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

      data.score = this.buildScore();

      return data;
    }
  });

  Backbone.MatchCollection = Backbone.Collection.extend({
    model: Backbone.MatchModel
  });


  Backbone.MatchView = Backbone.View.extend({
    template: undefined,
    className: 'match',
    tagName: 'table',
    render: function(options) {
      var data = this.model.toRender();
      data.editable = true;
      data.tabindex = options && options.tabindex ? options.tabindex : 100;

      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .find('input').attr('readonly', !data.editable);

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.MatchView.prototype.template = _.template($('#match-template').html());
  });

  Backbone.MatchesView = Backbone.View.extend({
    className: 'match',
    initialize: function(options) {
      this.onResize = _.bind(_.debounce(this.onResize, 100), this);
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
          tabindex = 100;
      this.collection.each(function(model) {
        var view = new Backbone.MatchView({
          model: model
        });
        self.$el.append(view.render({tabindex: tabindex}).$el);
        self.views.push(view);
        tabindex += 100;
      });
      return this;
    }
  });

}.call(this));