const path = require('path');
const getRealPath = require('../utils/getRealPath.js');
const isFolder = require('../utils/isFolder.js');
const getIcon = require('../utils/getIcon.js');
const fse = require('fs-extra');

module.exports = async function (ctx, next) {
  if (ctx.isDirectory) {
    const files = await fse.readdir(ctx.realPath);
    const pathname = ctx.url !== '/' ? decodeURIComponent(ctx.url) : '';
    const result = [];
    for (const file of files) {
      try {
        const url = `${pathname}/${file}`;
        const realPath = await getRealPath(url, ctx.rootDir, ctx.randomHash);
        const folderFlag = await isFolder(realPath);
        let icon = getIcon(realPath, folderFlag);
        if (file.startsWith('.')) {
          icon += ' hidden-file'
        }
        result.push({
          url,
          name: file,
          icon,
        })
      } catch (error) {
        console.log(error);
      }
    }
    ctx.render(path.join(__dirname, '../template/folder.html'), {
      title: pathname,
      files: result,
    });

  } else {
    await next();
  }
}
