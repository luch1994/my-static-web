#!/usr/bin/env node

var program = require('commander');
const startServer = require('../src/index.js');

const package = require('../package');

program
    .version(package.version)
    .description(package.description);

program
    .command('start')
    .option('-p --port <port>', 'set server port')
    .on('--help', () => {
        console.log('start a file server');
        console.log('启动文件服务器');
    })
    .action((cmd) => {
        let port = 3000;
        if (cmd.port) {
            port = parseInt(cmd.port);
        }
        startServer(port, process.cwd());
    });

program.parse(process.argv);