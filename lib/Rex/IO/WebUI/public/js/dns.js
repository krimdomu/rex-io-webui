/**
 * DNS functions
 */

(function() {

   $(document).ready(function() {

      $("a.dns-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         var tld = this.getAttribute("tld");
         list_dns(tld);
      });

   });


})();

function list_dns(tld) {

   $("#content_area").load("/dns/" + tld, null, function() {
      // do something after loading...
      $("#table_entries tbody tr").click( function( e ) {
         if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
         }
         else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
         }
      });

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
            $("#table_entries").parent().css("height", $("#content_area").height()-160);
            oTable.fnDraw();
         }, 200);
      });



      window.setTimeout(function() {
         $("#table_entries").parent().css("height", $("#content_area").height()-160);
         oTable.fnDraw();
      }, 200);

      $("#add_dns_entry").dialog({
         autoOpen: false,
         height: 500,
         width: 350,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/dns/" + $("#domain").val() + "/" + $("#type").val() + "/" + $("#name").val(),
                  "type": "POST",
                  "data": JSON.stringify({
                     "data": $("#data").val(),
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

      $("#dns_del_entry").button().click(function() {
         var selected_row = fnGetSelected(oTable);
         var domain = $(selected_row).attr("attr_domain");
         var type = $(selected_row).attr("attr_type");
         var name = $(selected_row).attr("attr_name");

         $.log("Delting: " + domain + "/" + type + "/" + name);

         delete_dns_entry(domain, name, type);
      });



      $("SELECT").selectBox();

   });


}

function delete_dns_entry(domain, host, type) {

   $.ajax({
      "url": "/dns/" + domain + "/" + type + "/" + host,
      "type": "DELETE"
   }).done(function(data) {
      list_dns(domain);     
   });
   
}

function fnGetSelected( oTableLocal )
{
    return oTableLocal.$('tr.row_selected');
}

