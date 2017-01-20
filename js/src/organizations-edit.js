(function() {

  Backbone.EditOrganizationView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form organization">
        <ul class="nav nav-tabs">
          <li <% if (tab == 'info') { %>class="active"<% } %> ><a href="#" class="info"><%=_lang('information')%></a></li>
          <li <% if (tab == 'logo') { %>class="active"<% } %> ><a href="#" class="logo"><%=_lang('logo')%></a></li>
          <li <% if (tab == 'address') { %>class="active"<% } %> ><a href="#" class="address"><%=_lang('address')%></a></li>
        </ul>
        <br/>
        <div class="form-group tab-info">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group tab-address">
          <input name="address" type="text" placeholder="<%=_lang('address')%>" value="<%=address%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group tab-address">
          <input name="city" type="text" placeholder="<%=_lang('city')%>" value="<%=city%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group tab-address">
          <%=Backbone.stateSelectTemplate({name: 'state', value: state})%>
        </div>
        <div class="form-group tab-address">
          <input name="zip" type="text" placeholder="<%=_lang('zip')%>" value="<%=zip%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group tab-address">
          <%=Backbone.countrySelectTemplate({name: 'country', value: country})%>
        </div>
        <div class="form-group tab-logo upload-buttons clearfix">
          <a class="btn btn-primary btn-file">
            <span><i class="fa fa-fw fa-camera"></i></span>
            <input type="file" value="<%=_lang('chooseAnImage')%>" accept="image/*" />
          </a>
          <button type="button" class="btn btn-danger pull-right clear-image"><i class="fa fa-fw fa-trash"></i></button>
        </div>
        <div class="form-group tab-logo">
          <div class="brand">
            <div class="wrapper">
              <img src="<%=image%>" />
            </div>
          </div>
          <div class="croppie-container" style="display: none;"></div>
          <p class="message" style="display: none;"></p>
        </div>
      </form>
    `),
    title: _lang('organization'),
    events: {
      'click .nav-tabs a': 'onClickNavTab',
      'change input[type=file]': 'onFileUpload',
      'click .clear-image': 'onClearImage'
    },
    initialize: function(options) {
      Backbone.EditEntityView.prototype.initialize.apply(this, arguments);
      this.tab = options.tab || 'info';
      this.imageSrc = this.model.get('image');
    },
    onClickNavTab: function(e) {
      e.preventDefault();
      this.$('.nav-tabs>li').removeClass('active');
      $(e.target).closest('li').addClass('active');
      this.renderTabs();
    },
    onFileUpload: function(e) {
      e.preventDefault();
      var image = this.$input[0].files[0];

      if (!image.type.match('image.*')) {
        this.$message.html(_lang('fileMustBeAnImage')).removeClass('text-info text-success').addClass('text-danger').fadeIn();
        return;
      }

      this.$message.html(_lang('pleaseWait')).removeClass('text-success text-danger').addClass('text-info').fadeIn();

      var reader = new FileReader();
      reader.onload = function(e) {
        this.$message.empty().hide();
        this.$logo.hide();
        this.$croppie.show();
        this.$croppie.croppie('bind', {
          url: e.target.result
        });
      }.bind(this);
      reader.readAsDataURL(image);
    },
    onClearImage: function(e) {
      this.imageSrc = undefined;
      this.$logo.find('img').remove();
      this.$logo.find('.wrapper').append('<img>');
      this.$logo.show();
      this.$croppie.hide();
    },
    onClickSave: function() {
      if (this.$croppie.is(':visible') && this.$input[0].files[0]) {
        this.$croppie.croppie('result', {type:'canvas', size: 'viewport'}).then(function(dataURI) {
          this.imageSrc = dataURI;
          return Backbone.EditEntityView.prototype.onClickSave.apply(this, arguments);
        }.bind(this));
      } else {
        return Backbone.EditEntityView.prototype.onClickSave.apply(this, arguments);
      }
    },
    domToData: function() {
      var data = this.$form.serializeObject();
      data.image = this.imageSrc;
      return data;
    },
    buildFormHtml: function() {
      return this.formTemplate(_.extend({tab: this.tab}, this.model.toRender()));
    },
    onRender: function() {
      this.$croppie = this.$('.croppie-container');
      this.$input = $('input[type=file]');
      this.$logo = this.$('.brand');
      this.$message = this.$('.message');

      this.$croppie.croppie({
        enableExif: true,
        viewport: {
          width: 180,
          height: 180,
          type: 'square'
        },
        boundary: {
          width: 260,
          height: 260
        }
      });

      this.$('select.selectpicker').selectpicker({
        iconBase: 'fa',
        showTick: true,
        tickIcon: "fa-check"
      });

      this.renderTabs();
      this.delegateEvents();

      return this;
    },
    renderTabs: function() {
      this.$('.tab-info,.tab-logo,.tab-address').hide();
      if (this.$('.nav-tabs>li.active>a').hasClass('info')) {
        this.$('.tab-info').show();
      } else if (this.$('.nav-tabs>li.active>a').hasClass('logo')) {
        this.$('.tab-logo').show();
      } else {
        this.$('.tab-address').show();
      }
    }
  });

}.call(this));