require([
         "dijit/layout/BorderContainer",
         "dijit/layout/TabContainer",
         "dijit/layout/ContentPane",
         "dojo/parser",
         "dijit/layout/AccordionContainer",
         "dojox/data/JsonRestStore",
         "dijit/tree/ForestStoreModel",
         "dijit/Tree"
        ],
        
        function() {
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
               console.log(item);
               console.log(node);
            }
         }, "tree");
        }

        );
