/**
 * DHCP functions
 */

(function() {

   $(document).ready(function() {

      $("a.dhcp-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();

         $(".page-content-container").load("/dhcp", null, function() {

            var minus_height = 260;

            // do something after loading...
            var oTable = $("#table_entries").dataTable({
               "bJQueryUI": true,
               "bPaginate": false,
               "sScrollY": $("#content_area").height()-minus_height,
               "sPaginationType": "full_numbers"
            });

            prepare_data_tables();

            $(window).on("resize", function() {
               if(typeof resize_Timer != "undefined") {
                  window.clearTimeout(resize_Timer);
               }

               resize_Timer = window.setTimeout(function() {
                  $("#table_entries").parent().css("height", $("#content_area").height()-minus_height);
                  oTable.fnDraw();
               }, 200);
            });
         });
      });

   });


})();
