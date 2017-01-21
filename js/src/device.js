$(document).on(window.cordova ? 'deviceready' : 'ready', function() {

  _.extend(Backbone, {
    WEBAPP: window.navigator.standalone,
    COCOON: window.cordova || false,
    MOBILE: "onorientationchange" in window || window.navigator.msMaxTouchPoints || window.cordova
  });
	
  if (window.Keyboard && typeof window.Keyboard.hideFormAccessoryBar == 'function') Keyboard.hideFormAccessoryBar(true);

  if (Backbone.WEBAPP || Backbone.COCOON) $('body').addClass('standalone');

});