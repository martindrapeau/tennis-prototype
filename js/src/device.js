$(document).on(window.cordova ? 'deviceready' : 'ready', function() {

  _.extend(Backbone, {
    WEBAPP: window.navigator.standalone,
    COCOON: window.cordova || false,
    MOBILE: "onorientationchange" in window || window.navigator.msMaxTouchPoints || window.cordova
  });
	
  if (window.Keyboard && typeof window.Keyboard.hideFormAccessoryBar == 'function') Keyboard.hideFormAccessoryBar(true);

  if (Backbone.WEBAPP || Backbone.COCOON) $('body').addClass('standalone');

  // In WebView+, localStorage gets cleared when the app closes.
  // This persists all of localStorage using the cordova-nativestorage-plugin.
  // When the app starts, call restore. Call save to persist.
  if (Backbone.COCOON) {
  	Backbone.persistLocalStorage = {

      // Call this to persist all of local storage to native storage.
      // Returns a promise.
      // Note: Only one save call runs at a time. If two calls are made, only the first
      // save to native storage operation will run. The same promise will be returned for
      // subsequent concurrent calls.
  		save: function() {
        if (Backbone.persistLocalStorage.deferred) return Backbone.persistLocalStorage.deferred.promise();
        Backbone.persistLocalStorage.deferred = new $.Deferred();
        NativeStorage.set("tennis_app",
          window.localStorage,
          function(result) {
            console.log('Backbone.persistLocalStorage.save success');
            Backbone.persistLocalStorage.deferred.resolve();
            _.defer(function() {
              Backbone.persistLocalStorage.deferred = undefined;
            });
          },
          function(e) {
            console.log('Backbone.persistLocalStorage.save failed:', e.code);
            Backbone.persistLocalStorage.deferred.reject(e);
            _.defer(function() {
              Backbone.persistLocalStorage.deferred = undefined;
            });
          }
        );
        return Backbone.persistLocalStorage.deferred.promise();
      },

      // Call this upon start to restore local storage based on native storage
      // Returns a promise. You should wait until it resolves to do any thing else.
      restore: function() {
        var deferred = new $.Deferred();
        NativeStorage.getString("tennis_app",
          function(result) {
            console.log('Backbone.persistLocalStorage.restore success');
            deferred.resolve();
          },
          function(e) {
            console.log('Backbone.persistLocalStorage.restore failed:', e.code);
            deferred.reject(e);
          }
        );
        return deferred.promise();
      }
  	}
  }

});