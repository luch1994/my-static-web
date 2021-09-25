const path = require('path');
const getRealPath = require('../utils/getRealPath.js');
const isFolder = require('../utils/isFolder.js');
const getIcon = require('../utils/getIcon.js');
const getFolderFiles = require('../utils/getFolderFiles.js');

module.exports = async function (ctx, next) {
  if (ctx.isDirectory) {
    const files = await getFolderFiles(ctx.realPath);
    const pathname = ctx.url !== '/' ? ctx.url : '';
    const result = [];
    for(const file of files) {
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
    }
    ctx.render(path.join(__dirname, '../template/folder.html'), {
      title: pathname,
      files: result,
    });

  } else {
    await next();
  }
}
