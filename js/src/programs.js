(function() {

  var dataStore = new BackboneLocalStorage('programs');

  Backbone.CategoryModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
      description: '',
      player_ids: []
    }
  });
  Backbone.CategoryCollection = Backbone.Collection.extend({
    model: Backbone.CategoryModel
  });

  Backbone.RoundModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
      description: '',
      date: null
    }
  });
  Backbone.RoundCollection = Backbone.Collection.extend({
    model: Backbone.RoundModel
  });

  Backbone.ProgramModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: null,
      description: '',
      categories: [],
      rounds: []
    }
  });
  Backbone.ProgramCollection = Backbone.Collection.extend({
    sync: dataStore.sync,
    model: Backbone.ProgramModel
  });

  Backbone.ProgramView = Backbone.View.extend({
    className: 'program',
    tagName: 'table',
    initialize: function(options) {
      this.stateModel = options.stateModel;
    },
    render: function() {
      this.model = this.collection.get(this.stateModel.get('program_id'));
      if (!this.model) return this;

      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', data.id);
      return this;
    }
  });
  $('document').ready(function() {
    Backbone.ProgramView.prototype.template = _.template($('#program-template').html());
  });


}.call(this));