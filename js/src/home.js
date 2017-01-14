(function() {

  Backbone.HomeView = Backbone.View.extend({
    template: _.template(`
      <div class="wrapper">
        <div class="center">
          <h1><%=_lang('appName')%></h1>
          <br/>
          <% if (admin_id) { %>
            <p class="lead"><%=_lang('account')%>: <%=admin.name%></p>
            <p><a href="#" class="change-account"><i class="fa fa-fw fa-user-circle"></i> <%=_lang('changeAccount')%></a></p>
            <br/>
            <form class="organization form-inline">
              <span class="lead"><%=_lang('organization')%>: </span>
              <div class="btn-group">
                <button class="btn btn-default dropdown-toggle" type="button" id="choose-organization" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                  <%=organization_id == null ? _lang('pleaseChoose') : organization.name%>
                  <span class="caret"></span>
                </button>
                <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="choose-organization">
                  <% for (var i = 0; i < organizations.length; i++) { %>
                    <li class="<%=organizations[i].id == organization_id ? 'active' : ''%>"><a href="#" class="change-organization" data-id="<%=JSON.stringify(organizations[i].id)%>"><%=organizations[i].name%></a></li>
                  <% } %>
                  <li role="separator" class="divider"></li>
                  <li><a href="#" class="add-organization"><i class="fa fa-fw fa-plus"></i> <%=_lang('addOrganization')%></a></li>
                </ul>
              </div>
            </form>
          <% } else { %>
            <form class="login">
              <h3><%=_lang('login')%></h3>
              <div class="form-group">
                <input class="form-control" type="email" name="email" placeholder="<%=_lang('email')%>" />
              </div>
              <div class="form-group">
                <input class="form-control" type="password" name="password" placeholder="<%=_lang('password')%>" />
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-danger"><%=_lang('submit')%></button>
              </div>
              <p><a href="#" class="show-signup"><%=_lang('createAnAccount')%> <i class="fa fa-fw fa-arrow-right"></i></a></p>
            </form>
            <form class="signup" style="display: none;">
              <h3><%=_lang('signup')%></h3>
              <div class="form-group">
                <input class="form-control" type="email" name="email" placeholder="<%=_lang('email')%>" />
              </div>
              <div class="form-group">
                <input class="form-control" type="password" name="password" placeholder="<%=_lang('password')%>" />
              </div>
              <div class="form-group">
                <input class="form-control" type="password" name="confirm" placeholder="<%=_lang('confirm')%>" />
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-danger"><%=_lang('submit')%></button>
              </div>
              <p><a href="#" class="show-login"><%=_lang('loginToAccount')%> <i class="fa fa-fw fa-arrow-right"></i></a></p>
            </form>
          <% } %>
          <p>
            <br/><br/><br/><br/>
            <button class="btn btn-danger clear">Clear</button>
          </p>
        </div>
      </div>
    `),
    className: 'home',
    events: {
      'click a.show-signup': 'onShowSignup',
      'click a.show-login': 'onShowLogin',
      'click a.change-account': 'onChangeAccount',
      'click a.change-organization': 'onChangeOrganization',
      'click a.add-organization': 'onAddOrganization',
      'click .clear': 'onClickClear'
    },
    initialize: function(options) {
      this.session = options.session;
      this.organizations = options.organizations;
      this.listenTo(this.model, 'change', this.render);
    },
    onShowSignup: function(e) {
      e.preventDefault();
      this.$('form.login').hide();
      this.$('form.signup').show();
    },
    onShowLogin: function(e) {
      e.preventDefault();
      this.$('form.login').show();
      this.$('form.signup').hide();
    },
    onChangeAccount: function(e) {
      e.preventDefault();
      this.model.save({session_id: undefined, admin_id: undefined, organization_id: undefined});
    },
    onChangeOrganization: function(e) {
      e.preventDefault();
      var id = $(e.currentTarget).data('id');
      this.model.save({organization_id: id});
    },
    onAddOrganization: function(e) {
      e.preventDefault();
      console.log('onAddOrganization');
    },
    onClickClear: function(e) {
      localStorage.clear();
      window.location.reload();
    },
    toRender: function() {
      var organization = this.organizations.get(this.model.get('organization_id'));
      return _.extend(this.model.toJSON(), {
        admin: this.model.get('admin_id') ? this.session.pick('name', 'email') : null,
        organizations: this.organizations.toJSON(),
        organization: organization ? organization.toJSON() : null
      });
    },
    render: function() {
      var data = this.toRender();
      this.$el.html(this.template(data));
    	return this;
    }
  });

}.call(this));