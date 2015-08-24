require("./css/normalize.css")
require("./css/base.css")

var Vue = require("vue")

var options = require("./app.vue")

var app = new Vue(options).$mount(".app")