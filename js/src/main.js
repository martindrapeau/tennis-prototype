$(document).ready(function() {

  Backbone.TennisAppState = Backbone.Model.extend({
    defaults: {
      view: undefined,
      program_id: undefined,
      category_id: undefined,
      round_id: undefined
    }
  });

  Backbone.TennisApp = Backbone.View.extend({
    sideMenuTemplate: _.template(`
      <% var state = {program_id: null}; %>
      <a class="navmenu-brand" href="#" data-state='<%=JSON.stringify(state)%>'><%=_lang('appName')%></a>
      <ul class="nav navmenu-nav">
        <li><a href="#" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw fa-home"></i> <%=_lang('home')%></a></li>
        <li><a href="#players" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw fa-users"></i> <%=_lang('allPlayers')%></a></li>
        <% for (var i = 0; i < programs.length; i++) { %>
          <% var program = programs[i]; %>
          <% state = {program_id: program.id}; %>
          <li><a href="#program-toggle" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw fa-calendar-o"></i> <%=program.name%></a></li>
          <li data-program-id="<%=program.id%>" style="display: <%=program.expanded ? 'block' : 'none'%>;">
            <a href="#program" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw"></i> <i class="fa fa-fw fa-cog"></i> <%=_lang('settings')%></a>
          </li>
          <li data-program-id="<%=program.id%>" style="display: <%=program.expanded ? 'block' : 'none'%>;">
            <a href="#matches" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw"></i> <i class="fa fa-fw fa-check-circle"></i> <%=_lang('matches')%></a>
          </li>
          <li data-program-id="<%=program.id%>" style="display: <%=program.expanded ? 'block' : 'none'%>;">
            <a href="#rankings" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw"></i> <i class="fa fa-fw fa-list-ol"></i> <%=_lang('rankings')%></a>
          </li>
        <% } %>
        <% state = {program_id: null}; %>
        <li><a href="#program" data-state='<%=JSON.stringify(state)%>'><i class="fa fa-fw fa-plus"></i> <%=_lang('addAProgram')%></a></li>
        <li class="spacer">&nbsp;</li>
      </ul>
    `),
    initialize: function(options) {

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

        var program_id = this.model.get('program_id');
        this.programs.each(function(model) {
          model.set({expanded: model.id == program_id}, {silent: true});
        });

        this.topMenuView = new Backbone.TopMenuView({
          el: $('#top-menu'),
          model: this.model,
          programCollection: this.programs
        });

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
          }),
          rankings: new Backbone.RankingsView({
            el: $('#rankings'),
            model: this.model,
            collection: undefined,
            playerCollection: this.players,
            matchCollection: this.matches,
            programCollection: this.programs,
            categoryCollection: this.categories,
            roundCollection: this.rounds
          })
        };

        this.render();
        this.show();

      }.bind(this));

      this.listenTo(this.model, 'change', this.show);
      this.listenTo(this.programs, 'change', this.renderSideMenu);

      $(window).on('popstate', this.onPopState.bind(this));
    },
    events: {
      'click #side-menu a': 'onClick',
      'show.bs.offcanvas #side-menu': 'onShowMenu',
      'hide.bs.offcanvas #side-menu': 'onHideMenu',
      'shown.bs.offcanvas #side-menu': 'onShownMenu',
      'hidden.bs.offcanvas #side-menu': 'onHiddenMenu'
    },
    onClick: function(e) {
      e.preventDefault();
      var $a = $(e.currentTarget),
          name = $a.attr('href').replace('#', '') || 'home',
          state = $a.data('state');
      if (name == 'program-toggle') return this.programToggle(state.program_id);
      this.model.set(_.extend(Backbone.TennisAppState.prototype.defaults, {view: name}, state), {pushState: true, hideMenu: true});
      return false;
    },
    programToggle: function(program_id) {
      var model = this.programs.get(program_id);
      if (!model || model.id == this.model.get('program_id')) return false;

      var expanded = !model.get('expanded');
      model.set({expanded: expanded});

      return false;
    },
    onShowMenu: function(e) {
      $('html').css({overflow:'hidden'});
      this.$el.css("overflow", "hidden");
      this.viewNeedsDelegateEvents = this.views[this.model.get('view')];
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.undelegateEvents();
    },
    onShownMenu: function(e) {
      this.$el.off("touchmove.bs");
      this.$('.canvas').css({overflow: 'hidden'});
      this.$('.canvas').on('touchmove.tennis', function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    },
    onHideMenu: function(e) {
      this.$('.canvas').css({overflow: ''});
      this.$('.canvas').off('touchmove.tennis');
      if (this.viewNeedsDelegateEvents) this.viewNeedsDelegateEvents.delegateEvents();
      this.viewNeedsDelegateEvents = undefined;
    },
    onHiddenMenu: function(e) {
      $('html').css({overflow:''});
      this.$el.css("overflow", "auto");
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

      // Hide old view
      var oldViewName = this.model.previous('view'),
          oldView = this.views[oldViewName];
      if (oldView) oldView.hide();

      // Show new view
      var viewName = this.model.get('view'),
          view = this.views[viewName];
      view.show(options);

      // Update URL
      if (options && (options.pushState || options.replaceState)) this.pushState(options);

      // Update/render menus
      this.topMenuView.render();
      if (options && options.renderSideMenu)
        this.renderSideMenu();
      else
        this.updateSideMenuLinks();

      // Hide menu maybe
      if (options && (options.hideMenu))
        _.defer(function() {
          this.$sideMenu.offcanvas('hide');
        }.bind(this));
    },
    render: function() {
      this.$sideMenu = this.$('#side-menu');
      this.renderSideMenu();
      return this;
    },
    renderSideMenu: function() {
      var data = _.extend(this.model.toJSON(), {
        programs: this.programs.map(function(model) {return model.pick('id', 'name', 'expanded')})
      });
      this.$sideMenu.html(this.sideMenuTemplate(data));
      this.updateSideMenuLinks();
      return this;
    },
    updateSideMenuLinks: function() {
      var name = this.model.get('view'),
          program_id = this.model.get('program_id');
      this.$sideMenu.find('a').each(function() {
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
    el: $('body')
  });

});