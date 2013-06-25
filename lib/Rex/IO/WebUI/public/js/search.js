var SEARCH_FUNCTION = function(itm) {};

(function() {

   $(document).ready(function() {
      $("#server_search").autocomplete({
         source: "/search",
         minLength: 2,
         select: function(event, ui) {
            SEARCH_FUNCTION(ui.item);
         },
      });

      $(window).on("resize", function() {

         window.setTimeout(function() {
            $("#tabs > .ui-tabs-panel").height($("#content_area").height() 
               - $("#tabs > .ui-tabs-nav").height() 
               - 45
            );
         }, 200);

      });

   });

})();

function set_search(fn) {
   SEARCH_FUNCTION = fn;
}
