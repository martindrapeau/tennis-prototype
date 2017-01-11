(function() {

  Backbone.SettingsView = Backbone.View.extend({
    template: _.template(`
      <div class="wrapper">
        <div class="center">
          <h1><%=_lang('settings')%></h1>
          <br/>
          <p class="lead">
            <span class="account"><%=_lang('account')%>: John Doe</span>
          </p>
          <p>
            <a href="#" class="change-account"><i class="fa fa-fw fa-check-circle"></i> <%=_lang('changeAccount')%></a>
          </p>
          <p>
            <button class="btn btn-danger clear">Clear</button>
          </p>
        </div>
      </div>
    `),
    className: 'home',
    events: {
      'click a.change-account': 'onChangeAccount',
      'click .clear': 'onClickClear'
    },
    onChangeAccount: function(e) {
      e.preventDefault();
    },
    onClickClear: function(e) {
      localStorage.clear();
      window.location.reload();
    },
    render: function() {
      this.$el.html(this.template());
    	return this;
    }
  });

}.call(this));