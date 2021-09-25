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