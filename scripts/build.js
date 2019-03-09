'use strict';

const Bundler = require('parcel-bundler');
const {readFile, writeFile} = require('fs').promises;
const path = require('path');
const makeDir = require('make-dir');

const {dirs} = require('./utils.js');

const BASE_DIR = path.join(__dirname, '..', 'marketplace');
const BUILD_DIR = path.join(__dirname, '..', 'dist');

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

const BASE_PARCEL_OPTIONS = {
  outFile: 'extension.html',
  target: 'browser',
  publicUrl: './',
  watch: false,
  minify: true,
  scopeHoist: true,
  sourceMaps: false
};

dirs(`${__dirname}/../marketplace`)
  .then(extensions => {
    return Promise.all(extensions.map(async extension => {
      const entryFile = path.join(BASE_DIR, extension, 'src', 'index.html');
      const manifest = await readExtensionManifest(extension);

      return {
        entryFile,
        name: extension,
        manifest
      };
    }));
  })
  .then(extensions => {
    return Promise.all(extensions.map(extension => {
      const extensionDir = `${extension.name}-${extension.manifest.majorVersion}`;
      const bundler = new Bundler(extension.entryFile, Object.assign({
        outDir: path.join(BUILD_DIR, extensionDir)
      }, BASE_PARCEL_OPTIONS));

      const newManifest = Object.assign({}, extension.manifest);

      delete newManifest.majorVersion;
      delete newManifest.srcdoc;

      newManifest.src = `https://${extensionDir}.contentfulexts.com/extension.html`;

      return Promise.all([
        writeExtensionManifest(extensionDir, newManifest),
        bundler.bundle()
      ]);
    }));
  })
  .catch(err => console.error(err));
