var server = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  onload: function() {
    var self = this;

    ui["easytree"] = $('#server_menu').easytree({
      stateChanged: function(nodes, nodes_json) {
        self.tree_state_changed(nodes, nodes_json);
      },
      openLazyNode: function(event, nodes, node, has_children) {
        self.tree_open_server_group(event, nodes, node, has_children);
      }
    });

    $("#li_server").on("mnuclick", function(event, elem) {
      var parent_node = $(elem).parent();
      var node_id_str = parent_node.attr("id");
      var tree_node = ui["easytree"].getNode(node_id_str);

      if(typeof tree_node == "undefined" || tree_node == null)
        return;

      var node_id = tree_node.node_id;

      if( !node_id ) { // root node clicked
        node_id = 1;
      }

      console.log("Tree clicked. Got id: " + node_id);

      var obj = "server/list";
      var ref = {
        "obj": obj,
        "event": event,
        "data": {
          "node_id": node_id
        }
      };

      ui.load_plugin(ref);
    });
  },

  tree_state_changed: function(nodes, nodes_json) {
  },

  tree_open_server_group: function(event, nodes, node, has_children) {
    if(has_children) {
      return false;
    }

    if(!node.lazyUrl) {
      node.lazyUrl = "/1.0/server_group_tree/children/1";
    }
  }
});

/// extend ui_plugin
ui_plugin.implement({
  onload_server: function() {
    console.log("proto: onload_server.");
  },

  onload_server_list: function() {
    console.log("proto: onload_server_list.");
  },
});

ui.register_plugin(
  {
    "object" : "server"
  }
);

// --- end
