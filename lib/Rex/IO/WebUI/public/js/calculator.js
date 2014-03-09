function calculate_value(code, data_map) {
  var math_register = [];
  var data_register = {};

  var cmd_map = {
    "cur": function(key) {
      var val = 0;

      if(typeof data_map[key] != "undefined"
        && typeof data_map[key][data_map[key].length -1] != "undefined") {
        
        val = data_map[key][data_map[key].length - 1].value;
      }

      math_register.push(val);
    },
    "prev": function(key) {
      var val = 0;

      if(typeof data_map[key] != "undefined"
        && typeof data_map[key][data_map[key].length -2] != "undefined") {
        
        val = data_map[key][data_map[key].length - 2].value;
      }

      math_register.push(val);
    },
    "math": function(op) {
      var ops = op.split(/\s+/);

      for (var oidx in ops) {
        var o = ops[oidx];
        var last = math_register.pop();
        var prev = math_register.pop();
        math_register.push(eval(prev + " " + o + " " + last));
      }
    },
    "push": function(v) {
      data_register[v] = math_register[math_register.length - 1];
    },
    "pop": function(v) {
      if(typeof data_register[v] == "undefined") {
        math_register.push(v);
      }
      else {
        math_register.push(data_register[v]);
      }
    },
    "dump": function(w) {
      console.log("========= MATH REGISTER =========");
      console.log(math_register);
      console.log("========= DATA REGISTER =========");
      console.log(data_register);
    },
    "round": function(r) {
      var c = math_register.pop();
      c = (Math.round(c * r) / r);
      math_register.push(c);
    }
  };

  var lines = code.split(/\r?\n/);

  for(var idx in lines) {
    if(lines[idx].match(/^#/)) {
      continue;
    }

    if(lines[idx].match(/^$/)) {
      continue;
    }

    var data = lines[idx].split(/:\s+?/);
    var cmd = data[0];
    var params = data[1];

    var code = cmd_map[cmd];
    code(params);
  }

  if(typeof data_register["$solution"] != "undefined") {
    return data_register["$solution"];
  }

  return 0;
}
