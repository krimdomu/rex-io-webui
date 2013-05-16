(function() {

   $(document).ready(function() {

      $(".monitoring-incidents").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         list_incidents();
      });

      $(".monitoring-monitor-groups").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         list_monitoring_groups();
      });

   });

})();

function prepare_incident_list(ref) {

   var minus_height = ref.minus_height;

   var oTable = $("#table_entries_incident").dataTable({
      //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bJQueryUI": true,
      "bPaginate": false,
      "sScrollY": $("#content_area").height()-minus_height,
      "sPaginationType": "full_numbers"
   });

   prepare_data_tables();

   $(".incident-link").click(function() {
      load_incident($(this).attr("incident_id"));
   });

   if(ref.selectable) {
      $("#table_entries_incident tbody tr").click( function( e ) {
         if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
         }
         else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
         }
      });
   }

   $(window).on("resize", function() {
      if(typeof resize_Timer_incident != "undefined") {
         window.clearTimeout(resize_Timer_incident);
      }

      resize_Timer_incident = window.setTimeout(function() {
         $("#table_entries_incident").parent().css("height", $("#content_area").height()-minus_height);
         oTable.fnDraw();
      }, 500);
   });

   return oTable;
}

function prepare_mon_group_list(ref) {

   var minus_height = ref.minus_height;

   var oTable = $("#table_entries_mon_groups").dataTable({
      //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bJQueryUI": true,
      "bPaginate": false,
      "sScrollY": $("#content_area").height()-minus_height,
      "sPaginationType": "full_numbers"
   });

   prepare_data_tables();

   if(ref.selectable) {
      $("#table_entries_mon_groups tbody tr").click( function( e ) {
         if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
         }
         else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
         }
      });
   }

   $(window).on("resize", function() {
      if(typeof resize_Timer_mongroup != "undefined") {
         window.clearTimeout(resize_Timer_mongroup);
      }

      resize_Timer_mongroup = window.setTimeout(function() {
         $("#table_entries_mon_groups").parent().css("height", $("#content_area").height()-minus_height);
         oTable.fnDraw();
      }, 500);
   });

   return oTable;
}

function prepare_mon_item_list(ref) {

   var minus_height = ref.minus_height;

   var oTable = $("#table_entries_items").dataTable({
      //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bJQueryUI": true,
      "bPaginate": false,
      "sScrollY": $("#content_area").height()-minus_height,
      "sPaginationType": "full_numbers"
   });

   prepare_data_tables();

   if(ref.selectable) {
      $("#table_entries_items tbody tr").click( function( e ) {
         if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
         }
         else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
         }
      });
   }

   $(window).on("resize", function() {
      if(typeof resize_Timer_monitems != "undefined") {
         window.clearTimeout(resize_Timer_monitems);
      }

      resize_Timer_monitems = window.setTimeout(function() {
         $("#table_entries_items").parent().css("height", $("#content_area").height()-minus_height);
         oTable.fnDraw();
      }, 500);
   });

   return oTable;
}

function load_monitoring_group(id) {

   load_page("/monitoring/group/" + id, function() {

      minus_height = 265;
      var oTable = prepare_mon_item_list({"minus_height":minus_height, "selectable":true});

      prepare_dropdown();

      $(".mon-item-link").click(function() {
         load_monitoring_item($(this).attr("group_id"), $(this).attr("item_id"));
      });

      $("#add_mon_item").dialog({
         autoOpen: false,
         height: 520,
         width: 400,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/monitoring/group/" + id + "/item",
                  "type": "POST",
                  "data": JSON.stringify({
                     "name": $("#name").val(),
                     "check_key": $("#check_key").val(),
                     "unit": $("#unit").val(),
                     "divisor": $("#divisor").val(),
                     "relative": $("#relative").attr("checked") ? 1 : 0,
                     "calculation": $("#calculation").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new monitoring item record";
                     }
                     else {
                        load_monitoring_group(id);
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

      $("#lnk_add_mon_item").click(function() {
         $("#add_mon_item").dialog("open");
      });

      $("#lnk_del_mon_item").click(function() {
         var selected_row = fnGetSelected(oTable);
         var item_id = $(selected_row).attr("item_id");

         $.log("Delting: " + item_id);

         delete_monitor_item(id, item_id);
      });

   });

}

function load_monitoring_item(group_id, item_id) {

   load_page("/monitoring/group/" + group_id + "/item/" + item_id, function() {
      prepare_tab();
      activate_tab($(".tab-pane:first"));

      $(".save_mon_item").button().click(function(event) {

         $.ajax({
            "url": "/monitoring/group/" + group_id + "/item/" + item_id,
            "type": "POST",
            "data": JSON.stringify({
               "name": $("#name").val(),
               "check_key": $("#check_key").val(),
               "unit": $("#unit").val(),
               "divisor": $("#divisor").val(),
               "relative": $("#relative").attr("checked") ? 1 : 0,
               "calculation": $("#calculation").val(),
               "failure": $("#failure").val()
            }),
            "contentType": "application/json",
            "dataType": "json"
         }).done(function(data) {
            $.pnotify({
               title: "Monitoring Item saved",
               text: "Save monitoring item " + $("#name").val(),
               type: "info"
            });
         });
       
      });
   });

}

function delete_monitor_item(group_id, id) {

   $.ajax({
      "url": "/monitoring/group/" + group_id + "/item/" + id,
      "type": "DELETE"
   }).done(function(data) {
      load_monitoring_group(group_id);     
   });
 
}

function list_monitoring_groups() {

   load_page("/monitoring",function() {

      group_view_hide_server();

      minus_height = 265;
      var oTable = prepare_mon_group_list({"minus_height":minus_height, "selectable":true});
      prepare_server_list(minus_height);

      prepare_dropdown();

      $(".mon-group-link").click(function() {
         load_monitoring_group($(this).attr("monitor_group_id"));
      });

      $("#add_mon_group").dialog({
         autoOpen: false,
         height: 200,
         width: 350,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/monitoring/group",
                  "type": "POST",
                  "data": JSON.stringify({
                     "name": $("#name").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new monitoring group record";
                     }
                     else {
                        list_monitoring_groups();
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

      $("#lnk_add_mon_group").click(function() {
         $("#add_mon_group").dialog("open");
      });

      $("#lnk_del_mon_group").click(function() {
         var selected_row = fnGetSelected(oTable);
         var group_id = $(selected_row).attr("monitor_group_id");

         $.log("Delting: " + group_id);

         delete_monitor_group(group_id);
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

            var group_id = $(event.target).attr("monitor_group_id");
            var server_id = $(ui.draggable).attr("srv_id");

            console.log("Adding " + server_id + " to " + group_id);
            add_monitoring_template_to_host(group_id, server_id);
         }
      });



   });

}

function add_monitoring_template_to_host(group_id, server_id) {

   $.ajax({
      "url": "/monitoring/group/" + group_id + "/host/" + server_id,
      "type": "POST"
   }).done(function(data) {
      $.pnotify({
         title: "Added monitor group to host",
         text: "Added monitor group to host",
         type: "info"
      });
   });
 
}

function delete_monitor_group(group_id) {

   $.ajax({
      "url": "/monitoring/group/" + group_id,
      "type": "DELETE"
   }).done(function(data) {
      list_monitoring_groups();     
   });
 
}

function list_incidents() {

   load_page("/incident",function() {

      minus_height = 265;
      var oTable = prepare_incident_list({"minus_height":minus_height, "selectable":false});

      prepare_dropdown();

      $("#add_incident").dialog({
         autoOpen: false,
         height: 500,
         width: 650,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/incident",
                  "type": "POST",
                  "data": JSON.stringify({
                     "title": $("#i_title").val(),
                     "content": $("#i_content").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new dns record";
                     }
                     else {
                        list_incidents();
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

      $("#lnk_add_incident").click(function() {
         $("#add_incident").dialog("open");
      });

   });

}

function load_incident(incident_id) {

   load_page("/incident/" + incident_id,function() {

      prepare_dropdown();
      prepare_tab();
      activate_tab($(".tab-pane:first"));

      $("#add_incident_message").dialog({
         autoOpen: false,
         height: 550,
         width: 650,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/incident/" + incident_id,
                  "type": "POST",
                  "data": JSON.stringify({
                     "title": $("#m_title").val(),
                     "message": $("#m_message").val(),
                     "status": $("#m_status").val(),
                     "assignee": $("#m_assignee").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new dns record";
                     }
                     else {
                        load_incident(incident_id);
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

      $("#lnk_add_incident_message").click(function() {
         $("#add_incident_message").dialog("open");
      });

   });

}



