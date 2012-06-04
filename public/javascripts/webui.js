
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





/*
 * Module: Server.js
 *
 * This module handles the content area when clicked on a server
 */

require(
   [
      "dojo/_base/declare",
   ],

   function(declare) {
      declare("org.rexops.webui.module.Server", null, {
         constructor: function(item) {
            var server = item.root_id;
            var tabcontainer = dijit.byId("tabContainer");

            var newtab = new dijit.layout.ContentPane({
               title: server,
               href: "/server/" + server + "/edit",
               closable: true
            });

            tabcontainer.addChild(newtab);
            tabcontainer.selectChild(newtab);
         }
      })
   }
);


/*
 * Module: Service.js
 *
 * This module handles the content area when clicked on a service key
 */

require(
   [
      "dojo/_base/declare",
   ],

   function(declare) {
      declare("org.rexops.webui.module.Service", null, {
         constructor: function(item) {
            var server = item.root_id;

            var tabcontainer = dijit.byId("tabContainer");
            var server_tab = dijit.byId(server + "_ServiceTab");

            if(server_tab) {
               server_tab.set("href", "/server/" + item.id);
            }
            else {
               server_tab = new dijit.layout.ContentPane({
                  id: server + "_ServiceTab",
                  title: server,
                  href: "/server/" + item.id,
                  closable: true
               });

               tabcontainer.addChild(server_tab);
            }

            tabcontainer.selectChild(server_tab);
         }
      })
   }
);


