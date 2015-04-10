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
console.log(elem);
    var tbl_options = {
      "bFilter": searchable,
      "bJQueryUI": true,
      "bPaginate": false,
      "sPaginationType": "full_numbers"
    };

    if($(elem).attr("rexio-ui-datatable-rows")) {
      tbl_options["ajax"] = $(elem).attr("rexio-ui-datatable-rows");
    }

    if(minus_height) {
      tbl_options["sScrollY"] = $("#center_pane").height()-minus_height+15;
    }

    var row_callback = function(row, data) {
      if(selectable) {
      
      }    
    };

    var pre_init = function(oTable) {
      if(minus_height) {
        $(window).on("resize", function() {
          if(typeof self._resize_timer[elem] != "undefined") {
            window.clearTimeout(self._resize_timer[elem]);
          }

          self._resize_timer[elem] = window.setTimeout(function() {
            $(elem).parent().css("height", $("#center_pane").height()-minus_height+15);
            oTable.fnDraw();
          }, 500);
        });
      }

      if(selectable) {
        var elem_id = elem;
        if(typeof elem == "object") {
          elem_id = $(elem).attr("id");
        }

        $("#" + elem_id + " tbody").on('click', 'tr', function( e ) {
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

      self._prepare_data_tables();
    };


    if($(elem).attr("rexio-ui-datatable-columns")) {
      self._render_header(elem, $(elem).attr("rexio-ui-datatable-columns"), function() {
        self._render_table(elem, tbl_options, pre_init);
      });
    }
    else {
      self._render_table(elem, tbl_options, pre_init);
    }

  },


  _render_header: function(elem, url, cb) {
    $.ajax(
      {
        "type": "GET",
        "url": url,
      }
    ).done(function(data) {
    console.log(data);
      var td_a = new Array();
      for(var i=0; i < data['data'].length; i++) {
        td_a.push("<td width=\"" + (typeof data['data'][i]['width'] != undefined ? data['data'][i]['width'] : "")  + "\">" + data['data'][i]['name'] + "</td>");
      }
      console.log(td_a);
      $(elem).find("thead > tr").html(td_a.join("\n"));
      cb();
    });
  },

  _render_table: function(elem, tbl_options, cb) {
    var oTable = $(elem).dataTable(tbl_options);
    cb(oTable);
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
