const chalk = require('chalk');
const log = console.log;

module.exports = {
	warn: (str = 'wran') => {
		log(chalk.yellow('[ ! ]: ' + str));
	},
	success: (str = 'success') => {
		log(chalk.green('[ √ ]: ' + str));
	},
	error: (str = 'error') => {
		log(chalk.red('[ × ]: ' + str));
	},
	info: (str = 'info') => {
		log(chalk.gray(str));
	}
};