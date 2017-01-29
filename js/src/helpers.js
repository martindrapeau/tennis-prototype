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
  _.lowerCaseFirst = function(name) {
    if (typeof name != 'string' || !name.length) return name;
    return name.substr(0, 1).toLowerCase() + name.substr(1);
  };
  _.compareDateToRange = function(date, start, end, unit) {
    unit || (unit = 'day');
    if (moment(date).isBefore(start, unit))
      return 1;
    else if (moment(date).isAfter(end, unit))
      return -1;
    return 0;
  }
  _.compareDateToRangeTitle = function(date, start, end, unit) {
    switch (_.compareDateToRange.apply(this, arguments)) {
      case -1:
        return _lang('passed');
      case 1:
        return _lang('upcoming');
    }
    return _lang('ongoing');
  }

  _.extend(Backbone.Model.prototype, {
    toRender: function() {
      return this.toJSON();
    }
  });

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

  _.extend(Backbone.Collection.prototype, {
    // Source: http://stackoverflow.com/questions/11795266/find-closest-date-in-array-with-javascript#answer-11826631
    getListsOfModelsAfterBeforeDate: function(testDate, dateAttr, models) {
      if (typeof testDate == 'string') testDate = new Date(testDate);
      models || (models = this.models);
      var before = [],
          after = [],
          max = models.length;
      for (var i = 0; i < max; i++) {
        var id = models[i].id,
            arrDate = new Date(models[i].get(dateAttr) || '3000-01-01'),
            diff = (arrDate - testDate) / (3600 * 24 * 1000);
        if (diff > 0) {
            before.push({diff: diff, id: id});
        } else {
            after.push({diff: diff, id: id});
        }
      }
      before.sort(function(a, b) {
        if(a.diff < b.diff) {
            return -1;
        }
        if(a.diff > b.diff) {
            return 1;
        }
        return 0;
      });

      after.sort(function(a, b) {
        if(a.diff > b.diff) {
            return -1;
        }
        if(a.diff < b.diff) {
            return 1;
        }
        return 0;
      });
      return {before: _.pluck(before, 'id'), after: _.pluck(after, 'id')};
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
              <a class="btn btn-danger btn-sm confirm"><%=confirmLabel%></a>
              <a class="btn btn-default btn-sm cancel"><%=cancelLabel%></a>
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
    domToData: function() {
      // Override this to serialize the form yourself
      return this.$form.serializeObject();
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
          actionLabel: '<i class="fa fa-fw fa-trash"></i>',
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
      this.model.set(this.domToData());
      if (typeof this.onSave == 'function') this.onSave();
    }
  });

  // Helper templates to generate select controls in forms. Uses Bootstrap's selectpicker plugin.
  // Don't forget to call the jQuery plugin method after in onRender to activate.
  // $('.selectpicker').selectpicker()

  // Generates a select to choose state and province
  // Call with {name: <attribute name>, value: <selected value>} where value is the selected state or null.
  Backbone.stateSelectTemplate = _.template(`
    <select class="form-control selectpicker" name="<%=name%>" title="<%=_lang('state')%>">
      <option value=""></option>
      <optgroup label="Canada">
        <% if (Backbone.default == 'en') { %>
        <option <%if(value=="AB"){%>selected<%}%> value="AB">Alberta</option>
        <option <%if(value=="BC"){%>selected<%}%> value="BC">British Columbia</option>
        <option <%if(value=="LB"){%>selected<%}%> value="LB">Labrador</option>
        <option <%if(value=="MB"){%>selected<%}%> value="MB">Manitoba</option>
        <option <%if(value=="NB"){%>selected<%}%> value="NB">New Brunswick</option>
        <option <%if(value=="NF"){%>selected<%}%> value="NF">Newfoundland</option>
        <option <%if(value=="NS"){%>selected<%}%> value="NS">Nova Scotia</option>
        <option <%if(value=="NU"){%>selected<%}%> value="NU">Nunavut</option>
        <option <%if(value=="NW"){%>selected<%}%> value="NW">North West Terr.</option>
        <option <%if(value=="ON"){%>selected<%}%> value="ON">Ontario</option>
        <option <%if(value=="PE"){%>selected<%}%> value="PE">Prince Edward Is.</option>
        <option <%if(value=="QC"){%>selected<%}%> value="QC">Quebec</option>
        <option <%if(value=="SK"){%>selected<%}%> value="SK">Saskatchewen</option>
        <option <%if(value=="YU"){%>selected<%}%> value="YU">Yukon</option>
      <% } else { %>
        <option <%if(value=="AB"){%>selected<%}%> value="AB">Alberta</option>
        <option <%if(value=="BC"){%>selected<%}%> value="BC">Colombie Britanique</option>
        <option <%if(value=="LB"){%>selected<%}%> value="LB">Labrador</option>
        <option <%if(value=="MB"){%>selected<%}%> value="MB">Manitoba</option>
        <option <%if(value=="NB"){%>selected<%}%> value="NB">Nouveau Brunswick</option>
        <option <%if(value=="NF"){%>selected<%}%> value="NF">Terr Neuve</option>
        <option <%if(value=="NS"){%>selected<%}%> value="NS">Nouvelle Écosse</option>
        <option <%if(value=="NU"){%>selected<%}%> value="NU">Nunavut</option>
        <option <%if(value=="NW"){%>selected<%}%> value="NW">Territoire du Nord Ouest</option>
        <option <%if(value=="ON"){%>selected<%}%> value="ON">Ontario</option>
        <option <%if(value=="PE"){%>selected<%}%> value="PE">Îles du Prince Edward</option>
        <option <%if(value=="QC"){%>selected<%}%> value="QC">Québec</option>
        <option <%if(value=="SK"){%>selected<%}%> value="SK">Saskatchewen</option>
        <option <%if(value=="YU"){%>selected<%}%> value="YU">Yukon</option>
      <% } %>
      </optgroup>
      <optgroup label="United States">
        <option <%if(value=="AL"){%>selected<%}%> value="AL">Alabama</option>
        <option <%if(value=="AK"){%>selected<%}%> value="AK">Alaska</option>
        <option <%if(value=="AZ"){%>selected<%}%> value="AZ">Arizona</option>
        <option <%if(value=="AR"){%>selected<%}%> value="AR">Arkansas</option>
        <option <%if(value=="CA"){%>selected<%}%> value="CA">California</option>
        <option <%if(value=="CO"){%>selected<%}%> value="CO">Colorado</option>
        <option <%if(value=="CT"){%>selected<%}%> value="CT">Connecticut</option>
        <option <%if(value=="DC"){%>selected<%}%> value="DC">Dist. Columbia</option>
        <option <%if(value=="DE"){%>selected<%}%> value="DE">Delaware</option>
        <option <%if(value=="FL"){%>selected<%}%> value="FL">Florida</option>
        <option <%if(value=="GA"){%>selected<%}%> value="GA">Georgia</option>
        <option <%if(value=="HI"){%>selected<%}%> value="HI">Hawaii</option>
        <option <%if(value=="ID"){%>selected<%}%> value="ID">Idaho</option>
        <option <%if(value=="IL"){%>selected<%}%> value="IL">Illinois</option>
        <option <%if(value=="IN"){%>selected<%}%> value="IN">Indiana</option>
        <option <%if(value=="IA"){%>selected<%}%> value="IA">Iowa</option>
        <option <%if(value=="KS"){%>selected<%}%> value="KS">Kansas</option>
        <option <%if(value=="KY"){%>selected<%}%> value="KY">Kentucky</option>
        <option <%if(value=="LA"){%>selected<%}%> value="LA">Louisiana</option>
        <option <%if(value=="ME"){%>selected<%}%> value="ME">Maine</option>
        <option <%if(value=="MD"){%>selected<%}%> value="MD">Maryland</option>
        <option <%if(value=="MA"){%>selected<%}%> value="MA">Massachusetts</option>
        <option <%if(value=="MI"){%>selected<%}%> value="MI">Michigan</option>
        <option <%if(value=="MN"){%>selected<%}%> value="MN">Minnesota</option>
        <option <%if(value=="MS"){%>selected<%}%> value="MS">Mississippi</option>
        <option <%if(value=="MO"){%>selected<%}%> value="MO">Missouri</option>
        <option <%if(value=="MT"){%>selected<%}%> value="MT">Montana</option>
        <option <%if(value=="NE"){%>selected<%}%> value="NE">Nebraska</option>
        <option <%if(value=="NV"){%>selected<%}%> value="NV">Nevada</option>
        <option <%if(value=="NH"){%>selected<%}%> value="NH">New Hampshire</option>
        <option <%if(value=="NJ"){%>selected<%}%> value="NJ">New Jersey</option>
        <option <%if(value=="NM"){%>selected<%}%> value="NM">New Mexico</option>
        <option <%if(value=="NY"){%>selected<%}%> value="NY">New York</option>
        <option <%if(value=="NC"){%>selected<%}%> value="NC">North Carolina</option>
        <option <%if(value=="ND"){%>selected<%}%> value="ND">North Dakota</option>
        <option <%if(value=="OH"){%>selected<%}%> value="OH">Ohio</option>
        <option <%if(value=="OK"){%>selected<%}%> value="OK">Oklahoma</option>
        <option <%if(value=="OR"){%>selected<%}%> value="OR">Oregon</option>
        <option <%if(value=="PA"){%>selected<%}%> value="PA">Pennsylvania</option>
        <option <%if(value=="RI"){%>selected<%}%> value="RI">Rhode Island</option>
        <option <%if(value=="SC"){%>selected<%}%> value="SC">South Carolina</option>
        <option <%if(value=="SD"){%>selected<%}%> value="SD">South Dakota</option>
        <option <%if(value=="TN"){%>selected<%}%> value="TN">Tennessee</option>
        <option <%if(value=="TX"){%>selected<%}%> value="TX">Texas</option>
        <option <%if(value=="UT"){%>selected<%}%> value="UT">Utah</option>
        <option <%if(value=="VT"){%>selected<%}%> value="VT">Vermont</option>
        <option <%if(value=="VA"){%>selected<%}%> value="VA">Virginia</option>
        <option <%if(value=="WA"){%>selected<%}%> value="WA">Washington</option>
        <option <%if(value=="WV"){%>selected<%}%> value="WV">West Virginia</option>
        <option <%if(value=="WI"){%>selected<%}%> value="WI">Wisconsin</option>
        <option <%if(value=="WY"){%>selected<%}%> value="WY">Wyoming</option>
      </optgroup>
    </select>
  `);

  // Generates a select to choose a country
  // Call with {name: <attribute name>, value: <selected value>} where value is the selected state or null.
  Backbone.countrySelectTemplate = _.template(`
    <select class="form-control selectpicker" name="<%=name%>" title="<%=_lang('country')%>">
      <option value=""></option>
      <option value="CA" <%if(value=='CA'){%>selected<%}%> >Canada</option>
      <option value="US" <%if(value=='US'){%>selected<%}%> >United States</option>
    </select>
  `);
}.call(this));