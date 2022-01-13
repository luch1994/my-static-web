const path = require('path');
module.exports = function getIcon(realPath, isFolder) {
    if (isFolder) {
      return 'folder';
    }
    const ext = path.extname(realPath);
    switch(ext) {
      case ".js":
        return "javascript";
      case ".html":
        return 'html';
      case ".css":
        return "css";
      case ".jpg":
      case ".png":
      case ".gif":
        return "img";
      default:
        return "file";
    }
  }