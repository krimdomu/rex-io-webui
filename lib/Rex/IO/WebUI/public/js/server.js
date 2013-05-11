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

      $(".server-group").click(function(event) {
         event.preventDefault();
         event.stopPropagation();

         list_server_groups();
      });

      // --- websockets - to get server events
      open_ws_connection();
   });

})();

function prepare_server_list(minus_height) {

   var oTable = $("#table_entries_server").dataTable({
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

   $(window).on("resize", function() {
      if(typeof resize_Timer_server != "undefined") {
         window.clearTimeout(resize_Timer_server);
      }

      resize_Timer_server = window.setTimeout(function() {
         $("#table_entries_server").parent().css("height", $("#content_area").height()-minus_height);
         oTable.fnDraw();
      }, 500);
   });


}

function prepare_server_group_list(minus_height) {

   var oTable = $("#table_entries_server_groups").dataTable({
      //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bJQueryUI": true,
      "bPaginate": false,
      "sScrollY": $("#content_area").height()-minus_height,
      "sPaginationType": "full_numbers"
   });

   prepare_data_tables();

   $("#table_entries_server_groups tbody tr").click( function( e ) {
      if ( $(this).hasClass('row_selected') ) {
         $(this).removeClass('row_selected');
      }
      else {
         oTable.$('tr.row_selected').removeClass('row_selected');
         $(this).addClass('row_selected');
      }
   });

   $(window).on("resize", function() {
      if(typeof resize_Timer_group != "undefined") {
         window.clearTimeout(resize_Timer_group);
      }

      resize_Timer_group = window.setTimeout(function() {
         $("#table_entries_server_groups").parent().css("height", $("#content_area").height()-minus_height);
         oTable.fnDraw();
      }, 500);
   });


}

function list_server_groups() {
   $(".page-content-container").load("/server_group", null, function() {

      var minus_height = 265;

      group_view_hide_server();

      prepare_server_group_list(minus_height);
      prepare_server_list(minus_height);

      $(".pull-menu").click(function(event) {
         if($(".dropdown-menu").css("display") == "none") {
            $(".dropdown-menu").show();
         }
         else {
            $(".dropdown-menu").hide();
         }

         event.preventDefault();
         event.stopPropagation();
      });

      $("#add_server_group").dialog({
         autoOpen: false,
         height: 300,
         width: 350,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/server_group",
                  "type": "POST",
                  "data": JSON.stringify({
                     "name": $("#name").val(),
                     "description": $("#description").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new dns record";
                     }
                     else {
                        list_server_groups();
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
         }
      });

      $("#lnk_add_server_group").click(function() {
         $("#add_server_group").dialog("open");
      });

       $("#lnk_del_server_group").click(function() {
         var selected_row = fnGetSelected(oTable);
         var group_id = $(selected_row).attr("group_id");

         $.log("Delting Server Group: " + group_id);

         delete_server_group(group_id);
      });

      // initialize server drag'n'drop
      $(".server_hndl").draggable({
         cursor: "move",
         cursorAt: { left: -20 },
         helper: function(event) {
            var itm = event.currentTarget;
            return $('<div style="background-color: #fcfcfc; border: 1px solid #c3c3c3;">' + $(itm).attr("srv_name") + '</div>');
         }
      });

      $(".group_drag_server").droppable({
         over: function(event, ui) {
            $(event.target).parent().parent().addClass("row_selected");
         },
         out: function(event, ui) {
            $(event.target).parent().parent().removeClass("row_selected");
         },
         drop: function(event, ui) {
            $(event.target).parent().parent().removeClass("row_selected");

            var group_id = $(event.target).attr("group_id");
            var server_id = $(ui.draggable).attr("srv_id");

            console.log("Adding " + server_id + " to " + group_id);

            add_server_to_group(server_id, group_id);
         }
      });

   });
}

function add_server_to_group(server_id, group_id) {
   $.ajax({
      "url": "/server_group/server/" + server_id + "/" + group_id,
      "type": "POST"
   }).done(function(data) {
      // display success message
      console.log("done");
   });
 
}

function group_view_hide_server() {

   $("#lnk_show_server").html("Show Server");
   $("#lnk_show_server").off("click");

   $("#lnk_show_server").click(function() {
      group_view_show_server();
   });

   $(".right_frame").hide();
   $(".left_frame").width("100%");

   $(window).trigger("resize");
}

function group_view_show_server() {

   $("#lnk_show_server").html("Hide Server");
   $("#lnk_show_server").off("click");

   $("#lnk_show_server").click(function() {
      group_view_hide_server();
   });

   $(".left_frame").width("50%");
   $(".right_frame").show();

   $(window).trigger("resize");
}

function delete_server_group(group_id) {
   $.ajax({
      "url": "/server_group/" + group_id,
      "type": "DELETE"
   }).done(function(data) {
      list_server_groups();     
   });
 
}

function list_server() {
   $(".page-content-container").load("/server", null, function() {

      var minus_height = 285;

      prepare_server_list(minus_height);

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

      else if(ref.cmd == "alerts") {
         if(ref.type == "alert") {
            $("#alert_no_events").remove();
            $("#alert_no_events_" + ref.host.id).remove();

            var html = new Array();

            html.push('<tr id="alert_' + ref.host.id + '_' + ref.template_item.id + '">');
            html.push('<td width="24" class="td-icon icon-warning"></td>');
            html.push('<td width="150">' + ref.time + "</td>");
            html.push('<td width="200">' + ref.host.name + "</td>");
            html.push("<td>" + ref.template_item.name + "</td>");
            html.push("</tr>");

            $("#monitoring_table").prepend(html.join("\n"));

            $("#incident_counter").html($("#monitoring_table tr").length);

            // and update the host view if open

            html = new Array();

            html.push('<tr id="alert_' + ref.host.id + '_' + ref.template_item.id + '_' + ref.host.id + '">');
            html.push('<td width="24" class="td-icon icon-warning"></td>');
            html.push('<td width="150">' + ref.time + '</td>');
            html.push("<td>" + ref.template_item.name + "</td>");
            html.push("</tr>");

            $("#monitoring_table_" + ref.host.id).prepend(html.join("\n"));

         }
         else if(ref.type == "clear") {
            $("#alert_" + ref.host.id + "_" + ref.template_item.id).remove();
            $("#alert_" + ref.host.id + "_" + ref.template_item.id + "_" + ref.host.id).remove();

            $("#incident_counter").html($("#monitoring_table tr").length);

            if($("#monitoring_table tr").length == 0) {
               $("#monitoring_table").append('<tr id="alert_no_events"><td>Currently everything is up and running. So go and get a coffee as long as you can...</td></tr>');
            }


            if($("#monitoring_table_" + ref.host.id + " tr").length == 0) {
               $("#monitoring_table_" + ref.host.id).append('<tr id="alert_no_events_' + ref.host.id + '"><td>There are currently no incidents for this host...</td></tr>');
            }

         }
      }

      else if(ref.cmd == "logstream") {
         var host_id = ref.host_id;
         var log_table = "#log_browser_" + host_id;
         //$("#" + log_table).append('');

         var col_names = new Array();
         $(".th-log-browser-" + ref.host_id).each(function(idx, itm) {
            col_names.push($(itm).attr("col_name"));
         });

         var new_html = new Array();

         new_html.push("<tr>");
         for(var i in col_names) {
            new_html.push("<td>");
            new_html.push(ref.data[col_names[i]]);
            new_html.push("</td>");
         }
         new_html.push("</tr>");

         $(".tr-log-browser-head-" + ref.host_id).after(new_html.join("\n"));
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

