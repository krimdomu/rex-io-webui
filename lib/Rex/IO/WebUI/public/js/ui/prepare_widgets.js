/**
 * ui class extensions for automatic ui management
 */

class_ui.implement({

  prepare_ui_widgets: function() {
    this._prepare_ui_widgets_button();
    this._prepare_ui_widgets_sortable();
    this._prepare_ui_widgets_tabs();
    this._prepare_ui_widgets_data_table();
    this._prepare_ui_widgets_dialog();
  },

  _prepare_ui_widgets_dialog: function() {
    var self = this;

    console.log("preparing dialog widgets... ");

    $(".rexio-ui-dialog").each(function(idx) {
      var elem = this;

      var ok_button_text = ( $(elem).attr("rexio-dialog-button-ok") ? $(elem).attr("rexio-dialog-button-ok") : "Ok" );
      var tmp            = $(elem).attr("rexio-dialog-button-ok-click").split(/\./);

      var cancel_button_text = ( $(elem).attr("rexio-dialog-button-cancel") ? $(elem).attr("rexio-dialog-button-cancel") : "Cancel" );
      var tmp2               = $(elem).attr("rexio-dialog-button-cancel-click").split(/\./);

      var tmp3;

      if($(elem).attr("rexio-dialog-close")) {
        tmp3 = $(elem).attr("rexio-dialog-close").split(/\./);
      }

      var t_buttons = new Object();

      t_buttons[ok_button_text] = function() {
        self._objects[tmp[0]]()[tmp[1]]();
        $(this).dialog("close");
      };

      t_buttons[cancel_button_text] = function() {
        self._objects[tmp2[0]]()[tmp2[1]]();
        $(this).dialog("close");
      };

      var dialog_options = {
        autoOpen: ( $(elem).attr("rexio-dialog-auto-open") == "true" ? true : false ),
        height: ( $(elem).attr("rexio-dialog-height") ? $(elem).attr("rexio-dialog-height") : 500 ),
        width: ( $(elem).attr("rexio-dialog-width") ? $(elem).attr("rexio-dialog-width") : 500 ),
        modal: ( $(elem).attr("rexio-dialog-modal") == "true" ? true : false ),
        buttons: t_buttons,
        close: function() {
          if(tmp3) {
            self._objects[tmp3[0]]()[tmp3[1]]();
          }
        }
      };

      $(elem).dialog(dialog_options);

    });

  },

  _prepare_ui_widgets_tabs: function() {
    var self = this;
    $(".rexio-ui-tabs").each(function(idx) {
      var elem = this;
      $(elem).tabs(
        {
          "activate": function(event, ui) {
            if($(elem).attr("rexio-ui-activate")) {
              var tmp   = $(elem).attr("rexio-ui-activate").split(/\./);
              var scope = tmp[0];
              var func  = tmp[1];

              self._objects[scope]()[func](event, ui);
            }
          }
        }
      );
    });
  },

  _prepare_ui_widgets_data_table: function() {
    var self = this;

    $(".rexio-ui-data-table").each(function(idx) {
      var elem         = this;
      var minus_height = $(elem).attr("rexio-ui-minus-height");
      var selectable   = $(elem).attr("rexio-ui-selectable");

      self.data_table(
        {
          "elem"         : elem,
          "minus_height" : minus_height,
          "selectable"   : (selectable == "true" ? true : false)
        }
      );
    });
  },

  _prepare_ui_widgets_button: function() {
    var self = this;
    console.log("preparing button widgets...");

    $(".rexio-ui-button").each(function(btn) {
      console.log("found button: " + $(this).attr("id"));
      $(this).button().click(function(event) {
        event.preventDefault();
        event.stopPropagation();

        var tmp   = $(this).attr("rexio-ui-click").split(/\./);
        var scope = tmp[0];
        var func  = tmp[1];

        self._objects[scope]()[func](event);
      });
    });
  },

  /**
   * automatically register sortable widgets.
   *
   * example:
   *   <ul id="registered_services" class="rexio-ui-sortable" rexio-ui-connect-with="#available_services">
   */
  _prepare_ui_widgets_sortable: function() {
    var self = this;
    console.log("preparing sortable widgets...");

    $(".rexio-ui-sortable").each(function() {
      console.log("found sortable: " + $(this).attr("id"));
      var connect_with = $(this).attr("rexio-ui-connect-with");

      if(connect_with) {
        $(this).sortable({
          connectWith: connect_with
        });
      }
      else {
        $(this).sortable();
      }
    });
  },

});
