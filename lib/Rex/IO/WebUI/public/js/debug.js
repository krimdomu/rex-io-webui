(function() {

$(document).ready(function() {
   Raven.config("http://cb4d12b8ecc74ee79a2d1dfd5e593e1d@localhost:9000/2");
   window.onerror = Raven.process;
});


})();

jQuery.log = function(l) {
   if(typeof console != "undefined") {
      console.log(l);
   }

   if(typeof Raven != "undefined") {
      Raven.captureMessage(l);
   }
};


