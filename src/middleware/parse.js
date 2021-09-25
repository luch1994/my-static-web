const url = require('url');
const isFolder = require('../utils/isFolder.js');
const getRealPath = require('../utils/getRealPath.js');
module.exports = function (options) {
    return async function (ctx, next) {
        ctx.randomHash = options.randomHash;
        ctx.rootDir = options.rootDir;
        const reqUrl = decodeURIComponent(ctx.url); // 中文解码
        if (options.log) {
            console.log(`request ${reqUrl}`)
        }
        const reqObj = url.parse(reqUrl);

        ctx.realPath = getRealPath(reqObj.pathname, ctx.rootDir, ctx.randomHash);
        ctx.isDirectory = await isFolder(ctx.realPath);
        await next();
    }
}