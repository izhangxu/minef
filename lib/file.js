/**
 * 文件操作
 */
const fs = require('fs');
const path = require('path');

let file = {
	// 创建文件目录
	mkdir: function(p, mode, cb) {
		let arr = p.split('/');
		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}
		if (typeof mode === 'string') {
			mode = parseInt(mode, 8);
		}
		if (arr[0] == '.') { // ./aaa
			arr.shift();
		}
		if (arr[0] == '..') { // ../aaa/bbb
			arr.splice(0, 2, arr[0] + '/' + arr[1]);
		}

		function inner(cur) {
			if (!fs.existsSync(cur)) {
				fs.mkdirSync(cur, mode);
			}
			if (arr.length) {
				inner(path.resolve(cur + '/' + arr.shift()));
			} else {
				cb && cb();
			}
		}
		arr.length && inner(arr.shift());
	},
	// 删除文件目录
	rmdir: function(path) {
		let files = [];
		if (fs.existsSync(path)) {
			files = fs.readdirSync(path);
			files.forEach(function(f) {
				let curPath = path + '/' + f;
				if (fs.statSync(curPath).isDirectory()) {
					file.rmdir(curPath);
				} else {
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	}
};
module.exports = file;