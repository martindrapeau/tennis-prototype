(function() {

  var dataStore = new BackboneLocalStorage('organizations', {data: window._organizations});

  Backbone.OrganizationModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: undefined,
      admin_ids: []
    }
  });

  Backbone.OrganizationCollection = Backbone.Collection.extend({
    sync: dataStore.sync,
    model: Backbone.OrganizationModel
  });

}.call(this));