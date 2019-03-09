'use strict';

const React = require('react');
const renderer = require('react-test-renderer');

function mockComponent (componentClassName) {
  return ((props) => {
    const className = props.className ? `${componentClassName} ${props.className}` : componentClassName;

    return (<div className={className} {...props}>{props.children}</div>)
  });
}

jest.mock('@contentful/forma-36-react-components', () => ({
  Icon: mockComponent('icon'),
  Typography: mockComponent('typography'),
  Subheading: mockComponent('subheading'),
  Paragraph: mockComponent('paragraph')
}));

const {UnsupportedLanguage} = require('../src/unsupported-language.js');

test('UnsupportedLanguage: renders correctly', function () {
  const tree = renderer
  .create(<UnsupportedLanguage localeCode="de-De" localeName="German" />)
  .toJSON();
  expect(tree).toMatchSnapshot();
});
