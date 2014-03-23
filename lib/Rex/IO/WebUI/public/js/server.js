var server = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  }
});

/// extend ui_plugin
ui_plugin.implement({
  onload_server: function() {
    console.log("proto: onload_server.");
  },

  onload_server_list: function() {
    console.log("proto: onload_server_list.");
  }
});

// --- end
