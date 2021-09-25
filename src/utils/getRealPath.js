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