const path = require('path');
const util = require('util');
const fs = require('fs');
const child_process = require('child_process');
const file = require('./file.js');
const Config = require('./config.js');
// const log = require('./log.js');
const program = require('commander');
const inquirer = require('inquirer');
// const spawn = require('cross-spawn');
const ho = require('./ho.js');

let zx = module.exports;

program
	.allowUnknownOption()
	.version('0.0.1')
	.option('s, switch', '切换到对应线上或测试环境')
	.option('c, copy', '复制文件到测试线（覆盖）')
	.option('i, init', '初始化目录') //<lang> 必须加参数
	.option('im, imagemin', '压缩图片')
	.option('h, host', '切换host')
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
	// console.log(program);
	// 配置目录地址
	if (program.config) {
		zx.createConfigJson(function(err) {
			if (err) {
				console.log(err);
			}
			console.log('配置开发及生产环境目录成功');
		});
	}
	// 项目初始化
	if (program.init) {
		zx.checkConfigJson(function(err) {
			if (err) {
				console.log(err);
			}
			zx.createDir(program.args[0]);
		});
	}
	// 复制文件到线上
	if (program.copy) {
		// console.log('还未配置初始化文件');
		zx.checkConfigJson(function(err, dir) {
			if (err) {
				throw err;
			}
			if (process.cwd().indexOf(dir.test) == -1) {
				throw new Error('请进入测试环境根目录');
			}
			if (program.args.length) {
				zx.copyDir(dir, program.args);
			} else {
				if (program.rawArgs.length == 4 && program.rawArgs.pop() == '-c') {
					zx.copyDir(dir, ['./']);
				}
			}
		});
	}
	// 图片压缩
	// if (program.imagemin){}
	// 切换host
	if (program.host) {
		ho.set('cdn1.leju.com leju.com', '122.2.132.42', {
			group: 'defaultGroup1'
		});
		// ho.remove('cdn.leju.com', '134.2.3.4');
		// hosts.addGroup('12345', '注释');
		// hosts.setGroup('12345', 'newName12345');
		// hosts.removeGroup('newName12345');
		// hosts.disable('cdn.leju.com', '1.2.3.4');
	}

};
// 路径转换
function transformUrl(arr) {
	arr = util.isArray(arr) ? arr : [arr];
	arr = arr.map(function(item) {
		return path.join(process.cwd(), item);
	});
	return arr;
}
// 配置目录地址
zx.createConfigJson = function(cb) {
	let dir = path.resolve(__dirname, '../config.json');
	let check = function() {
		inquirer.prompt(zx.inquirer.configFileInput)
			.then(function(answers) {
				fs.writeFile(dir, JSON.stringify({
					"path": answers
				}), 'utf8', function(err) {
					if (err) {
						typeof cb == 'function' && cb('创建文件失败');
					} else {
						typeof cb == 'function' && cb(null, answers);
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
			file.mkdir(process.cwd() + '/' + newDir + jsonDir[item]);
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
zx.copyDir = function(dir, files) {
	if (!dir || !util.isArray(files)) {
		throw new Error('参数不正确');
	}
	files = files.map(path.normalize);
	files = transformUrl(files);
	files.forEach(function(item) {
		file.copy(item, path.join(dir.online, item.replace(dir.test, '')));
	});
	console.log('移动文件成功');
};
// 检测是否有config.json文件
zx.checkConfigJson = function(cb) {
	if (!fs.existsSync(config_file)) {
		inquirer.prompt(zx.inquirer.noExistsConfigFile)
			.then(function(answers) {
				if (answers.create) {
					zx.createConfigJson(function(err, dir) {
						if (err) {
							typeof cb == 'function' && cb(err);
						}
						typeof cb == 'function' && cb(null, dir);
					});
				}
			});
	} else {
		typeof cb == 'function' && cb(null, JSON.parse(fs.readFileSync(config_file, 'UTF-8')).path);
	}
};