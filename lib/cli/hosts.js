const configJson = require('../configJson.js');
const log = require('../log.js');
const hosts = require('../hosts.js');
/**
 * 修改hosts文件
 * @param  {String}
 * @param  {Object}
 * @return {undefined}
 */
const setHosts = (argv, json) => {
	let ho, HOSTS = json.hosts,
		firstArgv, secendArgv, thirdArgv;

	const setArgv = (arr) => {
		if (arr && arr.length) {
			firstArgv = arr[0];
			secendArgv = arr[1];
			thirdArgv = arr[2];
			return true;
		} else {
			log.error('参数错误');
			return false;
		}
	};

	// 切换到测试线
	if (argv.t) {
		if (!HOSTS) {
			return log.error('confing.json文件中没有hosts配置项');
		}
		ho = HOSTS.test;
		ho.forEach((item) => {
			hosts.set(item.domain, item.ip);
		});
	}
	// 切换到线上
	else if (argv.o) {
		if (!HOSTS) {
			return log.error('confing.json文件中没有hosts配置项');
		}
		ho = HOSTS.test;
		ho.forEach((item) => {
			hosts.disable(item.domain, item.ip);
		});
	}
	// 删除group deletegroup
	else if (argv.D && setArgv(argv.D)) {
		hosts.removeGroup(firstArgv);
	}
	// 禁用group disablegroup
	else if (argv.D && setArgv(argv.D)) {
		hosts.disableGroup(firstArgv);
	}
	// 激活group disableGroup
	else if (argv.A && setArgv(argv.A)) {
		hosts.activeGroup(firstArgv);
	}
	// 删除host delete
	else if (argv.r && setArgv(argv.r)) {
		hosts.remove(firstArgv, secendArgv, {
			group: thirdArgv
		});
	}
	// 设置host
	else if (argv.s && setArgv(argv.s)) {
		if (!firstArgv) {
			return log.error('缺少参数');
		}
		hosts.set(firstArgv, secendArgv, {
			group: thirdArgv
		});
	}
	// 禁用host
	else if (argv.d && setArgv(argv.d)) {
		if (!firstArgv) {
			return log.error('缺少参数');
		}
		hosts.disable(firstArgv, secendArgv, {
			group: thirdArgv
		});
	}
	// 激活host
	else if (argv.a && setArgv(argv.a)) {
		if (!firstArgv) {
			return log.error('缺少参数');
		}
		hosts.active(firstArgv, secendArgv, {
			group: thirdArgv
		});
	} 
	// 显示所有的hosts
	else if (argv.l) {
		return log.info(hosts._batchHost());
	}
};

module.exports = (opts) => {
	const argv = opts.flags;
	configJson.all((err, json) => {
		if (err) {
			return log.error(err);
		}
		setHosts(argv, json);
	});
};