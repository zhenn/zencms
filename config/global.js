var express = require('express');

var app = global.app = express();
var env = global.env = app.get('env');
global.groupmap = require('./groupmap.json');