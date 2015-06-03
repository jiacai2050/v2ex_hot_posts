var ejs = require("ejs");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var _ = require("underscore");
var exec = require('child_process').exec;
var request = require('request');
var config = require('../config');

require("./str");
require("./date");

var template = "";
var postsDir = path.join(HOME, "data");
var deployDir = path.join(HOME, ".deploy");
fs.exists(deployDir, function(exists) {
    if(!exists) {
        fs.mkdirSync(deployDir);
    }
});
var templateArticle = path.join(HOME, "template", "post.ejs");

exports.deploy= function() {
    var cmdArr = [
        "cd " + path.join(HOME, ".deploy"),
        "git checkout gh-pages",
        "git add -A .",
        "git commit -m 'update at "+ new Date() +"'",
        "git push origin gh-pages:gh-pages"
    ];
    exec(cmdArr.join(";"), function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    }); 
}
function prepare(cb) {
    var gitDir = path.join(deployDir, ".git");
    fs.exists(gitDir, function(exists) {
        if(!exists) {
            fs.mkdirSync(gitDir);
            console.log("mkdir .deploy/.git ...");
            var cmdArr = [
                "cd " + path.join(HOME, ".deploy"),
                "git init", 
                "git remote add origin git@github.com:jiacai2050/v2ex_hot_posts.git",
                "git pull origin gh-pages:gh-pages",
                "git checkout gh-pages",
            ];
            exec(cmdArr.join(";"), function(err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                cb();
            }); 
        } else {
            cb();    
        }
    });
}
function readPostsDir() {
    fs.readdir(postsDir, function(err, postFiles) {
        _.map(postFiles, function(postFile) {
            if(postFile && postFile.endsWith("json")) {
                postFile = path.join(postsDir, postFile);
                var hotPosts = require(postFile);
                hotPosts = _.uniq(hotPosts, function(hotPost) {
                    return hotPost.url;
                });
                hotPosts = _.sortBy(hotPosts, function(hotPost) {
                    return - hotPost.replies;
                });
                fs.readFile(templateArticle, function(err, template) {
                    template = template.toString("utf8");
                    hotPosts = JSON.stringify(hotPosts);
                    var tsMatched = /(\d{10,10})\.json/.exec(postFile);
                    var ts = 0;
                    if(tsMatched.length > 1) {
                        ts = tsMatched[1];
                    }
                    var currentDate = new Date(ts * 1000);
                    var year= currentDate.format("yyyy");
                    var month = currentDate.format("MM");
                    var day = currentDate.format("dd");
                    var date = [year, month, day].join("/");
                    var html = ejs.render(template, {
                        hotPosts: hotPosts,
                        date: date
                    });
                    var postDir = path.join(deployDir, year, month, day);
                    writeHTML(html, postDir);
                });
            }
        });
    });
    
}
exports.generate = function() {
    prepare(readPostsDir);
}
exports.retrive = function() {
    request(config.v2ex.postAddress, function(err, res, body) {
        if(!err && res.statusCode == 200) {
            var hotPosts = JSON.parse(body);
            var d = parseInt(new Date().getTime()/1000/3600/24)*3600*24; 
            var now = d + ".json";
            var jsonFile = path.join(HOME, "data", now);
            // 同一天可能执行多次retrive操作，合并多次的结果
            fs.exists(jsonFile, function(exists) {
                if(exists) {
                    var oldPosts = require(jsonFile);
                    hotPosts = hotPosts.concat(oldPosts);
                    hotPosts = _.uniq(hotPosts, function(hotPost) {
                        return hotPost.url;
                    });
                }
                saveAsJson(jsonFile, hotPosts);
            });
        } else {
            console.log(err);
        }
    });
}
function writeHTML(html, postDir) {
    mkdirp(postDir, function(err) {
        var page = path.join(postDir, "index.html");
        fs.writeFile(page, html, function(err) {
            if(err) {
                throw err;
            }
            console.log(page + " write ok!"); 
        }); 
    })
}
function saveAsJson(jsonFile, hotPosts) {
    fs.writeFile(jsonFile, JSON.stringify(hotPosts, null, 4), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + jsonFile);
        }
    });
}
