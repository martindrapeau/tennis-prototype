(function() {

  Backbone.lang = {
    default: 'fr',
    langs: ['en', 'fr'],
    get: function(key, lang) {
      lang || (lang = Backbone.lang.default);
      var i = _.indexOf(Backbone.lang.langs, lang);
      if (i == -1) throw 'Invalid language "' + lang + '"';
      if (!Backbone.lang.dict[key]) return '';
      return Backbone.lang.dict[key][i];
    },
    dict: {
      appName: ['Tennis App', 'Tennis App'],
      account: ['Account', 'Compte'],
      email: ['Email', 'Courriel'],
      name: ['Name', 'Nom'],
      comment: ['Comment', 'Commentaire'],
      court: ['Court', 'Terrain'],
      changeAccount: ['Change account', 'Changer de compte'],
      player: ['Player', 'Joueur'],
      players: ['Players', 'Joueurs'],
      match: ['Match', 'Match'],
      matches: ['Matches', 'Matches'],
      home: ['Home', 'Accueil'],
      matchTime: ['Match time', 'Heure du match'],
      more: ['More', 'Plus'],
      matchIncomplete: ['Match incomplete', 'Match incomplet'],
      forfeit: ['forfeit', 'abandon'],
      forfeited: ['forfeited', 'a abandonné'],
      clearException: ['Clear exception', "Effacer l'exception"],
      delete: ['Delete', 'Effacer'],
      areYouSure: ['Are you sure?', 'Veuillez confirmer'],
      addAMatch: ['Add a match', 'Ajouter un match'],
      addAPlayer: ['Add a player', 'Ajouter un joueur']
    }
  };

  window._lang = Backbone.lang.get;

}.call(this));