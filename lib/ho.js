const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const _ = require('lodash');
// var HOSTS = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts': '/etc/hosts';
const HOSTS = path.join(__dirname, '../h.txt');
const EOL = os.EOL;
const groupReg = /^##@@##(.*?)$/;
const groupAllReg = /##@@##(.*?\s*?)##@@##/g;
const blankReg = /\s+/;

// 转换每行host
const _parseLine =(line) => {
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
				/*
				{
					type: 1,
					value: {
						ip: '123.59.190.247',
						domain: [test.partner.leju.com,test.m.partner.leju.com],
						disabled: false
					}
				}
				*/
			}
		}
	}
	return obj;
};
class Hosts {
	constructor(defaultName){
		this.defaultName = defaultName || 'defaultGroup';
		this.get = this.get.bind(this);
		this._batchHost = this._batchHost.bind(this);
	}

	//读取host内容并解析成一个数组
	get() {
		let hostsstr = fs.readFileSync(HOSTS, 'utf-8');
		let lines = hostsstr.split(EOL);
		let arr = [];
		for (var i = 0; i < lines.length; i++) {
			var line = _parseLine(lines[i]);
			if (!line) {
				arr.push('');
			} else {
				arr.push(line);
			}
		}
		return arr;
	}

	//设置一个domain
	set(domain, ip, options) {
		let self = this,
			notes = {},
			flag = false, j ={};
		ip = ip || '127.0.0.1';
		options = options || {};
		options.group = options.group || this.defaultName;
		this._batchHost(function(obj) {
			for (var i=0;i<obj.length;i++){
				if (obj[i] !== '') {
					let domainArr = domain.split(blankReg);
					// 去重
					if (obj[i].type == 1 && util.isObject(obj[i].value)) {
						let newD = obj[i].value.domain;
						if (_.isEqual(newD.sort(), domainArr.sort())) {
							obj.splice(i--, 1);
						}
					}
					// 如果之前有相同的host，则先禁用
					if (obj[i].type == 1 && util.isObject(obj[i].value)) {
						domainArr.forEach(function(ele){
							if (obj[i].value.domain.indexOf(ele) > -1 && !obj[i].value.disabled) {
								console.log('[' + obj[i].value.domain + ']（'+ (i+1) +'行）中已存在这个host [' + ele + ']，将被禁用');
								obj[i].value.disabled = true;
							}
						});
					}
					// 记录不同group的位置
					if (obj[i].type == 3 && groupReg.test(obj[i].value)) {
						let key = obj[i].value.substring(6);
						notes[key] = {
							start: i
						};
					}
				}
			}
			let notesKey = Object.keys(notes);
			notesKey.forEach(function(item) {
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
					obj.splice(notes[item].start + 1, 0, j);
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
		domain = !util.isArray(domain) ? domain.split(',') : domain;
		this._batchHost(function(obj) {
			obj.forEach(function(item, index) {
				if (item !== '') {
					if (item.type == 1 && util.isObject(item.value) && ip == item.value.ip && utils.arraysSimilar(domain, item.value.domain)) {
						obj.splice(index, 1);
					}
				}
			});
			return obj;
		});
	}

	// 转换host
	_batchHost(fn) {
		let hostsArray = this.get();
		hostsArray = fn ? fn(hostsArray) : hostsArray;
		if (hostsArray) {
			fs.writeFileSync(HOSTS, this._hostTostr(hostsArray));
		}
	}

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
		
		return lines.join(EOL).replace(groupAllReg, '');
	}
};

module.exports = new Hosts();