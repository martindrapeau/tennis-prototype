(function() {

  Backbone.TopMenuView = Backbone.View.extend({
    template: _.template(`
      <button type="button" class="btn navbar-toggle pull-left" data-toggle="offcanvas" data-recalc="false" data-target=".navmenu" data-canvas=".canvas">
        <i class="fa fa-fw fa-bars"></i>
      </button>
    <% if (program) { %>
      <div class="navbar-brand"><%=program.name%></div>
      <% if (view == 'program') { %>
        <button id="#program-menu" type="button" class="btn pull-right dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i class="fa fa-fw fa-ellipsis-h"></i></button>
        <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="program-menu">
          <li><a href="#" class="edit-program"><i class="fa fa-fw fa-pencil"></i> <%=_lang('changeTheName')%></a></li>
          <li><a href="#" class="delete-program"><i class="fa fa-fw fa-trash"></i> <%=_lang('delete')%></a></li>
        </ul>
      <% } %>
    <% } else { %>
      <% if (view == 'players') { %>
        <div class="navbar-brand"><%=_lang('players')%></div>
      <% } %>
    <% } %>
    `),
    initialize: function(options) {
      this.programCollection = options.programCollection;
      this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      var data = this.model.toJSON(),
          program = this.programCollection.get(data.program_id);
      data.program = program ? program.toJSON() : null;

      this.$el.html(this.template(data));
      this.onRender();
      
      return this;
    },
    onRender: function() {
      return this;
    }
  });

}.call(this));