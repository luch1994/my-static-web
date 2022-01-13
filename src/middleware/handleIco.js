module.exports = function(randomHash) {
    return async function (ctx, next) {
        if (ctx.url === '/favicon.ico') {
            ctx.url = `/${randomHash}/file.ico`;
        }
        await next();
    }
}