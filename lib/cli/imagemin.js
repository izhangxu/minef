const path = require('path');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');
const file = require('../file.js');
const log = require('../log.js');

/**
 * 处理路径
 * @param  {String} opts 
 * @return {String} 
 */
const replacePath = (path) => {
	if (path) {
		if (process.platform.indexOf('win') === 0) {
			path = path.replace(/\\/g, '/');
		}
		if (path !== '/') {
			path = path.replace(/\/$/, '');
		}
		return path;
	} else {
		return false;
	}
};
/**
 * 处理图片
 * @param  {Object} argv
 * @return {Object}
 */
const imageMin = (argv) => {
	let strInput = path.join(process.cwd(), argv.i);
	let strOutput = path.dirname(strInput);
	if (!file.isFile(strInput) && !file.isDir(strInput)) {
		return log.error('待压缩图片路径不正确');
	}
	if (file.isDir(strInput)) {
		if (argv.f) {
			newOutput = replacePath(argv.i);
		} else {
			newOutput = argv.o ? replacePath(argv.o) : replacePath(argv.i) + '_out';
		}
		strInput = file.realpath(strInput) + '/*.{jpg,jpeg,png,gif}';
		strOutput = path.join(process.cwd(), newOutput);
	}
	if (file.isFile(strInput)) {
		if (!argv.f) {
			let ext = path.extname(strInput);
			let newInput = strInput.replace(/\.(?:jpg|png|gif)$/, '_out') + ext;
			file.write(newInput, fs.readFileSync(strInput));
			if (!argv.o) {
				strInput = newInput;
			} else {
				strOutput = file.realpath(path.join(process.cwd(), argv.o));
			}
		}
	}
	// console.log(strInput, strOutput);
	imagemin([strInput], strOutput, {
		plugins: [
			imageminMozjpeg({
				quality: argv.q || 80
			}),
			imageminGifsicle({
				colors: argv.c || 50
			}),
			imageminPngquant({
				quality: argv.l || 80
			})
		]
	}).then((files) => {
		files = files.map((item) => {
			return item.path;
		}).join('\n');
		log.info(files);
		log.success('图片压缩成功');
	}).catch((e) => {
		console.log(e);
	});
};

module.exports = (opts) => {
	imageMin(opts.flags);
};