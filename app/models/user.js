var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var times = require('../../lib/time');
var md5 = require('../../lib/md5');

var roleMap = require('../../config/privilege.json');

var UserSchema = new Schema({
    id: String,
    userName:String,
    password: String,
    role: String,
    createTime: Number,
    lastModifyTime: Number
});

UserSchema.statics.getRoleMap = function() {
    return roleMap;
}

var UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;
