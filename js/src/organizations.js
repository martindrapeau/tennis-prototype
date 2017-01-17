(function() {

  var dataStore = new BackboneLocalStorage('organizations', {data: window._organizations});

  Backbone.OrganizationModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: undefined,
      image: undefined,
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
    sync: dataStore.sync,
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
        <div class="wrapper">
          <% if (image) { %>
            <img src="<%=image%>" alt="<%=initials%>" />
          <% } else { %>
            <div class="initials"><%=initials%></div>
          <% } %>
        </div>
        <div class="name"><%=name%></div>
      </div>
    `),
    addFormTemplate: _.template(`
      <form class="bootbox-form">
        <input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" placeholder="<%=_lang('organizationName')%>" />
        <p class="help-block"><%=_lang('organizationHelp')%></p>
      </form>
    `),
    events: {
    },
    initialize: function(options) {
      this.stateModel = options.stateModel;
      this.programCollection = options.programCollection;
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
                this.collection.add(this.model);
                this.model.save({name: result}, {wait: true}).done(function() {
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
      return this.model ? this.model.toRender() : {};
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

      return this;
    }
  });

}.call(this));