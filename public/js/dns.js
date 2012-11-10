/**
 * DNS functions
 */

(function() {

   $(document).ready(function() {

      $("a.dns-link").click(function() {
         var tld = this.getAttribute("tld");
         $("#content_area").load("/dns/" + tld, null, function() {
            // do something after loading...
            var oTable = $("#table_entries").dataTable({
               "bJQueryUI": true,
               "bPaginate": false,
               "sScrollY": $("#content_area").height()-90,
               "sPaginationType": "full_numbers"
            });

            oTable.$("td").editable("/dns/" + tld, {
               "callback": function(value, y) {
                  var sel_pos = oTable.fnGetPosition(this);
                  oTable.fnUpdate(value, sel_pos[0], sel_pos[1]);
               },
               "submitdata": function( value, settings) {
                  return {
                     "row_id": this.parentNode.getAttribute("id"),
                     "column": oTable.fnGetPosition(this)[2]
                  };
               },
               "height": "14px",
               "width": "100%"
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
