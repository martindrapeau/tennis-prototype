(function() {

  Backbone.TopMenuView = Backbone.View.extend({
    initialize: function(options) {
      this.programCollection = options.programCollection;
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      var data = this.model.toJSON(),
          program = this.programCollection.get(data.program_id);
      data.program = program ? program.toJSON() : null;

      this.$el.html(this.template(data));
      this.onRender();
      
      return this;
    },
    onRender: function() {
      return this;
    }
  });
  $('document').ready(function() {
    Backbone.TopMenuView.prototype.template = _.template($('#top-menu-template').html());
  });

}.call(this));