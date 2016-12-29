(function() {

  Backbone.RankingModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: undefined,
      won: 0,
      lost: 0,
      completed: 0,
      total: 0
    }
  });

  Backbone.RankingCollection = Backbone.Collection.extend({
    model: Backbone.RankingModel,
    comparator: 'won'
  });

  Backbone.RankingView = Backbone.View.extend({
    className: 'player',
    render: function() {
      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
      return this;
    }
  });
  $('document').ready(function() {
    Backbone.RankingView.prototype.template = _.template($('#rankings-player-template').html());
  });

  Backbone.RankingsView = Backbone.View.extend({
    className: 'rankings',
    events: {
      'changed.bs.select .selects select.selectpicker': 'onCategorySelect'
    },
    initialize: function(options) {
      this.playerCollection = options.playerCollection;
      this.matchCollection = options.matchCollection;
      this.programCollection = options.programCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
      this.collection = new Backbone.RankingCollection();
    },
    onCategorySelect: function(e) {
      var id = $(e.currentTarget).val();
      id = id ? parseInt(id, 10) : null;
      this.model.set({category_id: id}, {pushState: true});
    },
    render: function(options) {
      options || (options = {});

      var data = this.model.toJSON(),
          program = this.programCollection.findWhere({id: data.program_id});
      if (!program) return this;

      var category = this.categoryCollection.findWhere({id: data.category_id});
      data.categories = this.categoryCollection.reduce(function(list, model) {
        if (model.get('program_id') == program.id) list.push(model.pick('id', 'name'));
        return list;
      }, []);
      var firstCategory = data.categories[0];
      if (!_.findWhere(data.categories, {id: data.category_id})) data.category_id = firstCategory ? firstCategory.id : null;

      this.$el.html(this.template(data));

      this.$('.selects select[name=category]')
        .selectpicker({
          iconBase: 'fa',
          showTick: true,
          tickIcon: "fa-check-circle"
        });

      if (data.category_id != this.model.get('category_id')) {
        options.pushState = undefined;
        options.replaceState = true;
        this.model.set({
          category_id: data.category_id
        }, {quiet: true});
      }

      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];

      this.$players = this.$('.players');
      this.collection.reset(this.build(data.program_id, data.category_id));

      this.collection.each(function(model) {
        var view = new Backbone.RankingView({model: model});
        this.$players.append(view.render().$el);
        this.views.push(view);
      }.bind(this));

      return this;
    },
    build: function(program_id, category_id) {
      return this.playerCollection.reduce(function(list, player) {

        var json = player.toJSON(),
            ranking = {
              id: json.id,
              name: json.name,
              initials: json.initials,
              title: json.title,
              won: 0,
              lost: 0,
              completed: 0,
              total: 0
            };
        _.each(player.matches, function(match) {
          if (match.get('program_id') != program_id || match.get('category_id') != category_id) return true;
          ranking.total += 1;
          ranking.completed = match.isComplete();
          var won = match.isPlayerWinner(player.id);
          if (won)
            ranking.won += 1
          else if (ranking.completed)
            ranking.lost += 1;
        });
        if (ranking.total > 0) list.push(ranking);
        return list;
      }, []);
    }
  });
  $('document').ready(function() {
    Backbone.RankingsView.prototype.template = _.template($('#rankings-template').html());
  });

}.call(this));