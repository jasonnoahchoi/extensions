import React from 'react';
import PropTypes from 'prop-types';

import {Timeline} from './timeline.js';
import {formatDate} from './utils.js';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const TODAY = new Date();
const TIMELINE_DIMENSIONS = [
  { label: 'Day', value: 'date' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
];
const CLIENT_ID = '318721834234-s3td95ohvub1bkksn3aicimnltvmtts8.apps.googleusercontent.com';

class App extends React.Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    parameters: PropTypes.object.isRequired,
    entry: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const {auth, parameters, entry} = props;
    const {prefix, slugId} = parameters;
    const hasSlug = slugId in entry.fields;

    const pagePath = hasSlug ? `/${prefix ? `${prefix}/` : ''}${entry.fields[slugId].getValue()}/` : '';
    this.state = {
      isAuthorized: false,
      hasSlug,
      range: {
        start: new Date(TODAY - DAY_IN_MS * 14),
        end: TODAY
      },
      dimension: 'date',
      pagePath
    };
    auth.on('signIn', () => this.setState({ isAuthorized: true }));
    auth.on('signOut', () => this.setState({ isAuthorized: false }));
    auth.authorize({
      container: 'auth-button',
      clientid: CLIENT_ID
    });
  }

  handleDateChange({ target }) {
    const { range } = this.state;
    range[target.name] = target.valueAsDate;
    this.setState({
      range
    });
  }

  handleDimensionChange({ target }) {
    this.setState({
      dimension: target.value
    });
  }

  render() {
    const { range, dimension, isAuthorized, pagePath, hasSlug } = this.state;
    const { auth, entry, parameters } = this.props;
    if (!isAuthorized) {
      return (<p>Not logged in</p>);
    }

    if (!hasSlug) {
      return (<p>Slug field is not correctly defined.</p>);
    }

    if (!entry.getSys().publishedAt) {
      return (<p>Nothing to analyze... entry is not published.</p>);
    }

    return (
      <section>
        <div className="range">
          <label>
            From
            <input
              name="start"
              type="date"
              onChange={this.handleDateChange.bind(this)}
              value={formatDate(range.start)}
            />
          </label>
          <label>
            To
            <input
              name="end"
              type="date"
              onChange={this.handleDateChange.bind(this)}
              value={formatDate(range.end)}
              max={formatDate(TODAY)}
            />
          </label>
        </div>
        <div className="dimensions">
          {TIMELINE_DIMENSIONS.map(dimension => {
              const isActive = dimension.value === this.state.dimension;
              return (<label className={isActive ? 'is-active' : ''}>
                {dimension.label}
                <input
                  type="radio"
                  name="dimension"
                  value={dimension.value}
                  onChange={this.handleDimensionChange.bind(this)}
                  checked={isActive}
                />
              </label>);
            })}
        </div>
        <Timeline
          pagePath={pagePath}
          range={range}
          dimension={dimension}
          parameters={parameters}
        />
        <div className="info">
          <svg
            fill="#2D2F31"
            width="100pt"
            height="100pt"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 9.617c22.27 0 40.383 18.117 40.383 40.383 0 22.27-18.117 40.383-40.383 40.383C27.73 90.383 9.617 72.27 9.617 50S27.73 9.617 50 9.617m0-7.695C23.461 1.922 1.922 23.46 1.922 50S23.461 98.078 50 98.078 98.078 76.538 98.078 50 76.539 1.922 50 1.922z"
            />
            <path
              d="M54.617 74.039h-9.234v-26.73h9.234zM57.117 31.27c0 3.93-3.188 7.113-7.117 7.113a7.116 7.116 0 1 1 0-14.23 7.119 7.119 0 0 1 7.117 7.117"
            />
          </svg>
          {pagePath}
        </div>
        <div className="signout">
          <button type="button" onClick={() => auth.signOut()}>
            sign out
          </button>
        </div>
      </section>
    );
  }
}

export {App};