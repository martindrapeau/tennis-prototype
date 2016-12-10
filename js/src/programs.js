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

  Backbone.ProgramView = Backbone.View.extend({
    className: 'program',
    initialize: function(options) {
      this.stateModel = options.stateModel;
      this.listenTo(this.stateModel, 'change:program_id', this.onChangeProgram);
    },
    onChangeProgram: function() {
      this.model = this.collection.get(this.stateModel.get('program_id'));
      if (this.model) this.render();
    },
    render: function() {
      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', data.id)
      return this;
    }
  });
  $('document').ready(function() {
    Backbone.ProgramView.prototype.template = _.template($('#program-template').html());
  });


}.call(this));