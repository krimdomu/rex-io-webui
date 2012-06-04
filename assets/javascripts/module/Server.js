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


