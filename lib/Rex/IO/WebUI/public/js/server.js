(function() {

   $(document).ready(function() {
      
      $(".server-add-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();

         $("#content_area").load("/server/new", null, function() {
            $(".save_button").button().click(function(event) {
               event.preventDefault();
               $.ajax({
                  "url": "/server/new",
                  "type": "POST",
                  "data": JSON.stringify({
                     "name": $("#name").val(),
                     "mac": $("#mac").val(),
                     "uuid": $("#uuid").val()
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
                     $.log(err);
                  }
               });
            });
         });
      });

      $(".server-list-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();

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
               $.log(err);
            }
         });
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
}

function load_server(srv_id) {

   $("#content_area").load("/server/" + srv_id, null, function() {

      $("#rename_server").dialog({
         autoOpen: false,
         height: 300,
         width: 350,
         modal: true,
         buttons: {
            "Rename Server": function() {
               $.log("new name: " + $("#name").val());
               var new_name = $("#name").val();
               var srv_id   = $("#srv_id").val();
               rename_server(srv_id, new_name, 
                  // success
                  function() {
                     $.log("Successfull renamed");
                     $("#rename_server").dialog("close");
                     load_server(srv_id);
                  },
                  // error
                  function() {
                     $.log("An error occured on renaming server");
                  }
               );
            },
            Cancel: function() {
               $(this).dialog("close");
            }
         },
         close: function() {
            $("#name").val("").removeClass("ui-state-error");
         }
      });

      $("#reload_hw").button().click(function(event) {
         trigger_inventory($(this).attr("ip"));
      });

      $(".edit-server-name").click(function(event) {
         $("#rename_server").dialog("open");
      });

      $("#tabs").tabs({
         "activate": function(event, ui) {
            $.log("Tab changed");
            $(".is_accordion").accordion();
         }
      });
      $("#hw-info").accordion();

      $("#general-info").accordion();
      //$("#network-info").accordion(); -- wenn hier, dann bug im jqueryui, hoehe passt nicht

      $("#tabs > .ui-tabs-panel").height($("#content_area").height() 
               - $("#tabs > .ui-tabs-nav").height() 
               - 45
         );

      $("SELECT").selectBox();

      $(".save_network_button").button().click(function(event) {
         event.preventDefault();
         var nwa_id = $(this).attr("eth_id");
         $.log("Saving network adapter: " + nwa_id);

         $.log("boot?: " + $("#boot_" + nwa_id).attr("checked"));

         $.ajax({
            "type": "POST",
            "url": "/network-adapter/" + nwa_id,
            "data": JSON.stringify({
               "proto": $("#proto_" + nwa_id).val(),
               "ip": $("#ip_" + nwa_id).val(),
               "netmask": $("#netmask_" + nwa_id).val(),
               "broadcast": $("#broadcast_" + nwa_id).val(),
               "network": $("#network_" + nwa_id).val(),
               "gateway": $("#gateway_" + nwa_id).val(),
               "boot": ($("#boot_" + nwa_id).attr("checked") == "checked" ? 1 : 0)
            })
         }).done(function(data) {
            $.log("Saved NetworkAdapter\nGot Data: " + JSON.stringify(data));
         });
      });

      $("#reboot_system").button().click(function(event) {
         event.preventDefault();
         trigger_reboot($(this).attr("ip"));
      });

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
               $.log(err);
            }
         });
      });
   });

}

function rename_server(srv_id, new_name, success_cb, error_cb) {

   $.ajax({
      "type": "POST",
      "url": "/server/" + srv_id,
      "data": JSON.stringify({
         "name": new_name
      })
   }).done(function(data) {
      try {
         if(data.ok != true) {
            throw "Error updating Server name";
         }

         success_cb();
      } catch(err) {
         error_cb();
      }
   });

}

function trigger_inventory(ip) {
   $.ajax({
      "type": "POST",
      "url": "/server/" + ip + "/inventory"
   }).done(function(data) {
      $.log("inventory triggered");
   });
}

function trigger_reboot(ip) {
   $.ajax({
      "type": "POST",
      "url": "/server/" + ip + "/reboot"
   }).done(function(data) {
      $.log("reboot triggered");
   });
}

