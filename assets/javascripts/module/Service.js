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


