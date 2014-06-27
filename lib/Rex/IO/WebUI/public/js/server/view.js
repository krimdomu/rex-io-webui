var server_view = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  load: function(obj) {
    var self    = this;
    var srv_id  = $(obj.target).attr("srv_id");
    this.srv_id = srv_id;

    self._load(srv_id);
  },

  _load: function(srv_id) {
    var self = this;
    console.log("Loading server overview for: " + srv_id);

    self.ui.load_page(
      {
        "link" : "/server/" + srv_id,
        "cb"   : function() { self.onload_server_page(srv_id); }
      }
    );
  },

  rename_server: function(event) {
    $("#rename_server").dialog("open");
  },

  update_permission_set: function(event) {
    var self = this;
    var permission_set_id = $("#permission_set").val();

    rexio.call("POST",
               "1.0",
               "server",
               ["server", self.srv_id,
                 "ref", {
                   "permission_set_id": permission_set_id
                 }
               ],
               function(data) {
                 if(data.ok != true) {
                   $.pnotify({
                     "title" : "Error updating Permission-Set",
                     "text"  : "Can't update permission-set on "
                                 + "<b>" + server_name + "</b>",
                     "type"  : "error"
                   });
                 }
                 else {
                   $.pnotify({
                     "title" : "Updated Permission-Set",
                     "text"  : "Permission-Set updated for "
                                 + "<b>" + server_name + "</b>",
                     "type"  : "info"
                   });
                 }
               });
  },

  click_rename_server_cancel: function() {
    $("#rename_server").dialog("close");
  },

  click_rename_server_ok: function() {
    var self = this;
    $("#rename_server").dialog("close");

    var new_name = $("#name").val();
    var srv_id   = $("#srv_id").val();

    console.log("Renaming server: " + srv_id + " to " + new_name);

    rexio.call("POST",
              "1.0",
              "server",
              ["server", srv_id, "ref", { "name" : new_name } ],
              function(data) {
                if(data.ok != true) {
                  $.pnotify({
                    "title" : "Error renaming server",
                    "text"  : "Can't rename server "
                                + "<b>" + server_name + "</b> to "
                                + "<b>" + new_name + "</b>",
                    "type"  : "error"
                  });
                }
                else {
                  $.pnotify({
                    "title" : "Renamed server",
                    "text"  : "Rename server "
                                + "<b>" + server_name + "</b> to "
                                + "<b>" + new_name + "</b>",
                    "type"  : "info"
                  });

                  server_name = new_name;
                }

                $("#rename_server").dialog("close");
                self._load(srv_id);
              }
            );

  },

  delete_server: function(obj) {
    var self = this;

    self.ui.dialog_confirm({
      "id"     : "server_delete_dialog",
      "title"  : "Really delete " + server_name,
      "text"   : "This server will be permanently deleted and cannot be recovered. Are you sure?",
      "button" : "Delete",
      "ok"     : function() {
        rexio.call("DELETE",
                  "1.0",
                  "server",
                  ["server", self.srv_id],
                  function(data) {
                    if(data.ok != true) {
                      $.pnotify({
                        "title" : "Error deleting server",
                        "text"  : "Can't delete server "
                                    + "<b>" + server_name + "</b>"
                                    + "<br />Error Message: " + data["error"],
                        "type"  : "error"
                      });
                    }
                    else {
                      $.pnotify({
                        "title" : "Server deleted",
                        "text"  : "Server "
                                    + "<b>" + server_name + "</b>"
                                    + " deleted.",
                        "type"  : "info"
                      });
                    }

                    // load server list.
                    //self.ui.redirect_to("server/list");
                    var selected_node = $(".easytree-active").attr("id");
                    var tree_node = self.ui["easytree"].getNode(selected_node);

                    self.ui.load_plugin({
                      "obj": "server/list",
                      "data": {
                        "node_id" : tree_node.node_id
                      }
                    });
                  }
                );

      },
      "cancel": function() {}
    });

  },

  click_save_boot_target: function(event) {
    var self = this;

    var srv_name    = server_name;
    var boot_target = $("#next_boot_target option:selected").text();

    rexio.call("POST",
               "1.0",
               "server",
               ["server", self.srv_id, "boot", $("#next_boot_target").val()],
               function(data) {
                 if(data.ok != true) {
                   $.pnotify({
                     "title" : "Error updating boottarget",
                     "text"  : "Can't update boottarget on "
                                 + "<b>" + srv_name + "</b>"
                                 + " to "
                                 + "<b>" + boot_target + "</b>",
                     "type"  : "error"
                   });
                 }
                 else {
                   $.pnotify({
                     "title" : "Updated boottarget",
                     "text"  : "Boottarget updated for "
                                 + "<b>" + srv_name + "</b>"
                                 + " to "
                                 + "<b>" + boot_target + "</b>",
                     "type"  : "info"
                   });
                 }
               });
  },

  onload_server_page: function(srv_id) {
    // prepare_tab();
    // activate_tab($(".tab-pane:first"));

    ui.execute_plugin_hook("onload_server");



    // $("#lnk_del_server").click(function() {
    //   delete_server(srv_id);
    // });
    //
    //
    // $("#reboot_system").button().click(function(event) {
    //   event.preventDefault();
    //   trigger_reboot($(this).attr("ip"));
    // });
    //

  }
});
