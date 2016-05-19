var class_rexio = new Class({
  initialize: function() {
    this._stash = {};
  },
  
  stash: function(key, value) {
    if(typeof value == "undefined" && typeof this._stash[key] != "undefined") { 
      return this._stash[key];
    }

    this._stash[key] = value;
  },
  
  call: function(method,
      version,
      plugin,
      options,
      done_cb,
      fail_cb) {
    
    var ref, url;
    var self = this;

    url = "/" + version + "/" + plugin;

    for(var i = 0; i < options.length; i+=2) {
      var key   = options[i];
      var value = options[i+1];
      if(key == "ref") {
        ref = value;
        continue;
      }

      if(value && value != null) {
        url += "/" + key + "/" + value;
      }
      else {
        url += "/" + key;
      }
    }

    console.log("url: " + url);

    $.ajax(
      {
        "type": method,
        "url" : url,
        "data": (ref ? JSON.stringify({"data": Object.merge(self._stash, ref)}) : null)
      }
    ).done(function(data) {
      self._stash = {};
      done_cb(data); 
    });

  },
  
  __END__: ""
});


var rexio = new class_rexio();
