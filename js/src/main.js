$(document).ready(function() {

  Backbone.TennisAppState = Backbone.Model.extend({
    defaults: {
      editMatches: false,
      editPlayers: false
    }
  });

  Backbone.TennisApp = Backbone.View.extend({
    initialize: function(options) {

      this.topMenu = new Backbone.TopMenuView({
        el: $('#top-menu'),
        model: this.model
      });

      var players = new Backbone.PlayerCollection(window._players),
          matches = new Backbone.MatchCollection(window._matches, {
            playersCollection: players
          });

      this.views = {
        home: new Backbone.HomeView({
          el: $('#home'),
          model: this.model
        }),
        players: new Backbone.PlayersView({
          el: $('#players'),
          model: this.model,
          collection: players
        }),
        matches: new Backbone.MatchesView({
          el: $('#matches'),
          model: this.model,
          collection: matches
        }),
        events: new Backbone.EventsView({
          el: $('#events'),
          model: this.model,
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
      var viewName = name || 'home',
          view = this.views[viewName];
      this.model.set({view: viewName});

      view.$el.show();
      this.topMenu.render();

      var route = !name || name == 'home' ? '' : name;
      history.pushState({name:name}, '', url + (route ? '#' : '') + route);

      this.updateLinks();
    },
    hide: function(name) {
      var view = this.views[name || 'home'];
      view.$el.show();
      this.topMenu.render();
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
    model: new Backbone.TennisAppState(),
    el: $('#side-menu')
  }).render();

});