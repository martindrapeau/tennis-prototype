(function() {

  var dataStoreCategories = new BackboneLocalStorage('categories');

  Backbone.CategoryModel = Backbone.Model.extend({
    matchIdAttribute: 'category_id',
    sync: dataStoreCategories.sync,
    defaults: {
      id: undefined,
      name: null,
      description: '',
      match_ids: []
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
        _.each(match.getmodelIds(), function(id) {
          var model = this.get(id);
          if (model) model.bindMatches([match]);
        }.bind(this));
      });

      this.listenTo(matches, 'remove', function(match) {
        _.each(match.getmodelIds(), function(id) {
          var model = this.get(id);
          if (model) model.bindMatches(_.filter(model.matches, function(o) {return o.id != match.id;}));
        }.bind(this));
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
    className: 'tag category btn btn-default',
    initialize: function(options) {

    },
    render: function() {
      var data = this.model.toRender();

      this.$el
        .html(this.template(data))
        .data('id', this.model.id)
        .data('cid', this.model.cid)
        .find('input').prop('readonly', !data.editable);

      return this;
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
    className: 'tag round btn btn-default'
  });

}.call(this));