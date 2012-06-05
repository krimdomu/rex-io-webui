
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
      "dijit/form/TextBox",
      "dijit/form/Select"
   ],

   function(declare) {
      declare("org.rexops.webui.app", null, {
         constructor: function() {

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
         constructor: function() {
         },

         can_run: function(item) { return true; },
         run: function(item) {
            var server = item.root_id;

            var tabcontainer = dijit.byId("tabContainer");
            var server_tab = dijit.byId(server + "_ServiceTab");

            if(server_tab) {
               server_tab.set("href", "/server/" + server + "/edit");
            }
            else {
               server_tab = new dijit.layout.ContentPane({
                  id: server + "_ServiceTab",
                  title: server,
                  href: "/server/" + server + "/edit",
                  closable: true
               });

               tabcontainer.addChild(server_tab);
            }

            tabcontainer.selectChild(server_tab);
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
      declare("org.rexops.webui.module.Server_Service", null, {
         constructor: function(item) {
         },

         can_run: function(item) {
            if(item.hasChildren && item.name == "variables") {
               return true;
            }

            return false;
         },

         run: function(item) {
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


