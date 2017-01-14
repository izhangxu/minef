const path = require('path');
const util = require('util');
const fs = require('fs');
const child_process = require('child_process');
const file = require('./file.js');
const Config = require('./config.js');
// const log = require('./log.js');
const program = require('commander');
const inquirer = require('inquirer');
const spawn = require('cross-path');


let zx = module.exports;

program
	.allowUnknownOption()
	.version('0.0.1')
	.option('s, switch', '切换到对应线上或测试环境')
	.option('c, copy', '负责文件到测试线')
	.option('i, init', '初始化目录') //<lang> 必须加参数
	.option('config', '配置开发及生产环境目录机制');

/*let config_path = {
	path: {
		test: '/Users/zhangxu/Documents/work/cdn/leju_203/cdn.ljimg.com/trunk',
		online: '/Users/zhangxu/Documents/work/cdn_online/trunk'
	}
};
*/
let config_file = path.resolve(__dirname, '../config.json');

/**
 * 配置文件
 */
zx.configPath = null;
zx.config = Config;
zx.inquirer = zx.config.inquirer;

/**
 * 项目初始化
 */
zx.init = function(argv) {
	program.parse(argv);
	// 配置目录地址
	if (program.config) {
		zx.createConfigJson()
			.then(function(dir) {
				zx.configPath = dir.path;
				console.log('配置开发及生产环境目录成功');
			})
			.catch(function(err) {
				console.log(err);
			});
	}
	// 项目初始化
	if (program.init) {
		zx.checkConfigJson(function() {
			zx.createDir(program.args[0]);
		});
	}
	// 复制文件到线上
	if (program.copy) {
		if (!zx.configPath) {
			console.log('还未配置初始化文件');
			zx.createConfigJson()
				.then(function(dir) {
					zx.configPath = dir.path;
					if (process.cwd() !== zx.configPath.test) {
						console.log('请进入测试环境根目录');
					}
				})
				.catch(function(err) {
					console.log(err);
				});
		} else {
			if (process.cwd() !== zx.configPath.test) {
				console.log('请进入测试环境根目录');
			}

		}
		zx.checkConfigJson(function() {
			zx.copyDir(program.args[0]);
		});
	}
};

// 配置目录地址
zx.createConfigJson = function(dir) {
	dir = dir || path.resolve(__dirname, '../config.json');
	return new Promise(function(resolve, reject) {
		let check = function() {
			inquirer.prompt(zx.inquirer.configFileInput)
				.then(function(answers) {
					fs.writeFile(dir, JSON.stringify({
						"path": answers
					}), 'utf8', function(err) {
						if (err) {
							reject(new Error('创建文件失败'));
						} else {
							resolve(answers);
						}
					});
				});
		};

		if (!fs.existsSync(dir)) {
			check();
		} else {
			inquirer.prompt(zx.inquirer.existsFile)
				.then(function(answers) {
					if (answers.overwrite) {
						try {
							fs.unlinkSync(dir);
						} catch (e) {
							throw e;
						}
						check();
					}
				});
		}
	});
};
// 创建初始化目录
zx.createDir = function(dir) {
	let jsonDir = zx.config.initDir;
	let k = Object.keys(jsonDir);
	let newDir = '';
	if (dir) {
		newDir = dir + '/';
	} else {
		newDir = 'file_init/';
	}

	if (!fs.existsSync(path.resolve(newDir))) {
		// 创建目录
		k.forEach(function(item) {
			file.mkdir(newDir + jsonDir[item]);
		});
		// 创建config.json
		child_process.exec('npm init --yes', {
			cwd: path.resolve(newDir)
		}, function(err) {
			if (err) {
				console.log(error.stack);
				console.log('Error code: ' + error.code);
			}
			process.exit(0);
		});
		console.log('目录初始化成功');
	} else {
		inquirer.prompt(zx.inquirer.existsDir).then(function(answers) {
			if (answers.overwrite) {
				try {
					file.rmdir(newDir);
				} catch (e) {
					throw e;
				}
				zx.createDir(dir);
			}
		});
	}
};
// 复制文件到线上
zx.copyDir = function(file) {
	let online_path = path.join()
};
// 检测是否有config.json文件
zx.checkConfigJson = function(cb) {
	if (!fs.existsSync(config_file)) {
		inquirer.prompt(zx.inquirer.noExistsConfigFile)
			.then(function(answers) {
				return answers.create;
			})
			.then(function(status) {
				status && zx.createConfigJson();
			})
			.then(function(dir) {
				if (dir) {
					zx.configPath = dir.path;
					cb && cb(dir.path);
				}
			})
			.catch(function(err) {
				console.log(err);
			});
	} else {
		cb && cb(JSON.parse(fs.readFileSync(config_file, 'UTF-8'));
	}
};