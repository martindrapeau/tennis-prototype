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
      all: ['All', 'Tous'],
      account: ['Account', 'Compte'],
      email: ['Email', 'Courriel'],
      name: ['Name', 'Nom'],
      telephone: ['Telephone', 'Telephone'],
      comment: ['Comment', 'Commentaire'],
      court: ['Court', 'Terrain'],
      changeAccount: ['Change account', 'Changer de compte'],
      player: ['Player', 'Joueur'],
      players: ['Players', 'Joueurs'],
      allPlayers: ['All players', 'Tous les joueurs'],
      match: ['Match', 'Match'],
      matches: ['Matches', 'Matches'],
      noMatches: ['No matches', 'Aucun match'],
      home: ['Home', 'Accueil'],
      matchTime: ['Match time', 'Heure du match'],
      more: ['More', 'Plus'],
      matchIncomplete: ['Match incomplete', 'Match incomplet'],
      matchesCompleted: ['Matches completed', 'Matches completés'],
      forfeit: ['forfeit', 'abandon'],
      forfeitShort: ['-', '-'],
      forfeited: ['forfeited', 'a abandonné'],
      clearException: ['Clear exception', "Effacer l'exception"],
      delete: ['Delete', 'Effacer'],
      areYouSure: ['Are you sure?', 'Veuillez confirmer'],
      add: ['Add', 'Ajouter'],
      addAMatch: ['Add a match', 'Ajouter un match'],
      addAPlayer: ['Add a player', 'Ajouter un joueur'],
      category: ['Category', 'Catégorie'],
      categories: ['Categories', 'Catégories'],
      round: ['Round', 'Ronde'],
      rounds: ['Rounds', 'Rondes']
    }
  };

  window._lang = Backbone.lang.get;

}.call(this));