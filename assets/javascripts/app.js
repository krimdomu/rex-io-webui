// main application js file

require(
   [
      "dojo/_base/declare",
      "dijit/layout/BorderContainer",
      "dijit/layout/TabContainer",
      "dijit/layout/ContentPane",
      "dojo/parser",
      "dijit/layout/AccordionContainer",
      "dojox/data/JsonRestStore",
      "dijit/tree/ForestStoreModel",
      "dijit/Tree",
      "dijit/MenuBar",
      "dijit/PopupMenuBarItem",
      "dijit/DropDownMenu",
      "dijit/MenuItem",
      "dijit/TitlePane",
      "dijit/form/Button",
      "dijit/form/TextBox"
   ],

   function(declare) {
      declare("org.rexops.webui.app", null, {
         constructor: function() {

            // Server Tree
            var server_store = new dojox.data.JsonRestStore({
               target: "/server/tree",
               idAttribute: "id"
            });

            var server_treeModel = new dijit.tree.ForestStoreModel({
               store: server_store,
               query: "root",
               childrenAttrs: ["childrenRef"],
               labelAttr: "name",
               deferItemLoadingUntilExpand: true,
               mayHaveChildren: function(item) {
                  return server_store.getValue(item, "hasChildren") == true;
               }
            });

            var server_tree = new dijit.Tree({
               model: server_treeModel,
               showRoot:false,
               onClick: function(item, node) {
                  var mod = new org.rexops.webui.module[item.module]();
                  if(mod.can_run(item)) {
                     mod.run(item);
                  }
               }
            }, "server_tree");

            // Service Tree
            var service_store = new dojox.data.JsonRestStore({
               target: "/service/tree",
               idAttribute: "id"
            });

            var service_treeModel = new dijit.tree.ForestStoreModel({
               store: service_store,
               query: "root",
               childrenAttrs: ["childrenRef"],
               labelAttr: "name",
               deferItemLoadingUntilExpand: true,
               mayHaveChildren: function(item) {
                  return service_store.getValue(item, "hasChildren") == true;
               }
            });

            var service_tree = new dijit.Tree({
               model: service_treeModel,
               showRoot:false,
               onClick: function(item, node) {
                  var mod = new org.rexops.webui.module[item.module]();
                  if(mod.can_run(item)) {
                     mod.run(item);
                  }
               }
            }, "service_tree");


         }
      });

      new org.rexops.webui.app();
   }
);





