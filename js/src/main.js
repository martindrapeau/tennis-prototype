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
      this.categories = new Backbone.CategoryCollection();
      this.rounds = new Backbone.RoundCollection();

      var p1 = this.players.fetch(),
          p2 = this.matches.fetch(),
          p3 = this.programs.fetch(),
          p4 = this.categories.fetch(),
          p5 = this.rounds.fetch();

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
      loadCollectionDataIfEmpty('categories', p4, window._categories);
      loadCollectionDataIfEmpty('rounds', p5, window._rounds);

      $.when(p1, p2, p3, p4, p5).done(function() {
        this.matches.bindPlayers(this.players);
        this.players.bindMatches(this.matches);
        this.categories.bindMatches(this.matches);
        this.rounds.bindMatches(this.matches);

        this.views = {
          home: new Backbone.HomeView({
            el: $('#home'),
            model: this.model
          }),
          program: new Backbone.ProgramView({
            el: $('#program'),
            model: undefined,
            collection: this.programs,
            stateModel: this.model,
            matchCollection: this.matches,
            categoryCollection: this.categories,
            roundCollection: this.rounds
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
            programCollection: this.programs,
            categoryCollection: this.categories,
            roundCollection: this.rounds
          })
        };

        this.render();
        this.show();

      }.bind(this));

      this.listenTo(this.model, 'change', this.show);
      this.listenTo(this.programs, 'change', this.renderMenu);

      $(window).on('popstate', this.onPopState.bind(this));
    },
    events: {
      'click a': 'onClick',
      'show.bs.offcanvas': 'onShowMenu',
      'hide.bs.offcanvas': 'onHideMenu',
      'hidden.bs.offcanvas': 'onHiddenMenu'
    },
    onClick: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget),
          name = $a.attr('href').replace('#', '') || 'home',
          state = $a.data('state');
      this.model.set(_.extend(Backbone.TennisAppState.prototype.defaults, {view: name}, state), {pushState: true, hideMenu: true});
      return false;
    },
    onShowMenu: function(e) {
      console.log('onShowMenu');
      $('html').css({overflow:'hidden'});
      $("body").css("overflow", "hidden");
      $("body").on("touchmove.bs", function (e) {
          if (!$(e.target).closest(".canvas")) {
              e.preventDefault();
              e.stopPropagation();
          }
      });
      this.viewNeedsDelegateEvents = this.views[this.model.get('view')];
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.undelegateEvents();
    },
    onHideMenu: function(e) {
      console.log('onHideMenu');
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.delegateEvents();
      this.viewNeedsDelegateEvents = undefined;
    },
    onHiddenMenu: function(e) {
      $('html').css({overflow:''});
      $("body").css("overflow", "auto");
      $("body").off("touchmove.bs");
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
      if (options && (options.pushState || options.replaceState)) this.pushState(options);

      if (options && options.renderMenu)
        this.renderMenu();
      else
        this.updateLinks();

      if (options && (options.hideMenu))
        _.defer(function() {
          this.$el.offcanvas('hide');
        }.bind(this));
    },
    render: function() {
      this.renderMenu();
      this.renderViews();
      return this;
    },
    renderMenu: function() {
      var data = _.extend(this.model.toJSON(), {
        programs: this.programs.map(function(model) {return model.pick('id', 'name')})
      });
      this.$el.html(this.sideMenuTemplate(data));
      this.updateLinks();
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
    },
    renderViews: function() {
      var currentViewName = this.model.get('view');
      _.each(this.views, function(view, viewName) {
        view.render();
        if (viewName != currentViewName) view.hide();
      });
      return this;
    }
  });

  var state = Backbone.TennisApp.prototype.getState();

  window.app = new Backbone.TennisApp({
    model: new Backbone.TennisAppState(state),
    el: $('#side-menu')
  });

});