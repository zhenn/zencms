var UserModel = require('../models/user');
var md5 = require('../../lib/md5');
var dbHelper = require('../../lib/dbhelper');
var roleMap = require('../../config/privilege.json');

function serialize(obj) {
    var result = '';
    for (var i in obj) {
        result += (i + '=' + obj[i] + '&')
    }

    return result.replace(/&$/i, '');
}

// 显示模板列表
exports.login = function(req, res) {
    res.render('user/login');
};

exports.create = function(req, res) {
    res.render('user/create', {
        roleMap: roleMap
    });
};

// 身份校验
exports.authorize = function(req, res, next) {
    if (!req.session.userInfo) {
        var return_url = req.path + '?' + serialize(req.query);
        return_url = return_url.replace(/\?$/i, '');
        res.redirect('/login?return_url=' + encodeURIComponent(return_url));
    } else {
        var userInfo = req.session.userInfo;
        res.locals.user = userInfo;
        res.locals.isShowByRole = function(route) {
            var routes = roleMap[userInfo.role];
            return routes.indexOf(route) >= 0;
        }
        next();
    }
}

// 权限管理
exports.privilige = function(req, res, next) {
 
    var userInfo = req.session.userInfo;
    var role = userInfo.role;
    var privileges = roleMap[role];
    var path = req.path == '/' ? '/template/list' : req.path;
    var hasPrivileges = 0;
   
    for (var i = 0, len = privileges.length; i < len; i++) {
        var privilege = privileges[i];
        if(path.indexOf(privilege) == 0) {
            hasPrivileges = 1;
            break;
        }
    }
    if (hasPrivileges) {
        next();
    } else {
        res.render('error', {
            message: '抱歉，你没有权限进行此项操作!',
            error: new Error('no privilige')
        });
    }
}

exports.logout =function(req, res, next) {
    req.session.destroy();
    res.redirect('/login');
};

exports.save = function(req, res) {
    var userName = req.body.userName;
    var inputPassword = req.body.password;
    password = md5.hex_md5(inputPassword+userName);
    var role = req.body.role;
    var userId = req.body.userId;
    UserModel.find({userName:userName},function(error,data){
    
        if(!userId){
            if(data.length !== 0 ){
                res.send({
                    code:'error',
                    message:'用户名重复',
                });
                return;
            }
            var user = new UserModel({
                userName: userName,
                password: password,
                role: role
            });
            user.save(function(err, data) {
                if (err) {
                    next(err);
                } else {
                    res.send({
                    code: 'success',
                    data: {}
                    });
                }
            });

        } else {
            UserModel.findById(userId, function(err, data) {
                if (inputPassword !== 'unchange') {
                    data.password = password;
                }
                data.role = role;
                data.lastModifyTime = +new Date;
                data.save(function(err, data) {
                    if (err) {
                        next(err);
                    } else {
                        res.send({
                        code: 'success',
                        data: {}
                        });
                    }
                });
            })
        }
    });
};

exports.showList = function(req, res, next){

    var page = req.query.page || 1;
    var pageSize = req.query.pageSize || 15;
    dbHelper.pageQuery(page,pageSize,UserModel,'',{},{
        '_id':-1
    },function(error, $page){
        if(error){
            next(error);
        }else{
            var data = $page.results;
            res.render('user/list', { 
                data: data,
                $page: $page
            });
        }

    });
};

exports.edit = function(req, res){
    var userId = req.params.userId;
    UserModel.findById(userId, function(err, data) {
        res.render('user/edit', {data,roleMap});
    });
    
};

exports.doLogin = function(req, res){

    var sess = req.session
    var userName = req.body.userName;
    var inputPassword = req.body.password;

    UserModel.findOne({userName: userName}, function(error, data) {
        
        if (data) {
            var realInputPassword = md5.hex_md5(inputPassword + userName);
            userPassword = data.password;
            if (realInputPassword == userPassword) {
                sess.userInfo = data;
                res.send({
                    code: 'success',
                    message: ''
                });
            }

        } else {
            res.send({
                code: 'error',
                message: '用户名密码错误'
            });
        }
        
    });   

}