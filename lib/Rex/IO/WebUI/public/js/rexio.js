function class_rexio() {
}

// rexio.call("GET", "1.0", "service", [ "service", 4, "host", 1 ])
class_rexio.prototype.call = function(method,
    version,
    plugin,
    options,
    done_cb,
    fail_cb) {

  var ref, url;

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
      "data": (ref ? JSON.stringify({"data": ref}) : null)
    }
  ).done(function(data) { done_cb(data); });
}


var rexio = new class_rexio();
