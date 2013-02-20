(function() {

   $(document).ready(function() {
      
      //$(".main-accordion").accordion();
      load_dashboard();

      $(".dashboard-link").click(function() {
         load_dashboard();
      });

      $(window).on("resize", function() {
         window.setTimeout(function() {
               $("#content_area").height($(window).height());
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

   });

})();

function load_dashboard() {
   $(".page-content-container").load("/dashboard");
}
