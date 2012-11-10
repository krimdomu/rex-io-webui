/**
 * Deploy::Template functions
 */

(function() {

   $(document).ready(function() {

      $("a.template-link").click(function() {
         $("#content_area").load("/deploy/template", null, function() {
            $("#template-tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
            $("#template-tabs li").removeClass("ui-corner-top" ).addClass( "ui-corner-left");
            $("#template-tabs .ui-tabs-panel").css("width", $("#content_area").width()-250);
            $("#save_template").button();

            $(window).on("resize", function() {
               window.setTimeout(function() {
                  $("#template-tabs .ui-tabs-panel").css("width", $("#content_area").width()-250);
               }, 200);
            });

         });
      });

   });


})();
