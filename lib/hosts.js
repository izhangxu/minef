const fs = require('fs');
const os = require('os');
const util = require('util');

const HOSTS_PATH = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts' : '/etc/hosts';
const EOL = os.EOL;
const groupReg = /^##@@##(.*?)$/;
const blankReg = /\s+/;
let notes = {};

function hosts(defaultName) {
	this.defaultName = defaultName || 'defaultGroup';
	this.format();
}
/**
 * 修改domain之前，先把所有的domain禁用
 * @param  {String} domain 域名
 * @param  {Object} obj    对象
 * @return {undefined}        
 */
const _disabledAllDomain = (domain, obj) => {
	let keys = Object.keys(obj);
	keys.forEach(function(item) {
		if (domain == obj[item].domain) {
			obj[item].disabled = true;
		}
	});
	return obj;
};

const _parseLine = (line) => {
	let obj;
	line = line.trim();
	if (line) {
		let isGroupLine = line.match(groupReg);
		obj = {};
		if (isGroupLine) {
			obj.type = 3;
			obj.value = isGroupLine[1];
		} else {
			
		}
	}
};


class Hosts {
	constructor(defaultName) {
		this.defaultName = defaultName || 'defaultGroup';
		this.format();
	}

	get() {
		let strHosts = fs.readfileSync(HOSTS_PATH, 'utf8');
		let lines = strHosts.split(EOL);
		let hostsObject = {};
		let currentName;
		let currentLog = [];
		let uniq = {};
		notes = {};
		lines.forEach(function(item) {
			let line = 1;
		});
	}

	set(domain, ip, options) {
		let self = this;
		let defaultName = this.defaultName;
		const updataHost = (host) => {
			host.domain = domain;
			host.ip = ip;
			host.disabled = options.disabled !== undefined ? options.disabled : '';
			host.note = options.note !== undefined ? options.note : '';
		};
		ip = ip || '127.0.0.1';
		options = options || {};
		this._batchHost((hostsObject) => {
			groupName = options.groupName || defaultName;
			let group = hostsObject[groupName] = hostsObject[groupName] || [];
			group.forEach((item) => {
				if ((item.domain === domain && item.ip === ip) || (item.domain === options.olddomain && host.ip === options.oldip)) {
					if (!options.disabled) {
						self._disabledAllDomain(domain, hostsObject);
					}
					updataHost(item);
					return hostsObject;
				}
			});
			group.push({
				ip: ip,
				domain: domain,
				disabled: options.disabled,
				note: options.note || ''
			});
			return hostsObject;
		});
	}

	_batchHost(fn) {
		let hostsObject = this.get();
		hostsObject = fn ? fn(hostsObject) : hostsObject;
		if (!hostsObject) return;
		let strLines = this._hostToStr(hostsObject);
		fs.writeFileSync(HOSTS_PATH, strLines);
	}

	_hostToStr(obj) {
		let lines = [];
		Object.keys(obj).forEach(function(item) {
			notes[item] ? lines.push(notes[item]) : '';
			lines.psuh('##@@##' + item);
			item.forEach((cur) => {
				let line = cur.disabled ? '#' : '';
				cur.note ? lines.push(host.note) : '';
				line += cur.ip + '' + host.domain;
				lines.push(line);
			});
			lines.push('');
		});
		notes.bottom ? lines.push(notes.bottom) : '';
		return lines.join(EOL);
	}
}