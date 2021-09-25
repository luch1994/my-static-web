const fs = require('fs');
const path = require('path');
const mime = require('mime');

module.exports = async function (ctx, next) {
    let ext = path.extname(ctx.realPath).slice(1); // 获取文件拓展名
    let contentType = mime.getType(ext) || 'text/plain';
    const option = {};
    if (contentType.startsWith('text')) {
        contentType += ';charset=utf-8';
        option.encoding = 'utf-8';
    }
    ctx.type = contentType;
    ctx.body = fs.createReadStream(ctx.realPath, option);
}
