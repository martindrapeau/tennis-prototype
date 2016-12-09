(function() {

  Backbone.CategoryModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
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
      date: null
    }
  });
  Backbone.RoundCollection = Backbone.Collection.extend({
    model: Backbone.RoundModel
  });

  Backbone.ProgramModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
      categories: [],
      rounds: []
    }
  });
  Backbone.ProgramCollection = Backbone.Collection.extend({
    model: Backbone.ProgramModel
  });

  


}.call(this));