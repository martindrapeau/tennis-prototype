$(document).on(window.cordova ? 'deviceready' : 'ready', function() {

  // Set up local storage adaptors (until we have a real backend)
  Backbone.SessionModel.prototype.sync = Backbone.SessionCollection.prototype.sync = new BackboneLocalStorage('sessions', {data: window._sessions}).sync;
  Backbone.OrganizationModel.prototype.sync = Backbone.OrganizationCollection.prototype.sync = new BackboneLocalStorage('organizations', {data: window._organizations}).sync;
  Backbone.MatchModel.prototype.sync = Backbone.MatchCollection.prototype.sync = new BackboneLocalStorage('matches', {data: window._matches}).sync;
  Backbone.PlayerModel.prototype.sync = Backbone.PlayerCollection.prototype.sync = new BackboneLocalStorage('players', {data: window._players}).sync;
  Backbone.CategoryModel.prototype.sync = Backbone.CategoryCollection.prototype.sync = new BackboneLocalStorage('categories', {data: window._categories}).sync;
  Backbone.RoundModel.prototype.sync = Backbone.RoundCollection.prototype.sync = new BackboneLocalStorage('rounds', {data: window._rounds}).sync;
  Backbone.ProgramModel.prototype.sync = Backbone.ProgramCollection.prototype.sync = new BackboneLocalStorage('programs', {data: window._programs}).sync;
  Backbone.TennisAppState.prototype.sync = new BackboneLocalStorage('app').sync;
  
  // Fetch state model from local storage and then start the app
  var model = new Backbone.TennisAppState();
  model.fetch().always(function() {
    console.log('start app');
    window.app = new Backbone.TennisApp({
      model: model,
      el: $('body')
    });
  });
  
});