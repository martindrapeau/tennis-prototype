(function() {

  var dataStore = new BackboneLocalStorage('programs');

  Backbone.ProgramModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: null,
      description: '',
      categories: [],
      rounds: []
    }
  });

  Backbone.ProgramCollection = Backbone.Collection.extend({
    sync: dataStore.sync,
    model: Backbone.ProgramModel
  });


  Backbone.ProgramView = Backbone.View.extend({
    className: 'program',
    events: {
      'click .add-category': 'onAddCategory',
      'click .category': 'onFocusCategory',
      'focus .category': 'onFocusCategory',
      'click .add-round': 'onAddRound',
      'click .round': 'onFocusRound',
      'focus .round': 'onFocusRound'
    },
    initialize: function(options) {
      this.modelInEdit = null;
      this.stateModel = options.stateModel;
      this.matchCollection = options.matchCollection;
      this.categoryCollection = options.categoryCollection;
      this.roundCollection = options.roundCollection;
      this.listenTo(this.categoryCollection, 'add remove', this.render);
      this.listenTo(this.roundCollection, 'add remove', this.render);
    },
    delegateEvents: function() {
      Backbone.View.prototype.delegateEvents.apply(this, arguments);
      $('body').on('click.tag', this.onClickBody.bind(this));
    },
    undelegateEvents: function() {
      Backbone.View.prototype.undelegateEvents.apply(this, arguments);
      if (this.modelInEdit) this.modelInEdit.set('editable', false);
      this.modelInEdit = null;
      $('body').off('click.tag');
    },
    onFocusCategory: function(e) {
      return this._onFocusTag('category', e);
    },
    onFocusRound: function(e) {
      return this._onFocusTag('round', e);
    },
    _onFocusTag: function(type, e) {
      var $el = $(e.currentTarget);
      if ($el.is('.' + type)) {
        var cid = $el.data('cid');
        if (this.modelInEdit && cid == this.modelInEdit.cid) return;
        if (this.modelInEdit) this.modelInEdit.set({editable: false}, {renderAll: true});
        var model = this[type + 'Collection'].get(cid);
        if (model) model.set({editable: true}, {renderAll: true});
        this.modelInEdit = model;
        e.stopPropagation();
      }
    },
    onClickBody: function(e) {
      var $el = $(e.target);
      if (this.stateModel.get('view') != 'program' || $el.closest('.bootstrap-select').length) return;
      if (this.modelInEdit &&
          !$el.is('.category') && !$el.closest('.category').is('.category') &&
          !$el.is('.round') && !$el.closest('.round').is('.round')) {
        this.modelInEdit.set({editable: false}, {renderAll: true});
        this.modelInEdit = null;
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
    render: function() {
      this.model = this.collection.get(this.stateModel.get('program_id'));
      if (!this.model) return this;

      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];

      var data = this.model.toJSON();
      this.$el
        .html(this.template(data))
        .data('id', data.id);

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

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.ProgramView.prototype.template = _.template($('#program-template').html());
  });


}.call(this));