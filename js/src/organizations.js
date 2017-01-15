(function() {

  var dataStore = new BackboneLocalStorage('organizations', {data: window._organizations});

  Backbone.OrganizationModel = Backbone.Model.extend({
    sync: dataStore.sync,
    defaults: {
      id: undefined,
      name: undefined,
      admin_ids: []
    },
    getStats: function() {
      return {
        playerCount: this.collection && this.collection.players ? this.collection.players.size() : '?',
        matchCount: this.collection && this.collection.matches ? this.collection.matches.size() : '?',
        programCount: this.collection && this.collection.programs ? this.collection.programs.size() : '?'
      };
    },
    toRender: function() {
      var data = this.toJSON(),
          stats = this.getStats();
      return _.extend(data, {
        stats: stats,
        statsText: _lang('orgStatsText')
          .replace('{1}', stats.programCount)
          .replace('{2}', stats.matchCount)
          .replace('{3}', stats.playerCount)
      });
    }
  });

  Backbone.OrganizationCollection = Backbone.Collection.extend({
    sync: dataStore.sync,
    model: Backbone.OrganizationModel,
    bindCollections: function(collections) {
      this.programs = collections.programs;
      this.matches = collections.matches;
      this.players = collections.players;
    }
  });

}.call(this));