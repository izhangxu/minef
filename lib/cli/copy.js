const path = require('path');
const util = require('util');
const configJson = require('../configJson.js');
const file = require('../file.js');
const log = require('../log.js');

// 路径转换
const transformUrl = (arr) => {
	arr = util.isArray(arr) ? arr : [arr];
	arr = arr.map((item) => {
		return path.join(process.cwd(), item);
	});
	return arr;
};
/**
 * 复制文件到线上目录
 * @param  {String}		目录地址
 * @param  {String}		文件名称
 * @return {undefined}	
 */
const copyDir = (dir, files) => {
	let f = files.join(',');
	if (!dir || !util.isArray(files)) {
		return log.error('参数不正确');
	}
	files = files.map(path.normalize);
	files = transformUrl(files);
	files.forEach((item) => {
		file.copy(item, path.join(dir.online, item.replace(dir.test, '')));
	});
	log.success(f + '移动文件成功');
};

module.exports = (opts) => {
	const argv = opts.flags,
		_ = argv._;
	configJson.all(function(err, json) {
		if (err) {
			return log.error(err);
		}
		let path = json.path;
		if (process.cwd().indexOf(path.test) == -1) {
			return log.error('请进入测试环境根目录');
		}
		if (argv.d) {
			copyDir(path, ['./']);
		}
		if (!argv.d && _.length > 1) {
			copyDir(path, _.slice(2));
		}
	});
};