(function() {

  Backbone.HomeView = Backbone.View.extend({
    className: 'home',
    template: undefined,
    events: {
      'click a.change-account': 'onChangeAccount'
    },
    onChangeAccount: function(e) {
      e.preventDefault();
    },
    render: function() {
      this.$el.html(this.template());
    	return this;
    }
  });

  $('document').ready(function() {
    Backbone.HomeView.prototype.template = _.template($('#home-template').html());
  });

}.call(this));