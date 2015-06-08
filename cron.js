#!/usr/bin/env node

var exec = require('child_process').exec; 
var path = require("path");
var CronJob = require('cron').CronJob;
new CronJob('0 10 7-23/6 * * *', function() {
    console.log(new Date());
    var script = path.join(__dirname, "cron.sh");
    exec(script, function(err, stdout, stderr) {
        if(err) console.log(err);
        console.log(stdout);
        console.log(stderr);
    });
}, null, true, "Asia/Shanghai");
