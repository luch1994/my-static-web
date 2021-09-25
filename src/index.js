
const render = require('./middleware/render.js');
const handleError = require('./middleware/handleError.js');
const parse = require('./middleware/parse.js');
const handleFolder = require('./middleware/handleFolder.js');
const handleFile = require('./middleware/handleFile.js');

module.exports = function start(port = 3000, options) {
  const randomHash = 'G4PvheR!bGvL498sJ&TGRdfB8gWXGt1e';
  options.randomHash = randomHash;
  const Koa = require('koa');
  const app = new Koa();

  app.use(render);
  app.use(handleError);
  app.use(parse(options));
  app.use(handleFolder);
  app.use(handleFile);

  app.listen(port);
  console.log(`server is running at http://localhost:${port}`);

}
