#!/usr/bin/env node

const pkg = require('../package.json');
const commandOptions = require('../lib/cli/commandOptions.json');
// const utils = require('./utils');
/*const config_path = {
	path: {
		test: '/Users/zhangxu/Documents/work/cdn/leju_203/cdn.ljimg.com/trunk',
		online: '/Users/zhangxu/Documents/work/cdn_online/trunk'
	}
};
*/
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
			.options(commandOptions.config)
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
			.options(commandOptions.hosts)
			.example('Usage: $0 hosts -s cdn.leju.com 192.168.1.192')
			.example('Usage: $0 hosts -r cdn.leju.com 192.168.1.192  groupName')
			.help()
			.argv;
	}
	if (command === 'server') {
		out = yargs
			.usage('Usage: $0 server [options]')
			.options(commandOptions.server)
			.example('Usage: $0 server -p 3000')
			.help()
			.argv;
	}
	if (command === 'proxy') {
		out = yargs
			.usage('Usage: $0 proxy [options]')
			.options(commandOptions.proxy)
			.example('Usage: $0 proxy -online')
			.help()
			.argv;
	}
	if (command === 'imagemin') {
		out = yargs
			.usage('Usage: $0 imagemin [options]')
			.options(commandOptions.imagemin)
			.demandOption('i')
			.example('Usage: $0 imagemin -i 123.png -o 123_1.png')
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
		.command('server', '启动文件服务器')
		.command('proxy', '代理文件到各个环境（方便调试，快速切换环境）')
		.command('imagemin', '图片压缩')
		.version(() => pkg.version)
		.epilogue("查看使用文档，输入 minef <command> --help\neg: $0 init --help");

	let argv = yargs.argv;
	let command = argv._[0];
	let valid = ['config', 'init', 'release', 'copy', 'hosts', 'server', 'proxy', 'imagemin'];

	if (valid.indexOf(command) > -1) {
		handleArgv(command, yargs.reset());
	} else {
		yargs.showHelp();
	}
}