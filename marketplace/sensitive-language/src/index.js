import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  Icon,
  Typography,
  Subheading,
  SectionHeading,
  Paragraph
} from "@contentful/forma-36-react-components";
import './index.css';
import '@contentful/forma-36-react-components/dist/styles.css';
import "@contentful/forma-36-fcss/dist/styles.css";
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { init } from 'contentful-ui-extensions-sdk';
import alex from 'alex';
import {UnsupportedLanguage} from './unsupported-language.js';
import {NoIssues} from './no-issues.js';

const textFieldTypes = ['Symbol', 'Text', 'RichText'];

class LanguageChecker extends React.Component {
  constructor () {
    super();
    this.state = {messageMap: {}}
  }

  componentDidMount () {
    const {entry, fieldsToCheck} = this.props;

    fieldsToCheck.forEach(fieldDefinition => {
      const fieldId = fieldDefinition.id;
      const field = entry.fields[fieldId];
      const currentValue = field.getValue();
      const isRichText = fieldDefinition.type === 'RichText';

      if (currentValue) {
        const {messages} = isRichText
          ? alex.text(documentToPlainTextString(currentValue))
          : alex.markdown(currentValue);

        this.setState((state) => {
          const messageMap = state.messageMap;

          messageMap[fieldId] = messages;

          return {messageMap};
        });
      }

      field.onValueChanged(value => {
        const {messages} = isRichText
          ? alex.text(documentToPlainTextString(value))
          : alex.markdown(value);

        this.setState((state) => {
          const messageMap = state.messageMap;

          messageMap[fieldId] = messages;

          return {messageMap};
        });
      });
    })
  }

  render() {
    const messageEntries = Object.entries(this.state.messageMap);
    const {fieldsToCheck} = this.props;
    let messageCount = 0;

    messageEntries.forEach(([,messages]) => {
      messageCount += messages.length;
    });

    if (messageCount === 0) {
      return (<NoIssues />);
    }

    return (
      <React.Fragment>
        <Typography>
          <Subheading style={{ display: 'flex', alignItems: 'center' }}>
            <Icon
              icon='Warning'
              color='warning'
              extraClassNames='f36-margin-right--xs'
            />
            Issues found
          </Subheading>
          <Paragraph>
            There are some issues with the content in the following fields:
          </Paragraph>
        </Typography>
        {messageEntries.map(([fieldId, messages]) => {
          if (messages.length === 0) {
            return null;
          }

          const fieldDefiniton = fieldsToCheck.find(({ id }) => id === fieldId);

          return (
            <div key={fieldId}>
              <SectionHeading extraClassNames='f36-margin-bottom--m'>
                {fieldDefiniton.name}
              </SectionHeading>

              <ul className='warning-list f36-margin-bottom--m'>
                {messages.map((message, index) => {
                  return (
                    <li className='warning-list__item' key={index}>
                      <Icon
                        icon='Close'
                        color='negative'
                        extraClassNames='f36-margin-right--2xs'
                      />
                      <Paragraph
                        title={`Flagged by rule ID "${message.ruleId}". ${
                          message.note ? message.note : ""
                        }`}
                      >
                        {message.message}
                      </Paragraph>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </React.Fragment>
    )
  }
}

LanguageChecker.propTypes = {
  fieldsToCheck: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired
};

class App extends React.Component {
  componentDidMount() {
    this.props.extension.window.startAutoResizer();
  }

  render() {
    const {extension} = this.props;

    const defaultLocale = extension.locales.default;
    if (!defaultLocale.startsWith('en-')) {
      return <UnsupportedLanguage localeCode={defaultLocale} localeName={extension.locales.names[defaultLocale]} />
    }

    const textFields = extension.contentType.fields.filter(({type}) => textFieldTypes.includes(type));
    return (<LanguageChecker entry={extension.entry} fieldsToCheck={textFields} />);
  }
}

App.propTypes = {
  extension: PropTypes.object.isRequired
};

init(extension => {
  const root = document.getElementById('root');

  ReactDOM.render(<App extension={extension} />, root);
});
