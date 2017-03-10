const initServer = require('./server.js');

module.exports = (opts) => {
	let argv = opts.flags;
	initServer(opts, {
		local: argv.l,
		test: argv.t,
		online: argv.o
	});
};