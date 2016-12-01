(function() {

  Backbone.PlayerModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      name: null,
      email: null,
      image: null
    },
    toRender: function() {
      var data = this.toJSON();

      data.title = data.name ? _.shortName(data.name) : null;
      data.initials = data.name ? _.initials(data.name) : null;

      return data;
    }
  });

  Backbone.PlayerCollection = Backbone.Collection.extend({
    model: Backbone.PlayerModel,
    getJSON: function(id) {
      var model = this.get(id);
      return model ? model.toJSON() : undefined;
    }
  });

  Backbone.PlayerView = Backbone.View.extend({
    className: 'player',
    events: {
      'keydown input': 'onInputKeydown',
      'blur input': 'saveInputToModel'
    },
    initialize: function(options) {
      this.listenTo(this.model, 'change', this.onChange);
    },
    onChange: function() {
      this.renderPicture(this.model.toRender());
    },
    render: function(options) {
      var data = this.model.toRender();
      data.editable = options && options.editPlayers;
      data.tabindex = options && options.tabindex ? options.tabindex : 100;

      this.$el
        .html(this.template(data))
        .data('id', data.id)
        .find('input').prop('readonly', !data.editable);

      this.renderPicture(data);

      return this;
    },
    renderPicture: function(data) {
      this.$('.initials').text(data.initials);
      return this;
    },
    onInputKeydown: function(e) {
      if (e.keyCode == 13) this.saveInputToModel.apply(this, arguments);
    },
    saveInputToModel: function(e) {
      var $input = $(e.currentTarget),
          attr = $input.attr('name'),
          type = $input.attr('type'),
          value = $input.val();
      this.model.set(attr, value);
    }
  });
  $('document').ready(function() {
    Backbone.PlayerView.prototype.template = _.template($('#player-template').html());
  });

  Backbone.PlayersView = Backbone.View.extend({
    className: 'player',
    events: {
      'click .add-player': 'onAddPlayer'
    },
    initialize: function(options) {
      this.onResize = _.bind(_.debounce(this.onResize, 100), this);
      this.listenTo(this.model, 'change:editPlayers', this.render);
      this.listenTo(this.collection, 'add remove', this.render);
      $(window).on('resize', this.onResize);
    },
    onAddPlayer: function(e) {
      var model = new Backbone.PlayerModel();
      this.collection.add(model);
      var view = this.views[this.views.length-1];
      view.$el.css({
        backgroundColor: '#ddffdd'
      });
      $('html, body').animate({
        scrollTop: view.$el.offset().top
      }, 500);
      view.$el.animate({
        backgroundColor: 'transparent'
      }, 750);
    },
    remove: function() {
      $(window).off('resize', this.onResize);
      return Backbone.View.prototype.remove.apply(this, arguments);
    },
    onResize: function() {
      this.render();
    },
    render: function() {
      this.views || (this.views = []);
      for (var i = 0; i < this.views.length; i++) this.views[i].remove();
      this.views = [];
      this.$el.empty();

      var self = this,
          options = _.extend(this.model.toJSON(), {tabindex: 100});
      this.collection.each(function(model) {
        var view = new Backbone.PlayerView({
          model: model
        });
        self.$el.append(view.render(options).$el);
        self.views.push(view);
        options.tabindex += 100;
      });

      if (options.editPlayers) {
        var $add = $('<button class="btn btn-default add-player">' + _lang('addAPlayer') + '...</button>');
        this.$el.append($add);
        if (self.views.length) $add.css('width', self.views[0].$el.css('width'));
      }
      
      return this;
    }
  });

}.call(this));