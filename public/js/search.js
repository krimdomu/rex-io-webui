(function() {

   $(document).ready(function() {
      $("#server_search").autocomplete({
         source: "/search",
         minLength: 2,
         select: function(event, ui) {
            $("#content_area").load("/server/" + ui.item.srv_id, null, function() {
               $("#tabs").tabs();
               $("#hw-info").accordion();

               $("#general-info").accordion();

               $("#tabs > .ui-tabs-panel").height($("#content_area").height() 
                        - $("#tabs > .ui-tabs-nav").height() 
                        - 45
                  );

               $("SELECT").selectBox();
               $("#save_boot_target").button().click(function(event) {
                  event.preventDefault();
                  $.log("server_id: " + ui.item.srv_id);
                  $.log("boot_id: " + $("#next_boot_target").val());
                  $.ajax({
                     "type": "POST",
                     "url": "/server/" + ui.item.srv_id + "/" + $("#next_boot_target").val()
                  }).done(function(data) {
                     try {
                        if(data.ok != true) {
                           throw "Error updating Server next_boot_target";
                        }
                     } catch(err) {
                        Raven.captureException(err);
                     }
                  });
               });
            });
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
