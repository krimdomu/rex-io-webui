(function() {


   $(document).ready(function() {

      $(".dashboard-link").click(function(event) {
         load_dashboard(true);

         event.preventDefault();
         event.stopPropagation();
      });

   });

})();

function load_dashboard(force) {
   set_search(search_open_server);

   var _hash = document.location.hash;
   if(! force && _hash && _hash != "#" && _hash != "#/dashboard") {
      var page = _hash.substr(1);
      var _tmp = page.split(/#/);
      page = _tmp[0];

      if(typeof $GLOBALS['load_callback'] != "undefined"
         && typeof $GLOBALS['load_callback'][page] != "undefined") {

         var func = $GLOBALS['load_callback'][page];
         if(_tmp[1]) {
            load_page(page, null, function() { func(); activate_tab($('#li-tab-' + _tmp[1])); });
         }
         else {
            load_page(page, null, func);
         }
         return;
      }
      else if(typeof $GLOBALS['load_callback']['__iterate__'] != "undefined") {
         var func;
         for(var cbo in $GLOBALS['load_callback']['__iterate__']) {
            var _a = $GLOBALS['load_callback']['__iterate__'][cbo];
            var found = _a.regexp.exec(page);
            if(found) {
               func = _a.callback;
               break;
            }
         }

         if(func) {
            if(_tmp[1]) {
               load_page(page, null, function() { func(); activate_tab($('#li-tab-' + _tmp[1])); });
            }
            else {
               load_page(page, null, func);
            }
    
            return;
         }
      }

   }

   load_page("/dashboard",function() {
      prepare_tab();
      activate_tab($(".tab-pane:first"));

      $("#lnk_clear_cache").click(function(event) {
         rexio_send_clear_cache();
         return cancel_events(event);
      });

      $(".incident-link").click(function() {
         load_incident($(this).attr("incident_id"));
      });
   });
}
