var needle = require('needle'); 
var time = require('../../lib/time'); 

exports.upload = function(req, res){
	res.render('file/upload');

}

exports.doUpload = function(req, res, next){
	var file = req.body.file;

	var data = {
	  //foo: 'bar',
	  'name':file.name,
	  'key':'oauthgame/html5/'+time.format(new Date().getTime, 'yyMMdd'),
	  file: {
			  file: file.path,
			  content_type: file.type
			}
	}
	needle.post('http://php-upload.pp.prod/upload/upload-image', data, { multipart: true }, function(err, resq, body) {
		if (err) {
			res.send({
				code: 'fail',
				msg: JSON.stringify(err)
			})
		} else {
			res.send(body);
		}
	});

}