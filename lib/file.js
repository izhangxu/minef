const fs = require('fs');
const iconv = require('iconv-lite');
const u = require('./utils');

let file = {
	isFile: function(path) {
		return fs.existsSync(path) && fs.statSync(path).isFile();
	},
	isDir: function(path) {
		return fs.existsSync(path) && fs.statSync(path).isDirectory();
	},
	isWin: process.platform.indexOf('win') === 0,
	realpath: function(path) {
		if (path && fs.existsSync(path)) {
			path = fs.realpathSync(path);
			if (file.isWin) {
				path = path.replace(/\\/g, '/');
			}
			if (path !== '/') {
				path = path.replace(/\/$/, '');
			}
			return path;
		} else {
			return false;
		}
	},
	/**
	 * 文件夹/文件复制不包括那些文件
	 * @param  {String} filename 路径
	 * @return {Boolean}          
	 */
	excludeFiles: function(filename) {
		return !(/.svn|Thumbs.db|.DS_Store/.test(filename));
	},
	/**
	 * 写入文件
	 * @param  {String} path     路径
	 * @param  {String} content  内容
	 * @param  {String} encoding 编码
	 * @return {undefined}
	 */
	write: function(path, content, encoding) {
		try {
			encoding = encoding || 'utf8';
			if (encoding == 'bgk') {
				let s = iconv.decode(content, 'gbk');
				content = iconv.encode(s, 'gbk');
			}
			fs.writeFileSync(path, content, encoding);
		} catch (e) {
			console.log('error [file.write]' + path);
			console.log(e);
		}
	},
	/**
	 * 创建文件目录
	 * @param  {Stribg}   p    目录名称（绝对地址）
	 * @param  {Number}   mode 权限
	 * @param  {Function} cb   回调函数
	 * @return {undefined}
	 */
	mkdir: function(p, mode, cb) {
		let arr = u.trim(p).split('/');
		if (mode === undefined) {
			mode = 0777 & (~process.umask());
		}
		if (typeof mode === 'string') {
			mode = parseInt(mode, 8);
		}
		arr[arr.length - 1] === '' && arr.pop();
		arr[0] === '' && arr.splice(0, 2, '/' + arr[1]); // /aaa
		arr[0] == '.' && arr.shift(); // ./aaa
		arr[0] == '..' && arr.splice(0, 2, arr[0] + '/' + arr[1]); // ../aaa/bbb
		function inner(cur) {
			if (!fs.existsSync(cur)) {
				fs.mkdirSync(cur, mode);
			}
			if (arr.length) {
				inner(cur + '/' + arr.shift());
			} else {
				typeof cb == 'function' && cb();
			}
		}
		arr.length && inner(arr.shift());
	},
	/**
	 * 删除文件目录/文件路径
	 * @param  {String} path 目录名称/文件路径
	 * @return {undefined}
	 */
	rmdir: function(path) {
		let files = [];
		if (fs.existsSync(path)) {
			if (file.isDir(path)) {
				files = fs.readdirSync(path);
				files.forEach(function(f) {
					let curPath = path + '/' + f;
					if (file.isDir(curPath)) {
						file.rmdir(curPath);
					} else {
						fs.unlinkSync(curPath);
					}
				});
				fs.rmdirSync(path);
			} else {
				if (file.isFile(path)) {
					fs.unlinkSync(path);
				}
			}
		}
	},
	/**
	 * 复制文件/文件目录
	 * @param  {String} source   原始的文件夹/文件路径
	 * @param  {String} target   目标的文件夹/文件路径
	 * @param  {Object} type     {cover: true, move: true} 是否覆盖，是否剪切
	 * @param  {String} encoding 文件编码
	 * @return {undefined}
	 */
	copy: function(source, target, type, encoding) {
		type = type || {};
		type.cover = type.cover || false;
		type.move = type.move || false;
		source = file.realpath(source);
		target = target.replace(/\/$/, '');
		let removedAll = true;
		if (source) {
			if (!fs.existsSync(target) && file.isDir(source)) {
				file.mkdir(target);
			}
			if (file.isDir(source)) {
				fs.readdirSync(source).forEach(function(item) {
					if (item != '.' && item != '..' && file.excludeFiles(item)) {
						removedAll = file.copy(source + '/' + item, target + '/' + item, type) || removedAll;
					}
				});
				// 剪切
				if (type.move && removedAll) {
					fs.rmdirSync(source);
				} else if (file.isFile(source)) {
					if (type.cover && file.existsSync(target)) {
						removedAll = false;
					} else {
						file.write(target, fs.readFileSync(source), encoding);
						if (type.move) {
							fs.unlinkSync(source);
						}
					}
				}
			} else if (file.isFile(source)) {
				file.write(target, fs.readFileSync(source), encoding);
				if (type.move) {
					fs.unlinkSync(source);
				}
			} else {
				removedAll = false;
			}
		} else {
			console.log('error : [' + source + '] --- no such file or dir');
		}
		return removedAll;
	}
};
module.exports = file;