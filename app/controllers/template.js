var TemplateModel = require('../models/template');
var dbHelper = require('../../lib/dbhelper');

// 显示模板列表
exports.showList = function(req, res) {

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

    dbHelper.pageQuery(page, pageSize, TemplateModel, '', conditions, {
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
            data.forEach(function(item, i) {
                item.setAlias()
            });

            res.render('template/list', { 
                data: data,
                $page: $page
            });
        }
    });
 
    // 倒序查询
    // var query = TemplateModel.find({})
    // query.sort({'_id':-1});
    // query.exec(function(err, data) {
    //     res.render('index', { 
    //         data: data
    //     });
    // })

    // 倒序查询
    // TemplateModel.find({}, null, {sort: {'_id': -1}} ,function(err, data) { 
    // });
};

// 编辑模板
exports.edit = function(req, res) {

    TemplateModel.findById(req.params.templateId, function(err, data) {
        data.setAlias();
        res.render('template/edit', data);
    });
};

// 创建模板
exports.create = function(req, res) {
    res.render('template/create');
};

// 保存模板
exports.save = function(req, res, next) {

    var body = req.body;

    var content = body.content;
    var name = body.name;
    var type = body.type;
    var group = body.group;

    var templateId = body.templateId;

    // 新建
    if (!templateId) {

        var template = new TemplateModel({
            name: name,
            content: content,
            type: type,
            createTime: new Date().getTime(),
            group: group,
            creator: req.session.userInfo.userName
        });

        template.save(function(err, data) {
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
        // 更新
        TemplateModel.findById(templateId, function(err, data) {
            data.content = content;
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
        });
    }
    
};


// 删除模板
exports.delete = function(req, res) {
    var templateId = req.body.templateId;
    TemplateModel.remove({
        _id: templateId
    }, function(err, _data) {
        res.send({
            code: 'success',
            data: {}
        });
    });
};

