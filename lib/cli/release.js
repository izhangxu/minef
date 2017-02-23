const path = require('path');
const child_process = require('child_process');
const configJson = require('../configJson.js');
const file = require('../file.js');
const log = require('../log.js');

/**
 * 发布文件
 * @param  {Object} dir
 * @param  {Object} files
 * @param  {String} commit_msg 
 * @return {undefined}
 */

const releaesFiles = (dir, files, commit_msg) => {
	if (!dir || !util.isArray(files)) {
		return log.error('参数不正确');
	}
	let test_dir = process.cwd(),
		online_dir = path.join(dir.online, test_dir.replace(dir.test, '')),
		flag = false,
		sp;
	files = files.map(path.normalize);
	files = transformUrl(files);
	files = files.map((item) => {
		let k = file.realpath(item);
		if (!k) {
			flag = true;
		}
		return k;
	});
	if (flag) {
		return log.error('待上传文件或文件目录不存在');
	}

	sp = child_process.spawn('sh', [path.resolve(__dirname, '../../rsync.sh'), files, test_dir, online_dir, commit_msg]);
	sp.stdout.setEncoding('utf8');
	sp.stdout.pipe(process.stdout);
	sp.stderr.on('data', (chunk) => {
		return log.error('stderr: ' + chunk);
	});
	sp.stdout.on('end', () => {
		return log.success('上传文件成功');
	});
};

module.exports = (opts) => {
	const argv = opts.flags,
		_ = argv._;
	configJson.all(function(err, json) {
		if (err) {
			return log.error(err);
		}
		const path = json.path;
		const commit_msg = (argv.m && typeof argv.m == 'string') ? argv.m : 'update';
		let arrFiles = [];
		if (process.cwd().indexOf(path.test) == -1) {
			return log.error('请进入测试环境根目录');
		}
		arrFiles = _.slice(1);
		// console.log(path, arrFiles, commit_msg);
		releaesFiles(path, arrFiles, commit_msg);
	});
};