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
      settings: ['Settings', 'Configration'],
      account: ['Account', 'Compte'],
      email: ['Email', 'Courriel'],
      name: ['Name', 'Nom'],
      description: ['Description', 'Description'],
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
      cannotDeleteWhenMatchesExist: ['You cannot delete this when matches exist. Please delete all matches first.', "Impossible d'effacer car il y a des matches. Veuillez les effacer en premier."],
      cannotDeleteWhenCategoriesOrRoundsExist: ['You cannot delete this when cateogries or rounds exist. Please delete all matches first.', "Impossible d'effacer car il y a des catégories ou des rondes. Veuillez les effacer en premier."],
      cannotCreateMatchWithoutCategorieAndRound: ['A match cannot be added without a category and round. Make sure at least one of each exist.', "Aucun match ne peut être créé sans l'existence d'une catégorie et d'une ronde. Veuillez aller en créer."],
      add: ['Add', 'Ajouter'],
      addAMatch: ['Add a match', 'Ajouter un match'],
      addAPlayer: ['Add a player', 'Ajouter un joueur'],
      addAProgram: ['Add a season', 'Ajouter une saison'],
      newProgram: ['New season', 'Nouvelle saison'],
      programName: ['Season name', 'Nome de la saison'],
      changeTheName: ['Change the name', 'Changer le nom'],
      category: ['Category', 'Catégorie'],
      categories: ['Categories', 'Catégories'],
      round: ['Round', 'Ronde'],
      rounds: ['Rounds', 'Rondes'],
      categoriesAndRounds: ['Categories & rounds', 'Catégories & rondes'],
      week: ['Week', 'Semaine'],
      rank: ['Rank', 'Classements'],
      rankings: ['Rankings', 'Classements'],
      rankingsPerCategory: ['Category Rankings', 'Classement par catégories'],
      wins: ['Wins', 'Victoires'],
      played: ['Played', 'Joués']
    }
  };

  window._lang = Backbone.lang.get;

}.call(this));