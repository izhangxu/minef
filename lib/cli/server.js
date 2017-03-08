const opener = require('opener');
const os = require('os');
const portfinder = require('portfinder');
const httpServer = require('../httpServer.js');
const log = require('../log.js');

const ifaces = os.networkInterfaces();

module.exports = (opts) => {
	const argv = opts.flags;
	let port = argv.p || parseInt(process.env.PORT, 10);
	let host = argv.a || '0.0.0.0';
	let logger;
	
	if (!argv.s) {
		logger = {
			info: console.log,
			request: (err, req) => {
				let date = new Date().toUTCString();
				if (err) {
					logger.info('[%s] "%s %s" Error (%s): "%s"', date, req.method, req.url, err.status.toString(), err.message);
				} else {
					logger.info('[%s] "%s %s" Success', date, req.method, req.url);
				}
			}
		};
	} else {
		logger = {
			info: function() {},
			request: function() {}
		};
	}

	const listen = (port) => {
		let options = {
			root: argv._[1],
			showDir: argv.d,
			autoIndex: argv.i,
			logFn: logger.request
		};

		let server = httpServer.createServer(options);
		server.listen(port, host, () => {
			const protocal = 'http://';
			const currentHost = host === '0.0.0.0' ? '127.0.0.1' : host;
			log.success('Servering up server, serving ' + server.root);
			if (argv.a && host !== '127.0.0.1') {
				log.info('	' + protocal + currentHost + ':' + port);
			} else {
				Object.keys(ifaces).forEach((item) => {
					ifaces[item].forEach((details) => {
						if (details.family == 'IPv4') {
							log.info('	' + protocal + details.address + ':' + port);
						}
					});
				});
			}
			log.info('Hit CTRL-C to stop the server');
			if (argv.o) {
				opener(protocal + currentHost + ':' + port);
			}
		});
	};

	if (!port) {
		portfinder.basePort = 8080;
		portfinder.getPort(function(err, port) {
			if (err) {
				throw err;
			}
			listen(port);
		});
	} else {
		listen(port);
	}

	if (process.platform === 'win32') {
		require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
		}).on('SIGINT', function() {
			process.emit('SIGINT');
		});
	}

	process.on('uncaughtException', function() {
		log.error('server uncaughtException');
		process.exit();
	});

	process.on('SIGINT', function() {
		log.info('\nserver stopped');
		process.exit();
	});

	process.on('SIGTERM', function() {
		log.info('\nserver stopped');
		process.exit();
	});
};