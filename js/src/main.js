$(document).ready(function() {

  Backbone.TennisAppState = Backbone.Model.extend({
    defaults: {
      view: undefined,
      program_id: undefined,
      category_id: undefined,
      round_id: undefined
    }
  });

  _.extend(Backbone.View.prototype, {
    show: function(options) {
      this.delegateEvents();
      this.render(options);
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
            collection: this.matches,
            programCollection: this.programs
          })
        };

        this.render();
        this.show();

      }.bind(this));

      this.listenTo(this.model, 'change', this.show);

      $(window).on('popstate', this.onPopState.bind(this));
    },
    events: {
      'click a': 'onClick',
      'show.bs.offcanvas': 'onShowMenu',
      'hide.bs.offcanvas': 'onHideMenu'
    },
    onClick: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget),
          name = $a.attr('href').replace('#', '') || 'home',
          state = $a.data('state');
      this.model.set(_.extend(Backbone.TennisAppState.prototype.defaults, {view: name}, state), {pushState: true});
      this.$el.offcanvas('hide');
      return false;
    },
    onShowMenu: function(e) {
      $('html').css({overflow:'hidden'});
      this.viewNeedsDelegateEvents= this.views[this.model.get('view')];
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.undelegateEvents();
    },
    onHideMenu: function(e) {
      $('html').css({overflow:''});
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.delegateEvents();
      this.viewNeedsDelegateEvents = undefined;
    },
    onPopState: function(e) {
      var state = this.getState();
      this.model.set(_.extend(Backbone.TennisAppState.prototype.defaults, state));
    },
    getState: function() {
      var parts = window.location.href.split('#'),
          url = parts[0],
          hash = parts[1] || '',
          firstAmp = hash.indexOf('&'),
          state = firstAmp >= 0 ? $.deparam(hash.substr(firstAmp+1), true) : {};
      state.view = hash ? hash.substr(0, firstAmp == -1 ? hash.length : firstAmp) : 'home';
      return state;
    },
    pushState: function(options) {
      var state = this.model.toJSON(),
          name = state.view,
          method = options && options.replaceState ? 'replaceState' : 'pushState';
      delete state.view;
      var omitKeys = []
      _.each(state, function(v, k) {
        if (v === null || v === '' || v === undefined) omitKeys.push(k);
      });
      state = _.omit(state, omitKeys);

      var route = !name || name == 'home' ? '' : name;
      if (!_.isEmpty(state)) route += '&' + $.param(state);
      history[method]({name: name}, '', window.location.href.split('#')[0] + (route ? '#' : '') + route);
    },
    show: function(model, options) {
      options || (options = {});
      this.viewNeedsDelegateEvents = undefined;

      var oldViewName = this.model.previous('view'),
          oldView = this.views[oldViewName];
      if (oldView) oldView.hide();

      var viewName = this.model.get('view'),
          view = this.views[viewName];
      view.show(options);

      this.topMenuView.render();
      this.updateLinks();
      if (options && (options.pushState || options.replaceState)) this.pushState(options);
    },
    render: function() {
      var data = _.extend(this.model.toJSON(), {
        programs: this.programs.map(function(model) {return model.pick('id', 'name')})
      });
      this.$el.html(this.sideMenuTemplate(data));
      _.each(this.views, function(view, viewName) {
        view.render();
        if (viewName != data.view) view.hide();
      });
      return this;
    },
    updateLinks: function() {
      var name = this.model.get('view'),
          program_id = this.model.get('program_id');
      this.$el.find('a').each(function() {
        var $a = $(this),
            state = $a.data('state') || {};
        state.view = $a.attr('href').replace('#', '') || 'home';
        if (state.view == name && state.program_id == program_id)
          $a.closest('li').addClass('active');
        else
          $a.closest('li').removeClass('active');
      });
    }
  });

  var state = Backbone.TennisApp.prototype.getState();

  window.app = new Backbone.TennisApp({
    model: new Backbone.TennisAppState(state),
    el: $('#side-menu')
  });

});