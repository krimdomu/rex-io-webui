
var $INIT = {
  server: [],
  server_list: [],
};

(function() {
  add_load_callback("/server", onload_list_server);
  add_load_callback(new RegExp("/server/(\\d+)"), function() {
    var s_reg = new RegExp("/server/(\\d+)$");
    var a_reg = s_reg.exec(document.location.hash);
    var srv_id = a_reg[1];
    onload_server_page(srv_id);
  });
  add_load_callback("/server/new", onload_server_new_page);
  add_load_callback("/server_group", noop_function);

  $(document).ready(function() {


    $(".server-add-link").click(function(event) {
      event.preventDefault();
      event.stopPropagation();

      load_page("/server/new", null, onload_server_new_page);
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

function onload_server_new_page() {

  $(".save_button").button().click(function(event) {
    event.preventDefault();
    $.ajax({
      "url": "/server/new",
      "type": "POST",
      "data": JSON.stringify({
        "name": $("#name").val(),
        "mac": $("#mac").val(),
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


}

var tbl_nwa_list;
function prepare_server_nwa_list() {

  tbl_nwa_list = $("#table_server_network_devices").dataTable({
    //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "bJQueryUI": true,
    "bPaginate": false,
    "sPaginationType": "full_numbers",
    "bFilter": false,
    "bInfo": false
  });

  $("#table_server_network_devices tbody tr").click( function( e ) {
    if ( $(this).hasClass('row_selected') ) {
      $(this).removeClass('row_selected');
    }
    else {
      tbl_nwa_list.$('tr.row_selected').removeClass('row_selected');
      $(this).addClass('row_selected');
    }
  });

  prepare_data_tables();
}

var tbl_bridge_list;
function prepare_server_bridge_list() {

  tbl_bridge_list = $("#table_server_network_bridges").dataTable({
    //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "bJQueryUI": true,
    "bPaginate": false,
    "sPaginationType": "full_numbers",
    "bFilter": false,
    "bInfo": false
  });

  $("#table_server_network_bridges tbody tr").click( function( e ) {
    if ( $(this).hasClass('row_selected') ) {
      $(this).removeClass('row_selected');
    }
    else {
      tbl_bridge_list.$('tr.row_selected').removeClass('row_selected');
      $(this).addClass('row_selected');
    }
  });

  prepare_data_tables();

}


function prepare_server_list(minus_height) {

  var oTable = $("#table_entries_server").dataTable({
    //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "bFilter": false,
    "bJQueryUI": true,
    "bPaginate": false,
    "sScrollY": $("#content_area").height()-minus_height,
    "sPaginationType": "full_numbers"
  });

  prepare_data_tables();

  $(".server-link").click(function(event) {
    load_server($(this).attr("srv_id"));
    event.preventDefault();
    return false;
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
  load_page("/server_group", null, function() {

    var minus_height = 265;

    group_view_hide_server();

    prepare_server_group_list(minus_height);
    prepare_server_list(minus_height);

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
    $.pnotify({
      text: "Server added to group",
      type: "info"
    });


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
    $.pnotify({
      text: "Group deleted",
      type: "info"
    });

    list_server_groups();
  });

}

function onload_list_server() {
  var minus_height = 285;

  prepare_server_list(minus_height);

  for(var hook in $INIT["server_list"]) {
    $INIT["server_list"][hook]();
  }

  $("#filter_now").button().click(function(event) {
    server_search();
  });

  //$("SELECT").selectBox();
  $(".save_button").button().click(function(event) {
    event.preventDefault();
    var srv_id = $(this).attr("srv_id");
    $.log("server_id: " + srv_id);
    $.log("boot_id: " + $("#next_boot_target_" + srv_id).val());
    $.ajax({
      "type": "POST",
      "url": "/server/" + srv_id + "/boot/" + $("#next_boot_target_" + srv_id).val()
    }).done(function(data) {
      try {
        if(data.ok != true) {
          throw "Error updating Server next_boot_target";
        }
        $.pnotify({
          text: "Boot target updated.",
          type: "info"
        });

      } catch(err) {
        $.log(err);
      }
    });
  });



}

function list_server() {
  load_page("/server", null, onload_list_server);
}

function server_delete_bridge(srv_id, br_id) {

  $.ajax({
    "type": "DELETE",
    "url": "/server/" + srv_id + "/bridge/" + br_id,
  }).done(function(data) {
    if(data.ok == true) {
      $.pnotify({
        text: "Bridge deleted.",
        type: "info"
      });

      load_server(server_id, function() {
        activate_tab($("#li-tab-network"));
      });
    }
    else {
      $.pnotify({
        text: "Error deleting bridge.",
        type: "error"
      });
    }
  });

}

function server_delete_network_adapter(srv_id, nwa_id) {

  $.ajax({
    "type": "DELETE",
    "url": "/server/" + srv_id + "/network_adapter/" + nwa_id,
  }).done(function(data) {
    if(data.ok == true) {
      $.pnotify({
        text: "Network adapter deleted.",
        type: "info"
      });

      load_server(server_id, function() {
        activate_tab($("#li-tab-network"));
      });
    }
    else {
      $.pnotify({
        text: "Error deleting network adapter.",
        type: "error"
      });
    }
  });

}

var __func_network_device_save = function() {};

function onload_server_page(srv_id, callback) {

  prepare_tab();
  activate_tab($(".tab-pane:first"));

  prepare_server_bridge_list();
  prepare_server_nwa_list();

  // run all init hooks
  for(var hook in $INIT["server"]) {
    $INIT["server"][hook]();
  }


  $("#lnk_del_server").click(function() {
    delete_server(srv_id);
  });

  $("#lnk_server_network_add_bridge").click(function(event) {
    open_add_new_bridge_dialog();
    return cancel_events(event);
  });

  $("#lnk_server_network_add_adapter").click(function(event) {
    open_add_new_network_dialog();
    return cancel_events(event);
  });

  $("#lnk_server_network_delete_bridge").click(function(event) {
    var sel_row = fnGetSelected(tbl_bridge_list);
    var br_id = $(sel_row).attr("dev_id");
    var br = $(sel_row).attr("dev");

    if(! br_id) {
      dialog_msgbox({
        "title": "No bridge selected.",
        "text": "You have to select a bridge."
      });
      return cancel_events(event);
    }

    dialog_confirm({
      id: "server_network_delete_bridge",
      title: "Really delete bridge " + br + "?",
      text: "This entry will be permanently deleted " + br,
      button: "Delete",
      ok: function() {
        server_delete_bridge(srv_id, br_id);
      },
      cancel: function() {}
    });

    return cancel_events(event);

  });

  $("#lnk_server_network_delete_adapter").click(function(event) {
    var sel_row = fnGetSelected(tbl_nwa_list);
    var nwa_id = $(sel_row).attr("dev_id");
    var nwa = $(sel_row).attr("dev");

    if(! nwa_id) {
      dialog_msgbox({
        "title": "No Network-Adapter selected.",
        "text": "You have to select a Network-Adapter."
      });
      return cancel_events(event);
    }

    dialog_confirm({
      id: "server_network_delete_adapter",
      title: "Really delete network adapter " + nwa + "?",
      text: "This entry will be permanently deleted " + nwa,
      button: "Delete",
      ok: function() {
        server_delete_network_adapter(srv_id, nwa_id);
      },
      cancel: function() {}
    });

    return cancel_events(event);
  });

  $("#lnk_server_network_configure_bridge").click(function(event) {
    var sel_row = fnGetSelected(tbl_bridge_list);
    var br_id = $(sel_row).attr("dev_id");

    if(! br_id) {
      dialog_msgbox({
        "title": "No bridge selected.",
        "text": "You have to select a bridge."
      });
      return cancel_events(event);
    }

    __func_network_device_save = function() {
        var sel_row = fnGetSelected(tbl_bridge_list);
        var br_id = $(sel_row).attr("dev_id");

        var ref = {
          "name": $("#nwa_name").val(),
          "ip": $("#nwa_ip").val(),
          "netmask": $("#nwa_netmask").val(),
          "network": $("#nwa_network").val(),
          "broadcast": $("#nwa_broadcast").val(),
          "gateway": $("#nwa_gateway").val(),
          "proto": $("#nwa_proto").val()
        };

        if($("#nwa_boot").is(":checked")) {
          ref['boot'] = 1;
        }
        else {
          ref['boot'] = 0;
        }

        save_bridge_configuration(br_id, ref);

      };

    open_configure_bridge_dialog(br_id);

    return cancel_events(event);
  });



  $("#lnk_server_network_configure_adapter").click(function(event) {
    var sel_row = fnGetSelected(tbl_nwa_list);
    var nwa_id = $(sel_row).attr("dev_id");

    if(! nwa_id) {
      dialog_msgbox({
        "title": "No Network-Adapter selected.",
        "text": "You have to select a Network-Adapter."
      });

      return cancel_events(event);
    }

    __func_network_device_save = function() {
        var sel_row = fnGetSelected(tbl_nwa_list);
        var nwa_id = $(sel_row).attr("dev_id");

        var ref = {
          "dev": $("#nwa_name").val(),
          "ip": $("#nwa_ip").val(),
          "mac": $("#nwa_mac").val(),
          "netmask": $("#nwa_netmask").val(),
          "network": $("#nwa_network").val(),
          "broadcast": $("#nwa_broadcast").val(),
          "gateway": $("#nwa_gateway").val(),
          "proto": $("#nwa_proto").val(),
          "network_bridge_id": $("#nwa_bridge").val()
        };

        if($("#nwa_boot").is(":checked")) {
          ref['boot'] = 1;
        }
        else {
          ref['boot'] = 0;
        }

        save_network_adapter_configuration(nwa_id, ref);

      };

    open_configure_network_dialog(nwa_id);

    return cancel_events(event);
  });

  $("#configure_network_device").dialog({
    autoOpen: false,
    height: 500,
    width: 350,
    modal: true,
    buttons: {
      "Save": function() {
        __func_network_device_save();
        $(this).dialog("close");
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    },
    close: function() {
    }
  });

  $("#rename_server").dialog({
    autoOpen: false,
    height: 300,
    width: 350,
    modal: true,
    buttons: {
      "Rename Server": function() {
        $.log("new name: " + $("#name").val());
        var new_name = $("#name").val();
        var srv_id  = $("#srv_id").val();
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
    $.log("dns?: " + $("#dns_" + nwa_id).attr("checked"));

    if($("#dns_" + nwa_id).attr("checked") == "checked") {
      var name_split = $("#txt_hostname").val().split(/\./);
      var hostname = name_split.shift();
      var domainname = name_split.join(".");

      if(domainname) {
        // also register dns
        add_dns_entry({
          domain: domainname,
          type: "A",
          name: hostname,
          data: $("#ip_" + nwa_id).val(),
          ttl: 3600
        });

        // and register reverse dns
        var ip_split = $("#ip_" + nwa_id).val().split(/\./);
        var ip_name = ip_split.pop();
        var ip_domain = ip_split.reverse().join(".") + ".IN-ADDR.ARPA";

        add_dns_entry({
          domain: ip_domain,
          type: "PTR",
          name: ip_name,
          data: $("#txt_hostname").val(),
          ttl: 3600
        });

      }


    }

    $.ajax({
      "type": "POST",
      "url": "/network-adapter/" + nwa_id,
      "data": JSON.stringify({
        "proto": $("#proto_" + nwa_id).val(),
        "wanted_ip": $("#ip_" + nwa_id).val(),
        "wanted_netmask": $("#netmask_" + nwa_id).val(),
        "wanted_broadcast": $("#broadcast_" + nwa_id).val(),
        "wanted_network": $("#network_" + nwa_id).val(),
        "wanted_gateway": $("#gateway_" + nwa_id).val(),
        "boot": ($("#boot_" + nwa_id).attr("checked") == "checked" ? 1 : 0)
      })
    }).done(function(data) {
      $.log("Saved NetworkAdapter\nGot Data: " + JSON.stringify(data));
      $.pnotify({
        text: "Network adapter updated.",
        type: "info"
      });


    });
  });

  $("#initialize_server").dialog({
    autoOpen: false,
    height: 600,
    width: 650,
    modal: true,
    buttons: {
      "Add": function() {
        $.log("initializing server");

        $.ajax({
          "url": "/server/initialize",
          "type": "POST",
          "data": JSON.stringify({
            "name": $("#name").val()
          }),
          "contentType": "application/json",
          "dataType": "json"
        }).done(function(data) {
          try {
            if(data.ok != true) {
              throw "Error adding new dns record";
            }
            else {
              //load_server(srv_id);
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

  $("#btn_initialize_server").button().click(function(event) {
    event.preventDefault();
    initialize_server($(this).attr("srv_id"));
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
      "url": "/server/" + srv_id + "/boot/" + $("#next_boot_target").val()
    }).done(function(data) {
      try {
        if(data.ok != true) {
          throw "Error updating Server next_boot_target";
        }
        $.pnotify({
          text: "Boot target updated.",
          type: "info"
        });
      } catch(err) {
        $.log(err);
      }
    });
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

  if(typeof callback != "undefined") {
    callback();
  }


}

function save_bridge_configuration(br_id, ref) {

  $.ajax({
    "type": "POST",
    "url": "/server/" + server_id + "/bridge/" + br_id,
    "data": JSON.stringify(ref)
  }).done(function(data) {
    if(data.ok == true) {
      $.pnotify({
        text: "Bridge updated.",
        type: "info"
      });

      load_server(server_id, function() {
        activate_tab($("#li-tab-network"));
      });

    }
    else {
      $.pnotify({
        text: "Failed updating bridge.",
        type: "error"
      });
    }

    $("#tr_mac").show();
    $("#tr_bridge").show();
  });

}

function save_network_adapter_configuration(nwa_id, ref) {

  $.ajax({
    "type": "POST",
    "url": "/server/" + server_id + "/network_adapter/" + nwa_id,
    "data": JSON.stringify(ref)
  }).done(function(data) {
    if(data.ok == true) {
      $.pnotify({
        text: "Network adapter updated.",
        type: "info"
      });

      load_server(server_id, function() {
        activate_tab($("#li-tab-network"));
      });

    }
    else {
      $.pnotify({
        text: "Failed updating network adapter.",
        type: "error"
      });
    }
  });

}

function open_add_new_bridge_dialog() {

  __func_network_device_save = function() {

      var ref = {
        "name": $("#nwa_name").val(),
        "ip": $("#nwa_ip").val(),
        "netmask": $("#nwa_netmask").val(),
        "network": $("#nwa_network").val(),
        "broadcast": $("#nwa_broadcast").val(),
        "gateway": $("#nwa_gateway").val(),
        "proto": $("#nwa_proto").val()
      };

      if($("#nwa_boot").is(":checked")) {
        ref['boot'] = 1;
      }
      else {
        ref['boot'] = 0;
      }

      save_bridge_configuration("new", ref);

    };


  $("#tr_mac").hide();
  $("#tr_bridge").hide();

  $("#configure_network_device").dialog('open');
  $("#nwa_name").val("");
}

function open_add_new_network_dialog() {

  $("#tr_bridge").show();
  $("#tr_mac").show();

  __func_network_device_save = function() {

      var ref = {
        "dev": $("#nwa_name").val(),
        "ip": $("#nwa_ip").val(),
        "mac": $("#nwa_mac").val(),
        "netmask": $("#nwa_netmask").val(),
        "network": $("#nwa_network").val(),
        "broadcast": $("#nwa_broadcast").val(),
        "gateway": $("#nwa_gateway").val(),
        "proto": $("#nwa_proto").val(),
        "network_bridge_id": $("#nwa_bridge").val()
      };

      if($("#nwa_boot").is(":checked")) {
        ref['boot'] = 1;
      }
      else {
        ref['boot'] = 0;
      }

      save_network_adapter_configuration("new", ref);

    };


  $("#configure_network_device").dialog('open');
  $("#nwa_name").val("");
}

function open_configure_bridge_dialog(br_id) {

  $.ajax({
    "type":"GET",
    "url":"/server/" + server_id + "/bridge/" + br_id,
  }).done(function(data) {
    $("#tr_mac").hide();
    $("#tr_bridge").hide();

    $("#configure_network_device").dialog('open');
    $("#nwa_name").val(data.name != 0 ? data.name : "");
    $("#nwa_ip").val(data.ip != 0 ? data.ip : "");
    $("#nwa_netmask").val(data.netmask != 0 ? data.netmask : "");
    $("#nwa_broadcast").val(data.broadcast != 0 ? data.broadcast : "");
    $("#nwa_network").val(data.network != 0 ? data.network : "");
    $("#nwa_gateway").val(data.gateway != 0 ? data.gateway : "");

    if(data.boot == 1) {
      $("#nwa_boot").prop('checked', true);
    }
    else {
      $("#nwa_boot").prop('checked', false);
    }

    $("#nwa_proto option[value=" + data.proto + "]").attr("selected", true);

  });

}

function open_configure_network_dialog(nwa_id) {

  $.ajax({
    "type":"GET",
    "url":"/server/" + server_id + "/network_adapter/" + nwa_id,
  }).done(function(data) {
    $("#tr_mac").show();
    $("#tr_bridge").show();
    $("#configure_network_device").dialog('open');
    $("#nwa_name").val(data.dev != 0 ? data.dev : "");
    $("#nwa_ip").val(data.ip != 0 ? data.ip : "");
    $("#nwa_mac").val(data.mac != 0 ? data.mac : "");
    $("#nwa_netmask").val(data.netmask != 0 ? data.netmask : "");
    $("#nwa_broadcast").val(data.broadcast != 0 ? data.broadcast : "");
    $("#nwa_network").val(data.network != 0 ? data.network : "");
    $("#nwa_gateway").val(data.gateway != 0 ? data.gateway : "");

    if(data.boot == 1) {
      $("#nwa_boot").prop('checked', true);
    }
    else {
      $("#nwa_boot").prop('checked', false);
    }

    $("#nwa_proto option[value=" + data.proto + "]").attr("selected", true);

    if(typeof data["bridge"] != "undefined" && typeof data["bridge"]["name"] != "undefined") {
      $("#nwa_bridge option[value=" + data.bridge.id + "]").prop("selected", true);
    }
    else {
      $("#nwa_bridge option").prop("selected", false);
      $("#nwa_bridge")[0].selectedIndex = 0;
    }

  });

}

function load_server(srv_id, callback) {

  load_page("/server/" + srv_id, null, function() { onload_server_page(srv_id, callback) });

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
      $.pnotify({
        text: "Server renamed",
        type: "info"
      });


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

  dialog_confirm({
    id: "server_reboot_dialog",
    title: "Really reboot server?",
    text: "The server will reboot!",
    button: "Reboot",
    ok: function() {
      $.ajax({
        "type": "POST",
        "url": "/server/" + ip + "/reboot"
      }).done(function(data) {
        $.pnotify({
          text: "Reboot send",
          type: "info"
        });
      });
    },
    cancel: function() {}
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

        $.pnotify({
          title: "Executing task on " + ref[i].host,
          text: "Executing service " + ref[i].script + " / " + ref[i].task + " on " + ref[i].host,
          type: "info"
        });
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

      $.pnotify({
        title: "Done executing task on " + ref.host,
        text: "Done executing service " + ref.script + " / " + ref.task + " on " + ref.host,
        type: "info"
      });
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

    else if(ref.cmd == "deploy") {
      console.log(ref);

      if(ref.type == "newsystem") {
        $.pnotify({
          title: "New system available",
          text: 'There is a new system available. Checkout server list and lookout for <a href="javascript:load_server(' + ref.host.id + ')">' + ref.host.name + "</a>",
          type: "info"
        });
      }

      if(ref.type == "start") {
        var li_id = "li_deploy_" + ref.host.id;
        $("#message_list").append('<li id="'
                        + li_id
                        + '" class="icon-rotating">Deploying '
                        + ref.template.name
                        + " on " + ref.host.name + "</li>");

        $.pnotify({
          title: "OS installation started",
          text: 'OS installation started on <a href="javascript:load_server(' + ref.host.id + ')">' + ref.host.name + '</a>',
          type: "info"
        });

      }


      if(ref.type == "finished") {
        var li_id = "li_deploy_" + ref.host.id;
        $("#" + li_id).removeClass("icon-rotating").addClass("icon-ok");
        window.setTimeout(function() {
          $("#" + li_id).remove();
        }, 5000);

        $.pnotify({
          title: "OS installation finished",
          text: 'OS installation finished on <a href="javascript:load_server(' + ref.host.id + ')">' + ref.host.name + '</a>',
          type: "info"
        });
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

    else if(ref.cmd == "jobqueue_output") {
      var log_div_name = "#jobqueue_output_" + ref.host;
      log_div_name.replace(/\./g, "_");

      var log_lines = $(".jobqueue_log_line");
      if(log_lines.length > 30) {
        $(log_lines[0]).detach();
      }

      var log_div = $(log_div_name);
      if(log_div) {
        var new_html = new Array();

        ref.line = ref.line.replace(/INFO/, '<span class="green_text">INFO</span>');
        ref.line = ref.line.replace(/WARN/, '<span class="orange_text">WARN</span>');
        ref.line = ref.line.replace(/ERROR/, '<span class="red_text">ERROR</span>');

        new_html.push('<div class="jobqueue_log_line">');
        new_html.push(ref.line);
        new_html.push('</div>');

        log_div.append(new_html.join("\n"));

        log_div.show();
      }
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

function delete_server(srv_id) {

  dialog_confirm({
    id: "server_delete_dialog",
    title: "Really delete " + server_name,
    text: "This server will be permanently deleted and cannot be recovered. Are you sure?",
    button: "Delete",
    ok: function() {
      $.ajax({
        "url": "/server/" + srv_id,
        "type": "DELETE"
      }).done(function(data) {

        $.pnotify({
          text: "Server deleted",
          type: "info"
        });

        list_server();
      });
    },
    cancel: function() {}
  });

}

function open_ws_connection() {
  $GLOBALS["ws"] = new WebSocket("ws://" + document.location.host + "/server_events");

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
      var date_now = new Date();
      if(connection_count > 50 && (last_time_connected.getTime() + 10 * 1000) <= date_now.getTime()) {
        console.log("no connection any more...");
        $.pnotify({
          title: "No connection to Message-Broker",
          text: "It seems that we can't establish a connection to the message-broker. Falling back to poll-mode.",
          type: "info"
        });
      }
      else {
        console.log("ws reconnect...");
        $GLOBALS["ws"] = open_ws_connection();
      }
    }
  };

  ws_restart_timer();
}

function initialize_server(srv_id) {
  $("#initialize_server").dialog("open");
}

/**
 * a timer to restart the websocket connection from time to time
 */

function ws_restart_timer() {
  window.setTimeout(function() {
    $GLOBALS["ws"].close();
    open_ws_connection();
  }, 1000*60*1);
}

function server_list_init_hook(func) {
  $INIT["server_list"].push(func);
}

function server_init_hook(func) {
  $INIT["server"].push(func);
}

function server_search() {
  var query_string = new Array();
  var post_data = new Array();

  $(".filter_key").each(function() {
    if($(this).val() != "") {
      query_string.push("table=" + $(this).attr("table"));
      query_string.push($(this).attr("table") + "." + $(this).attr("key") + "=" + encodeURI($(this).val()));
    }
  });

  //load_page();
  load_page("/server?" + query_string.join("&"), null, onload_list_server);
}
