$(document).ready(function() {

  Backbone.TennisAppState = Backbone.Model.extend({
    defaults: {
      view: undefined,
      program_id: null
    }
  });

  _.extend(Backbone.View.prototype, {
    show: function() {
      this.delegateEvents();
      this.render();
      this.$el.show();
    },
    hide: function() {
      this.$el.hide();
      this.undelegateEvents();
    }
  });

  Backbone.TennisApp = Backbone.View.extend({
    sideMenuTemplate: _.template($('#side-menu-template').html()),
    initialize: function(options) {

      this.topMenuView = new Backbone.TopMenuView({
        el: $('#top-menu'),
        model: this.model
      });

      this.players = new Backbone.PlayerCollection();
      this.matches = new Backbone.MatchCollection();
      this.programs = new Backbone.ProgramCollection();

      var p1 = this.players.fetch(),
          p2 = this.matches.fetch(),
          p3 = this.programs.fetch();

      // DEV: The first time, bootstrap in fictional data from data.js.
      var loadCollectionDataIfEmpty = function (name, promise, data) {
        promise.always(function() {
          if (this[name].size()) return;
          console.log(name + ' dataStore is empty. Setting up default data.');
          this[name].reset(data);
          this[name].each(function(model) {model.save();});
        }.bind(this));
      }.bind(this);
      loadCollectionDataIfEmpty('players', p1, window._players);
      loadCollectionDataIfEmpty('matches', p2, window._matches);
      loadCollectionDataIfEmpty('programs', p3, window._programs);

      $.when(p1, p2, p3).done(function() {
        this.matches.bindPlayers(this.players);
        this.players.bindMatches(this.matches);

        this.views = {
          home: new Backbone.HomeView({
            el: $('#home'),
            model: this.model
          }),
          program: new Backbone.ProgramView({
            el: $('#program'),
            model: undefined,
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

        this.render();

      }.bind(this));

    },
    events: {
      'click a': 'onClick',
      'show.bs.offcanvas': 'onShowMenu',
      'hide.bs.offcanvas': 'onHideMenu'
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
    onShowMenu: function(e) {
      $('html').css({overflow:'hidden'});
      var hash = this.getHash();
      if (!hash || !hash.name) return;
      var view = this.views[hash.name || 'home'];
      view.undelegateEvents();
      this.viewNeedsDelegateEvents = view;
    },
    onHideMenu: function(e) {
      $('html').css({overflow:''});
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.delegateEvents();
      this.viewNeedsDelegateEvents = undefined;
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
      this.viewNeedsDelegateEvents = undefined;
      var hash = this.getHash();
      if (name === undefined) {
        name = hash.name;
        state = hash.state;
      }

      this.hide();
      var viewName = name || 'home',
          view = this.views[viewName];
      this.model.set(_.extend({view: viewName, program_id: null}, state));

      view.show();
      this.topMenuView.render();

      var route = !name || name == 'home' ? '' : name;
      if (!_.isEmpty(state)) route += '&' + $.param(state);
      history.pushState({name:name}, '', hash.url + (route ? '#' : '') + route);

      this.updateLinks();
    },
    hide: function(name) {
      var hash = this.getHash();
      if (name === undefined) {
        name = hash.name;
        state = hash.state;
      }
      var viewName = name || 'home',
          view = this.views[viewName];
      view.hide();
      this.topMenuView.render();
    },
    render: function() {
      var data = _.extend(this.model.toJSON(), {
        programs: this.programs.map(function(model) {return model.pick('id', 'name')})
      });
      this.$el.html(this.sideMenuTemplate(data));
      _.each(this.views, function(view) {
        view.render();
        view.hide();
      });
      this.show();
      return this;
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
  });

});