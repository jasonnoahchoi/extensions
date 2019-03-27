const channelName = (prefix, entrySys) => [
  prefix,
  entrySys.space.sys.id,
  entrySys.environment.sys.id,
  entrySys.id,
].join('!');

export default async function createPubNubClient({
  PubNub,
  publishKey,
  subscribeKey,
  channelPrefix,
  entrySys,
  onChange,
}) {
  const pubnub = new PubNub({ publishKey, subscribeKey, ssl: true });
  const channel = channelName(channelPrefix, entrySys);
  const state = { log: [] };

  function addToLog({ entry, timetoken }) {
    const validEntry = entry && typeof entry.id === 'string';
    const validTimetoken = typeof timetoken === 'string';
    const newEntry = !state.log.find(cur => cur.id === entry.id);


    if (validEntry && validTimetoken && newEntry) {
      // Timetoken is a 17-digit precision unix time (UTC)
      const t = parseInt(timetoken, 10) / 10000;
      const item = { ...entry, t };
      state.log = state.log.concat([item]);
      state.log.sort((a, b) => b.t - a.t);
      return true;
    }
    return false;
  }

  function getHistory() {
    return new Promise((resolve, reject) => {
      pubnub.history({
        channel,
        count: 25,
        stringifiedTimeToken: true,
      }, (status, res) => {
        if (status && status.error) {
          reject(new Error('Failed to get channel history.'));
        } else {
          resolve(res);
        }
      });
    });
  }

  function publish(message) {
    return new Promise((resolve, reject) => {
      pubnub.publish({ channel, message }, (status, res) => {
        if (status && status.error) {
          reject(new Error('Failed to publish a message.'));
        } else {
          resolve(res);
        }
      });
    });
  }

  // Prepopulate the log with history.
  const { messages } = await getHistory();
  messages.forEach(addToLog);

  // Add more messages as they come.
  pubnub.addListener({
    message: ({ message, timetoken }) => {
      const wasAdded = addToLog({ entry: message, timetoken });
      if (wasAdded) {
        onChange(state.log);
      }
    },
  });
  pubnub.subscribe({ channels: [channel] });

  return {
    log: state.log,
    publish,
    disconnect: () => pubnub.unsubscribe({ channels: [channel] }),
  };
}
