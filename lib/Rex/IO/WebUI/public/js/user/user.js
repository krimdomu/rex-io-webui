var user_user = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
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
    rexio.call("POST",
               "1.0",
               "user",
               [
                 "user", null,
                 "ref", {
                   "name"     : $("#name").val(),
                   "password" : $("#password").val(),
                 }
               ],
               function(data) {
                 if(data.ok != true || data.ok == 0) {
                   $.pnotify({
                     "title" : "Error creating user",
                     "text"  : "Can't create new user "
                                 + "<b>" + $("#name").val() + "</b>"
                                 + "<br /><br /><b>Error</b>: " + data['error'],
                     "type"  : "error"
                   });
                 }
                 else {
                   $.pnotify({
                     "title" : "New user created",
                     "text"  : "New user "
                                 + "<b>" + $("#name").val() + "</b>"
                                 + " created. ",
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
