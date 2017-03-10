/**
 * 统一配置文件
 * @type {Object}
 */
module.exports = {
	"initDir": {
		"baseDir": "assets", //静态文件名称
		"cssDir": "css", //css文件夹名称
		"jsDir": "js", //js文件夹名称
		"htmlDir": "html", //html文件夹名称
		"widgetDir": "widget", //widget文件夹名称
	},
	"inquirer": {
		// 是否存在文件夹
		"existsDir": [{
			type: 'confirm',
			name: 'overwrite',
			message: 'Directory already exists, overwrite?',
			default: false
		}],
		// 是否存在文件
		"existsFile": [{
			type: 'confirm',
			name: 'overwrite',
			message: 'File already exists, overwrite?',
			default: false
		}],
		// 判断config.json是否存在
		"noExistsConfigFile": [{
			type: 'confirm',
			name: 'create',
			message: 'File(config.json) does not exist, please create if first',
			default: true
		}],
		// 配置config.json
		"configFileInput": [{
			type: 'input',
			name: 'test',
			message: 'Please enter a file path for the test environment!',
			default: ''
		}, {
			type: 'input',
			name: 'online',
			message: 'Please enter a file path for the production environment!',
			default: ''
		}]
	},
	"proxy": {
		'host': 'cdn.leju.com',
		'local': '127.0.0.1',
		'test': '10.207.0.202',
		'online': '123.59.190.238'
	}
};