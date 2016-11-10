var RichtextModel = require('../models/richtext');
var dbHelper = require('../../lib/dbhelper');

exports.list = function(req, res, next) {
    
    var query = req.query,
        page = query.page || 1,
        pageSize = query.pageSize || 15,
        creator = query.creator,
        group = query.group,
        name = query.name,
        conditions = {
            
        };

    creator && (conditions.creator = creator);
    group && (conditions.group = group);
    name && (conditions.name = new RegExp(name));

    dbHelper.pageQuery(page, pageSize, RichtextModel, '', conditions, {
        '_id': -1
    }, function(error, $page){
        /**
            { 
                pageNumber: 1,  // 页码
                pageCount: 6,   // 总页数
                results: []     // 当前页查询记录
            }
         */
        if (error) {
            next(error);
        } else {
            var data = $page.results;

            res.render('richtext/list', { 
                data: data,
                $page: $page
            });
        }
    });
};

exports.create = function(req, res) {
    res.render('richtext/create');
};

exports.save = function(req, res) {

    var body = req.body;

    var content = body.content;
    var name = body.name;
    var title = body.title;
    var group = body.group;
    var widthRate = body.widthRate;
    var imgAdaptScreen = Boolean(Number(body.imgAdaptScreen));

    var pageId = body.pageId;

    // 新建
    if (!pageId) {
        try {
            var richtext = new RichtextModel({
                name: name,
                content: content,
                title: title,
                group: group,
                creator: req.session.userInfo.userName,
                widthRate: widthRate,
                imgAdaptScreen: imgAdaptScreen,
                createTime: new Date().getTime()
            });

            richtext.save(function(err, data) {
                if (err) {
                    next(err);
                } else {
                    res.send({
                        code: 'success',
                        data: {}
                    });
                }
            });
        } catch(e) {
            console.log(e)
        }
        

    } else {
        // 更新
        RichtextModel.findById(pageId, function(err, data) {

            try {
                data.content = content;
                data.title = title;
                data.widthRate = widthRate;
                data.imgAdaptScreen = imgAdaptScreen;
                data.lastModifyTime = +new Date;
                data.save(function(_err, _data) {
                    
                    if (_err) {
                        next(_err);
                    } else {
                        res.send({
                            code: 'success',
                            data: {}
                        });
                    }
                });
            } catch(e) {
                console.log(e)
            }
            
        });
    }
};


exports.edit = function(req, res) {
    RichtextModel.findById(req.query.pageId, function(err, data) {
        res.render('richtext/edit', data);
    });
};


exports.delete = function(req, res) {
    var pageId = req.body.pageId;
    RichtextModel.remove({

        _id: pageId
    }, function(err, _data) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                code: 'success',
                data: {}
            });
        }
        
    });
};

exports.preview = function(req, res) {
    var pageId = req.query.pageId;

    RichtextModel.findById(pageId, function(err, data) {
        if (err) {
            next(err);
        } else {
            if (!data) {
                err = new Error('此页面不存在!');
                next(err);
            } else {
                // data.setAlias();
                data.pagetype = 'richtext';
                res.render('page/show', data);
            }
        }
    });
};

exports.render = function(req, res) {
    var pageId = req.query.pageId;

    RichtextModel.findById(pageId, function(err, data) {
        if (err) {
            next(err);
        } else {
            if (!data) {
                err = new Error('此页面不存在!');
                next(err);
            } else {
                // data.setAlias();
                // data.pagetype = 'richtext';
                res.render('richtext/show', data);
            }
        }
    });
};





