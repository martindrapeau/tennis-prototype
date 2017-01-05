(function() {

  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
  
  _.shortName = function(name) {
    var pieces = name.split(/\s+/);
    return _.map(pieces, function(v, i) {
      return i+1 < pieces.length ? v[0] : v;
    }).join(' ');
  };
  _.initials = function(name) {
    var pieces = name.split(/\s+/);
    return _.map(pieces, function(v, i) {
      return v[0].toUpperCase();
    }).join('');
  };

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

  Backbone.ConfirmDeleteInlineFormControl = Backbone.View.extend({
    template: _.template(`
      <div class="form-group action">
        <button type="button" class="btn btn-danger action"><%=actionLabel%></button>
      </div>
      <div class="inline-form confirm">
        <div class="form-group">
          <span><%=message%></span>
          <button type="button" class="btn btn-primary btn-sm confirm"><%=confirmLabel%></button>
          <button type="button" class="btn btn-primary btn-sm cancel"><%=cancelLabel%></button>
        </div>
      </div>
      <div class="validation-failed-message text-danger"></div>
    `),
    events: {
      'click button.action': 'onAction',
      'click button.confirm': 'onConfirm',
      'click button.cancel': 'onCancel'
    },
    initialize: function(options) {
      this.message = options.message || 'Are you sure?';
      this.onValidate = options.onValidate;
      this.callback = options.callback;
      this.actionLabel = options.actionLabel || 'Action';
      this.confirmLabel = options.confirmLabel || 'Confirm';
      this.cancelLabel = options.cancelLabel || 'Cancel';
    },
    render: function() {
      this.$el.html(this.template({
        message: this.message,
        actionLabel: this.actionLabel,
        confirmLabel: this.confirmLabel,
        cancelLabel: this.cancelLabel
      }));
      this.$actionGroup = this.$('.form-group.action');
      this.$confirmGroup = this.$('.inline-form.confirm');
      this.$validationFailedMessage = this.$('.validation-failed-message');
      this.$confirmGroup.hide();
      this.$validationFailedMessage.hide();
      return this;
    },
    onAction: function() {
      if (typeof this.onValidate == 'function') {
        var result = this.onValidate();
        if (result) {
          this.$actionGroup.fadeOut(function() {
            this.$validationFailedMessage.html(result).fadeIn();
          }.bind(this));
          return;
        }
      }
      this.$actionGroup.fadeOut(function() {
        this.$confirmGroup.fadeIn();
      }.bind(this));
    },
    onConfirm: function() {
      if (typeof this.callback == 'function') this.callback();
    },
    onCancel: function() {
      this.$confirmGroup.fadeOut(function() {
        this.$actionGroup.fadeIn();
      }.bind(this));
    }
  });

}.call(this));