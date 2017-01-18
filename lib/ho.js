const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const _ = require('lodash');
// var HOSTS = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts': '/etc/hosts';
const HOSTS = path.join(__dirname, '../h.txt');
const EOL = os.EOL;
const groupReg = /^##@@##(.*?)$/;
const groupAllReg = /##@@##(.+\s*?)##@@##/g;
const blankReg = /\s+/;
let notes = {};

// 转换每行host
const _parseLine = (line) => {
	let obj;
	line = line.trim();
	if (line) {
		let isGroupLine = line.match(groupReg);
		obj = {};
		if (isGroupLine) {
			obj.type = 3;
			obj.value = '##@@##' + isGroupLine[1]; //{ type: 3, value: '##@@##defaultGroup' }
		} else {
			let line2 = line.split(blankReg);
			if (line2.length < 2 || !line2[0].match(/^\d|#[\d]/g)) {
				obj.type = 2;
				obj.value = line; //{ type: 2, value: '#91乐居卡-2016-09-05' }
			} else {
				let ip = line2.shift();
				let domains = line2;
				let disabled = (/^#/).test(ip);
				if (disabled) {
					ip = ip.slice(1);
				}
				obj.type = 1;
				obj.value = {
					ip: ip,
					domain: domains,
					disabled: disabled
				};
				/*{
					type: 1,
					value: {
						ip: '123.59.190.247',
						domain: [test.partner.leju.com,test.m.partner.leju.com],
						disabled: false
					}
				}*/
			}
		}
	}
	return obj;
};

class Hosts {
	constructor(defaultName) {
		this.defaultName = defaultName || 'defaultGroup';
		this.get = this.get.bind(this);
		this._batchHost = this._batchHost.bind(this);
		this.recordGroup = this.recordGroup.bind(this);
	}

	//读取host内容并解析成一个数组
	get() {
		let hostsstr = fs.readFileSync(HOSTS, 'utf-8');
		let lines = hostsstr.split(EOL);
		let arr = [];
		lines.forEach(function(item) {
			let newItem = _parseLine(item);
			if (!newItem) {
				arr.push('');
			} else {
				arr.push(newItem);
			}
		});
		return arr;
	}

	//设置一个domain
	set(domain, ip, options) {
		let flag = false,
			j = {};
		ip = ip || '127.0.0.1';
		options = options || {};
		options.group = options.group || this.defaultName;
		this._batchHost((obj) => {
			// 去重复的domain数组
			obj = obj.filter(function(item) {
				if (item.type == 1 && util.isObject(item.value)) {
					let domainArr = domain.split(blankReg);
					let newD = item.value.domain.slice(0);
					if (_.isEqual(newD.sort(), domainArr.sort())) {
						return false;
					}
				}
				return true;
			});
			// 如果之前有相同的host，则先禁用
			obj.forEach(function(item, index) {
				if (item.type == 1 && util.isObject(item.value)) {
					let domainArr = domain.split(blankReg);
					domainArr.forEach(function(ele) {
						if (item.value.domain.indexOf(ele) > -1 && !item.value.disabled) {
							console.log('[ ' + item.value.domain + ' ]（' + (index + 1) + '行）中已存在这个host [' + ele + ']，将被禁用');
							item.value.disabled = true;
						}
					});
				}
			});
			notes = this.recordGroup(obj);
			Object.keys(notes).forEach(function(item) {
				// 如果group存在，则在该group中插入新domain
				if (item == options.group) {
					flag = true;
					j = {
						type: 1,
						value: {
							ip: ip,
							domain: util.isArray(domain) ? domain : [domain],
							disabled: options.disabled || false
						}
					};
					obj.splice(notes[item].end, 0, j);
				}
			});
			// 如果group不存在，则在最后追加
			if (!flag) {
				j = [{
					type: 3,
					value: '##@@##' + options.group
				}, {
					type: 1,
					value: {
						ip: ip,
						domain: util.isArray(domain) ? domain : [domain],
						disabled: options.disabled || false
					}
				}, {
					type: 3,
					value: '##@@##'
				}];
				obj.push(...j);
			}
			return obj;
		});
	}

	// 移除一个domian
	remove(domain, ip) {
		domain = !util.isArray(domain) ? domain.split(blankReg) : domain;
		this._batchHost((obj) => {
			obj = obj.filter((item) => {
				if (item.type == 1 && util.isObject(item.value)) {
					let domainArr = item.value.domain.slice(0);
					if (ip == item.value.ip && _.isEqual(domain.sort(), domainArr.sort())) {
						return false;
					}
				}
				return true;
			});
			return obj;
		});
	}

	// 记录组位置
	recordGroup(obj) {
		let tempDis = {},
			tempKey = '';
		obj.forEach((item, index) => {
			// 记录不同group的位置
			if (item.type == 3 && groupReg.test(item.value)) {
				let key = item.value.substring(6);
				if (key) {
					tempDis.start = index;
					tempKey = key;
					notes[tempKey] = {};
				} else {
					tempDis.end = index;
					notes[tempKey] = {
						start: tempDis.start,
						end: tempDis.end
					};
				}
			}
		});
		return notes;
	}

	// 移除一个组
	removeGroup(groupName) {
		this._batchHost((obj) => {
			let record = this.recordGroup(obj);
			let arr = []; // 记录每个组的位置 [{defaultName: {start: 39, end: 50}}, {...}]
			let f = []; // 保存匹配的组每行的行号
			Object.keys(record).forEach((item) => {
				if (item == groupName) {
					arr.push({
						start: record[item].start,
						end: record[item].end
					});
				}
			});
			if (!arr.length) {
				console.log('组 ' + groupName + ' 未找到，移除失败');	
				return obj;
			}
			obj = obj.filter((item, index) => {
				arr.forEach((ele) => {
					if (index >= ele.start && index <= ele.end) {
						f.push(index);
					}
				});
				if (f.indexOf(index) > -1) {
					return false;
				}
				return true;
			});
			console.log('组 ' + groupName + ' 已被成功移除');
			return obj;
		});
	}

	// 转换host为字符串
	_hostTostr(arr) {
		let lines = [];
		arr.forEach(function(item) {
			let l = '';
			if (item === '') {
				lines.push('');
			} else {
				if (typeof item.value === 'string') {
					lines.push(item.value);
				} else {
					l = item.value.disabled ? '#' : '';
					l += item.value.ip + '   ' + item.value.domain.join(',').replace(/,/g, ' ');
					lines.push(l);
				}
			}
		});
		// 删除空组
		return lines.join(EOL).replace(groupAllReg, '');
	}

	// 写入host文件
	_batchHost(fn) {
		let hostsArray = this.get();
		hostsArray = fn ? fn(hostsArray) : hostsArray;
		if (hostsArray) {
			fs.writeFileSync(HOSTS, this._hostTostr(hostsArray));
		}
	}
}

module.exports = new Hosts();