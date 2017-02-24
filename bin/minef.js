#!/usr/bin/env node

const pkg = require('../package.json');
// const utils = require('./utils');

// 引用模块
const handleCli = (opts) => {
	return require('../lib/cli/' + opts.input[0])(opts);
};
// 处理命令
const handleArgv = (command, yargs) => {
	let out;
	if (command === 'config') {
		out = yargs
			.usage('Usage: $0 config [options]')
			.options({
				't': {
					alias: 'test',
					describe: '测试线路径',
					type: 'string'
				},
				'o': {
					alias: 'online',
					describe: '正式线路径',
					type: 'string'
				},
				'a': {
					alias: 'all',
					describe: '显示所有配置',
				}
			})
			.example("$0 config -t '/leju_203/trunk' -o /cdn_online/trunk")
			.help()
			.argv;
	}
	if (command === 'init') {
		out = yargs
			.usage("Usage: $0 init <project_name>")
			.example("$0 init live.leju")
			.help()
			.argv;
	}
	if (command === 'copy') {
		out = yargs
			.usage('Usage: $0 copy <test_file>')
			.options('c', {
				alias: 'current',
				describe: '复制当前目录',
				type: 'boolean'
			})
			.example('Usage: $0 copy index.js lib/')
			.example('Usage: $0 copy -c')
			.help()
			.argv;
	}
	if (command === 'release') {
		out = yargs
			.usage('Usage: $0 release <file_name>')
			.options('m', {
				describe: '添加注释',
				type: 'string'
			})
			.example('Usage: $0 release index.js')
			.example('Usage: $0 release index.js file/ -m "update"')
			.help()
			.argv;
	}
	if (command === 'hosts') {
		out = yargs
			.usage('Usage: $0 hosts [options]')
			.options({
				't': {
					alias: 'test',
					describe: '切换到测试线',
					type: 'boolean'
				},
				'o': {
					alias: 'online',
					describe: '切换到正式线',
					type: 'boolean'
				},
				'R': {
					alias: 'remove-group',
					describe: '移除一组host',
					type: 'array'
				},
				'D': {
					alias: 'disable-group',
					describe: '禁用一组host',
					type: 'array'
				},
				'A': {
					alias: 'active-group',
					describe: '禁用一组host',
					type: 'array'
				},
				'r': {
					alias: 'remove',
					describe: '移除一条host',
					type: 'array'
				},
				'd': {
					alias: 'disable',
					describe: '禁用一条host',
					type: 'array'
				},
				'a': {
					alias: 'active',
					describe: '激活一条host',
					type: 'array'
				},
				's': {
					alias: 'set',
					describe: '设置一条host',
					type: 'array'
				},
				'l': {
					alias: 'list',
					describe: '显示设置的所有hosts',
					type: 'boolean'
				}
			})
			.example('Usage: $0 hosts -s cdn.leju.com 192.168.1.192')
			.example('Usage: $0 hosts -r cdn.leju.com 192.168.1.192  groupName')
			.help()
			.argv;
	}
	if (command === 'server') {
		out = yargs
			.usage('Usage: $0 server [options]')
			.options({
				'p': {
					alias: 'port',
					describe: '改变监听端口（默认是8080）',
					type: 'string'
				},
				'o': {
					alias: 'open',
					default: true,
					describe: '服务器启动后打开浏览器',
					type: 'boolean'
				},
				'i': {
					alias: 'autoindex',
					default: false,
					describe: '处理请求时显示默认页面（index.html）',
					type: 'boolean'
				}
			})
			.example('Usage: $0 server -p 3000')
			.help()
			.argv;
	}
	if (out.help) {
		return yargs.showHelp();
	}
	handleCli({
		flags: out,
		input: out._
	});
};

if (!module.parent) {
	let yargs = require('yargs')
		.command('config', '生成配置文件，记录开发及生产环境目录')
		.command('init', '生成初始化文件目录')
		.command('copy', '将文件从开发环境目录复制到生成环境目录')
		.command('release', '将文件从开发环境目录发布到生成环境目录（svn）')
		.command('hosts', '修改hosts文件')
		.version(() => pkg.version)
		.epilogue("查看使用文档，输入 minef <command> --help\neg: $0 init --help");

	let argv = yargs.argv;
	let command = argv._[0];
	let valid = ['config', 'init', 'release', 'copy', 'hosts', 'server'];

	if (valid.indexOf(command) > -1) {
		handleArgv(command, yargs.reset());
	} else {
		yargs.showHelp();
	}
}