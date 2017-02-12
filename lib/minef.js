const path = require('path');
const util = require('util');
const fs = require('fs');
const child_process = require('child_process');
const inquirer = require('inquirer');
const file = require('./file.js');
const Config = require('./config.js');
const hosts = require('./hosts.js');
const log = require('./log.js');

let mainf = module.exports;

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
mainf.config = Config;
mainf.inquirer = mainf.config.inquirer;

/**
 * 项目初始化
 */
mainf.init = (argv) => {
	let argv2 = argv[2];
	if (argv2 == '-h' || argv2 == '-help') {
		mainf.help();
	}
	// 配置目录地址
	if (argv2 == 'config') {
		mainf.createConfigJson(function(err) {
			if (err) {
				return log.error(err);
			}
			return log.success('配置开发及生产环境目录成功');
		});
	}
	// 项目初始化
	if (argv2 == 'i' || argv2 == 'init') {
		mainf.checkConfigJson(function(err) {
			if (err) {
				return log.error(err);
			}
			mainf.createDir(argv[3]);
		});
	}
	// 复制文件到线上
	if (argv2 == 'c' || argv2 == 'copy') {
		// console.log('还未配置初始化文件');
		mainf.checkConfigJson(function(err, json) {
			if (err) {
				return log.error(err);
			}
			let dir = json.path;
			if (process.cwd().indexOf(dir.test) == -1) {
				return log.error('请进入测试环境根目录');
			}
			if (argv.length >= 3 && argv[4] != '-d') {
				mainf.copyDir(dir, argv.slice(3));
			} else {
				if (argv.length == 3 && argv[3] != '-d') {
					mainf.copyDir(dir, ['./']);
				}
			}
		});
	}
	// 切换host
	if (argv2 == 'h' || argv2 == 'hosts') {
		mainf.checkConfigJson((err, json) => {
			if (err) {
				return log.error(err);
			}
			mainf.setHosts(argv, json);
		});
	}

};

// 路径转换
const transformUrl = (arr) => {
	arr = util.isArray(arr) ? arr : [arr];
	arr = arr.map((item) => {
		return path.join(process.cwd(), item);
	});
	return arr;
};

mainf.help = () => {
	var content = [];
	content = content.concat([
		'',
		'  Usage: mainf <Command>',
		'',
		'  Command:',
		'',
		'    config			生成一个配置文件，其中包含开发环境和生产环境的文件路径(svn或git路径)、想要配置的hosts地址...',
		'',
		'    i, init 			初始化一个文件目录  e.g.: init page。包含js,assets,css,html,widget文件夹及config.json文件',
		'',
		'    c, copy 			把开发环境的文件/文件夹复制（覆盖）到生产环境的文件目录',
		'      -d 				把开发环境下当前文件夹复制（覆盖）到生产环境',
		'',
		'    h, hosts 			修改hosts文件，添加任意的一个或一组hosts地址',
		'      -s, -set 				在hosts文件中添加一条地址  e.g.: -s cdn.leju.com 192.168.192.1 {group: "abc"}',
		'      -active 				在hosts文件中激活一条地址  e.g.: -active cdn.leju.com 192.168.192.1 {group: "abc"}',
		'      -disable 				在hosts文件中禁用一条地址  e.g.: -disable cdn.leju.com 192.168.192.1 {group: "abc"}',
		'      -d, -delete 			在hosts文件中删除一条地址  e.g.: -d cdn.leju.com 192.168.192.1 {group: "abc"}',
		'      -activeGroup 			在hosts文件中激活一组地址  e.g.: -activeGroup abc',
		'      -disableGroup			在hosts文件中禁用一组地址  e.g.: -disableGroup abc',
		'      -deleteGroup  			在hosts文件中删除一组地址  e.g.: -deleteGroup abc',
		'      -t, -test  			在hosts文件中删除一组地址（配合config.json中的 hosts 字段）',
		'      -o, -online  			在hosts文件中删除一组地址（配合config.json中的 hosts 字段）',
		''
	]);
	log.info(content.join('\n'));
};

// 配置目录地址
mainf.createConfigJson = (cb) => {
	let dir = path.resolve(__dirname, '../config.json');
	let check = (h) => {
		inquirer.prompt(mainf.inquirer.configFileInput)
			.then((answers) => {
				let json = {
					"path": answers
				};
				if (h) {
					json.hosts = h;
				}
				fs.writeFile(dir, JSON.stringify(json), 'utf8', function(err) {
					if (err) {
						typeof cb == 'function' && cb('创建文件失败');
					} else {
						typeof cb == 'function' && cb(null, json);
					}
				});
			});
	};
	if (!fs.existsSync(dir)) {
		check();
	} else {
		inquirer.prompt(mainf.inquirer.existsFile)
			.then((answers) => {
				if (answers.overwrite) {
					let h;
					try {
						h = JSON.parse(fs.readFileSync(config_file, 'UTF-8')).hosts;
					} catch (e) {
						throw e;
					}
					check(h);
				}
			});
	}
};

// 创建初始化目录
mainf.createDir = (dir) => {
	let jsonDir = mainf.config.initDir,
		k = Object.keys(jsonDir),
		newDir = '';
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
				log.error(error.stack + error.code);
			}
			process.exit(0);
		});
		log.success('目录初始化成功');
	} else {
		inquirer.prompt(mainf.inquirer.existsDir).then(function(answers) {
			if (answers.overwrite) {
				try {
					file.rmdir(newDir);
				} catch (e) {
					throw e;
				}
				mainf.createDir(dir);
			}
		});
	}
};

// 复制文件到线上
mainf.copyDir = (dir, files) => {
	if (!dir || !util.isArray(files)) {
		log.error('参数不正确');
	}
	files = files.map(path.normalize);
	files = transformUrl(files);
	files.forEach((item) => {
		file.copy(item, path.join(dir.online, item.replace(dir.test, '')));
	});
	log.success('移动文件成功');
};

// 修改hosts文件
mainf.setHosts = (argv, json) => {
	let domain, ip, group, groupName, ho,
		firstArg = argv[3];

	// 切换到测试线
	if (firstArg == '-t' || firstArg == '-test') {
		if (!json.hosts) {
			return log.error('confing.json文件中没有hosts配置项');
		}
		ho = json.hosts.test;
		ho.forEach((item) => {
			hosts.set(item.domain, item.ip);
		});
	}
	// 切换到线上
	else if (firstArg == '-o' || firstArg == '-online') {
		if (!json.hosts) {
			return log.error('confing.json文件中没有hosts配置项');
		}
		ho = json.hosts.test;
		ho.forEach((item) => {
			hosts.disable(item.domain, item.ip);
		});
		return;
	}
	// 删除group deletegroup
	else if (firstArg == '-deleteGroup') {
		groupName = argv[4];
		hosts.removeGroup(groupName);
	}
	// 禁用group disablegroup
	else if (firstArg == '-disableGroup') {
		groupName = argv[4];
		hosts.disableGroup(groupName);
	}
	// 激活group disableGroup
	else if (firstArg == '-activeGroup') {
		groupName = argv[4];
		hosts.activeGroup(groupName);
	}
	// 删除host delete
	else if (firstArg == '-d' || firstArg == '-delete') {
		domain = argv[4].replace(',', ' ');
		ip = argv[5];
		group = argv[6];
		hosts.remove(domain, ip, {
			group: group
		});
	}
	// 设置host
	else if (firstArg == '-s' || firstArg == '-set') {
		domain = argv[4];
		if (!domain) {
			return console.log('缺少参数');
		}
		ip = argv[5];
		group = argv[6];
		hosts.set(domain, ip, {
			group: group
		});
	}
	// 禁用host
	else if (firstArg == '-disable') {
		domain = argv[4];
		if (!domain) {
			return console.log('缺少参数');
		}
		ip = argv[5];
		group = argv[6];
		hosts.disable(domain, ip, {
			group: group
		});
	}
	// 激活host
	else if (firstArg == '-active') {
		domain = argv[4];
		if (!domain) {
			return console.log('缺少参数');
		}
		ip = argv[5];
		group = argv[6];
		hosts.active(domain, ip, {
			group: group
		});
	}
};

// 检测是否有config.json文件
mainf.checkConfigJson = (cb) => {
	if (!fs.existsSync(config_file)) {
		inquirer.prompt(mainf.inquirer.noExistsConfigFile)
			.then((answers) => {
				if (answers.create) {
					mainf.createConfigJson((err, json) => {
						if (err) {
							typeof cb == 'function' && cb(err);
						}
						typeof cb == 'function' && cb(null, json);
					});
				}
			});
	} else {
		typeof cb == 'function' && cb(null, JSON.parse(fs.readFileSync(config_file, 'UTF-8')));
	}
};