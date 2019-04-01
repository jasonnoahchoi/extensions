'use strict';

const { readFile, writeFile, rename } = require('fs').promises;
const path = require('path');
const makeDir = require('make-dir');
const cpy = require('cpy');

const { dirs } = require('./utils.js');

const BASE_DIR = path.join(__dirname, '..', 'marketplace');
const BUILD_DIR = path.join(__dirname, '..', 'dist');

async function readExtensionManifest(extension) {
  const filePath = path.join(BASE_DIR, extension, 'extension.json');

  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeExtensionManifest(extensionDir, manifest) {
  const outPutDir = path.join(BUILD_DIR, extensionDir);
  const filePath = path.join(outPutDir, 'extension.json');

  return makeDir(outPutDir).then(() => writeFile(filePath, JSON.stringify(manifest), 'utf8'));
}

dirs(`${__dirname}/../marketplace`)
  .then(extensions => {
    return Promise.all(
      extensions.map(async extension => {
        const entryFile = path.join(BASE_DIR, extension, 'src', 'index.html');
        const manifest = await readExtensionManifest(extension);

        return {
          entryFile,
          name: extension,
          manifest
        };
      })
    );
  })
  .then(extensions => {
    return Promise.all(
      extensions.map(extension => {
        const extensionDir = `${extension.name}-${extension.manifest.majorVersion}`;

        const newManifest = Object.assign({}, extension.manifest);

        delete newManifest.majorVersion;
        delete newManifest.srcdoc;

        newManifest.src = `https://${extensionDir}.contentfulexts.com/extension.html`;

        return cpy(path.join(BASE_DIR, extension.name, 'build'), path.join(BUILD_DIR, extensionDir))
          .then(() => writeExtensionManifest(extensionDir, newManifest))
          .then(() =>
            rename(
              path.join(BUILD_DIR, extensionDir, 'index.html'),
              path.join(BUILD_DIR, extensionDir, 'extension.html')
            )
          );
      })
    );
  })
  .catch(err => console.error(err));
