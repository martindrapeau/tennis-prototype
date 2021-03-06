(function() {

  Backbone.OrganizationModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: undefined,
      image: undefined,
      phone: undefined,
      email: undefined,
      url: undefined,
      facebook_url: undefined,
      region: undefined,
      address: undefined,
      borough: undefined,
      city: undefined,
      state: undefined,
      zip: undefined,
      country: undefined,
      latitude: undefined,
      longitude: undefined,
      facility_ids: [],
      admin_ids: []
    },
    getStats: function() {
      return {
        playerCount: this.collection && this.collection.players ? this.collection.players.size() : '?',
        matchCount: this.collection && this.collection.matches ? this.collection.matches.size() : '?',
        programCount: this.collection && this.collection.programs ? this.collection.programs.size() : '?'
      };
    },
    toRender: function() {
      var data = this.toJSON(),
          stats = this.getStats();
      return _.extend(data, {
        initials: _.initials(data.name),
        stats: stats,
        statsText: _lang('orgStatsText')
          .replace('{1}', stats.programCount)
          .replace('{2}', stats.matchCount)
          .replace('{3}', stats.playerCount)
      });
    }
  });

  Backbone.OrganizationCollection = Backbone.Collection.extend({
    model: Backbone.OrganizationModel,
    bindCollections: function(collections) {
      this.programs = collections.programs;
      this.matches = collections.matches;
      this.players = collections.players;
    }
  });


  Backbone.OrganizationView = Backbone.View.extend({
    template: _.template(`
      <div class="brand">
        <div class="wrapper <%=image ? '' : 'bg'%>">
          <% if (image) { %>
            <img src="<%=image%>" alt="<%=initials%>" />
          <% } else { %>
            <div class="initials"><%=initials%></div>
          <% } %>
        </div>
        <address>
          <strong><%=name%></strong>
          <% if (address) { %>
            <br/><%=address%>
            <br/><%=city%>, <%=state%> <%=zip%>
          <% } %>
          <%
            var parts = _.compact([
              phone ? {href: 'tel:'+phone, html: phone} : null,
              url && facebook_url != url ? {href: url, html: '<i class="fa fa-fw fa-external-link"></i>', target: '_blank'} : null,
              facebook_url ? {href: facebook_url, html: '<i class="fa fa-fw fa-facebook-square"></i>', target: '_blank'} : null,
              email ? {href: 'mailto:'+email, html: '<i class="fa fa-fw fa-envelope"></i>'} : null
            ]);
          %>
          <% if (parts.length) { %><br/><% } %>
          <% for (var i = 0; i < parts.length; i++) { %>
            <a href="<%=parts[i].href%>" <%if(parts[i].target){%>target="<%=parts[i].target%>"<%}%>><%=parts[i].html%></a><% if (i < parts.length-1) { %>, <% } %>
          <% } %>
        </address>
      </div>
      <% if (program) { %>
        <div class="upcoming-program">
          <% if (round) { %>
            <h4><%=title%> - <%=round.name%>, <%=program.name%></h4>
          <% } else { %>
            <h4><%=title%> - <%=program.name%></h4>
          <% } %>
          <% if (round && match_title) { %>
            <p>
              <a href="#" class="btn btn-primary goto-matches" data-round_id="<%=round.id%>"><%=match_title%> <i class="fa fa-fw fa-arrow-circle-right"></i></a>
            </p>
          <% } %>
        </div>
      <% } %>
    `),
    addFormTemplate: _.template(`
      <form class="bootbox-form">
        <input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" placeholder="<%=_lang('organizationName')%>" />
        <p class="help-block"><%=_lang('organizationHelp')%></p>
      </form>
    `),
    events: {
      'click .brand': 'onClickBrand',
      'click .goto-matches': 'onClickGotoMatches'
    },
    initialize: function(options) {
      this.stateModel = options.stateModel;
      this.programCollection = options.programCollection;
      this.matchCollection = options.matchCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $('#top-menu').on('click', '.edit-organization', this.onEditOrganization.bind(this));
      $('#top-menu').on('click', '.delete-organization', this.onClickDeleteOrganization.bind(this));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      $('#top-menu').off('click', '.edit-organization');
      $('#top-menu').off('click', '.delete-organization');
    },
    onAddOrganization: function() {
      // Called from #home view
      var model = new Backbone.OrganizationModel();
      bootbox.dialog({
        title: _lang('addOrganization'),
        message: this.addFormTemplate(model.toJSON()),
        size: 'small',
        buttons: {
          cancel: {
            label: _lang('cancel')
          },
          confirm: {
            label: _lang('save'),
            callback: function() {
              var result = $('.bootbox.modal').find('input').val();
              if (!result) {
                // TODO: Report error to user.
                return false;
              }

              $('#side-menu').one('shown.bs.offcanvas', function(e) {
                this.model = model;
                this.model.save({name: result}, {wait: true}).done(function() {
                  this.collection.add(this.model);
                  this.stateModel.save({view: 'organization', organization_id: this.model.id}, {pushState: true, renderMenu: true, hideMenu: true, programIsNew: true});
                }.bind(this));
                bootbox.hideAll();
              }.bind(this));

              _.defer(function() {
                $('#top-menu .navbar-toggle').click();
              });

            }.bind(this)
          }
        }
      });

      return this;
    },
    onClickBrand: function(e) {
      if (!$(e.target).is('a') && !$(e.target).closest('a').length) return this.onEditOrganization.apply(this, arguments);
    },
    onClickGotoMatches: function(e) {
      e.preventDefault();
      var round_id = $(e.currentTarget).data('round_id'),
          round = this.roundCollection.get(round_id),
          program_id = round.get('program_id'),
          program = this.programCollection.get(program_id),
          category_id = this.categoryCollection.findWhere({program_id: program_id});

      program.set({expanded: true}, {silent: true});

      $('#side-menu').one('shown.bs.offcanvas', function(e) {
        this.stateModel.save({view: 'matches', program_id: program_id, round_id: round_id, category_id: category_id}, {pushState: true, renderMenu: true, hideMenu: true});
      }.bind(this));
      _.defer(function() {
        $('#top-menu .navbar-toggle').click();
      });
    },
    onEditOrganization: function(e) {
      e.preventDefault();
      new Backbone.EditOrganizationView({
        model: this.model,
        onSave: this.onSave.bind(this)
      }).render();
    },
    onSave: function() {
      this.model.save(null, {wait: true});
    },
    onClickDeleteOrganization: function(e) {
      e.preventDefault();
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);

      setTimeout(function() {
        if (this.programCollection.size()) {
          bootbox.alert(_lang('cannotDeleteWhenProgramsExist'), function() {
            this.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
          }.bind(this));
          return;
        }

        bootbox.confirm(_lang('areYouSure'), function(result) {
          if (!result) {
            this.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
            return;
          }

          $('#side-menu').one('shown.bs.offcanvas', function(e) {
            this.stopListening(this.model);
            _.defer(function() {
              var organization_id = this.model.id;
              this.model.collection.remove(this.model);
              this.model.destroy({wait: true}).done(function() {
                this.stateModel.set({
                  view: 'home',
                  organization_id: undefined,
                  program_id: undefined,
                  category_id: undefined,
                  round_id: undefined
                }, {
                  renderMenu: true,
                  replaceState: true,
                  hideMenu: true
                });
                this.model = undefined;

              }.bind(this));
              this.$el.css({backgroundColor: ''});
            }.bind(this));
          }.bind(this));
          _.defer(function() {
            $('#top-menu .navbar-toggle').click();
          });

        }.bind(this));

      }.bind(this), 200);

    },
    toRender: function() {
      if (!this.model) return {};
      var program = this.programCollection.getUpcoming(),
          round = program ? this.roundCollection.getUpcoming(program.id) : null,
          matches = round ? this.matchCollection.where({round_id: round.id}) : [];
          data = _.extend(this.model.toRender(), {
            program: program ? program.toRender() : null,
            round: round ? round.toRender() : null
          });

      data.title = program ? _.compareDateToRangeTitle(new Date(), program.get('start'), program.get('end')) : '';
      if (round) data.title = _.compareDateToRangeTitle(new Date(), round.get('start'), round.get('end'));
      data.match_title = matches ? (matches.length + ' ' + _lang(matches.length == 1 ? 'match' : 'matches').toLowerCase()) : '';

      return data;
    },
    render: function() {
      var organization_id = this.stateModel.get('organization_id');
      if (!organization_id) throw 'organization_id is not set';

      if (this.model) this.stopListening(this.model);
      this.model = this.collection.get(organization_id);
      if (!this.model) return this;
      this.listenTo(this.model, 'change', this.render);

      var data = this.toRender();
      this.$el.html(this.template(data));

      if (data.round) {
        new Backbone.RoundView({
          el: this.$('.tag.round'),
          model: this.roundCollection.get(data.round.id)
        }).render();
      }

      return this;
    }
  });

}.call(this));