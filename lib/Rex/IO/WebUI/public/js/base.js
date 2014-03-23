var $GLOBALS = {
  "load_callback": {}
};

var ui = new class_ui();


(function() {

  $(document).ready(function() {

    //$(".main-accordion").accordion();
    //load_dashboard();
    ui.bootstrap();

    $("#link_message_area_close").click(function() {
      if(! is_message_area_open()) {
        $(this).parent().removeClass("message_area_down").addClass("message_area");
      }
      else {
        $(this).parent().removeClass("message_area").addClass("message_area_down");
      }
      $(window).trigger("resize");
    });

    $(window).on("resize", function() {
      window.setTimeout(function() {
        if(is_message_area_open()) {
          $("#content_area").height($(window).height() - 120);
        }
        else {
          $("#content_area").height($(window).height());
        }
      }, 100);
    });

    $("#content_area").height($(window).height());

    $("li.has-sub").each(function(idx, elem) {
      $(elem).click(function(event) {
        if($(elem).find("ul").css("display") == "none") {
          $(elem).find("ul").show();
          $(elem).find("a").addClass("icon-arrow-down").removeClass("icon-arrow-left");
        }
        else {
          $(elem).find("ul").hide();
          $(elem).find("a").addClass("icon-arrow-left").removeClass("icon-arrow-down");
        }

        event.preventDefault();
        return false;
      });

    });

    $(document).on("unload", function() {
      $(".dialog-window").each(function(idx, itm) {
        $(itm).dialog("destroy");
      });
    });

    // window.onpopstate = function(oEvent) {
    //   console.log(oEvent);
    //   if(oEvent.state) {
    //     var page = oEvent.state.page;
    //     var _tmp = page.split(/#/);
    //     page = _tmp[0];
    //
    //     var index = oEvent.state.index;
    //
    //     var foo = __webui_history[index].foo;
    //     var callback = __webui_history[index].callback;
    //
    //     load_page(page, foo, callback, 1);
    //   }
    // };

  });
})();



function add_load_callback(page, callback) {
  if(typeof page == "object") {
    if(typeof $GLOBALS["load_callback"]["__iterate__"] == "undefined") {
      $GLOBALS["load_callback"]["__iterate__"] = new Array();
    }

    $GLOBALS["load_callback"]["__iterate__"].push({
      "regexp": page,
      "callback": callback
    });
  }
  else {
    $GLOBALS["load_callback"][page] = callback;
  }
}

function prepare_data_tables() {

/*
  $(".dataTables_wrapper > .fg-toolbar:first").addClass("table-toolbar");
  $(".dataTables_wrapper > .fg-toolbar:last").addClass("table-bottom-bar");
  $(".table-toolbar > .dataTables_filter").addClass("table-search-field");
  $("table.dataTable:first > thead > tr > td").addClass("table-cell-head").addClass("table-cell-head-border");
  $("table.dataTable > tbody > tr > td").addClass("table-cell").addClass("table-cell-border");
*/

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

}

function activate_tab(tab, no_hist) {
  var li_id  = "#li-tab-" + tab.attr("tab_id");
  var tab_id = "#tab-" + tab.attr("tab_id");

  // current page
  var current_page = __webui_history[__webui_history.length-1];
  var current_page_url = current_page.page;
  var _tmp = current_page_url.split(/#/);

  /*
  if(! no_hist) {
    if(_tmp[1]) {
      console.log("history_push");
      history_push(_tmp[0] + "#" + tab.attr("tab_id"), current_page.foo, current_page.callback);
    }
    else {
      console.log("history_replace");
      history_replace(_tmp[0] + "#" + tab.attr("tab_id"), current_page.foo, current_page.callback);
    }
  }
  */

  tab.show();
  $("ul.tabs > li").removeClass("active");
  $(".tab-pane").hide();

  console.log(li_id);

  $(li_id).addClass("active");

  var pre_show_function  = $(li_id).attr("pre_show");
  var post_show_function = $(li_id).attr("post_show");

  if(pre_show_function) {
    window[pre_show_function]();
  }

  $(tab_id).show();

  if(post_show_function) {
    window[post_show_function]();
  }
}

function prepare_tab() {
  $("ul.tabs > li > a").click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    var tab_name = "#tab-" + $(this).attr("tab_id");
    console.log("tab_name: " + tab_name);
    activate_tab($(tab_name));
  });
}

function is_message_area_open() {
  if($("#link_message_area_close").parent().height() < 100) {
    return false;
  }

  return true;
}

function get_random_string(count)
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < count; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function prepare_dropdown() {
  console.log("deprecated call: prepare_dropdown from: " + arguments.callee.caller.toString());
  ui.prepare_dropdown();
}

var __webui_history = new Array();

function history_replace(page, foo, callback) {

  var o = {
      "page": page,
      "foo": foo,
      "callback": callback
    };

  __webui_history.push(o);

  history.replaceState({
      "page": page,
      "index": __webui_history.length - 1
    },
    "",
    "#" + page
  );

}

function history_push(page, foo, callback) {

  var o = {
      "page": page,
      "foo": foo,
      "callback": callback
    };

  __webui_history.push(o);

  history.pushState({
      "page": page,
      "index": __webui_history.length - 1
    },
    "",
    "#" + page
  );

}

function load_page(page, foo, callback, no_hist) {
  console.log("deprecated call: load_page from: " + arguments.callee.caller.toString());

  ui.load_page(
    {
      "link"       : page,
      "foo"        : foo,
      "cb"         : callback,
      "no_history" : no_hist
    }
  );
}

function onload_page() {
  prepare_dropdown();
}

function search_open_server(itm) {
  load_server(itm.srv_id);
}

/**
 * Create confirmation dialog
 *
 * ref.id    uniq ID
 * ref.title  title
 * ref.text  text to display
 * ref.button text of "ok" button
 * ref.height hight of the dialog
 * ref.ok    callback function if "ok" button pressed
 * ref.cancel callback function if "cancel" button pressed
 */
function dialog_confirm(ref) {
  console.log("deprected call of dialog_confirm by: " + arguments.callee.caller.toString());
  ui.dialog_config(ref);
}

/**
 * Create message dialog
 *
 * ref.id    uniq ID
 * ref.title  title
 * ref.text  text to display
 * ref.height hight of the dialog
 * ref.ok    callback function if "ok" button pressed
 */
function dialog_msgbox(ref) {
  console.log("deprected call of dialog_msgbox by: " + arguments.callee.caller.toString());
  ui.dialog_msgbox(ref);
}

function fnGetSelected( oTableLocal )
{
   return oTableLocal.$('tr.row_selected');
}

function noop_function() {}

function cancel_events(event) {
  event.preventDefault();
  event.stopPropagation();

  $(".dropdown-menu").hide();

  return false;
}

function rexio_send_clear_cache() {
  $.ajax({
    "type": "POST",
    "url": "/clear/cache"
  }).done(function(data) {
    $.pnotify({
      text: "Cache cleared.",
      type: "info"
    });
  });
}
