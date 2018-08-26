"use strict";
function forObj(obj, fn) {Object.keys(obj).forEach(function (key) {fn(obj[key], key);})}