var server_list = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
    this._init_obj = null;
    this._edit_server_group = false;
  },

  load: function(obj) {
    var self = this;

    self._init_obj = obj;

    this.ui.load_page(
      {
        "link" : "/server?table=hardware&hardware.server_group_id="
                    + obj.data.node_id,
        "cb"   : function() {
          self.bootstrap();
        }
      }
    );
  },

  click_filter_now: function(event) {
    this.server_search();
  },

  reload: function() {
    var self = this;
    self.load(self._init_obj);
  },

  server_search: function() {
    var self         = this;
    var query_string = new Array();
    var post_data    = new Array();

    $(".filter_key").each(function() {
      if($(this).val() != "") {
        query_string.push("table=" + $(this).attr("table"));
        query_string.push($(this).attr("table")
          + "."
          + $(this).attr("key")
          + "="
          + encodeURI($(this).val()));
      }
    });

    self.ui.load_page(
      {
        "link" : "/server?" + query_string.join("&"),
        "cb"   : function() { self.bootstrap(); }
      }
    );
  },

  click_save_button: function(event) {
    var self = this;
    var target = event.currentTarget;

    var srv_id      = $(target).attr("srv_id");
    var srv_name    = $(target).attr("srv_name");
    var boot_target = $("#next_boot_target_" + srv_id + " option:selected").text();

    rexio.call("POST",
               "1.0",
               "server",
               ["server", srv_id, "boot", $("#next_boot_target_" + srv_id).val()],
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

  click_server_link: function(event) {
    var self   = this;
    var target = event.currentTarget;
    var srv_id = $(target).attr("srv_id");

    console.log("loading server: " + srv_id);

// load_page("/server/" + srv_id, null, function() { onload_server_page(srv_id, callback) });
    self.ui.load_page(
      {
        "link" : "/server/" + srv_id,
        "cb"   : function() { self.onload_server_page(srv_id); }
      }
    );
  },

  bootstrap: function() {
    var self = this;

    self.ui.execute_plugin_hook("onload_server_list");

    $(".server_hndl").draggable({
      cursor: "move",
      cursorAt: { top: -10 },
      appendTo: "body",
      helper: function(event) {
        var itm = event.currentTarget;
        self.current_drag_item = {
          "server_id": $(itm).attr("srv_id"),
          "server_name": $(itm).attr("server_name")
        };
        return $('<div style="background-color: #fcfcfc; border: 1px solid #c3c3c3; z-index:5000;">' + $(itm).attr("server_name") + '</div>');
      },
      stop: function() {
        console.log("drag stop");
        window.setTimeout(function() { self.current_drag_item = null; }, 1);
      }
    });

    $(".easytree-title").off();
    $(".easytree-title").on("mouseup", function(event) {
      console.log("mousebutton up");
      console.log(self.current_drag_item);

      if(self.current_drag_item == null)
        return;

      var drop_node = this;

      var parent_node = $(drop_node).parent();
      var tree_node = self.ui["easytree"].getNode(parent_node.attr("id"));
      if(!tree_node["name"]) {
        tree_node = {
          "name": tree_node['text'],
          "node_id": 1
        };
      }

      var server_name = self.current_drag_item.server_name;
      var server_id = self.current_drag_item.server_id;

      console.log("Dropping server '" + server_name + "' ("
                    + server_id + ") to '"
                    + tree_node.name + "' ("
                    + tree_node.node_id + ")");

      rexio.call("POST",
                 "1.0",
                 "server",
                 [
                   "server", server_id,
                   "ref", {
                     "server_group_id": tree_node.node_id
                   }
                 ],
                 function(data) {
                   if(data.ok != true) {
                     $.pnotify({
                       "title" : "Error adding server to group",
                       "text"  : "Can't add server "
                                   + "<b>" + server_name + "</b>"
                                   + " to group "
                                   + "<b>" + tree_node.name + "</b>"
                                   + "<br /><br />"
                                   + "<b>Error:</b>" + data["error"],
                       "type"  : "error"
                     });
                   }
                   else {
                     $.pnotify({
                       "title" : "Added server to group",
                       "text"  : "Added server  "
                                   + "<b>" + server_name + "</b>"
                                   + " to group "
                                   + "<b>" + tree_node.name + "</b>",
                       "type"  : "info"
                     });
                     self.reload();
                   }
                 });

    });

    $(".easytree-title").on("mouseover", function(event) {
      var e_class = $(this).attr("class");
      if( !e_class.match(/row_selected/) ) {
        $(this).addClass("row_selected");
      }
    });

    $(".easytree-title").on("mouseout", function(event) {
      $(this).removeClass("row_selected");
    });


  },

  click_add_server_group_ok: function() {
    var self = this;
    console.log("Adding new group");

    var selected_node = $(".easytree-active").attr("id");
    var tree_node = self.ui["easytree"].getNode(selected_node);
    if(!tree_node["name"]) {
      tree_node = {
        "name": tree_node['text'],
        "node_id": 1
      };
    }

    var group_name = $("#server_group_name").val();
    var permission_set_id = $("#permission_set").val();
    var node_id = null;

    if(self._edit_server_group) {
      var selected_node = $(".easytree-active").attr("id");
      var tree_node = self.ui["easytree"].getNode(selected_node);
      if(!tree_node["name"]) {
        tree_node = {
          "name": tree_node['text'],
          "node_id": 1,
        };
      }

      node_id = tree_node["node_id"];
    }

    rexio.call("POST",
                "1.0",
                "server_group_tree",
                [
                  "node", node_id,
                  "ref", {
                    "name"              : group_name,
                    "permission_set_id" : permission_set_id,
                    "parent_id"         : tree_node.node_id
                  }
                ],
                function(data) {
                  if(data.ok != true) {
                    $.pnotify({
                      "title" : "Error "
                                  + (self._edit_server_group ? " updating " : " adding new ")
                                  + " group",
                      "text"  : "Can't "
                                  + (self._edit_server_group ? " update " : " add new ")
                                  + " group "
                                  + "<b>" + group_name + "</b>"
                                  + " as child "
                                  + (self._edit_server_group ? " of " : " to ")
                                  + " group "
                                  + "<b>" + tree_node.name + "</b>"
                                  + "<br /><br />"
                                  + "<b>Error:</b>" + data["error"],
                      "type"  : "error"
                    });
                  }
                  else {
                    $.pnotify({
                      "title" : (self._edit_server_group ? "Updated " : "Added new ")
                                  + " group",
                      "text"  : (self._edit_server_group ? "Updated " : "Added new ")
                                  + "  group  "
                                  + "<b>" + group_name + "</b>"
                                  + " as child "
                                  + (self._edit_server_group ? " of " : " to ")
                                  + "  group "
                                  + "<b>" + tree_node.name + "</b>",
                      "type"  : "info"
                    });
                    self.ui["easytree"].toggleNode(selected_node);
                    self.ui["easytree"].toggleNode(selected_node);
                  }
                  self._edit_server_group = false;
              });
  },

  click_add_server_group_cancel: function() {
    $("#add_server_group").dialog("close");
  },

  add_group_dialog: function() {
    var self = this;
    self._edit_server_group = false;
    $("#add_server_group").dialog("option", "title", "Add Server Group");
    $("#server_group_name").val("");
    $("#permission_set option[value=1]").prop("selected", true);
    $("#add_server_group").dialog("open");
  },

  edit_group_dialog: function() {
    var self = this;
    self._edit_server_group = true;

    var selected_node = $(".easytree-active").attr("id");
    var tree_node = self.ui["easytree"].getNode(selected_node);
    if(!tree_node["name"]) {
      tree_node = {
        "name": tree_node['text'],
        "node_id": 1,
        "permission_set_id" : 1
      };
    }

    $("#server_group_name").val(tree_node["name"]);
    $("#permission_set option[value=" + tree_node["permission_set_id"] + "]")
      .prop("selected", true);

    $("#add_server_group").dialog("option", "title", "Edit Server Group "
      + tree_node["name"]);
    $("#add_server_group").dialog("open");
  },

  delete_group_dialog: function() {
    var selected_node = $(".easytree-active").attr("id");
    var tree_node = self.ui["easytree"].getNode(selected_node);
    if(!tree_node["name"]) {
      tree_node = {
        "name": tree_node['text'],
        "node_id": 1
      };
    }

    if(tree_node.node_id == 1) {
      $.pnotify({
        "title" : "Can't delete group",
        "text"  : "The root-node can't be deleted.",
        "type"  : "error"
      });

      return;
    }

    self.ui.dialog_confirm({
      "id"     : "server_group_delete_dialog",
      "title"  : "Really delete " + tree_node.name,
      "text"   : "This group will be permanently deleted and cannot be recovered. Are you sure?",
      "button" : "Delete",
      "ok"     : function() {
        rexio.call("DELETE",
                  "1.0",
                  "server_group_tree",
                  ["node", tree_node.node_id],
                  function(data) {
                    if(data.ok != true) {
                      $.pnotify({
                        "title" : "Error deleting group",
                        "text"  : "Can't delete group "
                                    + "<b>" + tree_node.name + "</b>"
                                    + "<br /><br /><b>Error</b>: " + data["error"],
                        "type"  : "error"
                      });
                    }
                    else {
                      $.pnotify({
                        "title" : "Group deleted",
                        "text"  : "Group "
                                    + "<b>" + tree_node.name + "</b>"
                                    + " deleted.",
                        "type"  : "info"
                      });
                      self.ui["easytree"].activateNode("tree_node_1");

                      self.ui["easytree"].toggleNode('tree_node_1');
                      self.ui["easytree"].toggleNode('tree_node_1');
                    }

                  }
                );

      },
      "cancel": function() {}
    });
  }
});

ui.register_plugin(
  {
    "object" : "server/list"
  }
);
