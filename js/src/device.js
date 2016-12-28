$(document).ready(function() {

  _.extend(Backbone, {
    WEBAPP: window.navigator.standalone,
    COCOON: window.navigator.isCocoonJS || window.cordova || false,
    MOBILE: "onorientationchange" in window || window.navigator.msMaxTouchPoints || window.navigator.isCocoonJS || window.cordova
  });
	
  if (window.Keyboard && typeof window.Keyboard.hideFormAccessoryBar == 'function') Keyboard.hideFormAccessoryBar(true);

  if (Backbone.WEBAPP || Backbone.COCOON) $('body').addClass('standalone');

});