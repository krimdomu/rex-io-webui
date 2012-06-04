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
      "dijit/TitlePane"
   ],

   function(declare) {
      declare("org.rexops.webui.app", null, {
         constructor: function() {

            var store = new dojox.data.JsonRestStore({
               target: "/server/tree",
               idAttribute: "id"
            });

            var treeModel = new dijit.tree.ForestStoreModel({
               store: store,
               query: "root",
               childrenAttrs: ["childrenRef"],
               labelAttr: "name",
               deferItemLoadingUntilExpand: true,
               mayHaveChildren: function(item) {
                  return store.getValue(item, "hasChildren") == true;
               }
            });

            var tree = new dijit.Tree({
               model: treeModel,
               showRoot:false,
               onClick: function(item, node) {
                  new org.rexops.webui.module[item.module](item);
               }
            }, "tree");

         }
      });

      new org.rexops.webui.app();
   }
);





