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
	"initFile": {
		"configFileName": "config.json" //配置文件名称
	},
	"inquirer": {
		"existsDir": [{
			type: 'confirm',
			name: 'overwrite',
			message: 'Directory already exists, overwrite?',
			default: false
		}],
		"existsFile": [{
			type: 'confirm',
			name: 'overwrite',
			message: 'File already exists, overwrite?',
			default: false
		}],
		"noExistsConfigFile": [{
			type: 'confirm',
			name: 'create',
			message: 'File(config.json) does not exist, please create if first',
			default: true
		}],
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
	}
};