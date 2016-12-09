$(document).ready(function() {

  Backbone.TennisAppState = Backbone.Model.extend({
    defaults: {
      editMatches: false,
      editPlayers: false,
      programs: _.map(window._programs, function(o) {
        return {
          id: o.id,
          name: o.name
        };
      }),
      program: window._programs[0]
    }
  });

  Backbone.TennisApp = Backbone.View.extend({
    sideMenuTemplate: _.template($('#side-menu-template').html()),
    initialize: function(options) {

      this.topMenuView = new Backbone.TopMenuView({
        el: $('#top-menu'),
        model: this.model
      });

      var players = new Backbone.PlayerCollection(window._players),
          matches = new Backbone.MatchCollection(window._matches),
          programs = new Backbone.ProgramCollection(window._programs);
      matches.bindPlayers(players);
      players.bindMatches(matches);

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
        })
      };

    },
    events: {
      'click a': 'onClick'
    },
    onClick: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget),
          name = $a.attr('href').replace('#', ''),
          state = $a.data('state');
      this.show(name, state);
      this.$el.offcanvas('hide');
      return false;
    },
    render: function() {
      this.$el.html(this.sideMenuTemplate(this.model.toJSON()));
      _.each(this.views, function(view) {
        view.render();
      });
      this.hideAll();
      this.show();
      return this;
    },
    show: function(name, state) {
      var parts = window.location.href.split('#'),
          url = parts[0],
          hash = parts[1] || '',
          firstAmp = hash.indexOf('&'),
          hashName = hash ? hash.substr(0, firstAmp == -1 ? hash.length : firstAmp) : '',
          hashState = firstAmp >= 0 ? $.deparam(hash.substr(firstAmp+1)) : {};

      if (name === undefined) {
        name = hashName;
        state = hashState;
      }

      this.hideAll();
      var viewName = name || 'home',
          view = this.views[viewName];
      this.model.set(_.extend({view: viewName}, state));

      view.$el.show();
      this.topMenuView.render();

      var route = !name || name == 'home' ? '' : name;
      if (state) route += '&' + $.param(state);
      history.pushState({name:name}, '', url + (route ? '#' : '') + route);

      this.updateLinks();
    },
    hide: function(name) {
      var view = this.views[name || 'home'];
      view.$el.show();
      this.topMenuView.render();
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