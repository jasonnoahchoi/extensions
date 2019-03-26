import React from 'react';

import {formatDate} from './utils.js';

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeline: null
    };
  }
  componentDidMount() {
    this.setState({
      timeline: new gapi.analytics.googleCharts.DataChart({
        reportType: 'ga',
        chart: {
          type: 'LINE',
          container: this.timeline,
          options: {
            width: '100%',
            backgroundColor: '#f7f9fa'
          }
        }
      })
    });
  }
  render() {
    const { range, dimension, pagePath } = this.props;
    const { viewId } = this.props.parameters;
    if (this.state.timeline) {
      this.state.timeline
        .set({
          query: {
            ...{
              ids: viewId,
              dimensions: `ga:${dimension}`,
              metrics: 'ga:sessions',
              filters: `ga:pagePath==${pagePath}`
            },
            'start-date': formatDate(range.start),
            'end-date': formatDate(range.end)
          }
        })
        .execute();
    }

    return (<div ref={c => (this.timeline = c)} />);
  }
}

export {Timeline};