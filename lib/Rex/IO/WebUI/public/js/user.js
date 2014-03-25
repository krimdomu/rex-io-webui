(function() {

  $(document).ready(function() {

    $(".users-users").click(function(event) {
      event.preventDefault();
      event.stopPropagation();
      load_user_list();
    });

    $(".users-groups").click(function(event) {
      event.preventDefault();
      event.stopPropagation();
      load_group_list();
    });

  });

})();

function prepare_user_list(ref) {

  var minus_height = ref.minus_height;

  var oTable = $("#table_entries_user").dataTable({
    //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "bJQueryUI": true,
    "bPaginate": false,
    "sScrollY": $("#content_area").height()-minus_height,
    "sPaginationType": "full_numbers"
  });

  prepare_data_tables();

  $(".user-link").click(function() {
    load_user($(this).attr("user_id"));
  });

  if(ref.selectable) {
    $("#table_entries_user tbody tr").click( function( e ) {
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
    if(typeof resize_Timer_user != "undefined") {
      window.clearTimeout(resize_Timer_user);
    }

    resize_Timer_user = window.setTimeout(function() {
      $("#table_entries_user").parent().css("height", $("#content_area").height()-minus_height);
      oTable.fnDraw();
    }, 500);
  });

  return oTable;

}

function prepare_group_list(ref) {

  var minus_height = ref.minus_height;

  var oTable = $("#table_entries_group").dataTable({
    //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "bJQueryUI": true,
    "bPaginate": false,
    "sScrollY": $("#content_area").height()-minus_height,
    "sPaginationType": "full_numbers"
  });

  prepare_data_tables();

  $(".group-link").click(function() {
    load_group($(this).attr("group_id"));
  });

  if(ref.selectable) {
    $("#table_entries_group tbody tr").click( function( e ) {
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
    if(typeof resize_Timer_group != "undefined") {
      window.clearTimeout(resize_Timer_group);
    }

    resize_Timer_group = window.setTimeout(function() {
      $("#table_entries_group").parent().css("height", $("#content_area").height()-minus_height);
      oTable.fnDraw();
    }, 500);
  });

  return oTable;

}

function load_user_list() {

  load_page("/user",function() {

    minus_height = 265;
    var oTable = prepare_user_list({"minus_height":minus_height, "selectable":true});

    $("#add_user").dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Add": function() {
          console.log("adding");

          $.ajax({
            "url": "/user",
            "type": "POST",
            "data": JSON.stringify({
              "name": $("#name").val(),
              "password": $("#password").val(),
            }),
            "contentType": "application/json",
            "dataType": "json"
          }).done(function(data) {
            try {
              if(data.ok != true) {
                throw "Error adding new dns record";
              }
              else {
                load_user_list();
              }
            } catch(err) {
              console.log(err);
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

    $("#lnk_add_user").click(function() {
      $("#add_user").dialog("open");
    });

    $("#lnk_del_user").click(function() {
      var selected_row = fnGetSelected(oTable);
      var user_id = $(selected_row).attr("user_id");

      console.log("Delting User: " + user_id);

      delete_user(user_id);
    });


  });

}

function load_group_list() {

  load_page("/group",function() {

    group_view_hide_user();

    minus_height = 265;
    var oTable = prepare_group_list({"minus_height": minus_height, "selectable":true});
    prepare_user_list({"minus_height": minus_height, "selectable": false});

    $("#add_group").dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "Add": function() {
          console.log("adding");

          $.ajax({
            "url": "/group",
            "type": "POST",
            "data": JSON.stringify({
              "name": $("#name").val(),
            }),
            "contentType": "application/json",
            "dataType": "json"
          }).done(function(data) {
            try {
              if(data.ok != true) {
                throw "Error adding new dns record";
              }
              else {
                load_group_list();
              }
            } catch(err) {
              console.log(err);
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

    $("#lnk_add_group").click(function() {
      $("#add_group").dialog("open");
    });

    $("#lnk_del_group").click(function() {
      var selected_row = fnGetSelected(oTable);
      var group_id = $(selected_row).attr("group_id");

      console.log("Delting Group: " + group_id);

      delete_group(group_id);
    });

    $(".user_hndl").draggable({
      cursor: "move",
      cursorAt: { left: -20 },
      helper: function(event) {
        var itm = event.currentTarget;
        return $('<div style="background-color: #fcfcfc; border: 1px solid #c3c3c3;">' + $(itm).attr("user_name") + '</div>');
      }
    });

    $(".group_drag_user").droppable({
      over: function(event, ui) {
        $(event.target).parent().parent().addClass("row_selected");
      },
      out: function(event, ui) {
        $(event.target).parent().parent().removeClass("row_selected");
      },
      drop: function(event, ui) {
        $(event.target).parent().parent().removeClass("row_selected");

        var group_id = $(event.target).attr("group_id");
        var user_id = $(ui.draggable).attr("user_id");

        console.log("Adding user: " + user_id + " to group: " + group_id);

        add_user_to_group(user_id, group_id);
      }
    });



  });

}

function add_user_to_group(user_id, group_id) {
  $.ajax({
    "url": "/group/" + group_id + "/user/" + user_id,
    "type": "POST"
  }).done(function(data) {
    // display message
    console.log("Added user " + user_id + " to group " + group_id);
  });
}

function delete_group(group_id) {
  $.ajax({
    "url": "/group/" + group_id,
    "type": "DELETE"
  }).done(function(data) {
    load_group_list();
  });
}

function delete_user(user_id) {
  $.ajax({
    "url": "/user/" + user_id,
    "type": "DELETE"
  }).done(function(data) {
    load_user_list();
  });
}

function group_view_hide_user() {

  $("#lnk_show_user").html("Show Users");
  $("#lnk_show_user").off("click");

  $("#lnk_show_user").click(function() {
    group_view_show_user();
  });

  $(".right_frame").hide();
  $(".left_frame").width("100%");

  $(window).trigger("resize");
}

function group_view_show_user() {

  $("#lnk_show_user").html("Hide Users");
  $("#lnk_show_user").off("click");

  $("#lnk_show_user").click(function() {
    group_view_hide_user();
  });

  $(".left_frame").width("50%");
  $(".right_frame").show();

  $(window).trigger("resize");
}
