/**
 * Deploy::Template functions
 */

(function() {

   $(document).ready(function() {

      $("a.template-link").click(function() {
         $("#content_area").load("/deploy/template", null, function() {
            $("#template-tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
            $("#template-tabs li").removeClass("ui-corner-top" ).addClass( "ui-corner-left");
            $("#template-tabs .ui-tabs-panel").css("width", $("#content_area").width()-250);
            $(".save_button").button().click(function(event) {
               event.preventDefault();
               var id = $(this).attr("template_id");
               $.log("saving template: " + id);
               $.ajax({
                  "type": "PUT",
                  "url": "/deploy/template/" + id,
                  "data": JSON.stringify({
                     "name": $("#name_" + id).val(),
                     "kernel": $("#kernel_" + id).val(),
                     "initrd": $("#initrd_" + id).val(),
                     "append": $("#append_" + id).val(),
                     "ipxe": $("#ipxe_" + id).val(),
                     "template": $("#template_" + id).val()
                  }),
               }).done(function(data) {
                  $.log("Saved template: " + id + "\nGot Data: " + JSON.stringify(data));
               });
            });

            $(window).on("resize", function() {
               window.setTimeout(function() {
                  $("#template-tabs .ui-tabs-panel").css("width", $("#content_area").width()-250);
               }, 200);
            });

         });
      });

   });


})();
