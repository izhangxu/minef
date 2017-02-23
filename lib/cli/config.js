const checkJsonFile = require('../configJson.js');
const log = require('../log.js');

module.exports = (opts) => {
	const argv = opts.flags;
	if (argv.a || (!argv.a && !argv.t && !argv.o)) {
		checkJsonFile.all(function(err, json) {
			if (err) {
				return log.error(err);
			}
			log.info(JSON.stringify(json, null, 4));
		});
	} else if (argv.t || argv.o) {
		const path = {
			test: argv.t || '',
			online: argv.o || ''
		};
		checkJsonFile.config(path, function(err, json) {
			if (err) {
				return log.error(err);
			}
			log.success('配置开发及生产环境目录成功');
			log.info(JSON.stringify(json, null, 4));
		});
	}
};