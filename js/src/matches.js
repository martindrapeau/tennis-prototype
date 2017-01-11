(function() {

  Backbone.EmptyMatchView = Backbone.View.extend({
    className: 'match empty',
    render: function() {
      this.$el.html(_lang("noMatches"));
      return this;
    }
  });

  Backbone.MatchView = Backbone.View.extend({
    template: _.template(`
      <thead>
        <tr>
          <th colspan="2"><%=location%></th>
          <th class="date-time dropdown" colspan="4"><%=date%> <%=time%></th>
        </tr>
      </thead>
      <tbody>
        <tr class="user">
          <td class="player"><%=user_title%></td>
          <td class="marker"></td>
          <td class="set"><%=user_set1%></td>
          <td class="set"><%=user_set2%></td>
          <td class="set"><%=user_set3%></td>
          <td class="points">
            <%=user_points%>
            <% if (user_points || other_points) { %><span class="pts">pts</span><% } %>
          </td>
        </tr>
        <tr class="other">
          <td class="player"><%=other_title%></td>
          <td class="marker"></td>
          <td class="set"><%=other_set1%></td>
          <td class="set"><%=other_set2%></td>
          <td class="set"><%=other_set3%></td>
          <td class="points">
            <%=other_points%>
            <% if (user_points || other_points) { %><span class="pts">pts</span><% } %>
          </td>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="6"><%=comment%></th>
        </tr>
      </tfoot>
    `),
    className: 'match',
    tagName: 'table',
    events: {
      'click tbody': 'onClick'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.render);
    },
    onClick: function(e) {
      e.preventDefault();
      e.stopPropagation();
      new Backbone.EditMatchView({
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
    render: function(options) {
      options || (options = this.lastRenderOptions);
      var data = this.model.toRender();

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid);

      this.renderMarker(data);
      return this;
    },
    renderMarker: function(data) {
      this.$('.marker').removeClass('exception').prop('title', undefined).empty();

      if (data.winner != null) this.$('.'+data.winner+' .marker').text('✓');

      switch (data.exception) {
        case Backbone.INCOMPLETE:
          this.$('.marker').addClass('exception').text('?').attr('title', 'Match incomplete');
          break;
        case Backbone.USER_WON_BECAUSE_FORFEIT:
          this.$('.other .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
          break;
        case Backbone.OTHER_WON_BECAUSE_FORFEIT:
          this.$('.user .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
          break;
      }

      return this;
    }
  });

  Backbone.MatchesView = Backbone.View.extend({
    selectsTemplate: _.template(`
      <div class="selects">
        <div class="category-select">
          <select name="category" class="selectpicker" data-width="100%">
            <% for (var i = 0; i < categories.length; i++) { %>
              <% var category = categories[i]; %>
              <option value="<%=category.id%>" <%=category.id == category_id ? "selected" : ""%>><%=category.name%></option>
            <% } %>
          </select>
        </div>
        <div class="round-select">
          <select name="round" class="selectpicker" data-width="100%">
            <% for (var i = 0; i < rounds.length; i++) { %>
              <% var round = rounds[i]; %>
              <option value="<%=round.id%>" <%=round.id == round_id ? "selected" : ""%>><%=round.name%></option>
            <% } %>
          </select>
        </div>
      </div>
    `),
    events: {
      'changed.bs.select .selects select.selectpicker': 'onCategoryOrRoundSelect'
    },
    initialize: function(options) {
      this.programCollection = options.programCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
      this.listenTo(this.collection, 'add remove', this.render);
      this.onResize = _.debounce(this._onResize.bind(this), 100);
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $(window).on('resize.matches', this.onResize);
      $('#top-menu').on('click', '.add-match', this.onAddMatch.bind(this));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      $(window).off('resize.matches');
      $('#top-menu').off('click', '.add-match');
    },
    onCategoryOrRoundSelect: function(e) {
      var id = $(e.currentTarget).val();
      id = id ? parseInt(id, 10) : null;
      var key = $(e.currentTarget).attr('name');
          attributes = {};
      attributes[key + '_id'] = id;
      this.model.set(attributes, {pushState: true});
    },
    onAddMatch: function(e) {
      e.preventDefault();
      var last = this.collection.lastInProgram(this.model.get('program_id')),
          model = new Backbone.MatchModel(_.extend({
            editable: true,
            program_id: this.model.get('program_id'),
            category_id: this.model.get('category_id'),
            round_id: this.model.get('round_id')
          }, last ? last.pick(['type', 'location', 'played_on', 'program_id']) : undefined));
      model.collection = this.collection;

      new Backbone.EditMatchView({
        model: model,
        tab: 'config',
        onSave: function() {
          this.collection.add(model, {sort: false});
          model.bindPlayers();
          var view = _.find(this.views, function(view) {
            if (view.model.cid == model.cid) return true;
          });
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

      if (!this.categoryCollection.findWhere({program_id: state.program_id}) && !this.roundCollection.findWhere({program_id: state.program_id})) {
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

}.call(this));