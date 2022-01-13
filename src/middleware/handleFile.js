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
