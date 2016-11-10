var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var times = require('../../lib/time');
var md5 = require('../../lib/md5');
var _ = require('underscore');

var TemplateSchema = new Schema({
    content: String, // 模板内容
    type: String,  // module page
    createTime: Number,
    lastModifyTime: Number,
    name: String,   // 模板名称
    group: String,  // pengpeng daidai uplive
    creator: String, // 创建者
    link: String, // 线上地址
    // tagData: [  
    //     {
    //         name: '自定义表情',
    //         id: 'xxx', 
    //         type: 'custom', 
    //         alias: 'whatever',  // 用于module输出json给js异步使用, page中无用
    //         data: [[{ 
    //             field: 'pic', 
    //             title: '图片', 
    //             value: '' 
    //         }, {
    //             field: 'text',
    //             title: '文本',
    //             value: ''
    //         }]]
    //     }
    // ]
    tagData: []
});

/**
 * 模板内容中cms标签id管理
 * 满足两点: 
 *    1, 非空
 *    2, 不重复
 */
function cmsTagIdHandler(content) {
    var cmsTagReg = /(<cms:.+?)>/gi; 
    var tagIdReg = /id=".+?"/gi;
    var results = content.match(cmsTagReg);
    
    content = content.replace(cmsTagReg, function(a, b, c) {
        var result = a;
        var randomNumber = Math.floor(Math.random() * 10000);
        if (!b.match(tagIdReg)) {
            result = b + ' id="' + md5.hex_md5((new Date().getTime() + randomNumber).toString()) + '">';
        }
        return result;
    })

    return content;

}

// 保存时, 对入库数据做处理
TemplateSchema.pre('save', function(next) {
    this.content = cmsTagIdHandler(this.content);
    next();

    // 在entity save回调时, 会收到此error
    // next(new Error('xx'))
}); 

function getDefaultTagDataByTemplate(fields, defaultRow) {
    var arr = fields.split(',');
    var result = [];
    arr = arr.map(function(item, i) {
        var a = item.split(':');
        return {
            field: a[0],
            title: a[1],
            value: ''
        };
    });

    for (var i = 0; i < defaultRow; i++) {
        result.push(arr);
    }
    return result;
}

/** 
 * 获得模板中标签内容列表
 * @param tempContent {string} 模板内容
 * @param tagData {array} 模板内的标签数据列表
 * @return array
 *      [
 *          {
 *              name: '中文标签名称',
 *              id: 'xxx' // 标签id
 *              type: '标签类型'
 *          }
 *      ]
 */
TemplateSchema.methods.getTagList = function(tempContent, tagData) {

   
    var tagreg = /<cms:[\s\S]+?<\/cms>/gi;
    var results = [];
    var matchResult = tempContent.match(tagreg);
    try {
        matchResult && matchResult.forEach(function(item, i) {
            var nameMatch = item.match(/name="(.*?)"/i),
                idMatch = item.match(/id="(.*?)"/i),
                typeMatch = item.match(/cms:(.*?) /i),
                fieldsMatch = item.match(/fields="(.*?)"/i),
                defaultRowMatch = item.match(/defaultRow="(.*?)"/i),
                rowMatch = item.match(/row="(.*?)"/i),
                aliasMatch = item.match(/alias="(.*?)"/i),
                data, 
                hasEditedData = false;

            
            var name = '系统默认-标签名称';
            if (nameMatch && nameMatch[1]) {
                name = nameMatch[1];
            }
            var id = idMatch && idMatch[1];
            var type = typeMatch && typeMatch[1];
            var fields = fieldsMatch && fieldsMatch[1];
            var defaultRow = 1;
            var row = 1;
            var alias = aliasMatch && aliasMatch[1];

            if (defaultRowMatch && defaultRowMatch[1]) {
                defaultRow = parseInt(defaultRowMatch[1]);
            }
            // console.log(rowMatch)
            if (rowMatch && rowMatch[1]) {
                row = parseInt(rowMatch[1]);
            }

            if (defaultRow > row) {
                defaultRow = row;
            }

            for (var j = tagData.length; j--;) {
                var val = tagData[j];
                if (val.id == id) {
                    hasEditedData = true;
                    data = _.clone(val).data || getDefaultTagDataByTemplate(fields, defaultRow);
                }
            }

            if (!hasEditedData) {
                data = getDefaultTagDataByTemplate(fields, defaultRow);
            }
            
            results.push({
                name: name,
                id: id,
                type: type,
                data: data,
                defaultRow: defaultRow,
                row: row,
                alias: alias
            });

        });
    } catch (e) {
        console.log('\n\n');
        console.log(e);
        console.log('\n\n');
    }
    

    return results;
};


TemplateSchema.methods.getTemplateTypeName = function(type) {
    var templateTypeMap = {
        page: '页面',
        module: '模块'
    };
    return templateTypeMap[type];
};

// 为查询数据设置别名, 通常用于前端显示
TemplateSchema.methods.setAlias = function() {
    var createTime = times.format(this.createTime),
        lastModifyTime = this.lastModifyTime ? times.format(this.lastModifyTime) : '';
    this.setValue('createTime', createTime);
    this.setValue('lastModifyTime', lastModifyTime);
    this.setValue('type', this.getTemplateTypeName(this.type));
}

var TemplateModel = mongoose.model('template', TemplateSchema);

module.exports = TemplateModel;
