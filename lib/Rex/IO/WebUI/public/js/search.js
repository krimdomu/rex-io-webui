(function() {

   $(document).ready(function() {
      $("#server_search").autocomplete({
         source: "/search",
         minLength: 2,
         select: function(event, ui) {
            load_server(ui.item.srv_id);
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
