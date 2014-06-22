var permission = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
    this._selected_permissions = new Object();
    this._edit_perm_set = false;
  },

  load: function(obj) {
    var self = this;

    self._init_obj = obj;

    this.ui.load_page(
      {
        "link" : "/permission/list_types",
        "cb"   : function() {
          self.bootstrap();
        }
      }
    );
  },

  bootstrap: function() {
  },

  add_permission_set_dialog: function() {
    this._selected_permissions = new Object();
    this._edit_perm_set = false;

    $("#add_permission_set").dialog("option", "title", "Add new Permission-Set");
    $("#add_permission_set_teaser").html("Add new permission-set");
    $("#name").val("");
    $("#description").val("");
    $(".permission_user_list > .ui-selected").removeClass("ui-selected");
    $(".all_permission_types > .ui-selected").removeClass("ui-selected");

    $("#add_permission_set").dialog("open");
  },

  edit_permission_set_dialog: function() {
    var self = this;

    var sel_row = self.ui.data_table_get_selected_item("table_entries_permission_sets");
    var set_id = $(sel_row).attr("set_id");
    var set_name = $(sel_row).attr("set_name");

    if( !set_id ) {
      self.ui.dialog_msgbox({
        "title": "No permission-set selected.",
        "text": "You have to select a permission-set first."
      });
      return;
    }

    rexio.call("GET",
                "1.0",
                "permission",
                ["set", set_id],
                function(data) {
                  if(data.ok != true || data.ok == 0) {
                    $.pnotify({
                      "title" : "Error getting permission-set",
                      "text"  : "Can't get permission-set data for "
                                  + "<b>" + set_name + "</b>"
                                  + "<br /><br /><b>Error</b>: " + data["error"],
                      "type"  : "error"
                    });
                  }
                  else {
                    self._selected_permissions = data["data"]["permissions"];
                    self._edit_perm_set = true;

                    $("#name").val(data["data"]["name"]);
                    $("#description").val(data["data"]["description"]);

                    $("#add_permission_set").dialog("option", "title", "Edit Permission-Set");
                    $("#add_permission_set_teaser").html("Edit " + set_name + " permission-set");
                    $(".permission_user_list > .ui-selected").removeClass("ui-selected");
                    $(".all_permission_types > .ui-selected").removeClass("ui-selected");

                    $("#add_permission_set").dialog("open");
                  }
                });
  },

  delete_permission_set_dialog: function() {
    var self = this;

    var sel_row = self.ui.data_table_get_selected_item("table_entries_permission_sets");
    var set_id = $(sel_row).attr("set_id");
    var set_name = $(sel_row).attr("set_name");

    if( !set_id ) {
      self.ui.dialog_msgbox({
        "title": "No permission-set selected.",
        "text": "You have to select a permission-set first."
      });
      return;
    }

    self.ui.dialog_confirm({
      "id"     : "delete_permission_set_confirm",
      "title"  : "Really delete permission-set " + set_name + "?",
      "text"   : "This action will permanently delete <b>" + set_name + "</b>.",
      "button" : "Delete",
        "ok": function() {
          rexio.call("DELETE",
                    "1.0",
                    "permission",
                    ["set", set_id],
                    function(data) {
                      if(data.ok != true || data.ok == 0) {
                        $.pnotify({
                          "title" : "Error deleting permission-set",
                          "text"  : "Can't delete permission-set "
                                      + "<b>" + set_name + "</b>"
                                      + "<br /><br /><b>Error</b>: " + data["error"],
                          "type"  : "error"
                        });
                      }
                      else {
                        $.pnotify({
                          "title" : "Permission-Set deleted",
                          "text"  : "Permission-Set "
                                      + "<b>" + set_name + "</b>"
                                      + " deleted.",
                          "type"  : "info"
                        });
                      }

                      // load server list.
                      self.ui.redirect_to("permission");
                    }
                  );
        },
      "cancel": function() {}
    });
  },

  onselected_permission_user_list: function() {
    var self = this;

    var user_id = $(".permission_user_list > .ui-selected").attr("user_id");

    $(".all_permission_types > .ui-selected").each(function() {
      $(this).removeClass("ui-selected");
    });

    if(typeof self._selected_permissions["user"] != "undefined"
      && typeof self._selected_permissions["user"][user_id] != "undefined") {

      $(self._selected_permissions["user"][user_id]).each(function(idx, itm) {
        $("#all_permission_types_entry_" + itm).addClass("ui-selected");
      });
    }
  },

  onselected_all_permission_types: function() {
    var self = this;

    $(".permission_user_list > .ui-selected").each(function() {
      var user_name = $(this).attr("user_name");
      var user_id   = $(this).attr("user_id");

      if(typeof self._selected_permissions["user"] == "undefined") {
        self._selected_permissions["user"] = new Object();
      }

      self._selected_permissions["user"][user_id] = new Array();

      console.log("selected user: " + user_name + " (" + user_id + ")");

      $(".all_permission_types > .ui-selected").each(function() {
        var perm_type_id   = $(this).attr("perm_type_id");
        var perm_type_name = $(this).attr("perm_type_name");

        console.log("selected permission type: "
          + perm_type_name + " ("
          + perm_type_id + ")");

        self._selected_permissions["user"][user_id].push(perm_type_id);
      });
    });

    console.log(self._selected_permissions);
  },

  click_create_permission_set_ok: function() {
    var self = this;

    var perm_set_id = null;

    var sel_row = self.ui.data_table_get_selected_item("table_entries_permission_sets");
    var set_id = $(sel_row).attr("set_id");
    var set_name = $(sel_row).attr("set_name");

    if(self._edit_perm_set) {
      perm_set_id = set_id;
    }

    rexio.call("POST",
               "1.0",
               "permission",
               [
                 "set", perm_set_id,
                 "ref", {
                   "name"        : $("#name").val(),
                   "description" : $("#description").val(),
                   "permissions" : self._selected_permissions
                 }
               ],
               function(data) {
                 if(data.ok != true || data.ok == 0) {
                   $.pnotify({
                     "title" : (self._edit_perm_set ? "Error updating permission-set" : "Error creating permission-set"),
                     "text"  : "Can't "
                                 + (self._edit_perm_set ? "update " : "create new ")
                                 + " permission-set "
                                 + "<b>" + $("#name").val() + "</b>"
                                 + "<br /><br /><b>Error</b>: " + data['error'],
                     "type"  : "error"
                   });
                 }
                 else {
                   $.pnotify({
                     "title" : (self._edit_perm_set ? "Permission-Set updated" : "New permission-set created"),
                     "text"  : (self._edit_perm_set ? "Permission-Set " : "New permission-set ")
                                 + "<b>" + $("#name").val() + "</b>"
                                 + (self._edit_perm_set ? " updated. " : " created. "),
                     "type"  : "info"
                   });

                   self.ui.redirect_to("permission");
                 }

                 $("#add_permission_set").dialog("close");
               });

  },

  click_create_permission_set_cancel: function() {
    $("#add_permission_set").dialog("close");
  }

});

ui.register_plugin(
  {
    "object" : "permission"
  }
);
