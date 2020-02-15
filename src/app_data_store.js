import { createDataStore } from './pwa-base/data_store.js';

const dataModel = createDataStore('sTime', {
  sys: {
    version: 1,
    initTime: Date.now(),
    updateWaiting: false,
    settings: {
      jira: {
        url: '',
        authorization: '',
        defaultIssueKeyPrefix: '',
      },
    },
    notifications: [],
  },
  app: {
    tasks: [],
    taskSwitches: [],
  }
});

export default dataModel;
