(function() {

  Backbone.EditMatchView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form match">
        <div class="form-group type">
          <div class="btn-group" data-toggle="buttons">
            <label class="btn btn-default <% if (type == Backbone.SINGLES) { %>active<% } %> />">
              <input type="radio" name="type" value="<%=Backbone.SINGLES%>" <% if (type == Backbone.SINGLES) { %>checked="checked"<% } %> autocomplete="off" /> <%=_lang('singles')%>
            </label>
            <label class="btn btn-default <% if (type == Backbone.DOUBLES) { %>active<% } %> />">
              <input type="radio" name="type" value="<%=Backbone.DOUBLES%>" <% if (type == Backbone.DOUBLES) { %>checked="checked"<% } %> autocomplete="off" /> <%=_lang('doubles')%>
            </label> 
          </div>
        </div>
        <label><%=_lang('playersAndScore')%></label>
        <div class="form-group players clearfix">
          <div class="vs">vs</div>
          <div class="user pull-left"></div>
          <div class="other pull-right"></div>
        </div>
        <div class="form-group user score">
          <span class="marker">&nbsp;</span>
          <input class="form-control" type="number" pattern="[0-9]*" inputmode="numeric" name="user_set1" value="<%=user_set1%>" tabindex="<%=tabindex+10%>" />
          <input class="form-control" type="number" pattern="[0-9]*" inputmode="numeric" name="user_set2" value="<%=user_set2%>" tabindex="<%=tabindex+12%>" />
          <input class="form-control" type="number" pattern="[0-9]*" inputmode="numeric" name="user_set3" value="<%=user_set3%>" tabindex="<%=tabindex+14%>" />
          <input class="form-control pts" type="number" pattern="[0-9]*" inputmode="numeric" name="user_points" value="<%=user_points%>" tabindex="<%=tabindex+16%>" />
          <span class="pts">pts</span>
        </div>
        <div class="form-group other score">
          <span class="marker">&nbsp;</span>
          <input class="form-control" type="number" pattern="[0-9]*" inputmode="numeric" name="other_set1" value="<%=other_set1%>" tabindex="<%=tabindex+11%>" />
          <input class="form-control" type="number" pattern="[0-9]*" inputmode="numeric" name="other_set2" value="<%=other_set2%>" tabindex="<%=tabindex+13%>" />
          <input class="form-control" type="number" pattern="[0-9]*" inputmode="numeric" name="other_set3" value="<%=other_set3%>" tabindex="<%=tabindex+15%>" />
          <input class="form-control pts" type="number" pattern="[0-9]*" inputmode="numeric" name="other_points" value="<%=other_points%>" tabindex="<%=tabindex+17%>" />
          <span class="pts">pts</span>
        </div>
        <div class="form-group outcome"></div>
        <label><%=_lang('court')%></label>
        <div class="form-group">
          <input name="location" type="text" placeholder="<%=_lang('court')%>" value="<%=location%>" class="form-control" autocomplete="off" />
        </div>
        <label><%=_lang('dateAndTime')%></label>
        <div class="form-group date-time clearfix">
          <div class="input-group date pull-left">
            <input class="form-control" type="text" name="date" value="<%=date%>" readonly="readonly" />
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class="input-group time pull-right">
            <input class="form-control" type="text" name="time" value="<%=time%>" readonly="readonly" />
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-time"></span>
            </span>
          </div>
        </div>
        <label><%=_lang('comment')%></label>
        <div class="form-group">
          <input name="comment" type="text" placeholder="<%=_lang('comment')%>" value="<%=comment%>" class="form-control" autocomplete="off" />
        </div>
      </form>
    `),
    playerSelectTemplate: _.template(`
      <select name="<%=key%>_id" class="selectpicker" data-width="100%">
        <% for (var i = 0; i < players.length; i++) { %>
          <% var player = players[i]; %>
          <option value="<%=player.id%>" <%=player.id == id ? "selected" : ""%>><%=player.name%></option>
        <% } %>
      </select>
    `),
    outcomeTemplate: _.template(`
      <button class="btn btn-default outcome dropdown-toggle" type="button" id="match-outcome" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
      <span class="outcome"><%=_lang('noException')%></span>
      <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" aria-labelledby="match-outcome">
        <li><a href="#" class="exception clear-exception" data-exception="null"><i class="fa fa-fw"></i> <%=_lang('noException')%></a></li>
        <li><a href="#" class="exception incomplete" data-exception="incomplete"><i class="fa fa-fw"></i> <%=_lang('matchIncomplete')%></a></li>
        <li><a href="#" class="exception user-forfeited" data-exception="other_won_because_forfeit"><i class="fa fa-fw"></i> <%=user_title_inline%> <%=_lang('forfeited')%></a></li>
        <li><a href="#" class="exception other-forfeited" data-exception="user_won_because_forfeit"><i class="fa fa-fw"></i> <%=other_title_inline%> <%=_lang('forfeited')%></a></li>
      </ul>
    `),
    title: _lang('matchInformation'),
    deleteConfirmMessage: _lang('deleteThisMatch'),
    events: {
      'change input,select': 'renderDynamicElements',
      'click .form-group.outcome .dropdown-menu a.exception': 'onClickException'
    },
    onClickException: function(e) {
      e.preventDefault();
      this.$('.form-group.outcome>.dropdown-menu>li.selected').removeClass('selected');
      $(e.target).closest('li').addClass('selected');
      this.renderDynamicElements();
    },
    domToData: function() {
      var data = this.$form.serializeObject();
      data.played_on = moment(data.date + ' ' + data.time).format('YYYY-MM-DD HH:mm:ss');
      delete data.date;
      delete data.time;
      _.each(['user_id', 'user_partner_id', 'other_id', 'other_partner_id', 'user_set1', 'user_set2', 'user_set3', 'user_points', 'other_set1', 'other_set2', 'other_set3', 'other_points'], function(key) {
        data[key] = parseFloat(data[key], 10);
        if (isNaN(data[key])) data[key] = null;
      });
      !data.user_id || (data.user = this.model.collection.playersCollection.get(data.user_id).toRender() || null);
      !data.user_partner_id || (data.user_partner = this.model.collection.playersCollection.get(data.user_partner_id).toRender() || null);
      !data.other_id || (data.other = this.model.collection.playersCollection.get(data.other_id).toRender() || null);
      !data.other_partner_id || (data.other_partner = this.model.collection.playersCollection.get(data.other_partner_id).toRender() || null);
      data.exception = this.$('.form-group.outcome>.dropdown-menu>li.selected>a').data('exception');
      return data;
    },
    buildFormHtml: function() {
      return this.formTemplate(this.model.toRender());
    },
    buildPlayerHtml: function(key, data, players) {
      var html = this.playerSelectTemplate({
        key: key,
        id: data[key+'_id'],
        players: players,
        match: data
      });
      if (data.type == Backbone.DOUBLES) {
        html += this.playerSelectTemplate({
          key: key+'_partner',
          id: data[key+'_partner_id'],
          players: players,
          match: data
        });
      }
      return html;
    },
    onRender: function() {

      this.$('.input-group.date').datetimepicker({
        ignoreReadonly: true,
        allowInputToggle: true,
        format: 'YYYY-MM-DD',
        widgetPositioning: {horizontal: 'left', vertical: 'top'}
      });

      this.$('.input-group.time').datetimepicker({
        ignoreReadonly: true,
        allowInputToggle: true,
        format: 'HH:mm',
        widgetPositioning: {horizontal: 'right', vertical: 'top'}
      });

      this.renderDynamicElements(null, this.model.toRender());

      this.delegateEvents();

      return this;
    },
    renderDynamicElements: function(e, data) {
      data || (data = new Backbone.MatchModel(this.domToData()).toRender());

      // Players
      if (!this.players) {
        this.players = this.model.collection.playersCollection.toJSON();
        this.players.unshift({id: null, name: '--'});
      }
      this.$('.form-group.players .user').html(this.buildPlayerHtml('user', data, this.players));
      this.$('.form-group.players .other').html(this.buildPlayerHtml('other', data, this.players));
      this.$('.selectpicker').selectpicker({
        iconBase: 'fa',
        showTick: true,
        tickIcon: "fa-user"
      });


      // Marker, outcome and exceptions
      var $outcome = this.$('.form-group.outcome');
      $outcome.html(this.outcomeTemplate(data));

      this.$('.marker').removeClass('exception').prop('title', undefined).empty();

      if (data.winner != null) {
        this.$('.'+data.winner+' .marker').text('✓');
        $outcome.find('button>.outcome').html(data[data.winner + '_title_inline'] + ' ' + _lang(data.type == Backbone.SINGLES ? 'playerWon' : 'playersWon'));
      }

      if (data.exception == Backbone.INCOMPLETE) {
        this.$('.marker').addClass('exception').text('?').attr('title', _lang('matchIncomplete'));
        $outcome.find('button>.outcome').text(_lang('matchIncomplete'));
        $outcome.find('.dropdown-menu .incomplete>i').addClass('fa-arrow-right').closest('li').addClass('selected');
      }

      if (data.exception == Backbone.USER_WON_BECAUSE_FORFEIT) {
        this.$('.other .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
        $outcome.find('button>.outcome').text(data.other_title_inline + ' ' + _lang('forfeited'));
        $outcome.find('.dropdown-menu .other-forfeited>i').addClass('fa-arrow-right').closest('li').addClass('selected');
      }

      if (data.exception == Backbone.OTHER_WON_BECAUSE_FORFEIT) {
        this.$('.user .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
        $outcome.find('button>.outcome').text(data.user_title_inline + ' ' + _lang('forfeited'));
        $outcome.find('.dropdown-menu .user-forfeited>i').addClass('fa-arrow-right').closest('li').addClass('selected');
      }

      if (!data.exception) {
        $outcome.find('.dropdown-menu .clear-exception>i').addClass('fa-arrow-right').closest('li').addClass('selected');
      }

      $outcome.find('.dropdown-menu .type>i').removeClass('fa-arrow-right');
      $outcome.find('.dropdown-menu .type[data-type=' + data.type + ']>i').addClass('fa-arrow-right');

      return this;
    }
  });

}.call(this));
