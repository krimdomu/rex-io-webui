var dashboard = new Class({
  Extends: ui_plugin,

  initialize: function(ui) {
    this.parent(ui);
  },

  onload: function() {
    this.load();
  },

  logout: function() {
    $.ajax({
      'url': '/logout',
    }).done(function() {
      document.location.href = "/";
    });
  },

  load: function(force) {
    this.ui.load_page(
      {
        "link" : "/dashboard",
        "cb"   : function() {
          prepare_tab();
          activate_tab($(".tab-pane:first"));

          $("#lnk_clear_cache").click(function(event) {
            rexio_send_clear_cache();
            return cancel_events(event);
          });

          $(".incident-link").click(function() {
            load_incident($(this).attr("incident_id"));
          });
        }
      }
    );
  }
});

ui.register_plugin(
  {
    "object" : "dashboard"
  }
);
