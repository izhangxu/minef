const chalk = require('chalk');
const log = console.log;

module.exports = {
	warn: (str = 'wran') => {
		log(chalk.yellow('Warn: '+str));
	},
	success: (str = 'success') => {
		log(chalk.green('Success: '+str));	
	},
	error: (str = 'error') => {
		log(chalk.red('Error: '+str));
	},
	info: (str = 'info') => {
		log(chalk.gray(str));
	}
};