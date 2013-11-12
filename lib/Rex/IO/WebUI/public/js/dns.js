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

   load_page("/dns/" + tld, null, function() {
      var minus_height = 260;

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

      window.setTimeout(function() {
         $("#table_entries").parent().css("height", $("#content_area").height()-minus_height);
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
               
               add_dns_entry({
                  domain: $("#domain").val(),
                  type: $("#type").val(),
                  name: $("#name").val(),
                  data: $("#data").val(),
                  ttl: $("#ttl").val(),
                  callback: function() {
                     list_dns($("#domain").val());
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

      $("#dns_add_entry").click(function() {
         $("#add_dns_entry").dialog("open");
      });

      $("#dns_del_entry").click(function() {
         var selected_row = fnGetSelected(oTable);
         var domain = $(selected_row).attr("attr_domain");
         var type = $(selected_row).attr("attr_type");
         var name = $(selected_row).attr("attr_name");

         delete_dns_entry(domain, name, type);
      });


   });


}

function delete_dns_entry(domain, host, type) {
   dialog_confirm({
      id: "dns_delete_dialog",
      title: "Really delete " + host,
      text: "This entry will be permanently deleted and cannot be recovered. Are you sure?",
      button: "Delete",
      ok: function() {
         $.ajax({
            "url": "/dns/" + domain + "/" + type + "/" + host,
            "type": "DELETE"
         }).done(function(data) {
            $.pnotify({
               title: type + ": " + host + "." + domain,
               text: "DNS entry deleted",
               type: "info"
            });

            list_dns(domain);     
         });
      },
      cancel: function() {}
   });
}

/*

CALL:

add_dns_entry({
   domain: "foo.bar",
   type: "A",
   name: "fe01",
   data: "192.168.7.2",
   ttl: 3600
});

*/
function add_dns_entry(ref) {

   $.ajax({
      "url": "/dns/" + ref.domain + "/" + ref.type + "/" + ref.name,
      "type": "POST",
      "data": JSON.stringify({
         "data": ref.data,
         "ttl": ref.ttl,
         "base64": ($("#base64").attr("checked") ? 1 : 0)
      }),
      "contentType": "application/json",
      "dataType": "json"
   }).done(function(data) {
      try {
         if(data.ok != true) {
            throw "Error adding new dns record";
         }
         else {
            if(typeof ref.callback != "undefined") {
               ref.callback();
            }
         }
      } catch(err) {
         $.log(err);
      }
   });
}



