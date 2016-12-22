(function() {

  var dataStore = new BackboneLocalStorage('programs');

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
      this.matchCollection = options.matchCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
    },
    render: function() {
      this.model = this.collection.get(this.stateModel.get('program_id'));
      if (!this.model) return this;

      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];

      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', data.id);

      this.$categories = this.$('tbody .categories');
      this.categoryCollection.each(function(model) {
        if (model.get('program_id') != data.id) return true;
        var view = new Backbone.CategoryView({
          model: model
        });
        this.$categories.append(view.render().$el);
        this.views.push(view);
      }.bind(this));
      this.$categories.append('<button class="tag category add btn btn-default">' + _lang('add') + '</button>');

      this.$rounds = this.$('tbody .rounds');
      this.roundCollection.each(function(model) {
        if (model.get('program_id') != data.id) return true;
        var view = new Backbone.RoundView({
          model: model
        });
        this.$rounds.append(view.render().$el);
        this.views.push(view);
      }.bind(this));
      this.$rounds.append('<button class="tag round add btn btn-default">' + _lang('add') + '</button>');

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.ProgramView.prototype.template = _.template($('#program-template').html());
  });


}.call(this));