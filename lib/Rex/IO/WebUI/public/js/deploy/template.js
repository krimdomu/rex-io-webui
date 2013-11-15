/**
 * Deploy::Template functions
 */

(function() {

   $(document).ready(function() {

      $("a.new-template-link").click(function(event) {

         load_page("/deploy/template/new", null, function() {
         
            $(".save_button").button().click(function(event) {
               $.log("creating new template");
               $.ajax({
                  "type": "POST",
                  "url": "/deploy/template",
                  "data": JSON.stringify({
                     "name": $("#name").val(),
                     "kernel": $("#kernel").val(),
                     "initrd": $("#initrd").val(),
                     "append": $("#append").val(),
                     "ipxe": $("#ipxe").val(),
                     "template": $("#template").val()
                  })
               }).done(function(data) {
                  $.log("Created new template\nGot Data: " + JSON.stringify(data));
               });
            });

         });

         return cancel_events(event); 
      });

      $("a.template-link").click(function(event) {

         load_page("/deploy/template", null, function() {

            prepare_tab();
            activate_tab($(".tab-pane:first"));

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
                  })
               }).done(function(data) {
                  $.log("Saved template: " + id + "\nGot Data: " + JSON.stringify(data));
               });
            });

         
         });

         return cancel_events(event);

      });

   });


})();
