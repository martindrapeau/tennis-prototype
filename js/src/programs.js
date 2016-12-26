(function() {

  var dataStore = new BackboneLocalStorage('programs');

  Backbone.ProgramModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: null,
      description: '',
      categories: [],
      rounds: [],
      editable: false
    },
    initialize: function() {
      this.set({editable: false}, {silent: true});
    }
  });

  Backbone.ProgramCollection = Backbone.Collection.extend({
    sync: dataStore.sync,
    model: Backbone.ProgramModel
  });


  Backbone.ProgramView = Backbone.View.extend({
    className: 'program',
    events: {
      'click .program-info': 'onFocusProgram',
      'focus .program-info': 'onFocusProgram',
      'keydown .program-info input': 'onProgramInputKeydown',
      'blur .program-info input': 'saveProgramInputToModel',
      'click .delete-program': 'onClickDeleteProgram',
      'click button.goto-matches': 'onClickGotoMatches',
      'click .add-category': 'onAddCategory',
      'click .category>.info': 'onFocusCategory',
      'focus .category>.info': 'onFocusCategory',
      'click .add-round': 'onAddRound',
      'click .round>.info': 'onFocusRound',
      'focus .round>.info': 'onFocusRound'
    },
    initialize: function(options) {
      this.stateModel = options.stateModel;
      this.matchCollection = options.matchCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
      this.listenTo(this.categoryCollection, 'add remove', this.render);
      this.listenTo(this.roundCollection, 'add remove', this.render);
    },
    getModelInEdit: function() {
      if (!this.model) return undefined;
      if (this.model.get('editable')) return this.model;
      return this.categoryCollection.findWhere({editable: true}) || this.roundCollection.findWhere({editable: true}) || undefined;
    },
    stopEditing: function(options) {
      var model = this.getModelInEdit();
      if (model) model.set({editable: false}, options);
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $('body').on('click.tag', this.onClickBody.bind(this));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      this.stopEditing();
      $('body').off('click.tag');
    },
    onFocusProgram: function(e) {
      if (this.model.get('editable')) return;
      this.stopEditing({renderAll: true});
      this.model.set({editable: true});
      e.stopPropagation();
    },
    onProgramInputKeydown: function(e) {
      if (e.keyCode == 13) {
        e.exitEditMode = true;
        this.saveProgramInputToModel.apply(this, arguments);
      }
    },
    saveProgramInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          value = $input.val(),
          attributes = {};
      attributes[attr] = value;
      if (e.exitEditMode) attributes.editable = false;
      var xhr = this.model.save(attributes, {wait: true});
    },
    onClickDeleteProgram: function(e) {
      this.$el.animate({backgroundColor: '#ffdddd'}, 100);
      setTimeout(function() {
        if (this.matchCollection.findWhere({program_id: this.model.id})) {
          alert(_lang('cannotDeleteWhenMatchesExist'));
          this.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
          return;
        }
        if (!confirm(_lang('areYouSure'))) {
          this.$el.animate({backgroundColor: 'transparent'}, 100, function() {$(this).css({backgroundColor:''});});
          return;
        }

        $('#side-menu').one('shown.bs.offcanvas', function(e) {
          this.stopListening(this.model);
          _.defer(function() {
            var program_id = this.model.id;
            this.model.collection.remove(this.model);
            this.model.destroy({wait: true}).done(function() {
              this.stateModel.set(
                _.extend(Backbone.TennisAppState.prototype.defaults, {view: 'home', program_id: null}), {
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
      }.bind(this), 200);
    },
    onClickGotoMatches: function(e) {
      var $tag = $(e.currentTarget).closest('.tag'),
          matchIdAttribute = $tag.data('matchIdAttribute'),
          id = $tag.data('id');
      var attributes = {view: 'matches'};
      attributes[matchIdAttribute] = id;
      this.stateModel.set(attributes, {pushState: true});
      $(e.target).blur();
    },
    onFocusCategory: function(e) {
      return this._onFocusTag('category', e);
    },
    onFocusRound: function(e) {
      return this._onFocusTag('round', e);
    },
    _onFocusTag: function(type, e) {
      var $el = $(e.currentTarget).closest('.tag');
      if ($el.is('.' + type)) {
        var cid = $el.data('cid'),
            modelInEdit = this.getModelInEdit();
        if (modelInEdit && cid == modelInEdit.cid) return;
        if (modelInEdit) modelInEdit.set({editable: false}, {renderAll: true});
        var model = this[type + 'Collection'].get(cid);
        if (model) model.set({editable: true}, {renderAll: true});
        e.stopPropagation();
      }
    },
    onClickBody: function(e) {
      var $el = $(e.target);
      if (this.stateModel.get('view') != 'program' || $el.closest('.bootstrap-select').length) return;
      var modelInEdit = this.getModelInEdit();
      if (modelInEdit && !$el.is('.tag') && !$el.closest('.tag').is('.tag') && !$el.is('.program-info') && !$el.closest('.program-info').is('.program-info')) {
        modelInEdit.set({editable: false}, {renderAll: true});
      }
    },
    onAddCategory: function(e) {
      return this._onAddTag('category', e);
    },
    onAddRound: function(e) {
      return this._onAddTag('round', e);
    },
    _onAddTag: function(type, e) {
      var model = new Backbone[type == 'category' ? 'CategoryModel' : 'RoundModel']({
        program_id: this.model.id,
        editable: true
      });
      this[type + 'Collection'].add(model, {sort: false});
      var view = _.find(this.views, function(view) {
        if (view.model.cid == model.cid) return true;
      });
      view.$el.css({
        backgroundColor: '#ddffdd'
      });
      $('html, body').animate({
        scrollTop: view.$el.offset().top
      }, 500);
      view.$el.animate({
        backgroundColor: 'transparent'
      }, 750, function() {
        this.$el.css({backgroundColor:''});
        this.focus();
      }.bind(view));
    },
    render: function(options) {
      if (this.model) this.stopListening(this.model);
      var program_id = this.stateModel.get('program_id');

      if (program_id || !options) {
        this.model = this.collection.get(program_id);
        if (!this.model) return this;
      } else {
        // Create a new program
        this.model = new Backbone.ProgramModel({
          name: _lang('newProgram')
        });
        this.model.save(null, {wait: true}).done(function() {
          this.collection.add(this.model);
          var category = new Backbone.CategoryModel({name: 'A1', program_id: this.model.id}),
              round = new Backbone.RoundModel({name: _lang('week') + ' 1', program_id: this.model.id});
          $.when(category.save(null, {wait: true}), round.save(null, {wait: true})).done(function() {
            this.categoryCollection.add(category, {silent: true});
            this.roundCollection.add(round, {silent: true});
            this.stateModel.set({program_id: this.model.id}, {replaceState: true, hideMenu: true, renderMenu: true, programIsNew: true});
            _.defer(function() {
              this.model.set({editable: true});
            }.bind(this));
          }.bind(this));
        }.bind(this));
        options.replaceState = false;
        options.pushState = false;
        options.hideMenu = false;
        return this;
      }
      this.listenTo(this.model, 'change', this.render);

      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];

      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .data('cid', this.model.cid)
        .find('input').prop('readonly', !data.editable);

      this.$categories = this.$('.categories');
      this.categoryCollection.each(function(model) {
        if (model.get('program_id') != data.id) return true;
        var view = new Backbone.CategoryView({
          model: model
        });
        this.$categories.append(view.render().$el);
        this.views.push(view);
      }.bind(this));
      this.$categories.append('<button class="tag add-category btn btn-default">' + _lang('add') + '</button>');

      this.$rounds = this.$('.rounds');
      this.roundCollection.each(function(model) {
        if (model.get('program_id') != data.id) return true;
        var view = new Backbone.RoundView({
          model: model
        });
        this.$rounds.append(view.render().$el);
        this.views.push(view);
      }.bind(this));
      this.$rounds.append('<button class="tag add-round btn btn-default">' + _lang('add') + '</button>');

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
  $('document').ready(function() {
    Backbone.ProgramView.prototype.template = _.template($('#program-template').html());
  });


}.call(this));