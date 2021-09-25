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