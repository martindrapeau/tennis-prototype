(function() {

  var dataStore = new BackboneLocalStorage('organizations');

  Backbone.OrganizationModel = new Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: undefined,
      admin_ids: []
    }
  });

  Backbone.OrganizationCollection = new Backbone.Collection.extend({
    sync: dataStore.sync,
    model: Backbone.OrganizationModel
  });

}.call(this));