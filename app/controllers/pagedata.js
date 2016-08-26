var TemplateModel = require('../models/template');
var _ = require('underscore');

// 格式化标签数据, 用于模板生成html
function parseTagData(tagData) {
    var sourceData = tagData.data || [];
    var result = [];
    sourceData.forEach(function(item, i) {
        var unit = {};
        item.forEach(function(_item, _i) {
            unit[_item.field] = _item.value;
        });
        result.push(unit);
    });

    //[{"pic": 'a', "text": 'b'}] 用于预览页面时使用的最终数据格式
    return result;
}


exports.render = function(req, res, next) {
    var templateId = req.query.templateId;
    TemplateModel.findById(templateId, function(err, data) {
        if (err) {
            next(err);
        } else {
            var templateContent = data.content;
            var cmsTagReg = /(<cms:[\s\S]+?>)([\s\S]*?)(<\/cms>)/gi;
            var tagDatas = data.tagData;

            templateContent = templateContent.replace(cmsTagReg, function(a, b, c, d) {
                
                var tagIdReg = /id="(.*?)"/i;
                var tagId = b.match(tagIdReg)[1];
                
                var tagData = {};

                for (var i = 0; i < tagDatas.length; i++) {
                    var item = tagDatas[i];
                    if (item.id == tagId) {
                        tagData = item;
                        break;
                    }
                }

                tagData = parseTagData(tagData);
                return '<% var data = ' + JSON.stringify(tagData) + '; %>' + c;
            });

            // console.log(templateContent);

            var result = _.template(templateContent)();

            res.send(result);
        }
    });
};


// 以iframe形势展示生成的html
exports.show = function(req, res, next) {

    var templateId = req.query.templateId;
    TemplateModel.findById(templateId, function(err, data) {
        if (err) {
            next(err);
        } else {
            if (!data) {
                err = new Error('此模板不存在!');
                next(err);
            } else {
                data.setAlias();
                res.render('page/show', data);
            }
        }
    });
    
};

exports.edit = function(req, res) {
    var templateId = req.query.templateId;
    TemplateModel.findById(templateId, function(err, data) {

        var taglist = data.getTagList(data.content, data.tagData);

        res.render('page/edit', {
            taglist: taglist,
            data: data
        });
    });

};

exports.save = function(req, res, next) {
    
    var body = req.body;
    var id = body.id; // tagid
    var name = body.name; // tagname
    var type = body.type; // tagtype
    var data = JSON.parse(body.data).data; 
    var templateId = body.templateId;

    TemplateModel.findById(templateId, function(err, _data) {

        var tagData = _data.tagData;
        var hasTagData = 0;
    
        for (var i = tagData.length; i--;) {
            if (tagData[i].id == id) {
                tagData.splice(i, 1, {
                    name: name,
                    type: type,
                    data: data,
                    id: id
                });
                hasTagData = 1;
                break;
            }
        }

        if (!hasTagData) {
            tagData.push({
                name: name,
                type: type,
                data: data,
                id: id
            });
        }
        _data.tagData = tagData;        

        _data.save(function(_err, __data) {
            if (_err) {
                // next(_err);
                console.log(_err)
            } else {
                res.send({
                    code: 'success',
                    data: __data
                });
            }
            
        });
    })
};

