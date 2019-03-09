'use strict';

const React = require('react');
const renderer = require('react-test-renderer');

const {mockComponent} = require('./mock-component.js');

jest.mock('../src/unsupported-language.js', () => ({
  UnsupportedLanguage: mockComponent('unsupported-language')
}));
jest.mock('../src/language-checker.js', () => ({
  UnsupportedLanguage: mockComponent('language-checker')
}));

const {App} = require('../src/app.js');

test('App: bails out for non-english languages', function () {
  const extension = {
    locales: {
      default: 'de-DE',
      names: {
        'de-DE': 'German'
      }
    },
    window: {
      startAutoResizer() {}
    }
  };

  const tree = renderer
    .create(<App extension={extension} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
