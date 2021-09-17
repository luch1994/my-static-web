const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

module.exports = function start(port = 3000, rootDir) {
  const IS_OPEN_CACHE = false; // 是否开启缓存功能
  const CACHE_TIME = 10;// 告诉浏览器多少时间内可以不用请求服务器，单位：秒
  const server = http.createServer(async (req, res) => {
    let reqUrl = decodeURIComponent(req.url); // 中文解码
    const reqObj = url.parse(reqUrl);
    const realPath = path.join(rootDir, reqObj.pathname); // 获取物理路径
    try {
      const stats = await new Promise((resolve, reject) => {
        fs.stat(realPath, (err, stats) => {
          if (err) {
            reject(err);
          } else {
            resolve(stats);
          }
        });
      });

      if (stats.isDirectory()) {
        await handleDir(req, res, realPath, reqObj.pathname);
      } else {
        await handleFile(req, res, realPath, reqObj.pathname);
      }

    } catch (error) {
      console.error(error);
      res.statusCode = 404;
      res.setHeader('content-type', 'text/html');
      res.write('path not found ' + JSON.stringify(error), 'utf-8');
      res.end();
    }

  });
  server.listen(port);
  console.log(`server is running at http://localhost:${port}`);
}



async function handleDir(req, res, realPath, pathname) {
  const files = await new Promise((resolve, reject) => {
    fs.readdir(realPath, {
      encoding: 'utf-8'
    }, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
  let result = '';
  pathname = pathname !== '/' ? pathname : '';
  for (let i = 0; i < files.length; i++) {
    result += `<a href="${pathname}/${files[i]}">${files[i]}</a><br/>`;
  }
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset='utf-8'/>
        <title>${pathname}</title>
      </head>
      <body>
        ${result}
      </body>
    </html>`;
  res.statusCode = 200;
  res.setHeader('content-type', 'text/html');
  res.end(html);
}



async function handleFile(req, res, realPath, pathname) {
  let ext = path.extname(realPath).slice(1); // 获取文件拓展名
  const contentType = mime.getType(ext) || 'text/plain';
  res.setHeader('content-type', contentType + ';charset=utf-8');
  let raw = fs.createReadStream(realPath, {
    encoding: 'utf-8'
  });
  res.writeHead(200, 'ok');
  raw.pipe(res);
}


