/**
 * Datacenter functions
 */

var rack_grid = new Array();
var rack_grid_y_lookup = new Array();
var he_in_px = 20 + 1;

(function() {

   $(document).ready(function() {

      $("a.datacenter-racks-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         list_all_racks();
      });

      $("a.datacenter-locations-link").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         list_datacenter_locations();
      });


   });


})();

function prepare_rack_designer(ref) {

   var minus_height = ref.minus_height;
   var minus_width  = ref.minus_width;

   $("#rack_designer").css({
      "height": $("#content_area").height()-minus_height,
      "width": $("#content_area").width()-minus_width
   });

   $(window).on("resize", function() {
      if(typeof resize_Timer_rackdesigner != "undefined") {
         window.clearTimeout(resize_Timer_rackdesigner);
      }

      resize_Timer_rackdesigner = window.setTimeout(function() {
         $("#rack_designer").css({
            "height": $("#content_area").height()-minus_height,
            "width": $("#content_area").width()-minus_width
         });
      }, 500);
   });
}

function list_all_racks() {

   load_page("/datacenter/racks", null, function() {

      set_search(create_server_object);

      var minus_height = 150;
      var minus_width  = 20;
      prepare_rack_designer({
         'minus_height': minus_height,
         'minus_width' : minus_width
      });


      rackdesigner_attach_events($(".server_item"));

      // fill rack_grid
      rack_grid = new Array();
      $(".rack-drop").each(function(idx, itm) {
         if(typeof rack_grid[$(itm).attr("he")] == 'undefined') {
            rack_grid[$(itm).attr("he")] = {};
         }

         rack_grid[$(itm).attr("he")][$(itm).attr("position")] = {
            x: $(itm)[0].offsetLeft,
            y: $(itm)[0].offsetTop,
            w: $(itm).width(),
            ox: $(itm).offset().left,
            oy: $(itm).offset().top,
         };

         rack_grid_y_lookup[$(itm)[0].offsetTop] = $(itm).attr("he");
      });

   });

}

function place_object_on_rack(obj) {
   if(typeof obj == "undefined") {
      console.log("undefined obj...");
      return;
   }

   var he_top = $(obj)[0].offsetTop;

   if(typeof rack_grid_y_lookup[he_top] == "undefined") {
      // fallback one pixel more
      he_top = $(obj)[0].offsetTop + 1;
   }
   if(typeof rack_grid_y_lookup[he_top] == "undefined") {
      // fallback one pixel less
      he_top = $(obj)[0].offsetTop - 1;
   }
   if(typeof rack_grid_y_lookup[he_top] == "undefined") {
      // error, he not found
      console.log("he not found...");
      return;
   }

   var he = rack_grid_y_lookup[he_top];
   $(obj).attr("he_start", he);

   if(typeof he != "undefined") {
      var front_area = {
         xb: rack_grid[he].front.x,
         xe: rack_grid[he].interior.x,
         ox: rack_grid[he].front.ox,
         w: rack_grid[he].front.w
      };
      var interior_area = {
         xb: rack_grid[he].interior.x,
         xe: rack_grid[he].back.x,
         ox: rack_grid[he].interior.ox,
         w: rack_grid[he].interior.w
      };
      var back_area = {
         xb: rack_grid[he].back.x,
         xe: rack_grid[he].back.x + rack_grid[he].back.w,
         ox: rack_grid[he].back.ox,
         w: rack_grid[he].back.w
      };

      var object_left = $(obj)[0].offsetLeft;

      // is it inside front?
      if(object_left >= front_area.xb && object_left < front_area.xe) {
         $(obj).css({
            left: front_area.xb
         });
         if($(obj).width() < front_area.w) {
            $(obj).css({
               width: front_area.w
            });
         }
      }
      else if(object_left >= interior_area.xb && object_left < interior_area.xe) {
         $(obj).css({
            left: interior_area.xb
         });
         if($(obj).width() < interior_area.w) {
            $(obj).css({
               width: interior_area.w
            });
         }
      }
      else if(object_left >= back_area.xb && object_left <= back_area.xe) {
         $(obj).css({
            left: back_area.xb,
            width: back_area.w
         });
      }
   }
}

function resize_object_on_rack(obj) {
   var he_count = Math.ceil(obj.height() / he_in_px);
   var new_height = he_count * he_in_px - 1;
   obj.height(new_height);
   $(obj).attr("he_count", he_count);
}

function save_rack() {

}

function create_server_object(ref) {
   var new_obj = $('<div class="server_item he1">' + ref.label + '</div>');
   new_obj.css({
      'top': 200,
      'left': 200
   });
   $('#rack_designer').append(new_obj);
   rackdesigner_attach_events(new_obj);

}

function rackdesigner_attach_events(obj) {

   obj.resizable({
      ghost: true,
      start: function(event) {
      },
      stop: function(event, ui) {
         resize_object_on_rack(ui.element);
      }
   }).draggable({
      snap: '.rack-cell',
      snapMode: 'inner',
      start: function(event) {
      },
      stop: function(event, ui) {
         place_object_on_rack(ui.helper);
      }
   });



}

function list_datacenter_locations() {

   load_page("/datacenter/locations", null, function() {

      var minus_height = 150;
      var minus_width  = 30;
      prepare_location_designer({
         'minus_height': minus_height,
         'minus_width' : minus_width
      });

      $(".location_designer").resizable();

   });

}

function prepare_location_designer(ref) {

   var minus_height = ref.minus_height;
   var minus_width  = ref.minus_width;

   $("#location_designer_frame").css({
      "height": $("#content_area").height()-minus_height,
      "width": $("#content_area").width()-minus_width
   });

   $(window).on("resize", function() {
      if(typeof resize_Timer_locationdesigner != "undefined") {
         window.clearTimeout(resize_Timer_locationdesigner);
      }

      resize_Timer_locationdesigner = window.setTimeout(function() {
         $("#location_designer_frame").css({
            "height": $("#content_area").height()-minus_height,
            "width": $("#content_area").width()-minus_width
         });
      }, 500);
   });
}


