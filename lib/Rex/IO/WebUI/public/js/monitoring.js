(function() {

   $(document).ready(function() {

      $(".monitoring-incidents").click(function(event) {
         event.preventDefault();
         event.stopPropagation();
         list_incidents();
      });

   });

})();

function prepare_incident_list(ref) {

   var minus_height = ref.minus_height;

   var oTable = $("#table_entries_incident").dataTable({
      //"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bJQueryUI": true,
      "bPaginate": false,
      "sScrollY": $("#content_area").height()-minus_height,
      "sPaginationType": "full_numbers"
   });

   prepare_data_tables();

   $(".incident-link").click(function() {
      load_incident($(this).attr("incident_id"));
   });

   if(ref.selectable) {
      $("#table_entries_incident tbody tr").click( function( e ) {
         if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
         }
         else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
         }
      });
   }

   $(window).on("resize", function() {
      if(typeof resize_Timer_incident != "undefined") {
         window.clearTimeout(resize_Timer_incident);
      }

      resize_Timer_incident = window.setTimeout(function() {
         $("#table_entries_incident").parent().css("height", $("#content_area").height()-minus_height);
         oTable.fnDraw();
      }, 500);
   });

   return oTable;
}


function list_incidents() {

   $(".page-content-container").load("/incident",function() {

      minus_height = 265;
      var oTable = prepare_incident_list({"minus_height":minus_height, "selectable":false});

      prepare_dropdown();

      $("#add_incident").dialog({
         autoOpen: false,
         height: 500,
         width: 650,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/incident",
                  "type": "POST",
                  "data": JSON.stringify({
                     "title": $("#i_title").val(),
                     "content": $("#i_content").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new dns record";
                     }
                     else {
                        list_incidents();
                     }
                  } catch(err) {
                     $.log(err);
                  }
               });

               $(this).dialog("close");
            },
            Cancel: function() {
               $(this).dialog("close");
            }
         },
         close: function() {
            $("INPUT").val("").removeClass("ui-state-error");
         }
      });

      $("#lnk_add_incident").click(function() {
         $("#add_incident").dialog("open");
      });

   });

}

function load_incident(incident_id) {

   $(".page-content-container").load("/incident/" + incident_id,function() {

      prepare_dropdown();
      prepare_tab();
      activate_tab($(".tab-pane:first"));

      $("#add_incident_message").dialog({
         autoOpen: false,
         height: 550,
         width: 650,
         modal: true,
         buttons: {
            "Add": function() {
               $.log("adding");

               $.ajax({
                  "url": "/incident/" + incident_id,
                  "type": "POST",
                  "data": JSON.stringify({
                     "title": $("#m_title").val(),
                     "message": $("#m_message").val(),
                     "status": $("#m_status").val(),
                     "assignee": $("#m_assignee").val()
                  }),
                  "contentType": "application/json",
                  "dataType": "json"
               }).done(function(data) {
                  try {
                     if(data.ok != true) {
                        throw "Error adding new dns record";
                     }
                     else {
                        load_incident(incident_id);
                     }
                  } catch(err) {
                     $.log(err);
                  }
               });

               $(this).dialog("close");
            },
            Cancel: function() {
               $(this).dialog("close");
            }
         },
         close: function() {
            $("INPUT").val("").removeClass("ui-state-error");
         }
      });

      $("#lnk_add_incident_message").click(function() {
         $("#add_incident_message").dialog("open");
      });

   });

}



