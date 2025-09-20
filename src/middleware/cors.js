/**
 * CORS 跨域中间件
 * 支持跨域资源共享，允许前端应用访问静态文件服务器
 */
module.exports = async (ctx, next) => {
    // 设置CORS响应头
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    ctx.set('Access-Control-Max-Age', '86400'); // 预检请求缓存24小时
    
    // 处理预检请求
    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        ctx.body = '';
        return;
    }
    
    await next();
};

