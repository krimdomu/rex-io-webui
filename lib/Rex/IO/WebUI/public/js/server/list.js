var server_list = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  load: function(obj) {
    var self = this;

    this.ui.load_page(
      {
        "link" : "/server",
        "cb"   : function() {
          self.bootstrap();
        }
      }
    );
  },

  click_filter_now: function(event) {
    this.server_search();
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
  }
});
