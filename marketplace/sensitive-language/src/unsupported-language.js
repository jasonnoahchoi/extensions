import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Typography, Subheading, Paragraph } from '@contentful/forma-36-react-components';

export function UnsupportedLanguage({ localeCode, localeName }) {
  return (
    <Typography>
      <Subheading style={{ display: 'flex', alignItems: 'center' }}>
        <Icon icon="Warning" color="negative" extraClassNames="f36-margin-right--xs" />
        Unsupported language
      </Subheading>
      <Paragraph style={{ marginBottom: 0 }}>
        {`The sensitive language feature only works for English text. The default locale of this space is ${localeName} (${localeCode}).`}
      </Paragraph>
    </Typography>
  );
}

UnsupportedLanguage.propTypes = {
  localeCode: PropTypes.string.isRequired,
  localeName: PropTypes.string.isRequired
};
