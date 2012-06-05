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


