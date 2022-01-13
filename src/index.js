const parseUrl = require('./middleware/parseUrl');
const handleFile = require('./middleware/handleFile');
const render = require('./middleware/render');
const handleFolder = require('./middleware/handleFolder');
const handleError = require('./middleware/handleError');
const handleIco = require('./middleware/handleIco');

module.exports = function start(options) {
    const Koa = require('koa');
    const app = new Koa();

    const randomHash = 'G4PvheR!bGvL498sJ&TGRdfB8gWXGt1e';
    options.randomHash = randomHash;

    app.use(render);
    app.use(handleError);
    app.use(handleIco(randomHash));
    app.use(parseUrl(options));
    app.use(handleFile);
    app.use(handleFolder);

    app.listen(options.port);
    console.log(`server is running at http://localhost:${options.port}`);
}
