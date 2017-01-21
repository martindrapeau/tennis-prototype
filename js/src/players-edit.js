(function() {

  Backbone.EditPlayerView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form player">
        <ul class="nav nav-tabs">
          <li <% if (tab == 'info') { %>class="active"<% } %> ><a href="#" class="info"><%=_lang('information')%></a></li>
          <li <% if (tab == 'picture') { %>class="active"<% } %> ><a href="#" class="picture"><%=_lang('picture')%></a></li>
        </ul>
        <div class="form-group tab-info">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group has-feedback tab-info">
          <input name="email" type="email" placeholder="<%=_lang('email')%>" value="<%=email%>" class="form-control" autocomplete="off" />
          <span class="form-control-feedback"><i class="fa fa-fw fa-envelope"></i></span>
        </div>
        <div class="form-group has-feedback tab-info">
          <input name="phone" type="text" placeholder="<%=_lang('telephone')%>" value="<%=phone%>" class="form-control" autocomplete="off" />
          <span class="form-control-feedback"><i class="fa fa-fw fa-phone"></i></span>
        </div>
        <div class="form-group tab-picture upload-buttons clearfix">
          <a class="btn btn-primary btn-file">
            <span><i class="fa fa-fw fa-camera"></i></span>
            <input type="file" value="<%=_lang('chooseAnImage')%>" accept="image/*" />
          </a>
          <button type="button" class="btn btn-danger pull-right clear-image"><i class="fa fa-fw fa-trash"></i></button>
        </div>
        <div class="form-group tab-picture">
          <div class="picture">
            <div class="wrapper">
              <img src="<%=image%>" />
            </div>
          </div>
          <div class="croppie-container" style="display: none;"></div>
          <p class="message" style="display: none;"></p>
        </div>
      </form>
    `),
    title: _lang('player'),
    deleteConfirmMessage: _lang('deleteThisPlayer'),
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
        this.$picture.hide();
        this.$croppie.show();
        this.$croppie.croppie('bind', {
          url: e.target.result
        });
      }.bind(this);
      reader.readAsDataURL(image);
    },
    onClearImage: function(e) {
      this.imageSrc = undefined;
      this.$picture.find('img').remove();
      this.$picture.find('.wrapper').append('<img>');
      this.$picture.show();
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
      this.$picture = this.$('.picture');
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
        this.$('.tab-picture').hide();
        this.$('.tab-info').show();
      } else {
        this.$('.tab-info').hide();
        this.$('.tab-picture').show();
      }
    }
  });

}.call(this));