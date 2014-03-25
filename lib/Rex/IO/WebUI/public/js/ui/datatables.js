/**
 * datatables implementations for ui class.
 */
class_ui.implement({
  data_table: function(opt) {
    var self         = this;
    var elem         = opt["elem"];
    var minus_height = opt["minus_height"];
    var selectable   = opt["selectable"];
    var searchable   = opt["searchable"];

    var tbl_options = {
      "bFilter": searchable,
      "bJQueryUI": true,
      "bPaginate": false,
      "sPaginationType": "full_numbers"
    };

    if(minus_height) {
      tbl_options["sScrollY"] = $("#content_area").height()-minus_height;
    }

    var oTable = $(elem).dataTable(tbl_options);

    if(minus_height) {
      $(window).on("resize", function() {
        if(typeof self._resize_timer[elem] != "undefined") {
          window.clearTimeout(self._resize_timer[elem]);
        }

        self._resize_timer[elem] = window.setTimeout(function() {
          $(elem).parent().css("height", $("#content_area").height()-minus_height);
          oTable.fnDraw();
        }, 500);
      });
    }

    if(selectable) {
      var elem_id = elem;
      if(typeof elem == "object") {
        elem_id = $(elem).attr("id");
      }

      $("#" + elem_id + " tbody tr").click( function( e ) {
        if ( $(this).hasClass('row_selected') ) {
          $(this).removeClass('row_selected');
        }
        else {
          oTable.$('tr.row_selected').removeClass('row_selected');
          $(this).addClass('row_selected');
        }
      });

      console.log("registering datatable: " + elem_id);
      self._data_tables[elem_id] = oTable;
    }

    this._prepare_data_tables();
  },

  _prepare_data_tables: function() {
    $(".dataTables_wrapper").each(function(idx, itm) {
      $(itm).find(".fg-toolbar:first").addClass("table-toolbar");
      $(itm).find(".fg-toolbar:last").addClass("table-bottom-bar");
    });

    $(".table-toolbar").each(function(idx, itm) {
      $(itm).find(".dataTables_filter").addClass("table-search-field");
    });

    $("table.dataTable").each(function(idx, itm) {
      $(itm).find("thead > tr > td").addClass("table-cell-head").addClass("table-cell-head-border");
    });

    $("table.dataTable").each(function(idx, itm) {
      $(itm).find("tbody > tr > td").addClass("table-cell").addClass("table-cell-border");
    });
  },

  data_table_get_selected_item: function(elem_id) {
    var self = this;
    console.log("Getting selected item from: " + elem_id);
    return self._data_tables[elem_id].$('tr.row_selected');
  }

});
