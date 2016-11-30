(function() {

  Backbone.TopMenuView = Backbone.View.extend({
    events: {
      'click button.edit-matches': 'onEditMatches',
      'click button.edit-players': 'onEditPlayers'
    },
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
    },
    onEditMatches: function() {
      this.model.set({
        editMatches: !this.model.get('editMatches')
      });
    },
    onEditPlayers: function() {
      this.model.set({
        editPlayers: !this.model.get('editPlayers')
      });
    }
  });
  $('document').ready(function() {
    Backbone.TopMenuView.prototype.template = _.template($('#top-menu-template').html());
  });

}.call(this));