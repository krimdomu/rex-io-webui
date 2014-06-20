var server = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  onload: function() {
    $('#server_menu').easytree();
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
