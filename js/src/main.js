$(document).ready(function() {

  Backbone.TennisAppState = Backbone.Model.extend({
    defaults: {
      view: undefined,
      editMatches: false,
      editPlayers: false,
      programs: _.map(window._programs, function(o) {
        return {
          id: o.id,
          name: o.name
        };
      }),
      program_id: window._programs[0].id,
      program: {
        id: window._programs[0].id,
        name: window._programs[0].name
      }
    }
  });

  Backbone.TennisApp = Backbone.View.extend({
    sideMenuTemplate: _.template($('#side-menu-template').html()),
    initialize: function(options) {

      this.topMenuView = new Backbone.TopMenuView({
        el: $('#top-menu'),
        model: this.model
      });

      this.players = new Backbone.PlayerCollection(window._players);
      this.matches = new Backbone.MatchCollection(window._matches);
      this.programs = new Backbone.ProgramCollection(window._programs);
      this.matches.bindPlayers(this.players);
      this.players.bindMatches(this.matches);

      this.views = {
        home: new Backbone.HomeView({
          el: $('#home'),
          model: this.model
        }),
        program: new Backbone.ProgramView({
          el: $('#program'),
          model: this.programs.first(),
          collection: this.programs,
          stateModel: this.model
        }),
        players: new Backbone.PlayersView({
          el: $('#players'),
          model: this.model,
          collection: this.players
        }),
        matches: new Backbone.MatchesView({
          el: $('#matches'),
          model: this.model,
          collection: this.matches
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
    getHash: function() {
      var parts = window.location.href.split('#'),
          url = parts[0],
          hash = parts[1] || '',
          firstAmp = hash.indexOf('&'),
          name = hash ? hash.substr(0, firstAmp == -1 ? hash.length : firstAmp) : '',
          state = firstAmp >= 0 ? $.deparam(hash.substr(firstAmp+1), true) : {};
      return {
        url: url,
        name: name,
        state: state
      };
    },
    show: function(name, state) {
      var hash = this.getHash();
      if (name === undefined) {
        name = hash.name;
        state = hash.state;
      }

      this.hideAll();
      var viewName = name || 'home',
          view = this.views[viewName];
      var program = null;
      if (state && state.program_id) program = this.programs.get(state.program_id);
      this.model.set(_.extend({view: viewName, program_id: program ? program.id : null, program: program ? program.pick('id', 'name') : null}, state));

      view.render();
      view.$el.show();
      this.topMenuView.render();

      var route = !name || name == 'home' ? '' : name;
      if (!_.isEmpty(state)) route += '&' + $.param(state);
      history.pushState({name:name}, '', hash.url + (route ? '#' : '') + route);

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
      var hash = this.getHash();
      this.$el.find('a').each(function() {
        var $a = $(this),
            name = $a.attr('href').replace('#', ''),
            state = $a.data('state') || {};
        if (name == hash.name && _.isEqual(state, hash.state))
          $a.closest('li').addClass('active');
        else
          $a.closest('li').removeClass('active');
      });
    }
  });

  window.app = new Backbone.TennisApp({
    model: new Backbone.TennisAppState(),
    el: $('#side-menu')
  }).render();

});