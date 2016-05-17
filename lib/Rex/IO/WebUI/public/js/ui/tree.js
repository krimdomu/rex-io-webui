/**
 * tree implementations for ui class.
 */
class_ui.implement({
  tree: function(opt) {
    var self = this;
    //console.log(opt);
    var on_cmd = $(opt).attr("rexio-ui-tree-open-node");
    var c_cmd = $(opt).attr("rexio-ui-tree-node-selected");
    
    var on_tmp = on_cmd.split(/\./);
    var c_tmp = c_cmd.split(/\./);
    
    $(opt).on('changed.jstree', function(event, data) {
      // TODO: support multiple select
      var node = data.instance.get_node(data.selected[0]);
      self.call_plugin_method(c_tmp[0], c_tmp[1], event, node);
    }).on('after_open.jstree', function(node) {
      self.call_plugin_method(on_tmp[0], on_tmp[1], node);
    }).jstree({
        'core': {
          'data': {
            'url': function(node) {
              
              return node.id === '#' ?
                  $(opt).attr("rexio-ui-tree-lazy-url") :
                    node.original.url
              },
            'data': function(node) {
              return { 'id': node.id };
            },
          }
        }
      });

    /*
    var tree = $(opt).easytree({
      nodeSelected: function(node) {
        console.log("nodeSelected:");
        console.log(node);
      },
      stateChanged: function(nodes, nodesJson) {
        console.log("tree.js: stateChanged: calling: " + c_tmp[0] + "." + c_tmp[1]);
        console.log($("#inventory_group_tree :selected"));
      },
      openLazyNode: function(event, nodes, node, hasChildren) {
        self.call_plugin_method(on_tmp[0], on_tmp[1], event, nodes, node, hasChildren);
      },
      data: [{
        "text": $(opt).attr("rexio-ui-tree-root-text"),
        "isExpanded": false,
        "isLazy": true,
        "id": $(opt).attr("rexio-ui-tree-root-id"),
        "lazyUrl": $(opt).attr("rexio-ui-tree-lazy-url")
      }],
    });
    
    self.register_has_sub_click(function(obj, event) {
      console.log("tree.js: has_sub_click: ");
      var currentlySelected = $('#' + $(obj).attr("id") + ' :selected').val();
      console.log(currentlySelected);
      var node = tree.getNode(currentlySelected);
      console.log(node);
    });
    */
    
    //var elem_id = "xxx";
    //self._trees[elem_id] = opt;
  }
});

