(function() {

  Backbone.EditProgramView = Backbone.EditEntityView.extend({
    formTemplate: _.template(`
      <form class="bootbox-form program">
        <div class="form-group tab-info">
          <input name="name" type="text" placeholder="<%=_lang('name')%>" value="<%=name%>" class="form-control" autocomplete="off" />
        </div>
        <div class="form-group date-time clearfix">
          <div class="input-group date start pull-left">
            <input class="form-control" type="text" name="start" value="<%=start%>" placeholder="<%=_lang('start')%>" readonly="readonly" />
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
          <div class="input-group date end pull-right">
            <input class="form-control" type="text" name="end" value="<%=end%>" placeholder="<%=_lang('end')%>" readonly="readonly" />
            <span class="input-group-addon">
              <span class="glyphicon glyphicon-calendar"></span>
            </span>
          </div>
      </form>
    `),
    title: _lang('organization'),
    onRender: function() {

      this.$('.input-group.date.start').datetimepicker({
        ignoreReadonly: true,
        allowInputToggle: true,
        format: 'YYYY-MM-DD',
        widgetPositioning: {horizontal: 'left', vertical: 'bottom'}
      });

      this.$('.input-group.date.end').datetimepicker({
        ignoreReadonly: true,
        allowInputToggle: true,
        format: 'YYYY-MM-DD',
        widgetPositioning: {horizontal: 'right', vertical: 'bottom'}
      });

      this.delegateEvents();

      return this;
    }
  });

}.call(this));