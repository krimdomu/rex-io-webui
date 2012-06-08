/*
 * Module: Inventory.js
 *
 * This module handles the content area when clicked on inventory
 */

require(
   [
      "dojo/_base/declare",
   ],

   function(declare) {
      declare("org.rexops.webui.module.Server_Inventory", null, {
         constructor: function(item) {
         },

         can_run: function(item) {
            return true;
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


