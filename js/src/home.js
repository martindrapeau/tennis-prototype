(function() {

  Backbone.HomeView = Backbone.View.extend({
    template: _.template(`
      <div class="wrapper">
        <div class="center">
          <h1><%=_lang('appName')%></h1>
          <br/>
          <% if (admin_id) { %>
            <p class="lead">
              <span class="account"><%=_lang('account')%>: John Doe</span>
            </p>
            <p>
              <a href="#" class="change-account"><i class="fa fa-fw fa-check-circle"></i> <%=_lang('changeAccount')%></a>
            </p>
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
      'click .clear': 'onClickClear'
    },
    initialize: function(options) {
      this.session = options.session;
      this.organizations = options.organizations;
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
    },
    onClickClear: function(e) {
      localStorage.clear();
      window.location.reload();
    },
    render: function() {
      var data = this.model.toJSON();
      this.$el.html(this.template(data));
    	return this;
    }
  });

}.call(this));