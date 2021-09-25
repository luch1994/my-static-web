const fs = require('fs');
module.exports = function (realPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(realPath, {
        }, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}