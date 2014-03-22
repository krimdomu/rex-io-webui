function class_ui() {

}

class_ui.prototype.add_task = function(option) {
  var li_id = option['id'];
  var icon  = option['icon'];
  var text  = option['text'];

  $("#message_list").append('<li id="'
                  + li_id
                  + '" class="icon-' + icon + '">'
                  + text
                  + "</li>");
}

var ui = new class_ui();
