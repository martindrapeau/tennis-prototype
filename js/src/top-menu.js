(function() {

  Backbone.TopMenuView = Backbone.View.extend({
    template: _.template(`
      <button type="button" class="btn navbar-toggle pull-left" data-toggle="offcanvas" data-recalc="false" data-target=".navmenu" data-canvas=".canvas">
        <i class="fa fa-fw fa-bars"></i>
      </button>
    <% if (view == 'organization') { %>
      <button id="#organization-menu" type="button" class="btn pull-right dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i class="fa fa-fw fa-ellipsis-h"></i></button>
      <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="program-menu">
        <li><a href="#" class="delete-organization"><i class="fa fa-fw fa-trash"></i> <%=_lang('delete')%></a></li>
      </ul>
    <% } else if (view == 'program') { %>
      <div class="navbar-brand"><%=program.name%></div>
      <button id="#program-menu" type="button" class="btn pull-right dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i class="fa fa-fw fa-ellipsis-h"></i></button>
      <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="program-menu">
        <li><a href="#" class="edit-program"><i class="fa fa-fw fa-pencil"></i> <%=_lang('changeTheName')%></a></li>
        <li><a href="#" class="add-category"><i class="fa fa-fw fa-plus"></i> <%=_lang('addCategory')%></a></li>
        <li><a href="#" class="add-round"><i class="fa fa-fw fa-plus"></i> <%=_lang('addRound')%></a></li>
        <li><a href="#" class="delete-program"><i class="fa fa-fw fa-trash"></i> <%=_lang('delete')%></a></li>
      </ul>
    <% } else if (view == 'matches') { %>
      <div class="navbar-brand"><%=program.name%></div>
      <button id="#matches-menu" type="button" class="btn pull-right dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i class="fa fa-fw fa-ellipsis-h"></i></button>
      <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="matches-menu">
        <li><a href="#" class="add-match"><i class="fa fa-fw fa-plus"></i> <%=_lang('addAMatch')%></a></li>
      </ul>
    <% } else if (view == 'rankings') { %>
      <div class="navbar-brand"><%=program.name%></div>
    <% } else if (view == 'players') { %>
      <div class="navbar-brand"><%=_lang('players')%></div>
      <button id="#players-menu" type="button" class="btn pull-right dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i class="fa fa-fw fa-ellipsis-h"></i></button>
      <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="players-menu">
        <li><a href="#" class="add-player"><i class="fa fa-fw fa-plus"></i> <%=_lang('addAPlayer')%></a></li>
        <li><a href="#" class="import-players"><i class="fa fa-fw fa-upload"></i> <%=_lang('importPlayers')%></a></li>
        <li><a href="#" class="export-all-players"><i class="fa fa-fw fa-share"></i> <%=_lang('exportAllPlayers')%></a></li>
      </ul>
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