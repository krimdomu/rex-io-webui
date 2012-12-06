/**
 * DNS functions
 */

(function() {

   $(document).ready(function() {

      $("a.dns-link").click(function() {
         var tld = this.getAttribute("tld");
         list_dns(tld);
      });

   });


})();

function list_dns(tld) {

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
            $("#table_entries").parent().css("height", $("#content_area").height()-160);
            oTable.fnDraw();
         }, 200);
      });

      $("#table_entries").parent().css("height", $("#content_area").height()-160);

      $("#add_dns_entry").dialog({
         autoOpen: false,
         height: 500,
         width: 350,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/dns/" + $("#domain").val() + "/A/" + $("#name").val(),
                  "type": "POST",
                  "data": JSON.stringify({
                     "ip": $("#ip").val(),
                     "ttl": $("#ttl").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new dns record";
                     }
                     else {
                        list_dns($("#domain").val());
                     }
                  } catch(err) {
                     $.log(err);
                  }
               });

               $(this).dialog("close");
            },
            Cancel: function() {
               $(this).dialog("close");
            }
         },
         close: function() {
            $("INPUT").val("").removeClass("ui-state-error");
            $("#ttl").val("3600");
         }
      });

      $("#dns_add_entry").button().click(function() {
         $("#add_dns_entry").dialog("open");
      });


      $("SELECT").selectBox();

   });


}
