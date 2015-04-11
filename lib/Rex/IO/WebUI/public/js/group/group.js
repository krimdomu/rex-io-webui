var group_group = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  load: function(obj) {
    var self = this;

    this.ui.load_page(
      {
        "link" : "/group",
        "cb"   : function() {
          self.bootstrap();
        }
      }
    );
  },

  bootstrap: function() {
    var self = this;
    self.group_view_hide_user();

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

        self.add_user_to_group(user_id, group_id);
      }
    });

  },

  add_user_to_group: function(user_id, group_id) {
    $.ajax({
      "url": "/group/" + group_id + "/user/" + user_id,
      "type": "POST"
    }).done(function(data) {
      // display message
      if(data.ok != true || data.ok == 0) {
        $.pnotify({
          "title" : "Error adding user to group",
          "text"  : "Can't add user "
                      + "<b>" + user_id + "</b> "
                      + " to group <b>" + group_id + "</b>"
                      + "<br /><br /><b>Error</b>: " + data["error"],
          "type"  : "error"
        });
      }
      else {
        $.pnotify({
          "title" : "User added to group",
          "text"  : "User "
                      + "<b>" + user_id + "</b>"
                      + " added to group <b>" + group_id + "</b>",
          "type"  : "info"
        });
      }
    });
  },

  add_group_dialog: function() {
    $("#add_group").dialog("open");
  },

  delete_group_dialog: function() {
    var self = this;

    var sel_row = self.ui.data_table_get_selected_item("table_entries_group");
    var group_id = $(sel_row).attr("group_id");
    var group_name = $(sel_row).attr("group_name");

    if( !group_id ) {
      self.ui.dialog_msgbox({
        "title": "No group selected.",
        "text": "You have to select a group first."
      });
      return;
    }

    self.ui.dialog_confirm({
      "id"     : "delete_group_confirm_dialog",
      "title"  : "Really delete group <b>" + group_name + "</b>?",
      "text"   : "This action will permanently delete <b>" + group_name + "</b>.",
      "button" : "Delete",
        "ok": function() {
          rexio.call("DELETE",
                    "1.0",
                    "group",
                    ["group", group_id],
                    function(data) {
                      if(data.ok != true || data.ok == 0) {
                        $.pnotify({
                          "title" : "Error deleting group",
                          "text"  : "Can't delete group "
                                      + "<b>" + group_name + "</b>"
                                      + "<br /><br /><b>Error</b>: " + data["error"],
                          "type"  : "error"
                        });
                      }
                      else {
                        $.pnotify({
                          "title" : "Group deleted",
                          "text"  : "Group "
                                      + "<b>" + group_name + "</b>"
                                      + " deleted.",
                          "type"  : "info"
                        });
                      }

                      // load server list.
                      self.ui.redirect_to("group/group");
                    }
                  );
          },
        "cancel": function() {}
      });
  },

  click_create_group: function() {
    rexio.call("POST",
               "1.0",
               "group",
               [
                 "group", null,
                 "ref", {
                   "name"     : $("#name").val(),
                 }
               ],
               function(data) {
                 if(data.ok != true || data.ok == 0) {
                   $.pnotify({
                     "title" : "Error creating group",
                     "text"  : "Can't create new group "
                                 + "<b>" + $("#name").val() + "</b>"
                                 + "<br /><br /><b>Error</b>: " + data['error'],
                     "type"  : "error"
                   });
                 }
                 else {
                   $.pnotify({
                     "title" : "New group created",
                     "text"  : "New group "
                                 + "<b>" + $("#name").val() + "</b>"
                                 + " created. ",
                     "type"  : "info"
                   });

                   self.ui.redirect_to("group/group");
                 }

                 $("#add_group").dialog("close");
               });
  },

  click_create_group_cancel: function() {
    $("#add_group").dialog("close");
  },


  group_view_hide_user: function() {

    var self = this;

    $("#lnk_show_user").html("Show Users");
    $("#lnk_show_user").off("click");

    $("#lnk_show_user").click(function() {
      self.group_view_show_user();
    });

    $(".right_frame").hide();
    $(".left_frame").width("100%");

    $(window).trigger("resize");
  },

  group_view_show_user: function() {

    var self = this;

    $("#lnk_show_user").html("Hide Users");
    $("#lnk_show_user").off("click");

    $("#lnk_show_user").click(function() {
      self.group_view_hide_user();
    });

    $(".left_frame").width("50%");
    $(".right_frame").show();

    $(window).trigger("resize");
  }


});

ui.register_plugin(
  {
    "object" : "group/group"
  }
);
