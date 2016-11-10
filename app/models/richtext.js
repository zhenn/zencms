var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RichtextSchema = new Schema({
    name: String,   // 页面名称, 便于在后台检索
    content: String, // html内容
    group: String,  // pp dd up, 推送html到线上服务器的凭证
    creator: String, // 创建者
    link: String, // 线上地址
    title: String, // 页面title
    widthRate: String, // 页面宽度屏幕占比
    imgAdaptScreen: Boolean, // 图片宽度是否100%
    
    createTime: Number,
    lastModifyTime: Number
    
});


// 保存时, 对入库数据做处理
RichtextSchema.pre('save', function(next) {
    // this.content = cmsTagIdHandler(this.content);
    next();

    // 在entity save回调时, 会收到此error
    // next(new Error('xx'))
}); 

var RichtextModel = mongoose.model('richtext', RichtextSchema);

module.exports = RichtextModel;
