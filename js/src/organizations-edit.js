(function() {

  Backbone.EditOrganizationView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form match">
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
            <input type="file" name="file" id="upload-logo" value="<%=_lang('chooseAnImage')%>" accept="image/*" />
          </a>
        </div>
        <div class="form-group tab-logo croppie-container"></div>
      </form>
    `),
    title: _lang('organizationInformation'),
    events: {
      'click .nav-tabs a': 'onClickNavTab',
      'change input[name=file]': 'onFileUpload',
    },
    initialize: function(options) {
      Backbone.EditEntityView.prototype.initialize.apply(this, arguments);
      this.tab = options.tab || 'info';
    },
    onClickNavTab: function(e) {
      e.preventDefault();
      this.$('.nav-tabs>li').removeClass('active');
      $(e.target).closest('li').addClass('active');
      this.renderTabs();
    },
    onFileUpload: function(e) {
      console.log('onFileUpload', e);

      this.$('.croppie-container').croppie({
        enableExif: true,
        viewport: {
          width: 200,
          height: 200,
          type: 'circle'
        },
        boundary: {
          width: 300,
          height: 300
        }
      });

    },
    buildFormHtml: function() {
      return this.formTemplate(_.extend({tab: this.tab}, this.model.toRender()));
    },
    onRender: function() {

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