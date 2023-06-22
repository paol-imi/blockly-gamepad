var body = "console.log(arguments)";

('"use strict";(async () => {await console.log(arguments[0])})();');

var func = new Function(
  '"use strict";(async () => {await console.log(arguments[0])})();'
);
func(1, 2);
