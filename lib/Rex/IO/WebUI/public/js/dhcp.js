/**
 * DHCP functions
 */

(function() {

   $(document).ready(function() {

      $("a.dhcp-link").click(function() {
         $("#content_area").load("/dhcp", null, function() {
            // do something after loading...
            var oTable = $("#table_entries").dataTable({
               "bJQueryUI": true,
               "bPaginate": false,
               "sScrollY": $("#content_area").height()-90,
               "sPaginationType": "full_numbers"
            });

            $(window).on("resize", function() {
               if(typeof resize_Timer != "undefined") {
                  window.clearTimeout(resize_Timer);
               }

               resize_Timer = window.setTimeout(function() {
                  $("#table_entries").parent().css("height", $("#content_area").height()-90);
                  oTable.fnDraw();
               }, 200);
            });
         });
      });

   });


})();
