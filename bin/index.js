#!/usr/bin/env node

var program = require('commander');
const startServer = require('../src/index.js');
const package = require('../package');
const fs = require('fs');
const chalk = require('chalk');

program.version(package.version);

const start = (cmd) => {
    let port = 3000, rootDir = process.cwd();
    if (cmd.port) {
        port = parseInt(cmd.port);
    }
    if (cmd.dir) {
        if (!fs.existsSync(cmd.dir)) {
            const msg = `error: path ${cmd.dir} does not exists`;
            console.log(chalk.red(msg));
            return;
        }
        rootDir = cmd.dir;
    }
    startServer({
        port,
        rootDir,
    });
}

const addProgram = program => {
    program.option('-p --port <port>', 'set server port，default 3000；设置服务器启动端口，默认3000')
    .option('-d --dir <dir>', 'set server root dir，default current path，设置静态资源的根目录，默认当前位置')
    .on('--help', () => {
        const msgEn = `use 'file-server' or 'file-server start' to start a file server`;
        const msgZh = `执行 'file-server' 或者 'file-server start'来启动一个文件服务器`
        console.log(chalk.green(msgEn));
        console.log(chalk.green(msgZh));
    })
    .action(start);
}

addProgram(program);
addProgram(program.command('start'));

program.parse(process.argv);