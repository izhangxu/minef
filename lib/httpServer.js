const fs = require('fs');
const ecstatic = require('ecstatic');
const union = require('union');
const url = require('url');
const mime = require('mime-types');
const path = require('path');
const httpProxy = require('http-proxy');
const Config = require('./Config.js');

/**
 * 启动服务
 */
class HttpServer {
	constructor(options) {
		if (options.root) {
			this.root = options.root || './';
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

		if (options.ext) {
			this.ext = options.ext === true ? 'html' : options.ext;
		}

		let before = options.before ? options.before.slice() : [];

		before.push(function(req, res) {
			if (options.logFn) {
				options.logFn(null, req, res);
			}

			res.emit('next');
		});
		// 代理
		if (typeof options.proxy === 'string') {
			if (options.proxy.indexOf('127.0.0.1') === -1) {
				let proxy = httpProxy.createServer({});
				before.push(function(req, res) {
					if (/(\.css)|(\.js)/g.test(req.url)) {
						proxy.on('error', function(e) {
							console.error(e.message);
						});
						proxy.on('proxyReq', function(proxyReq) {
							proxyReq.setHeader('HOST', Config.host);
							proxyReq.setHeader('X-Real-Ip', '127.0.0.1');
							proxyReq.setHeader('X-Forwarded-For', '127.0.0.1');
						});
						proxy.web(req, res, {
							target: options.proxy,
							changeOrigin: true
						});
					} else {
						res.emit('next');
					}
				});
			} else {
				
			}
		}

		before.push(ecstatic({
			root: this.root,
			cache: 3600,
			showDir: true,
			autoIndex: this.autoIndex,
			defaultExt: this.ext,
			gzip: true,
			headers: {},
			contentType: this.contentType
		}));

		let serverOptions = {
			before: before,
			onError: function(err, req, res) {
				if (options.logFn) {
					options.logFn(err, req, res);
				}
				res.end();
			}
		};

		this.server = union.createServer(serverOptions);
		/*this.server = http.createServer(this.request.bind(this));*/
	}

	/*request(req, res) {
		let hasExtName = true;
		let requestUrl = req.url;
		let pathName = url.parse(requestUrl).pathname;

		if (path.extname(pathName) === '') {
			// console.log(pathName, /\/$/.test(pathName));
			if (!/\/$/.test(pathName)) {
				pathName += '/';
				res.writeHead(301, {
					location: 'http://' + req.headers.host + pathName
				});
				res.end();
			}
			pathName += 'index.html';
			hasExtName = false;
		}
		let filePath = path.join(process.cwd(), this.root, pathName);
		let contentType = mime.lookup(filePath);
		fs.exists(filePath, (status) => {
			if (status) {
				res.writeHead(200, {
					'content-type': contentType
				});
				let stream = fs.createReadStream(filePath, {
					flags: "r",
					encoding: null
				});
				stream.on('error', () => {
					res.writeHead(500, {
						'content-type': 'text/html'
					});
					res.end('<h1>500 Server Error</h1>');
				});
				stream.pipe(res);
			} else {
				if (hasExtName) {
					res.writeHead(404, {
						'content-type': 'text/html'
					});
					res.end('<h1>404 Not Found</h1>');
				} else {
					// 访问目录
					let h = '<head><meta charset="utf-8"></head>';
					try {
						let files = fs.readdirSync(path.dirname(filePath));
						h += `<table><tbody>`;
						files.forEach((item) => {
							h += `<tr><td><a href="${item}">${item}</a></td><td></td><td></td></tr>`;
						});
						h += `</tbody></table>`;
					} catch (e) {
						h += '<h1>您访问的目录不存在</h1>';
					}
					res.writeHead(200, {
						'content-type': 'text/html'
					});
					res.end(h);
				}
			}
		});
	}*/

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