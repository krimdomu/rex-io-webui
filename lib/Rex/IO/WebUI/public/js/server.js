(function() {

   $(document).ready(function() {
      
      $(".server-add-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();

         $(".page-content-container").load("/server/new", null, function() {
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
   $(".page-content-container").load("/server", null, function() {

      var minus_height = 285;

      var oTable = $("#table_entries").dataTable({
         //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
         "bJQueryUI": true,
         "bPaginate": false,
         "sScrollY": $("#content_area").height()-minus_height,
         "sPaginationType": "full_numbers"
      });

      prepare_data_tables();

      $(".server-link").click(function() {
         load_server($(this).attr("srv_id"));
      });

      //$("SELECT").selectBox();
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
            $("#table_entries").parent().css("height", $("#content_area").height()-minus_height);
            oTable.fnDraw();
         }, 500);
      });


      $(".bulk_op_button").button().click(function(event) {

         if($("#bulk_operation")[0].value == "add_services") {
            var all_checked_server = new Array();

            $(".bulk_checkbox").each(function(idx, itm) {
               if(itm.checked == true) {
                  all_checked_server.push({
                     id: $(itm).attr("srv_id"),
                     name: $(itm).attr("srv_name")
                  });
               }
            });

            load_bulk_view(all_checked_server);
         } // --- end add_services

      });
   });
}

function load_bulk_view(servers) {

   $(".page-content-container").load("/server/bulk", null, function() {
      for(var server in servers) {
         $("#selected_servers").append('<li srv_id="' + servers[server].id + '">' + servers[server].name + "</li>");
      }

      $("#registered_services, #available_services").sortable({
         connectWith: ".service_list"
      }).disableSelection();

      $("#save_services").button().click(function(event) {
         console.log("saving services...");
      });

      $("#run_services").button().click(function(event) {
         console.log("running services...");
      });

   });

}

function load_server(srv_id) {

   $(".page-content-container").load("/server/" + srv_id, null, function() {

      prepare_tab();
      activate_tab($(".tab-pane:first"));

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

      $("#tabs > .ui-tabs-panel").height($("#content_area").height() 
               - $("#tabs > .ui-tabs-nav").height() 
               - 45
         );

      //$("SELECT").selectBox();

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

      $("#registered_services, #available_services").sortable({
         connectWith: ".service_list"
      }).disableSelection();


      $("#save_services").button().click(function(event) {
         $("#registered_services > li").each(function(idx, itm) {
            delete_all_tasks_from_server($(itm).attr("srv_id"), function() {
               save_task_for_server($(itm).attr("task_id"), $(itm).attr("srv_id"), idx);
            });
         });
      });

      $("#run_services").button().click(function(event) {
         var tasks = new Array();

         $("#registered_services > li").each(function(idx, itm) {
            tasks.push({
               "server_id": $(itm).attr("srv_id"),
               "task_id": $(itm).attr("task_id")
            });
         });

         run_tasks_on_server(tasks);
      });

   });

}

function run_tasks_on_server(tasks, callback) {
   console.log("Running multiple tasks: " + tasks);

   $.ajax({
      "type":"RUN",
      "url":"/server/tasks",
      "data": JSON.stringify(tasks)
   }).done(function(data) {
      console.log(data);
   });
}

function run_task_on_server(task_id, server_id, callback) {
   console.log("Running task: " + task_id + " on server: " + server_id);

   $.ajax({
      "type":"RUN",
      "url":"/server/" + server_id + "/task/" + task_id
   }).done(function(data) {
      if(data.ok != true) {
         throw "Error running task for server";
      }

      if(callback) {
         callback();
      }
   });
}

function delete_all_tasks_from_server(server_id, callback) {
   // first remove all tasks
   $.ajax({
      "type":"DELETE",
      "url": "/server/" + server_id + "/tasks",
   }).done(function(data) {
      if(data.ok != true) {
         throw "Error removing services from server.";
      }

      if(callback) {
         callback();
      }
   });


}

function save_task_for_server(task_id, server_id, idx) {
   console.log("Saving task: " + task_id + " for server: " + server_id + " on position: " + idx);

   $.ajax({
      "type":"POST",
      "url":"/server/" + server_id + "/task",
      "data": JSON.stringify({
         "task_id": task_id,
         "task_order": idx
      })
   }).done(function(data) {
      console.log(data);
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

