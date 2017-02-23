const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const inquirer = require('inquirer');
const file = require('../file.js');
const Config = require('../config.js');
const inquirerConfig = Config.inquirer;
const log = require('../log.js');

/**
 * 创建文件目录
 * @param  {String} dir 名称
 * @return {undefined}     
 */
const createDir = (dir) => {
	let jsonDir = Config.initDir,
		k = Object.keys(jsonDir),
		newDir = dir ? dir + '/' : 'file_init/';

	if (!fs.existsSync(path.resolve(newDir))) {
		// 创建目录
		k.forEach(function(item) {
			file.mkdir(process.cwd() + '/' + newDir + jsonDir[item]);
		});
		// 创建config.json
		child_process.exec('npm init --yes', {
			cwd: path.resolve(newDir)
		}, function(err) {
			if (err) {
				log.error(error.stack + error.code);
			}
			process.exit(0);
		});
		log.success('目录 [' + newDir.replace(/\/$/, '') + '] 初始化成功');
	} else {
		inquirer.prompt(inquirerConfig.existsDir).then(function(answers) {
			if (answers.overwrite) {
				try {
					file.rmdir(newDir);
				} catch (e) {
					throw e;
				}
				return createDir(dir);
			}
		});
	}
};

module.exports = (opts) => {
	const argv = opts.flags;
	createDir(argv._[1]);
};