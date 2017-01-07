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

  // Close popovers when clicking outside
  // http://stackoverflow.com/questions/11703093/how-to-dismiss-a-twitter-bootstrap-popover-by-clicking-outside
  $(document).on('click', function (e) {
    $('[data-toggle="popover"],[data-original-title]').each(function () {
        //the 'is' for buttons that trigger popups
        //the 'has' for icons within a button that triggers a popup
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {                
            (($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false  // fix for BS 3.3.6
        }

    });
  });

  Backbone.ConfirmDeleteInlineFormControl = Backbone.View.extend({
    template: _.template(`
      <div class="popover-markup"> 
        <a class="action btn btn-default"><span class="text-danger"><%=actionLabel%></span></a>
        <div class="content hide">
          <div class="inline-form confirm">
            <div class="form-group">
              <span><%=message%></span>
              <a class="btn btn-primary btn-sm confirm"><%=confirmLabel%></a>
              <a class="btn btn-primary btn-sm cancel"><%=cancelLabel%></a>
            </div>
          </div>
          <div class="validation-failed-message text-danger"></div>
        </div>
      </div>
    `),
    events: {
      'click a.confirm': 'onConfirm',
      'click a.cancel': 'onCancel'
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
      this.$action = this.$('a.action');
      this.$content = this.$('.content');
      this.$confirmGroup = this.$('.inline-form.confirm');
      this.$validationFailedMessage = this.$('.validation-failed-message');

      this.$action.popover({
        placement: 'top',
        html: true,
        content: this.onAction.bind(this)
      });

      return this;
    },
    onAction: function() {
      if (typeof this.onValidate == 'function') {
        var result = this.onValidate();
        if (result) {
          this.$validationFailedMessage.html(result);
          this.$validationFailedMessage.show();
          this.$confirmGroup.hide();
          return this.$content.html();
        }
      }
      this.$validationFailedMessage.hide();
      this.$confirmGroup.show();
      return this.$content.html();
    },
    onConfirm: function(e) {
      e.preventDefault();
      this.$action.popover('hide');
      if (typeof this.callback == 'function') this.callback();
    },
    onCancel: function(e) {
      e.preventDefault();
      this.$action.popover('hide');
    }
  });

  Backbone.EditEntityView = Backbone.View.extend({
    formTemplate: _.template(`
      <form class="bootbox-form">
        <div class="form-group">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
      </form>
    `),
    title: 'Entity information',
    deleteConfirmMessage: 'Delete this entity?',
    onValidateBeforeDelete: function() {
      // This gets called before deletion (if you provided an onDelete callback).
      // Override this function and return a string to prevent deletion in certain conditions.
      // Return a falsy value to allow deletion.
      return false;
    },
    onRender: function() {
      // Override to provide extra rendering logic. Make sure to return this.
      return this;
    },
    buildFormHtml: function() {
      // Override to provide your own HTML generation code for the form
      return this.formTemplate(this.model.toJSON());
    },
    initialize: function(options) {
      // Callback for when the user saves the form
      this.onSave = options.onSave;
      // Provide this callback if you want a delete button. Omit it not to have one.
      this.onDelete = options.onDelete;
    },
    render: function() {
      bootbox.dialog({
        title: this.title,
        message: this.buildFormHtml(),
        size: 'small',
        buttons: {
          cancel: {
            label: _lang('cancel')
          },
          confirm: {
            label: _lang('save'),
            callback: this.onClickSave.bind(this)
          }
        }
      });
      this.$el = $('.bootbox.modal');
      this.$form = this.$('form');

      if (typeof this.onDelete == 'function') {
        this.$('.modal-footer').prepend(new Backbone.ConfirmDeleteInlineFormControl({
          className: 'pull-left',
          message: this.deleteConfirmMessage,
          onValidate: this.onValidateBeforeDelete.bind(this),
          callback: this.onClickDelete.bind(this),
          actionLabel: '<i class="fa fa-fw fa-trash"></i> ' + _lang('delete'),
          confirmLabel: _lang('yes'),
          cancelLabel: _lang('no')
        }).render().$el);
      }

      return this.onRender();
    },
    onClickDelete: function() {
      bootbox.hideAll();
      this.onDelete();
    },
    onClickSave: function() {
      bootbox.hideAll();
      var data = this.$form.serializeObject();
      this.model.set(data);
      if (typeof this.onSave == 'function') this.onSave();
    }
  });

}.call(this));