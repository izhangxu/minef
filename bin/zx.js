#!/usr/bin/env node

const fs = require('fs'),
	path = process.cwd();

let run = function(obj) {
	if (obj[0] === '-v') {
		console.log('version is 1.0.0');
	} else if (obj[0] === '-h') {
		console.log('Usages:\n1...\n2...');
		console.log('       -v --version [show version]');
	} else {
		fs.readdir(path, function(err, files) {
			if (err) {
				return console.log(err);
			}
			for (var i = 0; i < files.length; i++) {
				console.log(files[i]); 
			}
		});
	}
};

run(process.argv.slice(2));