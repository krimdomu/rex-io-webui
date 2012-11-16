(function() {

   $(document).ready(function() {
      
      $(".server-add-link").click(function() {
         $("#content_area").load("/server/new", null, function() {
            $(".save_button").button().click(function(event) {
               event.preventDefault();
               $.ajax({
                  "url": "/server/new",
                  "type": "POST",
                  "data": JSON.stringify({
                     "name": $("#name").val(),
                     "mac": $("#mac").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error updating Server next_boot_target";
                     }
                     else {
                        list_server();
                     }
                  } catch(err) {
                     Raven.captureException(err);
                  }
               });
            });
         });
      });

      $(".server-list-link").click(function() {
         list_server();
      });

   });

})();

function list_server() {
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
      $(".save_button").button().click(function(event) {
         event.preventDefault();
         var srv_id = $(this).attr("srv_id");
         $.log("server_id: " + srv_id);
         $.log("boot_id: " + $("#next_boot_target_" + srv_id).val());
         $.ajax({
            "type": "POST",
            "url": "/server/" + srv_id + "/" + $("#next_boot_target_" + srv_id).val()
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
}

function load_server(srv_id) {

   $("#content_area").load("/server/" + srv_id, null, function() {
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
         $.log("server_id: " + srv_id);
         $.log("boot_id: " + $("#next_boot_target").val());
         $.ajax({
            "type": "POST",
            "url": "/server/" + srv_id + "/" + $("#next_boot_target").val()
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

}
