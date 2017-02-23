const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const Config = require('./config.js');
const config_file = path.resolve(__dirname, '../config.json');
const inquirerConfig = Config.inquirer;
/**
 * 配置目录地址
 * @param  {Object}	参数 {path: {}, hosts: {}}
 * @param  {Function}	回调
 * @param  {Boolean}	是否已经存在文件  true存在 
 * @return {undefined}
 */
const initJsonFile = (opts, cb, boo) => {
	let json = {};
	if (boo) {
		json = {
			path: opts
		};
	} else {
		let k = JSON.parse(fs.readFileSync(config_file, 'UTF-8'));
		let p = k.path;
		let o = opts.path;
		k.path = {
			test: o.test ? o.test : p.test ? p.test : '',
			online: o.online ? o.online : p.online ? p.online : ''
		};
		json = k;
	}
	fs.writeFile(config_file, JSON.stringify(json, null, "\t"), 'utf8', function(err) {
		if (err) {
			typeof cb == 'function' && cb('创建文件失败');
		} else {
			typeof cb == 'function' && cb(null, json);
		}
	});
};
/**
 * 检测是否有config.json文件
 * @param  {Function}
 * @return {undefined}
 */
module.exports = {
	config: (opt, cb) => {
		if (!fs.existsSync(config_file)) {
			initJsonFile(opt, cb, true);
		} else {
			inquirer.prompt(inquirerConfig.existsFile)
				.then((answers) => {
					let json = JSON.parse(fs.readFileSync(config_file, 'UTF-8'));
					if (answers.overwrite) {
						json.path = opt;
						initJsonFile(json, cb);
					} else {
						typeof cb == 'function' && cb(null, json);
					}
				});
		}
	},
	all: (cb) => {
		if (!fs.existsSync(config_file)) {
			typeof cb == 'function' && cb('还未初始化配置文件');
		} else {
			typeof cb == 'function' && cb(null, JSON.parse(fs.readFileSync(config_file, 'UTF-8')));
		}
	}
};