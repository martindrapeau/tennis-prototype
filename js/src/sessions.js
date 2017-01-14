(function() {

  var dataStore = new BackboneLocalStorage('sessions', {data: window._sessions});

  Backbone.SessionModel = Backbone.Model.extend({
    sync: dataStore.sync,
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
    sync: dataStore.sync,
    model: Backbone.SessionModel
  });

}.call(this));