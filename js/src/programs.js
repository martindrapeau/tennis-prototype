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
      'keyup input': 'onInputKeyup',
      'click button.goto-matches': 'onClickGotoMatches',
      'click .add-category': 'onAddCategory',
      'click .category>.info': 'onFocusCategory',
      'focus .category>.info': 'onFocusCategory',
      'click .add-round': 'onAddRound',
      'click .round>.info': 'onFocusRound',
      'focus .round>.info': 'onFocusRound'
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
    onFocusProgram: function(e) {
      if (this.modelInEdit && this.model.cid == this.modelInEdit.cid) return;
      if (this.modelInEdit) this.modelInEdit.set({editable: false}, {renderAll: true});
      this.model.set({editable: true});
      this.modelInEdit = this.model;
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
      if (e.exitEditMode) xhr.done(function() {this.modelInEdit = null;}.bind(this));
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
      if (this.modelInEdit && !$el.is('.tag') && !$el.closest('.tag').is('.tag') && !$el.is('.program-info') && !$el.closest('.program-info').is('.program-info')) {
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
      if (this.model) this.stopListening(this.model);
      this.model = this.collection.get(this.stateModel.get('program_id'));
      if (!this.model) return this;
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

      return this;
    }
  });
  $('document').ready(function() {
    Backbone.ProgramView.prototype.template = _.template($('#program-template').html());
  });


}.call(this));