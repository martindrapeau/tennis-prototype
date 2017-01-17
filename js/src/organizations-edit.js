(function() {

  Backbone.EditOrganizationView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form organization">
        <ul class="nav nav-tabs">
          <li <% if (tab == 'info') { %>class="active"<% } %> ><a href="#" class="info"><%=_lang('information')%></a></li>
          <li <% if (tab == 'logo') { %>class="active"<% } %> ><a href="#" class="logo"><%=_lang('logo')%></a></li>
        </ul>
        <br/>
        <div class="form-group tab-info">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group tab-logo upload-buttons">
          <a class="btn btn-primary btn-file">
            <span><%=_lang('upload')%></span>
            <input type="file" value="<%=_lang('chooseAnImage')%>" accept="image/*" />
          </a>
          <span class="file-name"></span>
        </div>
        <div class="form-group tab-logo">
          <div class="logo-container">
            <img src="<%=image%>" />
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
    },
    initialize: function(options) {
      Backbone.EditEntityView.prototype.initialize.apply(this, arguments);
      this.tab = options.tab || 'info';
      this.croppedImageBase64 = undefined;
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
      this.croppedImageBase64 = undefined;

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
      this.$('.file-name').text(image.name);
    },
    buildFormHtml: function() {
      return this.formTemplate(_.extend({tab: this.tab}, this.model.toRender()));
    },
    domToData: function() {
      var data = this.$form.serializeObject();
      if (this.croppedImageBase64) data.image = this.croppedImageBase64;
      return data;
    },
    onClickSave: function() {
      if (this.$croppie.is(':visible') && this.$input[0].files[0]) {
        this.$croppie.croppie('result').then(function(dataURI) {
          this.croppedImageBase64 = dataURI;
          return Backbone.EditEntityView.prototype.onClickSave.apply(this, arguments);
        }.bind(this));
      } else {
        return Backbone.EditEntityView.prototype.onClickSave.apply(this, arguments);
      }
    },
    onRender: function() {

      this.$croppie = this.$('.croppie-container');
      this.$input = $('input[type=file]');
      this.$logo = this.$('.logo-container');
      this.$message = this.$('.message');

      this.$croppie.croppie({
        enableExif: true,
        viewport: {
          width: 180,
          height: 180,
          type: 'circle'
        },
        boundary: {
          width: 260,
          height: 260
        }
      });

      this.renderTabs();
      this.delegateEvents();

      return this;
    },
    renderTabs: function() {
      if (this.$('.nav-tabs>li.active>a').hasClass('info')) {
        this.$('.tab-logo').hide();
        this.$('.tab-info').show();
      } else {
        this.$('.tab-info').hide();
        this.$('.tab-logo').show();
      }
    }
  });

}.call(this));