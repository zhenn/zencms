var needle = require('needle'); 
var time = require('../../lib/time'); 
var fs = require('fs');
var path = require('path');
var _process = require('child_process');
var TemplateModel = require('../models/template');
var RichtextModel = require('../models/richtext');

exports.upload = function(req, res){
	res.render('file/upload');
};

exports.doUpload = function(req, res, next){

	// 区别是否来自编辑器
	var source = req.query.source;
	var file = source == 'editor' ? req.body.wangEditorH5File : req.body.file;

	var data = [];
	var key = 'oauthgame/html5/' + time.format(new Date().getTime, 'yyyyMMdd');
	
	// 多文件上传
	if (file.length) {

		for (var i = file.length; i--;) {
			var item = file[i];
			data.push({
				name: item.name,
				key: key,
				file: {
					file: item.path,
					'content_type': item.type
				}
			});
		}

	} else {
		data.push({
			name: file.name,
			key: key,
			file: {
				file: file.path,
				'content_type': file.type
			}
		});
	}
	
	pushToCDN(data, res, source);
};


function pushToCDN(data, res, source) {

	var totalFile = data.length;
	var resbody = [];
	var count = 0;
	data.forEach(function(item, i) {
		needle.post('http://php-upload.pp.prod/upload/upload-image', item, { multipart: true }, function(err, resq, body) {
			count++;
			if (source == 'editor') {
				resbody = JSON.parse(body).url;
			} else {
				resbody.push(JSON.parse(body));
			}

			if (count == totalFile) {
				res.send(resbody);
			}
		});
	});
}

// 发布html
exports.publish = function(req, res, next) {
	var body = req.body,
		source = body.source,
		pageid = body.pageid,  // xxxxxxxxx
		group = body.group,  // uplive pengpeng daidai
		pagetype = body.pagetype, // richtext | template, 发布成功后把线上路径插入对应表中
		Model, 
		realGroup;

	switch(pagetype) {
		case 'richtext':
			Model = RichtextModel;
			break;
		case 'templatetype':
			Model = TemplateModel;
			break;
		default:
			break;
	}

	switch(group) {
		case 'daidai':
			realGroup = 'dd';
			break;
		case 'pengpeng':
			realGroup = 'pp';
			break;
		case 'uplive':
			realGroup = 'up';
			break;
		default:
			break;
	}

	var productOrigin = {
        up: 'http://h5.upliveapp.com',
        dd: 'http://m.daidaichat.com',
        pp: 'http://whatever.pengpengla.com'
	};

	needle.get(source, function(err, resp) {

		if (!err) {

			// 写入临时文件
			var targetDir = __dirname;
			var targetFile = targetDir + '/' + pageid + '.html';
			
			fs.writeFileSync(targetFile, resp.body);

			var filename = pageid + '.html';

			// 如果在开发环境, 需要走跳板机10.0.1.99做中转
			if (global.env == 'development') {
				_process.exec('scp ' + targetFile + ' zhennan@10.0.1.99:/data/uploadHtml/uploadhtml/', function(err, stdout, stderr) {
					if (err) {
						res.json(err);
					} else {
						fs.unlinkSync(targetFile);
						needle.post('http://10.0.1.99:5000/upload', {
							filename: filename,
							group: realGroup
						}, { multipart: true}, function(err, resq, body) {
							var result = err || body;

							Model.findById(pageid, function(_err, data) {
								data.link = body.data.link;
								data.save(function() {
									res.json(result);
								});
								
							});
							
						});
					}
				});
			} else {
				// 线上环境直接同步html到业务服务器
				// 先拷贝文件到同步目录
				_process.exec('scp ' + targetFile + ' 54.223.81.123:/data/h5cms/file/' + realGroup + '/', function(err, stdout, stderr) {
					if (err) {
						res.json(err);
					} else {
						// 远程执行shell同步html到业务服务器
						_process.exec('ssh 54.223.81.123 -t -t "sh /data/h5cms/sh/update_h5cms.sh ' + realGroup + ' ' + filename.replace('.html', '') + '"' , function(_err, _stdout, _stderr) {

							// console.log('ssh 54.223.81.123 -t -t "sh /data/h5cms/sh/update_h5cms.sh ' + realGroup + ' ' + filename.replace('.html', '') + '"');
							if (_err) {
			                    res.json(_err);
			                } else {
			                    fs.unlinkSync(targetFile);
			                    try {
			                    	Model.findById(pageid, function(_err, data) {
			                    		
		                    			data.link = productOrigin[realGroup] + '/zencms/' + filename;
										data.save(function() {
											res.json({
					                            code: 'success',
					                            data: {
					                                link: productOrigin[realGroup] + '/zencms/' + filename
					                            }
					                        });
										});
			                    		
										
									});
			                    } catch(err) {
			                    	res.json(err);
			                    }
			                    
		                        
			                }
						});

					}
				});

			}
			

		} else {
			res.json(err);
		}
	});
	
};






