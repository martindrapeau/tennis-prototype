(function() {

  Backbone.HomeView = Backbone.View.extend({
    template: _.template(`
      <div class="wrapper">
        <div class="center">
          <h1><%=_lang('appName')%></h1>
          <br/>
          <% if (admin_id) { %>
            <p class="lead"><%=_lang('welcome')%> <%=admin.name%>!</p>
            <p><a href="#" class="change-account"><i class="fa fa-fw fa-user-circle"></i> <%=_lang('changeAccount')%></a></p>
            <br/>
            <p class="lead">
              <% if (organization_id) { %>
                <%=_lang('managingThisOrganization')%>
              <% } else if (organizations.length == 0) { %>
                <%=_lang('createAnOrganization')%>
              <% } else {%>
                <%=_lang('pleaseChooseAnOrganization')%>
              <% } %>
            </p>
            <% if (organizations.length) { %>
              <form class="organization">
                <div class="form-group btn-group">
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
                <% if (organization_id) { %>
                  <br/><br/>
                  <p class="lead"><%=_lang('clickOnMenuToNavigate')%></p>
                <% } %>
              </form>
            <% } else {%>
              <p><button class="btn btn-danger add-organization"><i class="fa fa-fw fa-plus"></i> <%=_lang('addOrganization')%></button></p>
            <% } %>
          <% } else { %>
            <form class="login">
              <h3><%=_lang('login')%></h3>
              <div class="form-group">
                <input class="form-control" type="email" name="email" placeholder="<%=_lang('email')%>" />
              </div>
              <div class="form-group">
                <input class="form-control" type="password" name="password" placeholder="<%=_lang('password')%>" />
              </div>
              <div class="form-group submit">
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
              <div class="form-group submit">
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
      'click .add-organization': 'onAddOrganization',
      'submit form.login': 'onLogin',
      'submit form.signup': 'onSignup',
      'click .clear': 'onClickClear'
    },
    initialize: function(options) {
      this.session = options.session;
      this.organizations = options.organizations;
      this.listenTo(this.model, 'change', this.render);

      // TEMP LOGIN STUFF
      this.sessions = new Backbone.SessionCollection();
      this.sessions.fetch();
    },
    onShowSignup: function(e) {
      e.preventDefault();
      this.$login.hide();
      this.$signup.show();
    },
    onShowLogin: function(e) {
      e.preventDefault();
      this.$login.show();
      this.$signup.hide();
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
    onLogin: function(e) {
      e.preventDefault();

      var credentials = this.$login.serializeObject(),
          session = this.sessions.findWhere(credentials);

      if (!session) {
        this.render();
        this.$signup.hide();
        this.$login.show();
        this.$login.find('.form-group.submit').before('<p class="lead text-center">' + _lang('invalidEmailOrPasswrd') + '</p>');
        return;
      }

      this.model.save({session_id: session.id});
    },
    onSignup: function(e) {
      e.preventDefault();
      this.render();
      this.$login.hide();
      this.$signup.show();
      this.$signup.find('.form-group.submit').before('<p class="lead text-center">Not yet implemented</p>');
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
    render: function(options) {
      var data = this.toRender();
      this.$el.html(this.template(data));
      this.$login = this.$('form.login');
      this.$signup = this.$('form.signup');
    	return this;
    }
  });

}.call(this));