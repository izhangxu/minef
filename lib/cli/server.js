const opener = require('opener');
const os = require('os');
const portfinder = require('portfinder');
const httpServer = require('../httpServer.js');
const log = require('../log.js');

const ifaces = os.networkInterfaces();

module.exports = (opts) => {
	const argv = opts.flags;
	let port = argv.p || parseInt(process.env.PORT, 10);
	let host = '127.0.0.1';

	const listen = (port) => {
		let options = {
			root: argv._[1],
			showDir: argv.d,
			autoIndex: argv.i
		};

		let server = httpServer.createServer(options);
		server.listen(port, host, () => {
			const protocal = 'http://';
			log.success('Servering up server:');
			if (host !== '127.0.0.1') {
				log.info('	' + protocal + host + ':' + port);
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
				opener(protocal + host + ':' + port);
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
		log.info('\nhttp-server stopped');
		process.exit();
	});

	process.on('SIGTERM', function() {
		log.info('\nhttp-server stopped');
		process.exit();
	});
};