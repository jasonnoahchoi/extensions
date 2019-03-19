'use strict';

const path = require('path');
const {readFile, writeFile} = require('fs').promises;
const program = require('commander');
const Bundler = require('parcel-bundler');
const {promisify} = require('util');
const makeDir = require('make-dir');
const execFile = promisify(require('child_process').execFile);

const BASE_DIR = path.join(__dirname, '..', 'marketplace');
const BUILD_DIR = path.join(__dirname, '..', 'dist');
const port = process.env.PORT || 1234;

const BASE_PARCEL_OPTIONS = {
  outFile: 'extension.html',
  target: 'browser',
  publicUrl: '/',
  watch: true,
  minify: false,
  scopeHoist: false,
  sourceMaps: true,
  contentHash: false,

  logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors
  hmr: true, // Enable or disable HMR while watching
  hmrPort: 54321, // The port the HMR socket runs on
  cache: true,
  hmrHostname: '', // A hostname for hot module reload, default to ''
  detailedReport: false,
  reload: false
};

async function readExtensionManifest (extension) {
  const filePath = path.join(BASE_DIR, extension, 'extension.json');

  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeExtensionManifest (extensionDir, manifest) {
  const outPutDir = path.join(BUILD_DIR, extensionDir);
  const filePath = path.join(outPutDir, 'extension.json');

  return makeDir(outPutDir)
    .then(() => writeFile(filePath, JSON.stringify(manifest), 'utf8'));
}

program
  .arguments('<extension>')
  .action(function (extension) {
    readExtensionManifest(extension)
      .then(manifest => {
        const newManifest = Object.assign({}, manifest);
        delete newManifest.majorVersion;

        newManifest.src = `http://localhost:${port}/extension.html`;

        const extensionDir = `${extension}-${manifest.majorVersion}`;

        return writeExtensionManifest(extensionDir, newManifest)
          .then(() => execFile('node_modules/.bin/contentful', [
            'extension',
            'update',
            '--descriptor',
            path.join(BUILD_DIR, extensionDir, 'extension.json'),
            '--force'
          ]))
          .then(() => extensionDir);
      })
      .then(extensionDir => {
        const entryFile = path.join(BASE_DIR, extension, 'src', 'index.html');
        const bundler = new Bundler(entryFile, Object.assign({
          outDir: path.join(BUILD_DIR, extensionDir)
        }, BASE_PARCEL_OPTIONS));

        return bundler.serve(port);
      })
      .catch(err => {
        console.error(err);
      });
  });

program.parse(process.argv);

if (program.args.length === 0) {
  console.error('no extension given!');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
