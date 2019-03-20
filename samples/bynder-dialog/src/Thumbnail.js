import React from 'react';
import { Card, IconButton } from '@contentful/forma-36-react-components';

export default function Thumbnail({ src, onDeleteClick }) {
  return (
    <Card extraClassNames="thumbnail">
      <img width="150" height="150" src={src} />
      <IconButton
        onClick={onDeleteClick}
        extraClassNames="thumbnail-remove"
        iconProps={{ icon: 'Close' }}
        buttonType="muted"
      />
    </Card>
  );
}
