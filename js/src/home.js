(function() {

  Backbone.HomeView = Backbone.View.extend({
    className: 'home',
    template: undefined,
    events: {
      'click a.change-account': 'onChangeAccount',
      'click .clear': 'onClickClear'
    },
    onChangeAccount: function(e) {
      e.preventDefault();
    },
    onClickClear: function(e) {
      localStorage.clear();
      window.location.reload();
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