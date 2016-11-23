$(document).ready(function() {

  Backbone.TennisApp = Backbone.View.extend({
    initialize: function(options) {

      this.views = {
        home: new Backbone.HomeView({
          el: $('#home')
        }),
        matches: new Backbone.MatchesView({
          el: $('#matches'),
          collection: new Backbone.MatchCollection(window._matches)
        }),
        events: new Backbone.EventsView({
          el: $('#events'),
          collection: new Backbone.EventCollection(window._events)
        })
      };

    },
    events: {
      'click a': 'onClick'
    },
    onClick: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget),
          name = $a.attr('href').replace('#', '');
      this.show(name);
      this.$el.offcanvas('hide');
      return false;
    },
    render: function() {
      _.each(this.views, function(view) {
        view.render();
      });
      this.hideAll();
      this.show();
      return this;
    },
    show: function(name) {
      var parts = window.location.href.split('#'),
          url = parts[0],
          hash = parts[1] || '';
      name = name == undefined ? hash : name;

      this.hideAll();
      this.views[name || 'home'].$el.show();

      var route = !name || name == 'home' ? '' : name;
      history.pushState({name:name}, '', url + (route ? '#' : '') + route);

      this.updateLinks();
    },
    hide: function(name) {
      this.views[name || 'home'].$el.show();
    },
    hideAll: function() {
      _.each(this.views, function(view) {
        view.$el.hide();
      });
    },
    updateLinks: function() {
      var hash = window.location.hash || '#';
      this.$el.find('a').each(function() {
        if ($(this).attr('href') == hash)
          $(this).closest('li').addClass('active');
        else
          $(this).closest('li').removeClass('active');
      });
    }
  });

  window.app = new Backbone.TennisApp({
    el: $('#side-menu')
  }).render();


});