var server_add = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  load: function(obj) {
    var self = this;

    this.ui.load_page(
      {
        "link" : "/server/new",
        "cb"   : function() {
          self.bootstrap();
        }
      }
    );
  },

  bootstrap: function() {

  },

  click_save_server: function(event) {
    var self = this;

    var selected_node = $(".easytree-active").attr("id");
    var tree_node = self.ui["easytree"].getNode(selected_node);
    var server_group_id = tree_node.node_id;

    rexio.call("POST",
              "1.0",
              "server",
              ["server", null,
               "ref", {
                "name" : $("#name").val(),
                "mac"  : $("#mac").val(),
                "server_group_id" : server_group_id
              }],
              function(data) {
                if(data.ok != true) {
                  $.pnotify({
                    "title" : "Error adding server",
                    "text"  : "Can't add new server "
                                + "<b>" + $("#name").val() + "</b>"
                                + "<br />"
                                + "Error message: " + data.error,
                    "type"  : "error"
                  });
                }
                else {
                  $.pnotify({
                    "title" : "Added new server",
                    "text"  : "Added new server "
                                + "<b>" + $("#name").val() + "</b>",
                    "type"  : "info"
                  });
                }

                self.ui.load_plugin({
                  "obj": "server/list",
                  "event" : event,
                  "data": {
                    "node_id" : server_group_id
                  }
                });
              }
            );

  }

});
