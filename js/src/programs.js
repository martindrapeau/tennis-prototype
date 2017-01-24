(function() {

  Backbone.ProgramModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
      description: '',
      categories: [],
      rounds: []
    }
  });

  Backbone.ProgramCollection = Backbone.Collection.extend({
    model: Backbone.ProgramModel,
    comparator: function(model) {
      return -model.id;
    }
  });


  Backbone.ProgramView = Backbone.View.extend({
    template: _.template(`
      <h4><%=_lang('categories')%></h4>
      <div class="categories"></div>
      <br/>
      <h4><%=_lang('rounds')%></h4>
      <div class="rounds"></div>
    `),
    addProgramFormTemplate: _.template(`
      <form class="bootbox-form">
        <input class="bootbox-input bootbox-input-text form-control" autocomplete="off" type="text" placeholder="<%=_lang('programName')%>" />
        <p class="help-block"><%=_lang('programHelp')%></p>
      </form>
    `),
    className: 'program',
    events: {
      'click button.goto-matches': 'onClickGotoMatches'
    },
    initialize: function(options) {
      this.stateModel = options.stateModel;
      this.matchCollection = options.matchCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
      this.listenTo(this.categoryCollection, 'add remove', this.render);
      this.listenTo(this.roundCollection, 'add remove', this.render);
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $('#top-menu').on('click', '.edit-program', this.onEditProgram.bind(this));
      $('#top-menu').on('click', '.delete-program', this.onClickDeleteProgram.bind(this));
      $('#top-menu').on('click', '.add-category', _.partial(this.onAddCategoryOrRound.bind(this), 'category'));
      $('#top-menu').on('click', '.add-round', _.partial(this.onAddCategoryOrRound.bind(this), 'round'));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      $('#top-menu').off('click', '.edit-program');
      $('#top-menu').off('click', '.delete-program');
      $('#top-menu').off('click', '.add-category');
      $('#top-menu').off('click', '.add-round');
    },
    addProgram: function() {
      var model = new Backbone.ProgramModel({
        name: '',
        organization_id: this.stateModel.get('organization_id'),
        expanded: true
      });
      bootbox.dialog({
        title: _lang('newProgram'),
        message: this.addProgramFormTemplate(model.toJSON()),
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

              this.model = model;
              this.collection.add(this.model);
              this.model.save({name: result}, {wait: true}).done(function() {
                var category = new Backbone.CategoryModel({name: 'A1', program_id: this.model.id}),
                    round = new Backbone.RoundModel({name: _lang('week') + ' 1', program_id: this.model.id});
                $.when(category.save(null, {wait: true}), round.save(null, {wait: true})).done(function() {
                  this.categoryCollection.add(category, {silent: true});
                  this.roundCollection.add(round, {silent: true});
                  this.stateModel.set({view: 'program', program_id: this.model.id}, {pushState: true, renderMenu: true, hideMenu: true, programIsNew: true});
                }.bind(this));
              }.bind(this));
              bootbox.hideAll();
            }.bind(this)
          }
        }
      });

      return this;
    },
    onEditProgram: function(e) {
      if (e) e.preventDefault();
      bootbox.prompt({
        title: _lang('programName'),
        value: this.model.get('name'),
        callback: function(result) {
          if (!result) return;
          this.model.save({name: result}, {wait: true}).done(function() {
            $('#top-menu .navbar-brand').text(result);
          });
        }.bind(this)
      });
    },
    onClickDeleteProgram: function(e) {
      e.preventDefault();
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);

      setTimeout(function() {
        if (this.matchCollection.findWhere({program_id: this.model.id})) {
          bootbox.alert(_lang('cannotDeleteWhenMatchesExist'), function() {
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
              var program_id = this.model.id;
              this.model.collection.remove(this.model);
              this.model.destroy({wait: true}).done(function() {
                this.stateModel.set({
                  view: 'organization',
                  program_id: undefined,
                  category_id: undefined,
                  round_id: undefined
                }, {
                  renderMenu: true,
                  replaceState: true,
                  hideMenu: true
                });
                this.model = undefined;

                var categories = this.categoryCollection.where({program_id: program_id});
                if (categories.length) this.categoryCollection.remove(categories, {silent: true});
                _.each(categories, function(model) {model.destroy();});

                var rounds = this.roundCollection.where({program_id: program_id});
                if (rounds.length) this.roundCollection.remove(rounds, {silent: true});
                _.each(rounds, function(model) {model.destroy();});

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
    onClickGotoMatches: function(e) {
      var $tag = $(e.currentTarget).closest('.tag'),
          matchIdAttribute = $tag.data('matchIdAttribute'),
          id = $tag.data('id'),
          attributes = {view: 'matches'};
      attributes[matchIdAttribute] = id;

      $('#side-menu').one('shown.bs.offcanvas', function(e) {
        this.stateModel.set(attributes, {pushState: true, hideMenu: true});
      }.bind(this));
      _.defer(function() {
        $('#top-menu .navbar-toggle').click();
      });
      $(e.target).blur();
    },
    onAddCategoryOrRound: function(type, e) {
      e.preventDefault();
      var modelClass = type == 'category' ? Backbone.CategoryModel : Backbone.RoundModel,
          model = new modelClass({
            organization_id: this.stateModel.get('organization_id'),
            program_id: this.model.id
          }),
          collection = type == 'category' ? this.categoryCollection : this.roundCollection,
          viewClass = type == 'category' ? Backbone.CategoryView : Backbone.RoundView,
          editViewClass = viewClass.prototype.editView;

      new editViewClass({
        model: model,
        onSave: function() {
          collection.add(model, {sort: false});

          var view = _.find(this.views, function(view) {
            if (view.model.cid == model.cid) return true;
          });
          view.$el.css({backgroundColor: '#ddffdd'});

          model.save(null, {wait: true}).done(function() {
            $('html, body').animate({
              scrollTop: view.$el.offset().top
            }, 500);

            view.$el.animate({
              backgroundColor: '#fff'
            }, 750, function() {
              view.$el.css({backgroundColor:''});
            });
            
          }.bind(this));
          
        }.bind(this)
      }).render();
    },
    render: function(options) {
      if (this.model) this.stopListening(this.model);

      var program_id = this.stateModel.get('program_id');
      if (!program_id) throw 'program_id is not set';

      this.model = this.collection.get(program_id);
      if (!this.model) return this;

      this.listenTo(this.model, 'change', this.render);

      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];

      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .data('cid', this.model.cid);

      this.$categories = this.$('.categories');
      this.categoryCollection.each(function(model) {
        if (model.get('program_id') != data.id) return true;
        var view = new Backbone.CategoryView({
          model: model
        });
        this.$categories.append(view.render().$el);
        this.views.push(view);
      }.bind(this));

      this.$rounds = this.$('.rounds');
      this.roundCollection.each(function(model) {
        if (model.get('program_id') != data.id) return true;
        var view = new Backbone.RoundView({
          model: model
        });
        this.$rounds.append(view.render().$el);
        this.views.push(view);
      }.bind(this));

      this.$el.append('<div class="spacer">&nbsp;</div>');

      if (options && options.programIsNew) {
        this.$el.css({backgroundColor: '#ddffdd'});
        setTimeout(function() {
          this.$el.animate({backgroundColor: 'transparent'}, 500, function() {$(this).css({backgroundColor: ''});});
        }.bind(this), 200);
      }

      return this;
    }
  });


}.call(this));