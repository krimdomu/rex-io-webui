var server = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  }
});

(function() {

  $(document).ready(function() {


    $(".server-add-link").click(function(event) {
      event.preventDefault();
      event.stopPropagation();

      load_page("/server/new", null, onload_server_new_page);
    });

  });

})();

function onload_server_new_page() {

  $(".save_button").button().click(function(event) {
    event.preventDefault();
  });


}

function server_search() {
}


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
