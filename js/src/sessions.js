(function() {

  Backbone.SessionModel = Backbone.Model.extend({
    defaults: {
      id: undefined,
      admin_id: undefined,
      name: undefined,
      email: undefined,
      password: undefined
    },
    initialize: function(options) {
    }
  });

  Backbone.SessionCollection = Backbone.Collection.extend({
    model: Backbone.SessionModel
  });

}.call(this));