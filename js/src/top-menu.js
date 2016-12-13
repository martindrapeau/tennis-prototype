(function() {

  Backbone.TopMenuView = Backbone.View.extend({
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
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