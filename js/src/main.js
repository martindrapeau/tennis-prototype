$(document).on(window.cordova ? 'deviceready' : 'ready', function() {

  function go() {

    // Set up local storage adaptors (until we have a real backend)
    function a2h(a) {
      var h = {};
      for (var i = 0; i < a.length; i++) {
        h[a[i].id] = a[i];
      }
      return h;
    }
    Backbone.SessionModel.prototype.sync = Backbone.SessionCollection.prototype.sync = new BackboneLocalStorage('sessions', {data: a2h(window._sessions)}).sync;
    Backbone.OrganizationModel.prototype.sync = Backbone.OrganizationCollection.prototype.sync = new BackboneLocalStorage('organizations', {data: a2h(window._organizations)}).sync;
    Backbone.MatchModel.prototype.sync = Backbone.MatchCollection.prototype.sync = new BackboneLocalStorage('matches', {data: a2h(window._matches)}).sync;
    Backbone.PlayerModel.prototype.sync = Backbone.PlayerCollection.prototype.sync = new BackboneLocalStorage('players', {data: a2h(window._players)}).sync;
    Backbone.CategoryModel.prototype.sync = Backbone.CategoryCollection.prototype.sync = new BackboneLocalStorage('categories', {data: a2h(window._categories)}).sync;
    Backbone.RoundModel.prototype.sync = Backbone.RoundCollection.prototype.sync = new BackboneLocalStorage('rounds', {data: a2h(window._rounds)}).sync;
    Backbone.ProgramModel.prototype.sync = Backbone.ProgramCollection.prototype.sync = new BackboneLocalStorage('programs', {data: a2h(window._programs)}).sync;
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
  }

  if (Backbone.persistLocalStorage) {
    Backbone.persistLocalStorage.restore().always(go);
  } else {
    go();
  }
  
});