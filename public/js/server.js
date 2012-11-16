(function() {

   $(document).ready(function() {
      
      $(".server-list-link").click(function() {
         $("#content_area").load("/server", null, function() {
         
            var oTable = $("#table_entries").dataTable({
               "bJQueryUI": true,
               "bPaginate": false,
               "sScrollY": $("#content_area").height()-90,
               "sPaginationType": "full_numbers"
            });

            $(".server-link").click(function() {
               load_server($(this).attr("srv_id"));
            });

            $("SELECT").selectBox();
            $("#save_boot_target").button().click(function(event) {
               event.preventDefault();
               $.log("server_id: " + $(this).attr("srv_id"));
               $.log("boot_id: " + $("#next_boot_target").val());
               $.ajax({
                  "type": "POST",
                  "url": "/server/" + $(this).attr("srv_id") + "/" + $("#next_boot_target").val()
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


            $(window).on("resize", function() {
               window.setTimeout(function() {
                  $("#table_entries").parent().css("height", $("#content_area").height()-90);
                  oTable.fnDraw();
               }, 200);
            });


         });
      });

   });

})();
