#!/usr/bin/env node

var script = process.argv[1];
var args = process.argv.slice(2);
var cmd = args.length == 0 ? "h" : args[0];
GLOBAL.HOME=__dirname;

var v = require("./lib/verb");

switch(cmd) {
    case "r": 
        v.retrive(); 
        break;
    case "g": 
        v.generate(); 
        break;
    case "d": 
        v.deploy(); 
        break;
    case "h": 
        var helpArr = [
            "Usage: " + script + " <option>",
            "<option> can be:",
            "r: retrive new post from v2ex.com",
            "g: generate json post to html",
            "d: deploy html to git",
            "h: print help message. It's me ^_^"
        ];
        console.log(helpArr.join("\n"));
        break;

}
