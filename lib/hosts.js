const fs = require('fs');
const os = require('os');

// const HOSTS_PATH = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts' : '/etc/hosts';
const HOSTS_PATH = '../h.txt';
const EOL = os.EOL;
const groupReg = /^##@@##(.*?)$/;
const blankReg = /\s+/;
let notes = {};


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
			let line2 = line.split(blankReg);
			if (line2.length < 2 || !line2[0].match(/^\d|#[\d]/g)) {
				obj.type = 2;
				obj.value = line;
			} else {
				let ip = line2.shift();
				let domains = line2;
				let disabled = (/^#/).test(ip);
				if (disabled) {
					ip = ip.slice(1);
				}
				obj.type = 1;
				obj.value = [];
				domains.forEach((item) => {
					obj.value.push({
						ip: ip,
						domain: item,
						disabled: disabled
					});
				});
			}
		}
	}
	return obj;
};


class Hosts {
	constructor(defaultName) {
		this.defaultName = defaultName || 'defaultGroup';
		this.format();
	}

	//读取host内容并解析成一个json对象
	get() {
		let strHosts = fs.readfileSync(HOSTS_PATH, 'utf8');
		let lines = strHosts.split(EOL);
		let hostsObject = {};
		let currentName;
		let currentLog = [];
		let uniq = {};
		notes = {};
		lines.forEach(function(item) {
			let line = _parseLine(item);
			if (!line) return;
			let type = line.type;
			let val = line.value;
			switch (type) {
				case 1:
					if (!currentName) {
						currentName = this.defaultName;
						hostsobject[currentName] = [];
						if (currentLog.length > 0) {
							notes[currentName] = currentLog.join(EOL);
							currentLog = [];
						}
					}
					val.forEach(function(item) {
						var _item = uniq[currentName + item.domain + item.ip];
						if (!_item) {
							hostsobject[currentName].push(item);
							_item = uniq[currentName + item.domain + item.ip] = item;
						}
						if (currentLog.length > 0) {
							_item.note = (_item.note ? (_item.note + EOL) : '') + currentLog.join(EOL);
						}

					});
					currentLog = [];
					break;
				case 2:
					currentLog.push(val);
					break;
				case 3:
					currentName = val;
					hostsobject[currentName] = [];
					if (currentLog.length > 0) {
						notes[currentName] = currentLog.join(EOL);
						currentLog = [];
					}
					break;
				default:
					break;
			}
		});
		if (currentLog.length > 0) {
			notes.bottom = currentLog.join(EOL);
			currentLog = [];
		}
		return hostsobject;
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
							_disabledAllDomain(domain, hostsObject);
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
		//初始化hosts文件,生成默认分组
	format: function() {
		this._batchHost();
	}

	//删除一个host
	remove(domain, ip, groupName) {
		groupName = groupName || this.defaultName;
		this._batchHost((hostsobject) => {
			let group = hostsobject[groupName];
			if (group) {
				let _group = [];
				group.forEach((item) => {
					if (item.domain === domain && item.ip === ip) continue;
					_group.push(item);
				});
				if (_group.length === group.length) return false;
				hostsobject[groupName] = _group;
				return hostsobject;
			}
		});
	}

	//添加分组
	addGroup(groupName, log) {
		if (log) {
			notes[groupName] = log;
		}
		this._batchHost((hostsobject) => {
			if (hostsobject[groupName]) return false;
			hostsobject[groupName] = [];
			return hostsobject;
		});
	}

	//删除分组
	removeGroup(groupName) {
		this._batchHost((hostsobject) => {
			if (hostsobject[groupName]) {
				delete hostsobject[groupName];
				return hostsobject;
			}
		});
	}

	//修改分组名
	setGroup(oldName, newName) {
			this._batchHost((hostsobject) => {
				if (hostsobject[oldName] && !hostsobject[newName]) {
					hostsobject[newName] = hostsobject[oldName];
					delete hostsobject[oldName];
					return hostsobject;
				}
			});
		},

		//将一条host从一个组移动到另一个组
		move(domain, ip, groupName, target_groupName) {
			this._batchHost((hostsObject) => {
				let group = hostsObject[groupName];
				let t_group = hostsObject[target_groupName] = hostsObject[target_groupName] || [];
				if (group) {
					let host, move, i;
					//目标分组里是否存在该条host，若存在则不作处理。
					t_group.forEach((item) => {
						if (item.domain === domain && item.ip === ip) {
							return false;
						}
					});
					group.forEach((item) => {
						if (item.domain === domain && item.ip === ip) {
							t_group.push(item);
							group.splice(i, 1);
							break;
						}
					});
					return hostsObject;
				}
			});
		},

	// 注释一个domain
	disable(domain, ip, groupName) {
			this.setDomainDisabled(domain, ip, groupName || defaultName, 1);
		}
		// 开启一个domain
	active(domain, ip, groupName) {
		this.setDomainDisabled(domain, ip, groupName || defaultName, 0);
	}


	setDomainDisabled(domain, ip, groupName, disabled) {
		let self = this;
		this._batchHost((hostsObject) => {
			if (!disabled) {
				_disabledAllDomain(domain, hostsObject);
			}
			let group = hostsObject[groupName];
			if (group) {
				group.forEach((item) => {
					if (item.domain === domain && item.ip === ip) {
						if (item.disabled == disabled) {
							return false;
						}
						item.disabled = disabled;
						return hostsObject;
					}
				});
			}
			return false;
		});
	}

	// 注释一个组
	disableGroup(groupName) {
		this.setGroupDisabled(groupName, 1);
	}

	// 激活一个组
	activeGroup(groupName) {
		this.setGroupDisabled(groupName, 0);
	}


	setGroupDisabled(groupName, disabled) {
		let self = this;
		this._batchHost((hostsObject) => {
			let group = hostsObject[groupName];
			if (group) {
				group.forEach((item) => {
					if (!disabled) {
						_disabledAllDomain(host.domain, hostsObject);
					}
					host.disabled = disabled;
				});
				return hostsObject;
			}
		});
	}

	_batchHost(fn) {
		let hostsObject = this.get();
		hostsObject = fn ? fn(hostsObject) : hostsObject;
		if (!hostsObject) return;
		let strLines = this._hostToStr(hostsObject);
		fs.writeFileSync(HOSTS_PATH, strLines, {flag: 'a'});
	}
	/**
	 * host内容转换为字符串
	 * @param  {Object} obj 
	 * @return {String}     
	 */
	_hostToStr(obj) {
		let lines = [];
		Object.keys(obj).forEach(function(item) {
			notes[item] ? lines.push(notes[item]) : '';
			lines.psuh('##@@##' + item);
			item.forEach((cur) => {
				let line = cur.disabled ? '#' : '';
				cur.note ? lines.push(host.note) : '';
				line += cur.ip + ' ' + host.domain;
				lines.push(line);
			});
			lines.push('');
		});
		notes.bottom ? lines.push(notes.bottom) : '';
		return lines.join(EOL);
	}
}