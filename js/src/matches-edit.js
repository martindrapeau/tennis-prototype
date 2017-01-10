(function() {

  Backbone.EditMatchView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form match">
        <label><%=_lang('playersAndScore')%></label>
        <div class="form-group players clearfix">
          <div class="vs">vs</div>
          <div class="user pull-left"><%=user()%></div>
          <div class="other pull-right"><%=other()%></div>
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
    title: _lang('matchInformation'),
    deleteConfirmMessage: _lang('deleteThisMatch'),
    events: {
      'change input,select': 'renderMarker',
      'click .form-group.outcome .dropdown-menu a.exception': 'onClickException'
    },
    buildFormHtml: function() {
      var data = this.model.toRender(),
          players = this.model.collection.playersCollection.toJSON();
      players.unshift({id: null, name: '--'});

      data.user = function() {
        var html = this.playerSelectTemplate({
          key: 'user',
          id: data.user_id,
          players: players,
          match: data
        });
        if (data.type == Backbone.DOUBLES) {
          html += this.playerSelectTemplate({
            key: 'user_partner',
            id: data.user_partner_id,
            players: players,
            match: data
          });
        }
        return html;
      }.bind(this);

      data.other = function() {
        var html = this.playerSelectTemplate({
          key: 'other',
          id: data.other_id,
          players: players,
          match: data
        });
        if (data.type == Backbone.DOUBLES) {
          html += this.playerSelectTemplate({
            key: 'other_partner',
            id: data.other_partner_id,
            players: players,
            match: data
          });
        }
        return html;
      }.bind(this);

      return this.formTemplate(data);
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
      data.exception = this.$('.form-group.outcome>.dropdown-menu>li.active>a').data('exception');
      return data;
    },
    onRender: function() {

      this.$('.selectpicker').selectpicker({
        iconBase: 'fa',
        showTick: true,
        tickIcon: "fa-user"
      });

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

      this.renderMarker(null, this.model.toRender());

      this.delegateEvents();

      return this;
    },
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
    onClickException: function(e) {
      e.preventDefault();
      this.$('.form-group.outcome>.dropdown-menu>li.active').removeClass('active');
      $(e.target).closest('li').addClass('active');
      this.renderMarker();
    },
    renderMarker: function(e, data) {
      data || (data = new Backbone.MatchModel(this.domToData()).toRender());
      console.log('renderMarker', data);

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
        $outcome.find('.dropdown-menu .incomplete>i').addClass('fa-check').closest('li').addClass('active');
      }

      if (data.exception == Backbone.USER_WON_BECAUSE_FORFEIT) {
        this.$('.other .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
        $outcome.find('button>.outcome').text(data.other_title_inline + ' ' + _lang('forfeited'));
        $outcome.find('.dropdown-menu .other-forfeited>i').addClass('fa-check').closest('li').addClass('active');
      }

      if (data.exception == Backbone.OTHER_WON_BECAUSE_FORFEIT) {
        this.$('.user .marker').addClass('exception').text(_lang('forfeitShort')).attr('title', _lang('forfeit'));
        $outcome.find('button>.outcome').text(data.user_title_inline + ' ' + _lang('forfeited'));
        $outcome.find('.dropdown-menu .user-forfeited>i').addClass('fa-check').closest('li').addClass('active');
      }

      if (!data.exception) {
        $outcome.find('.dropdown-menu .clear-exception>i').addClass('fa-check').closest('li').addClass('active');
      }

      $outcome.find('.dropdown-menu .type>i').removeClass('fa-check');
      $outcome.find('.dropdown-menu .type[data-type=' + data.type + ']>i').addClass('fa-check');

      return this;
    }
  });

}.call(this));
