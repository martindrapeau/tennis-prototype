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
    comparator: function(m1, m2) {
      if (m1.attributes.won == m2.attributes.won) {
        if (m1.attributes.total == m2.attributes.total) return 0;
        return m1.attributes.total < m2.attributes.total ? 1 : -1;
      }
      return m1.attributes.won < m2.attributes.won ? 1 : -1;
    }
  });

  Backbone.RankingView = Backbone.View.extend({
    template: _.template(`
      <td class="rank"><%=rank%></td>
      <td class="player">
        <div class="player-wrapper">
          <div class="picture">
            <div class="wrapper">
              <div class="initials"><%=initials%></div>
            </div>
          </div>
          <div class="info">
            <div class="name"><%=title%></div>
          </div>
        </div>
      </td>
      <td class="wins"><%=won%></td>
      <td class="played"><%=completed%></td>
    `),
    tagName: 'tr',
    render: function() {
      var data = this.model.toJSON();
      data.rank = this.model.collection.indexOf(this.model) + 1;
      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
      return this;
    }
  });

  Backbone.RankingsView = Backbone.View.extend({
    template: _.template(`
      <h4><%=_lang('rankingsPerCategory')%></h4>
      <div class="selects">
        <div class="category-select">
          <select name="category" class="selectpicker">
            <% for (var i = 0; i < categories.length; i++) { %>
              <% var category = categories[i]; %>
              <option value="<%=category.id%>" <%=category.id == category_id ? "selected" : ""%>><%=category.name%></option>
            <% } %>
          </select>
        </div>
      </div>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th></th>
            <th><%=_lang('player')%></th>
            <th><%=_lang('wins')%></th>
            <th><%=_lang('played')%></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `),
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

      this.$players = this.$('table');
      this.collection.reset(this.build(data.program_id, data.category_id));

      var $tbody = this.$players.find('tbody');
      this.collection.each(function(model) {
        var view = new Backbone.RankingView({model: model});
        $tbody.append(view.render().$el);
        this.views.push(view);
      }.bind(this));

      return this;
    },
    build: function(program_id, category_id) {
      return this.playerCollection.reduce(function(list, player) {

        var json = player.toRender(),
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
          ranking.completed += match.isComplete() ? 1 : 0;
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

}.call(this));