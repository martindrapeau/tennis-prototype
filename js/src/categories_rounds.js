(function() {

  Backbone.CategoryModel = Backbone.Model.extend({
    matchIdAttribute: 'category_id',
    defaults: {
      id: undefined,
      name: null,
      description: '',
      match_ids: []
    },
    initialize: function() {
      this.matches = [];
    },
    bindMatches: function(matches) {
      var attrs = {};
      attrs[this.matchIdAttribute] = this.id;
      this.matches = matches || this.collection.matchesCollection.where(attrs);
      this.set({match_ids: _.pluck(this.matches, ['id'])});
    },
    toRender: function() {
      var data = this.toJSON();
      data.tabindex = this.cid.replace('c', '') * 100;
      data.matchIdAttribute = this.matchIdAttribute;

      data.stats = {
        completed: 0,
        total: this.matches.length
      };

      for (var i = 0; i < this.matches.length; i++) {
        if (this.matches[i].isComplete()) data.stats.completed += 1;
      }

      return data;
    }
  });

  Backbone.CategoryCollection = Backbone.Collection.extend({
    matchIdAttribute: 'category_id',
    model: Backbone.CategoryModel,
    bindMatches: function(matches) {
      this.stopListening();
      this.matchesCollection = matches;

      this.each(function(model) {
        model.bindMatches();
      });

      this.listenTo(matches, 'add', function(match) {
        var model = this.get(match.get(this.matchIdAttribute));
        if (model) model.bindMatches(model.matches.concat([match]));
      });

      this.listenTo(matches, 'remove', function(match) {
        var model = this.get(match.get(this.matchIdAttribute));
        if (model) model.bindMatches(_.filter(model.matches, function(o) {return o.id != match.id;}));
      });

      this.listenTo(matches, 'change', function(match) {
        var id, model;
        if (match.hasChanged(this.matchIdAttribute)) {
          id = match.previous(this.matchIdAttribute);
          model = this.get(id);
          if (model) model.bindMatches(_.filter(model.matches, function(o) {return o.id != match.id;}));
          id = match.get(this.matchIdAttribute);
          model = this.get(id);
          if (model) model.bindMatches(model.matches.concat([match]));
        }
      });

    }
  });

  Backbone.EditCategoryView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form">
        <div class="form-group">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group">
          <input name="description" type="text" placeholder="<%=_lang('description')%>" value="<%=description%>" class="form-control" autocomplete="off" />
        </div>
      </form>
    `),
    title: _lang('category'),
    deleteConfirmMessage: _lang('deleteThisCategory'),
    onValidateBeforeDelete: function() {
      if (this.model.matches.length) return _lang('cannotDeleteWhenMatchesExist');
      return false;
    }
  });

  Backbone.CategoryView = Backbone.View.extend({
    template: _.template(`
      <div class="info">
        <div class="title clearfix">
          <div class="name pull-left"><%=name%></div>
          <div class="description pull-right"><%=description%></div>
        </div>
        <div class="stats"></div>
      </div>
      <div class="buttons">
        <button class="btn btn-default btn-sm goto-matches" data-id="<%=id%>" data-attr="<%=matchIdAttribute%>" title="<%=_lang('matches')%>"><i class="fa fa-fw fa-check-circle"></i></button>
      </div>
    `),
    className: 'tag category',
    events: {
      'click .info': 'onClick'
    },
    editView: Backbone.EditCategoryView,
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.render);
    },
    onClick: function(e) {
      new this.editView({
        model: this.model,
        onSave: this.onSave.bind(this),
        onDelete: this.onDelete.bind(this)
      }).render();
    },
    onSave: function() {
      this.model.save(null, {wait: true});
    },
    onDelete: function() {
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);
      setTimeout(function() {
        this.$el.animate({
          opacity: 0
        }, 750, function() {
          this.model.collection.remove(this.model);
          this.model.destroy();
        }.bind(this));
      }.bind(this), 100);
    },
    render: function() {
      var data = this.model.toRender();

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
        .data('matchIdAttribute', this.model.matchIdAttribute)

      this.$('.stats').text(data.stats.completed + '/' + data.stats.total + ' ' + _lang(data.stats.total == 1 ? 'match' : 'matches').toLowerCase());

      return this;
    }
  });


  Backbone.RoundModel = Backbone.CategoryModel.extend({
    matchIdAttribute: 'round_id',
    defaults: _.extend({
      start: null,
      end: null
    }, Backbone.CategoryModel.prototype.defaults)
  });

  Backbone.RoundCollection = Backbone.CategoryCollection.extend({
    matchIdAttribute: 'round_id',
    model: Backbone.RoundModel,
    getUpcoming: function(program_id) {
      var models = program_id ? this.filter({program_id: program_id}) : this.models;
      if (models.length == 0) return null;
      var ba = this.getListsOfModelsAfterBeforeDate(new Date(), 'start', models);
      if (ba.after.length) return this.get(ba.after[0]);
      if (ba.before.length) return this.get(ba.before[0]);
      return _.last(models);
    }
  });

  Backbone.EditRoundView = Backbone.EditCategoryView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form">
        <div class="form-group">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group date-time clearfix">
          <div class="input-group date start pull-left">
            <input class="form-control" type="text" name="start" value="<%=start%>" placeholder="<%=_lang('start')%>" readonly="readonly" />
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class="input-group date end pull-right">
            <input class="form-control" type="text" name="end" value="<%=end%>" placeholder="<%=_lang('end')%>" readonly="readonly" />
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
        </div>
        <div class="form-group">
          <input name="description" type="text" placeholder="<%=_lang('description')%>" value="<%=description%>" class="form-control" autocomplete="off" />
        </div>
      </form>
    `),
    title: _lang('round'),
    deleteConfirmMessage: _lang('deleteThisRound'),
    onRender: function() {
      this.$('.input-group.date.start').datetimepicker({
        ignoreReadonly: true,
        allowInputToggle: true,
        format: 'YYYY-MM-DD',
        widgetPositioning: {horizontal: 'left', vertical: 'bottom'}
      });
      this.$('.input-group.date.end').datetimepicker({
        ignoreReadonly: true,
        allowInputToggle: true,
        format: 'YYYY-MM-DD',
        widgetPositioning: {horizontal: 'right', vertical: 'bottom'}
      });
      this.delegateEvents();
      return this;
    }
  });

  Backbone.RoundView = Backbone.CategoryView.extend({
    className: 'tag round',
    editView: Backbone.EditRoundView
  });

}.call(this));