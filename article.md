# 命令行工具开发了解+文件服务了解+vite源码略读+开发简版vite
话不多说，先上项目地址
https://www.npmjs.com/package/local-file-server

本教程改用file-server，但是最终发布的包名是local-file-server

## 1. 初始化项目

我们先创建一个file-server的文件夹，命令行进入这个文件夹

执行

```bash
npm init
```

可以直接回车或者执行```npm init -y```全部跳过，后面会详细介绍每个点的具体含义

项目初始化后，我们这根目录看到一个package.json

<img src="/Users/didi/Library/Application Support/typora-user-images/image-20211215125023411.png" alt="image-20211215125023411" style="zoom:50%;" />

* **name ** 是我们在npm上的包名，是不能和已有的包重复，这里我们本地开发，可以先不用管，如果要发布到npm上的话就需要命名唯一的包名
* **version** 是我们npm包的版本，通常我们```npm install xxx```的时候默认是下载最新版本，我们也可以指定下载某个版本```npm install xxx@version```
* **description** 用来描述当前项目的大致功能，在npm上也可以优化查询，也会作为搜索结果的包名下面的说明文案
* **main** 当我们的npm包在别的项目中引入时，指定的主入口
* **keywords** 关键字，用于优化查询结果
* **author** 作者，可以写上npm上的用户名加上邮箱，如```luch1994 <luch1994@xxx.com`>``

因为我们要开发命令行工具，所以需要再加上bin这个字段

```
{
  ...
  "bin": {
    "file-server": "bin/index.js"
  }
  ...
}
```

其中，```file-server```就是我们在命令行里启动的命令，```bin/index.js```就是命令行的代码

我们创建bin目录，bin目录下创建index.js

在index.js里写下代码

```javascript
#!/usr/bin/env node
console.log('hello world');
```

其中第一行是必须要有的

接着我们执行```npm link```，将这个npm包link到本地的全局，在命令行里执行 ```file-server```，看到打印出了 hello world，说明我们的命令行工具可以正常运行



## 2. 前置知识

在正式开发一个命令行工具之前我们需要先了解一些第三方库

- [commander](https://www.npmjs.com/package/commander) —— 提供 cli 命令与参数
- [glob](https://www.npmjs.com/package/glob) —— 遍历文件
- [shelljs](https://www.npmjs.com/package/shelljs) —— 常用的 shell 命令支持
- [prompts](https://www.npmjs.com/package/prompts) —— 读取控制台用户输入
- [fs-extra](https://www.npmjs.com/package/fs-extra) —— 文件读写等操作，对内置的fs做了封装，支持promise
- [inquirer](https://www.npmjs.com/package/inquirer) —— 类似于 prompts
- [chalk](https://www.npmjs.com/package/chalk) —— 彩色日志
- [debug](https://www.npmjs.com/package/debug) —— 类似于 chalk
- [execa](https://www.npmjs.com/package/execa) —— 执行 shell 指令

我们这个教程，没有做很复杂的功能，就只做一个静态的文件服务器，只用到了commander和chalk，其他的库可以自行研究一下，也欢迎留言补充

我们还需要了解<a href="http://nodejs.cn/api/process.html">process</a>进程这个内置的nodejs模块的一些功能，本教程主要用到了```process.cwd()```和```process.argv```

## 3. 开发命令行工具

我们先将目录做以下调整，新增src文件夹，在src文件夹下，是启动静态资源服务器的代码，bin目录下是我们命令行工具的代码

```
├── README.md
├── bin
│   └── index.js
├── src
│   └── index.js
└── package.json
```

我们先编写src/index.js

```javascript
module.exports = function() {
    console.log('start a server');
}
```

安装commander和chalk（chalk最新版本是5.x，已经改成和import的形式，本教程还是使用的nodejs的require的形式）

```bash
npm install commander chalk@4
```

我们修改bin/index.js

引入必备的包

```javascript
var program = require('commander');
const startServer = require('../src/index.js');
const package = require('../package');
```

设置version和description

```javascript
program.version(package.version);
program.parse(process.argv);
```

接着我们可以执行```file-server --version```或者```file-server -V```查看我们的版本

我们的静态资源服务器，主要是的目的是接收一个端口和一个静态资源服务的根目录，然后启动一个服务，我们可以设置默认的端口，根目录默认当前路径，下面编写我们的代码

```javascript
const fs = require('fs');
const chalk = require('chalk');
```

```javascript
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
```

其中 ```command```是我们服务器启动的命令，如果什么都不加就默认，如这里我们可以执行 ```file-server```也可以执行```file-server start```

```options```是我们定义的一些参数，```-p```和```--port```是接收参数的形式，```<port>```是cmd的参数名，后面是描述

```action```是执行命令的时候做的操作，回调的参数是cmd

在start方法里，我们做的主要是获取到端口和根目录路径，然后启动文件服务器

**结果检验**

执行```file-server ```或者```file-server start ```可以看到打印出了start a server

执行```file-server -d xxx ```，传入一个不存在的目录可以看到打印出了红色的error，传入存在路径后也是正常打印出了start a server

执行```file-server -h ```可以看到我们的一些帮助文案



**到这里我们的命令行开发的功能就结束了，下一节是启动静态服务器的教程，不感兴趣的可以略过**

## 4. 开发静态文件服务器

### 4.1 简易版

开发一个静态资源服务器，我们有这么几步要做

1. 启动一个http服务

2. 根据路由读取当前文件信息

   2.1 如果是文件夹，拼装html返回一个文件夹下的文件列表

   2.2 如果是文件，返回文件

   2.3 如果不存在，返回404

根据这个思路，我们开始开发我们的代码

先安装一些第三方包 ```npm i mime-types fs-extra```

```javascript
const http = require('http');
const url = require('url');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

module.exports = function (options) {
    const port = options.port;
    const rootDir = options.rootDir;

    const server = http.createServer(async (req, res) => {
        let reqUrl = decodeURIComponent(req.url); // 中文解码
        const obj = url.parse(reqUrl); // 解析请求的url

        const realPath = path.join(rootDir, obj.pathname); // 获取物理路径

        // 获取文件基本信息，包括大小，创建时间修改时间等信息
        try {
            const stats = await fs.stat(realPath);
            if (stats.isDirectory()) {
                // 读取文件夹
                const files = await fs.readdir(realPath);
                res.statusCode = 200;
                res.setHeader('content-type', 'text/html');
                let result = '';
                const prepath = req.url === '/' ? '' : req.url;
                for (let i = 0; i < files.length; i++) {
                    result += `<a href="${prepath}/${files[i]}">${files[i]}</a><br/>`;
                }
                const html = `
          <!doctype html>
          <html>
            <head>
              <meta charset='utf-8'/>
            </head>
            <body>
              ${result}
            </body>
          </html>`;
                res.end(html);

            } else {
                const ext = path.extname(realPath); // 获取文件拓展名
                const contentType = mime.contentType(ext) || 'text/plain';
                res.setHeader('content-type', contentType);
                const raw = fs.createReadStream(realPath);
                res.writeHead(200, 'ok');
                raw.pipe(res);
            }
        } catch (error) {
            res.writeHead(404, 'ok');
            res.end(error.message)
        }
    });

    server.listen(port);
    console.log(`server is running at http://localhost:${port}`);
}
```

经过检验，我们访问文件夹、访问文件和访问不存在文件都正常的，我们第一版的文件服务器就完成了，但是目前存在着几个问题：

1. 样式十分的丑陋
2. 代码都写到了一起，十分难读
3. html使用字符串拼接，

所以我们做了一版升级版

### 4.2 升级版

我们做了这么几个设计

1. 支持引入内置的资源，使用iconfont优化我们的图标，使用自定义样式美化页面
2. 使用koa启动服务，使用koa的中间件处理逻辑，让代码更容易读
3. 使用ejs来作为页面渲染引擎，让html代码更容易维护和更新

我们的目录调整成这样

```
.
├── README.md
├── bin
│   └── index.js
├── src
│   ├── files
│   │   ├── style.css
│   │   ├── favicon.ico
│   │   └── font 
│   ├── middleware
│   ├── utils
│   └── index.js
└── package.json
```

在src文件夹下：

files是我们内置的资源文件，包括iconfont下载的资源和我们自己写的样式和ico文件

middleware是我们即将编写的中间件

utils是我们的一些工具方法

index.js是我们的入口文件

我们先安装必要的npm包

```npm i koa ejs```

修改src/index.js

```javascript
module.exports = function start(options) {
  const Koa = require('koa');
  const app = new Koa();

  app.listen(options.port);
  console.log(`server is running at http://localhost:${options.port}`);
}
```

服务启动成功，但是访问异常

接着开始编写我们的中间件

中间件我们按下面的思路来开发

1. 处理路由，先检查是请求内置的资源还是当前文件夹的路径，拿到本次请求的本地的路径，检查是文件还是文件夹
2. 如果是文件夹，读取文件列表，拿到文件列表里每个文件对应的类型，渲染模板
3. 如果是文件，照旧返回文件即可

#### 4.2.1 我们先开发处理路由的中间件

对于内置文件，我们加一个随机生成的长字符串前缀，也可以自定义英文或者别的方式，我们采用网上随机生成的一串字符作为内置资源的路由，当访问的是这个路由的时候，就把物理路径打到我们内置的文件夹里

```javascript
const parseUrl = require('./middleware/parseUrl');
......
// 在start方法里
const randomHash = 'G4PvheR!bGvL498sJ&TGRdfB8gWXGt1e';
options.randomHash = randomHash;
app.use(parseUrl(options));
```

parseUrl.js 实现如下：

```javascript
const url = require('url');
const isFolder = require('../utils/isFolder.js');
const getRealPath = require('../utils/getRealPath.js');
module.exports = function (options) {
    return async function (ctx, next) {
        ctx.randomHash = options.randomHash;
        ctx.rootDir = options.rootDir;
        const reqUrl = decodeURIComponent(ctx.url); // 中文解码
        console.log(`request ${reqUrl}`);
        const reqObj = url.parse(reqUrl);

        ctx.realPath = getRealPath(reqObj.pathname, ctx.rootDir, ctx.randomHash);
        ctx.isDirectory = await isFolder(ctx.realPath);
        await next();
    }
}
```

其中，getRealPath是根据路由判断是访问内置的文件夹还是当前文件夹

```javascript
const path = require('path');
module.exports = (pathname, rootDir, randomHash) => {
    let realPath;
    if (pathname.includes(randomHash)) {
        realPath = path.join(__dirname, "../files", pathname.replace(`/${randomHash}`, ''))
    } else {
        realPath = path.join(rootDir, pathname); // 获取物理路径
    }
    return realPath;
}
```

isFolder方法就是判断路径是否是文件夹

```javascript
const fs = require('fs');
module.exports = realPath => {
    return new Promise((resolve, reject) => {
        fs.stat(realPath, (err, stats) => {
            if (err) {
                reject(err);
            } else {
                resolve(stats.isDirectory());
            }
        });
    });
}
```

**经过parseUrl中间件后，我们可以得到访问的文件的物理路径和他是否是文件夹**

#### 4.2.2 开发处理文件中间件

处理文件相对简单，只要读取文件将文件返回即可

```javascript
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

module.exports = async function (ctx, next) {
    if (!ctx.isDirectory) {
        let ext = path.extname(ctx.realPath); // 获取文件拓展名
        const contentType = mime.contentType(ext) || 'text/plain';
        ctx.type = contentType;
        ctx.body = fs.createReadStream(ctx.realPath);
    } else {
        await next();
    }
}
```

在index.js里加上代码

```javascript
const handleFile = require('./middleware/handleFile');
......
app.use(handleFile);
```

#### 4.2.3 开发处理文件夹的中间件

处理文件夹相对复杂一点，首先我们需要开发ejs模板，读取文件夹下的文件列表，渲染模板将模板返回

**先开发模板**

在src文件夹下新增templates文件夹，新增folder.html，即是我们访问文件夹时要返回的html模板，模板里会引入我们的样式文件和iconfont

```ejs
<!DOCTYPE html>
<html>
    <head>
        <meta charset='utf-8'/>
        <title><%= title %></title>
        <link rel="shortcut icon " type="images/x-icon" href="/<%= randomHash %>/favicon.ico">
        <link href="/<%= randomHash %>/style.css" rel="stylesheet" type="text/css" />
        <link href="/<%= randomHash %>/font/iconfont.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
        <ul class="file-list">
            <% files.forEach(function(file){ %>
              <li>
                  <a class="link <%= file.icon %>" href="<%= file.url %>">
                      <i class="iconfont icon-<%= file.icon %>"></i> 
                      <%= file.name %>
                    </a>
              </li>
            <% }); %>
          </ul>
    </body>
</html>
```

开发render方法渲染，我们可以以utils的方法暴露出去，也可以编写中间件，这里我们以中间件的形式编写

```javascript
const ejs = require('ejs');
module.exports = async (ctx, next) => {
    ctx.render = function (template, data) {
        ejs.renderFile(template, {
            ...data,
            randomHash: ctx.randomHash,
        }, {}, function (err, str) {
            if (err) {
                throw err;
            }
            ctx.type = 'text/html';
            ctx.body = str;
        });
    }
    await next();
}
```

```javascript
const render = require('./middleware/render');
......
app.use(render);
```

开发handleFolder中间件，实现返回文件夹的方法，handleFolder主要实现的功能是：

1、读取文件夹下的所有文件

2、处理文件列表，对每个文件做处理：

​	2.1、拼接该文件的url

​	2.1、获取该url对应的物理路径，判断是否是文件夹

​	2.3、获取该类型的文件对应的图标的类名，图标是使用iconfont

​	2.4、渲染html，返回

```javascript
const path = require('path');
const getRealPath = require('../utils/getRealPath.js');
const isFolder = require('../utils/isFolder.js');
const getIcon = require('../utils/getIcon.js');
const fse = require('fs-extra');

module.exports = async function (ctx, next) {
  if (ctx.isDirectory) {
    const files = await fse.readdir(ctx.realPath);
    const pathname = ctx.url !== '/' ? decodeURIComponent(ctx.url) : '';
    const result = [];
    for (const file of files) {
      try {
        const url = `${pathname}/${file}`;
        const realPath = await getRealPath(url, ctx.rootDir, ctx.randomHash);
        const folderFlag = await isFolder(realPath);
        let icon = getIcon(realPath, folderFlag);
        if (file.startsWith('.')) {
          icon += ' hidden-file'
        }
        result.push({
          url,
          name: file,
          icon,
        })
      } catch (error) {
        console.log(error);
      }
    }
    ctx.render(path.join(__dirname, '../template/folder.html'), {
      title: pathname,
      files: result,
    });

  } else {
    await next();
  }
}
```

```javascript
const handleFolder = require('./middleware/handleFolder');
......
app.use(handleFolder);
```

此时，我们的开发基本完成，启动我们的命令行工具，返回文件和文件夹都是正常的

![image-20220110120003461](/Users/didi/Library/Application Support/typora-user-images/image-20220110120003461.png)



#### 4.2.4 错误处理和其他

我们发现几个问题

1、访问文件的时候，因为是浏览器打开，浏览器会默认访问/favicon.ico，但是没有对应的物理路径，所以会报错，需要单独处理/favicon.ico

2、默认的错误页面比较丑，我们想做一些优化

编写handleIco.js中间件，编写handleError中间件

```javascript
module.exports = function(randomHash) {
    return async function (ctx, next) {
        if (ctx.url === '/favicon.ico') {
            ctx.url = `/${randomHash}/file.ico`;
        }
        await next();
    }
}
```

```javascript
const path = require('path')
module.exports = async function (ctx, next) {
    try {
        await next();
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.render(path.join(__dirname, '../template/error.html'), {
            message: err.message
        });
    }
}
```

注意调整一下中间件的顺序

```javascript
app.use(render);
app.use(handleError);
app.use(handleIco(randomHash));
app.use(parseUrl(options));
app.use(handleFile);
app.use(handleFolder);
```

## 5. Vite的思考

最近在学习vite的源码，官方介绍如下

- A dev server that serves your source files over [native ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), with [rich built-in features](https://vitejs.dev/guide/features.html) and astonishingly fast [Hot Module Replacement (HMR)](https://vitejs.dev/guide/features.html#hot-module-replacement).
- A [build command](https://vitejs.dev/guide/build.html) that bundles your code with [Rollup](https://rollupjs.org/), pre-configured to output highly optimized static assets for production.

### 5.1 vite开发环境源码略读

开发环境是使用原生的es module丰富的内置功能来实现的

生成环境是使用的rollup编译的你的代码

简单看了一下开发环境的源码，和我写的文件服务有一些类似的地方，我也开发了一个很简陋的vite，主要还是以学习为主

**先简单介绍一下我阅读vite源码的过程：**

我们先克隆vite的源码，git仓库地址如下：https://github.com/vitejs/vite

克隆之后，看到packages文件夹，里面是官方的各个npm包，我们看vite文件夹，就是vite的源码

我们看package.json，里面的bin

```
"bin": {
	"vite": "bin/vite.js"
},
```

打开**packages/vite/bin/vite.js**就是我们的入口文件

代码里最核心的就是start方法

```
function start() {
  require('../dist/node/cli')
}
```

这里是dist目录，源码应该是在src/node/cli里，我们找到对应的文件，是ts文件

打开**packages/vite/src/node/cli.ts**

这个文件声明了各个环境的启动，有dev、build、preview等，具体细节不用深究，我们目前只看开发环境

在开发环境里，最核心的就是创建了一个server

```
const { createServer } = await import('./server')
const server = await createServer({
    root,
    base: options.base,
    mode: options.mode,
    configFile: options.config,
    logLevel: options.logLevel,
    clearScreen: options.clearScreen,
    server: cleanOptions(options)	
})
```

打开**packages/vite/src/node/server/index.ts**，找到createServer方法

createServer主要做了这么几件事：

1. 获取配置

2. 启动服务

3. 创建文件监听器，监听文件的change、add、remove等做不同的操作

4. 使用中间件，如跨域中间件、proxy中间件等，所有中间件都在**packages/vite/src/node/server/middlewares**这个文件夹下面，处理核心逻辑中间件是**transformMiddleware**

打开**packages/vite/src/node/server/middlewares/transform.ts**，看transformMiddleware的实现

transformMiddleware方法里，我们看到

```
if (
    isJSRequest(url) ||
    isImportRequest(url) ||
    isCSSRequest(url) ||
    isHTMLProxy(url)
)
```

处理我们前端核心是transformRequest的调用

打开**packages/vite/src/node/server/transformRequest.ts**，找到transformRequest方法

**真正处理各种文件的逻辑在doTransform这个方法里**，主要做了这几件事

1. 一些缓存判断

2. 调用所有插件的load方法，如果load方法没有返回值，直接fs.readFile读取文件内容，拿到原文件内容
3. 调用所有插件的transform方法，如处理js文件里的import等

所有的内置插件，我们可以在**packages/vite/src/node/plugins**这个文件夹下看到



**vite的简易流程大致如上，我们根据上面的流程，自己开发一个简易的vite**

### 5.2 开发一个简易版的vite

#### 5.2.1 创建一个空项目

```bash
mkdir customvite-vue-demo
cd customvite-vue-demo
npm init -y
npm i vue@3
```

把使用vite创建的项目里的src、index.html和public文件夹复制过来

我们按照上面的教程，创建一个空的命令行项目，我们的项目名叫my-vite，link到全局

修改customvite-vue-demo项目的package.json

```
...
"devDependencies": {
    "my-vite": "0.0.1"
}
...
"scripts": {
    "dev": "my-vite"
},
```

再执行npm link my-vite，执行npm run dev，看到打印出我们的测试代码，说明我们的项目初始化完成

接下来开始开发我们的简易版vite，我们主要开发我们的my-vite项目，使得在customvite-vue-demo项目里执行```npm run dev```的时候，成功把项目启动

#### 5.2.2 开始开发

我们在开发之前，先把需要实现的功能理清楚：

1. 使用koa启动一个文件服务，当前路径作为根目录
2. 开发针对js请求的中间件
3. 开发其他资源处理的中间件

开发js请求的中间件的时候，调用我们编写的一些插件

我们目前只考虑vue文件和import node_modules文件的转换

