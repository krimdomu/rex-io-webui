var class_ui = new Class({
  initialize: function() {
    this._objects      = new Object();
    this._ready_funcs  = new Array();
    this._resize_timer = new Object();
    this._classes      = new Object();
    this._data_tables  = new Object();
    this._trees        = new Object();
    this._routes       = new Array();
    this._has_sub_click = new Array();
  },

  bootstrap: function() {
    console.log("bootstrapping ui...");
    var self = this;

    $("body").layout({
      east__initClosed: true,
      south__initClosed: true,
      north__resizable: false,
      north__closable: false,
      west__size: 220,
    });

    for(var i = 0; i < this._ready_funcs.length; i++) {
      this._ready_funcs[i](this);
    }

    this._init_objects();

    $(window).on('hashchange', function() { self.route(); });
    this.route();
  },

  ready: function(func) {
    console.log("registering new ready function.");
    this._ready_funcs.push(func);
  },

  execute_plugin_hook: function(hook) {
    for(var obj in this._objects) {
      console.log("obj: " + obj);
      this._objects[obj]()[hook]();
    }
  },

  register_plugin: function(ref) {
    var self = this;
    var obj  = ref["object"];

    console.log("register plugin: " + obj);

    if(self._objects[obj]) {
      console.log("plugin (" + obj + ") already registered.");
      return;
    }

    var class_name = self.get_class_name(obj);
    self._objects[obj] = function() {
      console.log("trying to access: " + obj);

      if(! self._classes[class_name]) {
        self._classes[class_name] = new window[class_name](self);
      }

      return self._classes[class_name];
    };

    self.require_js(
      {
        "js" : "/js/" + obj + ".js",
        "cb" : function() {
          if(typeof self._objects[obj]()["onload"] != "undefined") {
            console.log("running onload_hooks (" + obj + ") ...");
            self._objects[obj]().onload();
          }
        }
      }
    );
  },

  _init_objects: function() {
    var self = this;
    $(".rexio-ui-link").each(function(idx, elem) {
      if($(this).attr("rexio-initialized")) {
        console.log("object already initialized... skipping.");
        return;
      }

      $(this).attr("rexio-initialized", true);

      var obj          = $(elem).attr("rexio-ui-object");
      var click_action = $(elem).attr("rexio-ui-click");

      if(obj) {
        self.register_plugin(
          {
            "object" : obj
          }
        );

        $(elem).click(function(event) {
          self._call_object_or_click_action(obj, null, event);
        })
      }

      else if(click_action) {
        $(elem).click(function(event) {
          self._call_object_or_click_action(null, click_action, event);
        });
      }

    });
  },

  _call_object_or_click_action: function(obj, click_action, event) {
    var self = this;

    if(obj) {
      console.log("_call_object_or_click_action: obj: " + obj);
      self.load_plugin({
        "obj": obj,
        "event": event,
      });
    }
    else if(click_action) {
      var tmp = click_action.split(/\./);
      console.log("_call_object_or_click_action: click_action: " + tmp[0] + "." + tmp[1]);

      self._objects[tmp[0]]()[tmp[1]](
        {
          "event"  : event,
          "target" : event.currentTarget
        }
      );
    }

    if(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    $(".dropdown-menu").hide();
  },
  
  call_plugin_method: function() {
    var self = this;
    var args = Array.prototype.slice.call(arguments);
    var plg = arguments[0];
    var method = arguments[1];
    
    console.log("ui.call_plugin_method: plugin: " + plg);
    console.log("ui.call_plugin_method: method: " + method);
    
    self.load_plugin({
      "obj": plg,
      "cb": function() {
        console.log(self._objects);
        console.log(args);
        self._objects[plg]()[method].apply(self._objects[plg](), args.slice(2, args.length));
      }
    });
  },

  load_plugin: function(ref) {
    var self = this;

    var plg = ref['obj'];
    var event = ref['event'];
    var data = ref['data'];
    var cb = ref['cb'];
    
    if( ! cb ) {
      cb = function() {
          ui._objects[plg]().load(
            {
              "event"  : event ? event : null,
              "target" : event ? event.currentTarget : null,
              "data"   : data
            }
          );
        };
    }

    self.require_js(
      {
        "js": "/js/" + plg + ".js",
        "cb": cb
      }
    );
  },

  get_class_name: function(str) {
    return str.replace(/\//g, "_");
  },

  add_task: function(option) {
    var li_id = option['id'];
    var icon  = option['icon'];
    var text  = option['text'];

    $("#message_list").append('<li id="'
                    + li_id
                    + '" class="icon-' + icon + '">'
                    + text
                    + "</li>");
  },

  register_route: function(route, cb) {
    this._routes.push(
      {
        "route": route,
        "cb": cb
      }
    );
  },

  route: function() {
    var url = location.hash;
    console.log("found url: " + url);

    var obj = url.slice(2) || "dashboard";
    console.log("object to use: " + obj);

    // check if url is a registered route
    for(var i = 0; i < this._routes.length; i++) {
      var route = this._routes[i]['route'];
      var route_type = (typeof route == "object" ? route.constructor.name : "string");
      console.log("route: " + route);
      console.log("typeof route: " + route_type);

      if(route_type == "RegExp") {
        if(route.test(obj)) {
          var res = route.exec(obj);
          this._routes[i]['cb'](res.slice(1));
        }
      }
      else {
      }

    }

    this._call_object_or_click_action(obj, null, null);
  },

  require_js: function(obj) {
    var js = obj["js"];
    var cb = ( obj["cb"] ? obj["cb"] : function() {} );

    console.log("require_js: " + js);
    $.getScript(js, function() {
      console.log("require_js: " + js + " loaded.");
      cb();
    })
  },

  link: function(opt) {
    var elem = opt["elem"];
    var link = opt["link"];
    var func = opt["func"];

    var cb   = (opt["cb"] ? opt["cb"] : function() {});

    $(elem).click(function(event) {
      event.preventDefault();
      event.stopPropagation();

      if(link) {
        this.load_page(
          {
            "link" : link,
            "foo"  : null,
            "cb"   : cb
          }
        );
      }
      else if(func) {
        func(
          {
            "event"   : event,
            "cb"      : cb,
            "srcElem" : elem
          }
        );
      }
    });
  },

  load_page: function(opt) {
    var self    = this;
    var link    = opt["link"];
    var foo     = opt["foo"];
    var cb      = opt["cb"];
    var no_hist = opt["no_history"];

    self._load_page(link, foo, cb, no_hist);
  },

  _load_page: function(page, foo, callback, no_hist) {
    var self = this;

    if(! callback) { callback = function() {}; }

    $(".dialog-window").each(function(idx, itm) {
      $(itm).dialog("destroy");
    });

    if(! no_hist) {
      history_push(page, foo, callback);
    }

    if(typeof foo == "function") {
      $(".page-content-container").load(page, null, function() { foo(); self.onload_page(); });
    }
    else {
      $(".page-content-container").load(page, foo, function() { callback(); self.onload_page(); });
    }
  },

  onload_page: function() {
    this._init_objects();
    this.prepare_dropdown();
    this.prepare_ui_widgets();
  },

  prepare_dropdown: function() {
    $(".pull-menu").click(function(event) {
      if($(".dropdown-menu").css("display") == "none") {
        $(".dropdown-menu").show();
      }
      else {
        $(".dropdown-menu").hide();
      }

      event.preventDefault();
      event.stopPropagation();
    });

    $(window).click(function(event) {
      $(".dropdown-menu").hide();
    });

    $("#menu").menu({
      "position": {
        "my": "right top",
        "at": "left top"
      }
    });

    $("#menu").removeClass("ui-widget").removeClass("ui-widget-content").removeClass("ui-corner-all");
    $("#menu").find("a").removeClass("ui-corner-all");
  },

  redirect_to: function(obj) {
    var self = this;
    self._objects[obj]().load({
      "event"  : null,
      "target" : null
    });
  },
  
  register_has_sub_click: function(cb) {
    this._has_sub_click.push(cb); 
  },
  
  trigger_has_sub_click: function(obj, event) {
    var self = this;
    this._has_sub_click.forEach(function(itm) {
      itm.call(self, [obj, event]);
    });
  },

});
