(function() {

  var dataStoreCategories = new BackboneLocalStorage('categories');

  Backbone.CategoryModel = Backbone.Model.extend({
    matchIdAttribute: 'category_id',
    sync: dataStoreCategories.sync,
    defaults: {
      id: undefined,
      name: null,
      description: '',
      match_ids: [],
      editable: false
    },
    initialize: function() {
      this.matches = [];
      this.set({editable: false}, {silent: true});
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
    sync: dataStoreCategories.sync,
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

  Backbone.CategoryView = Backbone.View.extend({
    className: 'tag category',
    events: {
      'keydown input': 'onInputKeydown',
      'blur input': 'saveInputToModel',
      'click button.delete': 'onClickDelete'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.onChange);
    },
    onChange: function(model, options) {
      var data = this.model.toRender();
      if (options && options.renderAll) {
        this.render();
      } else {
        this.renderStats(data);
      }
    },
    focus: function() {
      this.$el.find('input').first().focus();
    },
    render: function() {
      var data = this.model.toRender();

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
        .data('matchIdAttribute', this.model.matchIdAttribute)
        .find('input').prop('readonly', !data.editable);

      this.renderStats(data);

      return this;
    },
    renderStats: function(data) {
      this.$('.stats').text(data.stats.completed + '/' + data.stats.total + ' ' + _lang(data.stats.total == 1 ? 'match' : 'matches').toLowerCase());
      return this;
    },
    onClickDelete: function(e) {
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);

      setTimeout(function() {
        if (this.model.get('match_ids').length) {
          bootbox.alert(_lang('cannotDeleteWhenMatchesExist'), function() {
            this.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
          }.bind(this));
          return;
        }

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
    onInputKeydown: function(e) {
      if (e.keyCode == 13) {
        e.exitEditMode = true;
        this.saveInputToModel.apply(this, arguments);
      }
    },
    saveInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          value = $input.val(),
          attributes = {},
          options = {wait: true};
      attributes[attr] = value;
      if (e.exitEditMode) {
        attributes.editable = false;
        options.renderAll = true;
        document.activeElement.blur();
      }
      this.model.save(attributes, options);
    }
  });
  $('document').ready(function() {
    Backbone.CategoryView.prototype.template = _.template($('#tag-template').html());
  });


  var dataStoreRounds = new BackboneLocalStorage('rounds');

  Backbone.RoundModel = Backbone.CategoryModel.extend({
    matchIdAttribute: 'round_id',
    sync: dataStoreRounds.sync,
    defaults: _.extend({date: null}, Backbone.CategoryModel.prototype.defaults)
  });

  Backbone.RoundCollection = Backbone.CategoryCollection.extend({
    matchIdAttribute: 'round_id',
    model: Backbone.RoundModel,
    sync: dataStoreRounds.sync
  });

  Backbone.RoundView = Backbone.CategoryView.extend({
    className: 'tag round'
  });

}.call(this));