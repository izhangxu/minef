/**
 * @author xiaojue
 * @email designsor@gmail.com
 * @fileoverview hosts-group
 */
var fs = require('fs');
var os = require('os');
var path = require('path');
var util = require('util');
var _ = require('lodash');
// var HOSTS = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts': '/etc/hosts';
var HOSTS = path.join(__dirname, '../h.txt');
var EOL = os.EOL;
var groupReg = /^##@@##(.*?)$/;
var groupAllReg = /##@@##(.*?\s*?)##@@##/g;
var blankReg = /\s+/;

function hosts(defaultName) {
	this.defaultName = defaultName || 'defaultGroup';
	// this.format();
}
/**
notes 
{
    group1: '',
    ...
}

hosts
{
    group1: [
        {
            ip:'',
            domain: '',
            disabled: '',
            note:''
        },
        {
            
        }
    ],
    group2: [
    
    ]
}
*/
hosts.prototype = {
	constructor: hosts,
	//读取host内容并解析成一个json对象
	get: function() {
		var hostsstr = fs.readFileSync(HOSTS, 'utf-8');
		var lines = hostsstr.split(EOL);
		var arr = [];
		for (var i = 0; i < lines.length; i++) {
			var line = this._parseLine(lines[i]);
			if (!line) {
				arr.push('');
			} else {
				arr.push(line);
			}
		}
		return arr;
	},
	//设置一个domain
	set: function(domain, ip, options) {
		let self = this,
			notesKey, defaultName, j,
			notes = {};
		ip = ip || '127.0.0.1';
		options = options || {};
		flag = false;
		defaultName = options.group || this.defaultName;
		this._batchHost(function(obj) {
			obj.forEach(function(item, index) {
				if (item !== '') {
					if (item.type == 1 && util.isObject(item.value)) {
						if (item.value.domain.indexOf(domain) > -1 && !item.value.disabled) {
							console.log('已存在这个host [' + domain + ']，将被禁用');
							item.value.disabled = true;
						}
						if (_.isEqual(item.value.domain, domain.split(blankReg))) {
							// console.log(index);
							obj.splice(index, 1);
						}
					}
					if (item.type == 3 && groupReg.test(item.value)) {
						let key = item.value.substring(6);
						notes[key] = {
							start: index
						};
					}
				}
			});
			notesKey = Object.keys(notes);
			notesKey.forEach(function(item) {
				if (item == defaultName) {
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
			if (!flag) {
				j = [{
					type: 3,
					value: '##@@##' + defaultName
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
	},
	// 移除一个domian
	remove: function(domain, ip) {
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
	},
	_parseLine: function(line) {
		var obj;
		line = line.trim();
		if (line) {
			var isGroupLine = line.match(groupReg);
			obj = {};
			if (isGroupLine) {
				obj.type = 3;
				obj.value = '##@@##' + isGroupLine[1]; //{ type: 3, value: '##@@##defaultGroup' }
			} else {
				var line2 = line.split(blankReg);
				if (line2.length < 2 || !line2[0].match(/^\d|#[\d]/g)) {
					obj.type = 2;
					obj.value = line; //{ type: 2, value: '#91乐居卡-2016-09-05' }
				} else {
					var ip = line2.shift();
					var domains = line2;
					var disabled = (/^#/).test(ip);
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
							ip: '10.207.0.202',
							domain: [cdn.leju.com],
							disabled: true
						}
					}
					*/
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
	},
	_batchHost: function(fn) {
		var hostsArray = this.get();
		hostsArray = fn ? fn(hostsArray) : hostsArray;
		if (hostsArray) {
			fs.writeFileSync(HOSTS, this._hostTostr(hostsArray));
		}
	},
	_hostTostr: function(arr) {
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

module.exports = new hosts();