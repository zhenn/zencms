var mongoose = require('mongoose');
var app = require('express')();
var env = app.get('env');

function createConnect() {
    var options = { 
        server: { 
            socketOptions: { 
                keepAlive: 1 
            } 
        } 
    };
    var connection;

    if (env == 'development') {
        connection = mongoose.connect('mongodb://10.0.1.34:27017/zencms', options).connection;
    } else {
        // 线上数据库待配置
        connection = mongoose.connect('mongodb://zencms:4prHUede59G@phpmongo-os01:12100/zencms', options).connection;
    }
    return connection;
}

// 连接数据库
exports.connect = function(env) {
    // 全局公用数据库连接
    var connect = createConnect();
    connect.on('error', function() {
      console.log('mongo connection error');
    });
    connect.on('disconnected', function() {
        console.log('Mongoose default connection disconnected'); 
    });
};

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    });
});

