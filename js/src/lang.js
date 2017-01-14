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
      login: ['Login', 'Connexion'],
      signup: ['Signup', 'Créer un compte'],
      password: ['Password', 'Mot de passe'],
      createAnAccount: ["You don't have one? Create your account.", "Vous en avez pas? Créer un compte."],
      loginToAccount: ["Already have an account? Login.", "Vous en avez déjà un? Connexion."],
      confirm: ['Confirm', 'Confirmer'],
      submit: ['Submit', 'Soumettre'],
      invalidEmailOrPasswrd: ['Invalid email or password', 'Courriel ou mot de passe invalide.'],
      all: ['All', 'Tous'],
      organization: ['Organization', 'Organisation'],
      addOrganization: ['New organization', "Nouvelle organisation"],
      pleaseChoose: ['Please choose', 'Veuillez choisir'],
      settings: ['Settings', 'Configuration'],
      information: ['Information', 'Information'],
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
      score: ['Score', 'Pointage'],
      playersAndScore: ['Players and score', 'Joueurs et pointage'],
      allPlayers: ['All players', 'Tous les joueurs'],
      dateAndTime: ['Date and time', 'Date et heure'],
      matchInformation: ['Match information', 'Information du match'],
      playerInformation: ['Player information', 'Information du joueur'],
      categoryInformation: ['Category information', 'Information de la catégorie'],
      roundInformation: ['Round information', 'Information de la ronde'],
      match: ['Match', 'Match'],
      matches: ['Matches', 'Matches'],
      noMatches: ['No matches', 'Aucun match'],
      singles: ['Singles', 'Simple'],
      doubles: ['Doubles', 'Double'],
      home: ['Home', 'Accueil'],
      matchTime: ['Match time', 'Heure du match'],
      more: ['More', 'Plus'],
      matchNotPlayed: ['Match not played yet', 'Match à venir'],
      playerWon: ['won', 'a gagné'],
      playersWon: ['won', 'ont gagnés'],
      matchComplete: ['Match complete', 'Match complet'],
      matchIncomplete: ['Match incomplete', 'Match incomplet'],
      matchesCompleted: ['Matches completed', 'Matches completés'],
      forfeit: ['forfeit', 'abandon'],
      forfeitShort: ['-', '-'],
      forfeited: ['forfeited', 'a abandonné'],
      noException: ['No exception', 'Aucune exception'],
      clearException: ['Clear exception', "Supprimer l'exception"],
      delete: ['Delete', 'Supprimer'],
      areYouSure: ['Are you sure?', 'Veuillez confirmer'],
      deleteThisMatch: ['Delete this match?', 'Supprimer ce match?'],
      deleteThisPlayer: ['Delete this player?', 'Supprimer ce joueur?'],
      deleteThisCategory: ['Delete this category?', 'Supprimer cette catégorie?'],
      deleteThisRound: ['Delete this round?', 'Supprimer cette ronde?'],
      yes: ['Yes', 'Oui'],
      no: ['No', 'Non'],
      cannotDeleteWhenMatchesExist: ['You cannot delete this when matches exist. Please delete all matches first.', "Impossible de supprimer car il y a des matches. Veuillez les supprimer en premier."],
      cannotDeleteWhenCategoriesOrRoundsExist: ['You cannot delete this when cateogries or rounds exist. Please delete all matches first.', "Impossible de supprimer car il y a des catégories ou des rondes. Veuillez les supprimer en premier."],
      cannotCreateMatchWithoutCategorieAndRound: ['A match cannot be added without a category and round. Make sure at least one of each exist.', "Aucun match ne peut être créé sans l'existence d'une catégorie et d'une ronde. Veuillez aller en créer."],
      add: ['Add', 'Ajouter'],
      save: ['Save', 'Sauvegarder'],
      cancel: ['Cancel', 'Annuler'],
      addAMatch: ['Add a match', 'Ajouter un match'],
      addAPlayer: ['Add a player', 'Ajouter un joueur'],
      addAProgram: ['Add a season', 'Ajouter une saison'],
      addCategory: ['Add a category', 'Ajouter une catégorie'],
      addRound: ['Add a round', 'Ajouter une ronde'],
      importPlayers: ['Import players', 'Importer des joueurs'],
      exportAllPlayers: ['Export all players', 'Exporter tous les joueurs'],
      newProgram: ['New season', 'Nouvelle saison'],
      programName: ['Season name', 'Nom de la saison'],
      programHelp: ['A program is a season or a tournament.', 'Une programmation représente soit un saison ou un tournoi.'],
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