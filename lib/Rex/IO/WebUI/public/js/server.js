var $GLOBALS = {};

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

      // --- websockets - to get server events
      open_ws_connection();
      open_ws_mb_connection();
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

         $("#selected_servers > li").each(function(srv_idx, srv_itm) {

            delete_all_tasks_from_server($(srv_itm).attr("srv_id"), function() {
               $("#registered_services > li").each(function(task_idx, task_itm) {
                  save_task_for_server($(task_itm).attr("task_id"), $(srv_itm).attr("srv_id"), task_idx);
               });

            });

         });

      });

      $("#run_services").button().click(function(event) {

         $("#selected_servers > li").each(function(srv_idx, srv_itm) {
            var tasks = new Array();

            $("#registered_services > li").each(function(task_idx, task_itm) {
               tasks.push({
                  "server_id": $(srv_itm).attr("srv_id"),
                  "task_id": $(task_itm).attr("task_id")
               });
            });

            run_tasks_on_server(tasks);
         });

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

      $(".monitor_chart").each(function(idx, itm) {
         var itm_id = $(itm).attr("itm_id");
         var host_id = $(itm).attr("host_id");
         var check_key = $(itm).attr("check_key");

         if(typeof $GLOBALS["monitor"]["timer_" + host_id] == "undefined") {
            $GLOBALS["monitor"]["timer_" + host_id] = {};
         }

         if(typeof $GLOBALS["monitor"]["timer_" + host_id][check_key] == "undefined") {
            $GLOBALS["monitor"]["timer_" + host_id][check_key] = new TimeSeries();
         }

         var chart = new SmoothieChart();
         chart.addTimeSeries($GLOBALS["monitor"]["timer_" + host_id][check_key], {
            strokeStyle: 'rgba(0, 255, 0, 1)',
            fillStyle  : 'rgba(0, 255, 0, 0.2)',
            lineWidth: 1 });

         chart.streamTo(itm, 1000);
      });

      var ip = $("#agent_ip")[0].value;
      var dir = "/var/log";

      get_directory_listing(ip, dir);
   });

}

function run_tasks_on_server(tasks, callback) {

   $.ajax({
      "type":"RUN",
      "url":"/server/tasks",
      "data": JSON.stringify(tasks)
   }).done(function(data) {
      if(data.ok != true) {
         throw "Error running task on server";
      }
   });
}

function run_task_on_server(task_id, server_id, callback) {

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

   $.ajax({
      "type":"POST",
      "url":"/server/" + server_id + "/task",
      "data": JSON.stringify({
         "task_id": task_id,
         "task_order": idx
      })
   }).done(function(data) {
      if(data.ok != true) {
         throw "Error saving task for server";
      }
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

function get_directory_listing(ip, dir) {
   
   $GLOBALS["ws_mb"].send(JSON.stringify({
      "to_ip":ip,
      "type":"fs",
      "fs":"ls",
      "location":dir,
      "seq":get_random_string(16)
   }));

}

function process_ws_mb_message(msg) {
   //console.log("msg: " + msg);

   var ref = $.parseJSON(msg);

   if(typeof ref["type"] != "undefined") {
      if(ref["type"] == "return" && ref["return_type"] == "fs") {
         $("#file_browser").html("");

         var data = ref["data"];
         data.sort(function(a, b) { return (b["mtime"] - a["mtime"]) });

         for (var idx in data) {
            if(data[idx].is_dir == 1 || data[idx].size == null) {
               continue;
            }
            var file_name = data[idx].name;
            var file_size = data[idx].size;
            var tmp_file_date = new Date(data[idx].mtime * 1000);

            var month = tmp_file_date.getMonth();
            if(month < 10) { month = "0" + month }
            var day = tmp_file_date.getDay();
            if(day < 10) { day = "0" + day }
            var hour = tmp_file_date.getHours();
            if(hour < 10) { hour = "0" + hour }
            var min = tmp_file_date.getMinutes();
            if(min < 10) { min = "0" + min }

            var file_date = tmp_file_date.getFullYear() + "-" + month + "-" + day;
            file_date += " " + hour + ":" + min;

            $("#file_browser").append('<tr><td><a href="#" file_name="' + file_name + '">' + file_name + '</a></td><td width="150">' + file_size + '</td><td width="150">' + file_date + '</td></tr>');
         }
      }
   }
}

$GLOBALS["monitor"] = {};

function process_ws_message(msg) {
   //console.log("ws message: " + msg);
   var ref = $.parseJSON(msg);

   if(typeof ref.push == "function") {
      // it's an array, so iterate

      for(var i in ref) {
         if(ref[i].cmd == "Execute") {
            var li_id = "li_" + ref[i].magic;
            $("#message_list").append('<li id="' 
                                    + li_id 
                                    + '" class="icon-rotating">Executing ' 
                                    + ref[i].script + " / " + ref[i].task 
                                    + " on " + ref[i].host + "</li>");
         }
      }
   }

   else {
      if(ref.cmd == "Answer") {
         var li_id = "li_" + ref.magic;
         $("#" + li_id).removeClass("icon-rotating").addClass("icon-ok");
         window.setTimeout(function() {
            $("#" + li_id).remove();
         }, 5000);
      }

      else if(ref.cmd == "monitor") {
         var item_id = ref.template_item_id;
         var host_id = ref.host;

         push_monitor_data(ref);
      }
   }
}

function push_monitor_data(ref) {
   var host_id = ref.host;
   var item_id = ref.template_item_id;

   if(typeof $GLOBALS["monitor"]["timer_" + host_id] == "undefined") {
      $GLOBALS["monitor"]["timer_" + host_id] = {};
   }

   if(typeof $GLOBALS["monitor"]["host_" + host_id] == "undefined") {
      $GLOBALS["monitor"]["host_" + host_id] = {};
   }

   if(typeof $GLOBALS["monitor"]["host_" + host_id][ref.check_key] == "undefined") {
      $GLOBALS["monitor"]["host_" + host_id][ref.check_key] = [];
   }

   if(typeof $GLOBALS["monitor"]["timer_" + host_id][ref.check_key] == "undefined") {
      $GLOBALS["monitor"]["timer_" + host_id][ref.check_key] = new TimeSeries();
   }

   var calct;

   if(ref.calculation) {
      calct = calculate_value(ref.calculation, $GLOBALS["monitor"]["host_" + host_id]);
   }
   else {
      calct = ref.value / ref.divisor;
   }

   $GLOBALS["monitor"]["timer_" + host_id][ref.check_key].append(new Date(ref.created * 1000).getTime(), calct);

   $GLOBALS["monitor"]["host_" + host_id][ref.check_key].push({
      "created": ref.created,
      "value"  : ref.value,
      "calculated": calct
   });

   populate_monitoring_field(host_id, item_id, ref.check_key);
}

function populate_monitoring_field(host_id, item_id, check_key) {


   var span_id = "#monitor_" + host_id + "_" + item_id;
   var item_list = $GLOBALS["monitor"]["host_" + host_id][check_key];
   var last_entry = item_list[item_list.length - 1];

   $(span_id).html(last_entry.calculated);

}

function open_ws_connection() {
   $GLOBALS["ws"] = new WebSocket("ws://localhost:3000/server_events");

   $GLOBALS["ws"].onopen = function() {
      console.log("ws socket opened.");
   };

   $GLOBALS["ws"].onmessage = function(msg) {
      process_ws_message(msg.data);
   };

   $GLOBALS["ws"].onclose = function(data) {
      console.log("ws socket closed.");
      if(data.wasClean == false) {
         // reconnect
         console.log("ws reconnect...");
         $GLOBALS["ws"] = open_ws_connection();
      }
   };
}

function open_ws_mb_connection() {
   $GLOBALS["ws_mb"] = new WebSocket("ws://localhost:3000/messagebroker");

   $GLOBALS["ws_mb"].onopen = function() {
      console.log("ws_mb socket opened.");
   };

   $GLOBALS["ws_mb"].onmessage = function(msg) {
      process_ws_mb_message(msg.data);
   };

   $GLOBALS["ws_mb"].onclose = function(data) {
      console.log("ws_mb socket closed.");
      if(data.wasClean == false) {
         // reconnect
         console.log("ws_mb reconnect...");
         $GLOBALS["ws_mb"] = open_ws_mb_connection();
      }
   };
}
