var user_user = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
    this._edit_user = false;
  },

  load: function(obj) {
    var self = this;

    this.ui.load_page(
      {
        "link" : "/user",
        "cb"   : function() {
          self.bootstrap();
        }
      }
    );
  },

  bootstrap: function() {

  },

  add_user_dialog: function() {
    this._edit_user = false;

    $("#user_name").val("");
    $("#user_password").val("");
    $("#add_user").dialog("option", "title", "New User");

    $("#add_user").dialog("open");
  },

  edit_user_dialog: function() {
    var self = this;
    this._edit_user = true;

    var sel_row   = self.ui.data_table_get_selected_item("table_entries_user");
    var user_id   = $(sel_row).attr("user_id");
    var user_name = $(sel_row).attr("user_name");
    var group_id  = $(sel_row).attr("group_id");
    var permission_set_id = $(sel_row).attr("permission_set_id");

    if( !user_id ) {
      self.ui.dialog_msgbox({
        "title": "No user selected.",
        "text": "You have to select a user first."
      });
      return;
    }

    $("#user_name").val(user_name);
    $("#user_password").val("");
    $("#add_user").dialog("option", "title", "Edit User " + user_name);
    $("#group_id option[value=" + group_id + "]").prop("selected", true);
    $("#permission_set option[value=" + permission_set_id + "]").prop("selected", true);

    $("#add_user").dialog("open");
  },

  delete_user_dialog: function() {
    var self = this;

    var sel_row = self.ui.data_table_get_selected_item("table_entries_user");
    var user_id = $(sel_row).attr("user_id");
    var user_name = $(sel_row).attr("user_name");

    if( !user_id ) {
      self.ui.dialog_msgbox({
        "title": "No user selected.",
        "text": "You have to select a user first."
      });
      return;
    }

    self.ui.dialog_confirm({
      "id"     : "delete_user_confirm_dialog",
      "title"  : "Really delete user <b>" + user_name + "</b>?",
      "text"   : "This action will permanently delete <b>" + user_name + "</b>.",
      "button" : "Delete",
        "ok": function() {
          rexio.call("DELETE",
                    "1.0",
                    "user",
                    ["user", user_id],
                    function(data) {
                      if(data.ok != true || data.ok == 0) {
                        $.pnotify({
                          "title" : "Error deleting user",
                          "text"  : "Can't delete user "
                                      + "<b>" + user_name + "</b>"
                                      + "<br /><br /><b>Error</b>: " + data["error"],
                          "type"  : "error"
                        });
                      }
                      else {
                        $.pnotify({
                          "title" : "User deleted",
                          "text"  : "User "
                                      + "<b>" + user_name + "</b>"
                                      + " deleted.",
                          "type"  : "info"
                        });
                      }

                      // load server list.
                      self.ui.redirect_to("user/user");
                    }
                  );
        },
      "cancel": function() {}
    });

  },

  click_create_user: function() {
    var self = this;

    var sel_row = self.ui.data_table_get_selected_item("table_entries_user");

    var user_id = null;
    var user_name;

    if(sel_row && self._edit_user) {
      user_id = $(sel_row).attr("user_id");
      user_name = $(sel_row).attr("user_name");
    }

    rexio.call("POST",
               "1.0",
               "user",
               [
                 "user", user_id,
                 "ref", {
                   "name"              : $("#user_name").val(),
                   "password"          : $("#user_password").val(),
                   "group_id"          : $("#group_id").val(),
                   "permission_set_id" : $("#permission_set").val(),
                 }
               ],
               function(data) {
                 if(data.ok != true || data.ok == 0) {
                   $.pnotify({
                     "title" : "Error "
                                 + (self._edit_user ? " updating " : " creating ")
                                 + " user",
                     "text"  : "Can't "
                                 + (self._edit_user ? " update " : " create new ")
                                 + " user "
                                 + "<b>" + $("#user_name").val() + "</b>"
                                 + "<br /><br /><b>Error</b>: " + data['error'],
                     "type"  : "error"
                   });
                 }
                 else {
                   $.pnotify({
                     "title" : (self._edit_user ? "User updated" : "New user created"),
                     "text"  : (self._edit_user ? "User " : "New user ")
                                 + "<b>" + $("#user_name").val() + "</b>"
                                 + (self._edit_user ? " updated. " : " created. "),
                     "type"  : "info"
                   });

                   self.ui.redirect_to("user/user");
                 }

                 $("#add_user").dialog("close");
               });
  },

  click_create_user_cancel: function() {
    $("#add_user").dialog("close");
  }

});
