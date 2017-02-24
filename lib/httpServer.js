const fs = require('fs');
const ecstatic = require('ecstatic');
const union = require('union');

/**
 * 启动服务
 */
class HttpServer {
	constructor(options = {}) {
		if (options.root) {
			this.root = options.root;
		} else {
			try {
				fs.lstatSync('./public');
				this.root = './public';
			} catch (e) {
				this.root = './';
			}
		}

		this.headers = options.headers || {};
		this.showDir = options.showDir !== false;
		this.autoIndex = options.autoIndex !== false;
		this.contentType = options.contentType || 'application/octet-stream';

		this.listen = this.listen.bind(this);
		this.close = this.close.bind(this);

		if (options.ext) {
			this.ext = options.ext === true ? 'html' : options.ext;
		}

		let before = options.before ? options.before.slice() : [];

		before.push(ecstatic({
			root: this.root,
			cache: 3600,
			showDir: true,
			autoIndex: this.autoIndex,
			defaultExt: this.ext,
			gzip: true,
			contentType: this.contentType,
		}));

		let serverOptions = {
			before: before,
			headers: this.headers
		};

		this.server = union.createServer(serverOptions);
	}

	listen() {
		this.server.listen.apply(this.server, arguments);
	}

	close() {
		return this.server.close();
	}
}

module.exports = {
	createServer: (options) => {
		return new HttpServer(options);
	},
	httpServer: HttpServer
};