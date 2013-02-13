(function() {

   $(document).ready(function() {
      
      //$(".main-accordion").accordion();
      load_dashboard();

      $(".dashboard-link").click(function() {
         load_dashboard();
      });

   });

})();

function load_dashboard() {
   $("#content_area").load("/dashboard");
}
