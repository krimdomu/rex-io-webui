(function() {

   $(document).ready(function() {
      
      //$(".main-accordion").accordion();
      load_dashboard();

      $("#dashboard-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         load_dashboard();
      });

      $("#link_message_area_close").click(function() {
         if(! is_message_area_open()) {
            $(this).parent().removeClass("message_area_down").addClass("message_area");
         }
         else {
            $(this).parent().removeClass("message_area").addClass("message_area_down");
         }
         $(window).trigger("resize");
      });

      $(".dashboard-link").click(function() {
         load_dashboard();
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
         $(elem).click(function() {
            if($(elem).find("ul").css("display") == "none") {
               $(elem).find("ul").show();
               $(elem).find("a").addClass("icon-arrow-down").removeClass("icon-arrow-left");
            }
            else {
               $(elem).find("ul").hide();
               $(elem).find("a").addClass("icon-arrow-left").removeClass("icon-arrow-down");
            }
         });

      });

      $(document).on("unload", function() {
         $(".dialog-window").each(function(idx, itm) {
            $(itm).dialog("destroy");
         });
      });

   });
})();

function load_dashboard() {
   load_page("/dashboard",function() {
      prepare_tab();
      activate_tab($(".tab-pane:first"));

      $(".incident-link").click(function() {
         load_incident($(this).attr("incident_id"));
      });
   });
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

function activate_tab(tab) {
   var li_id  = "#li-tab-" + tab.attr("tab_id");
   var tab_id = "#tab-" + tab.attr("tab_id");

   tab.show();
   $("ul.tabs > li").removeClass("active");
   $(".tab-pane").hide();

   console.log(li_id);

   $(li_id).addClass("active");
   $(tab_id).show();
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
   $(".pull-menu").click(function(event) {
      if($(".dropdown-menu").css("display") == "none") {
         $(".dropdown-menu").show();
      }
      else {
         $(".dropdown-menu").hide();
      }

      event.preventDefault();
      event.stopPropagation();
   });
}

function load_page(page, foo, callback) {

   $(".dialog-window").each(function(idx, itm) {
      $(itm).dialog("destroy");
   });

   if(typeof foo == "function") {
      $(".page-content-container").load(page, null, foo);
   }
   else {
      $(".page-content-container").load(page, foo, callback);
   }


}


