
var template = require('../app/controllers/template');
var pagedata = require('../app/controllers/pagedata');
var user = require('../app/controllers/user');
var file = require('../app/controllers/file');

module.exports = function(app) {
    
    app.get('*', function(req, res, next) {
        res.locals.user = '';
        next();
    });
    app.get('/login', user.login);
    app.get('/logout', user.logout);
    app.post('/user/doLogin', user.doLogin);

    app.get('*', user.authorize);
    app.get('*', user.privilige);

    app.get('/', function(req, res, next) {
        res.redirect('/template/list');
    });
    app.get('/template/list', template.showList);
    app.get('/template/edit/:templateId', template.edit);
    app.post('/template/save', template.save);
    app.get('/template/create', template.create);
    app.post('/template/delete', template.delete);


    app.get('/page/edit', pagedata.edit);
    app.post('/page/save', pagedata.save);
    app.get('/page/preview', pagedata.show);
    app.get('/page/render', pagedata.render);

    app.get('/user/create', user.create);
    app.post('/user/save', user.save);
    app.get('/user/list', user.showList);
    app.get('/user/edit/:userId', user.edit);

    app.get('/file/upload', file.upload);
    app.post('/file/doUpload', file.doUpload);
    
};
