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
  if (Backbone.COCOON && window.NativeStorage) {
  	Backbone.persistLocalStorage = {
      // Set this to the localStorage keys to save
      keys: [],

      // Call this to persist all of local storage to native storage.
      // Returns a promise.
      // Note: Only one save call runs at a time. If two calls are made, only the first
      // save to native storage operation will run. The same promise will be returned for
      // subsequent concurrent calls.
  		save: function() {
        if (Backbone.persistLocalStorage.deferred) return Backbone.persistLocalStorage.deferred.promise();
        Backbone.persistLocalStorage.deferred = new $.Deferred();
        var data = {};
        _.each(Backbone.persistLocalStorage.keys, function(k) {
          data[k] = window.localStorage[k];
        });
        window.NativeStorage.setItem("tennis_app",
          data,
          function(result) {
            console.log('Backbone.persistLocalStorage.save success');
            window._log += 'Backbone.persistLocalStorage.save success: ' + _.keys(result).join(', ') + '\n';
            window._log += result['app'] + '\n';
            Backbone.persistLocalStorage.deferred.resolve();
            _.defer(function() {
              Backbone.persistLocalStorage.deferred = undefined;
            });
          },
          function(e) {
            console.log('Backbone.persistLocalStorage.save failed:', e.code);
            window._log += ['Backbone.persistLocalStorage.save failed: ', e.code.join(' ')] + '\n';
            Backbone.persistLocalStorage.deferred.reject(e);
            _.defer(function() {
              Backbone.persistLocalStorage.deferred = undefined;
            });
          }
        );
        return Backbone.persistLocalStorage.deferred.promise();
      },

      // Call this upon start to restore local storage from native storage.
      // Returns a promise. You should wait until it resolves to do any thing else.
      restore: function(keys) {
        var deferred = new $.Deferred();
        window.NativeStorage.getItem("tennis_app",
          function(data) {
            _.each(_.keys(data || {}), function(o, k) {
              window.localStorage[k] = o;
            });
            console.log('Backbone.persistLocalStorage.restore success');
            window._log += 'Backbone.persistLocalStorage.restore success: ' + _.keys(data).join(', ') + '\n';
            window._log += data['app'] + '\n';
            deferred.resolve();
          },
          function(e) {
            console.log('Backbone.persistLocalStorage.restore failed:', e.code);
            window._log += ['Backbone.persistLocalStorage.restore failed: ', e.code.join(' ')] + '\n';
            deferred.reject(e);
          }
        );
        return deferred.promise();
      },

      clear: function() {
        window.NativeStorage.clear(function() {}, function() {});
      }
  	};
  }

});