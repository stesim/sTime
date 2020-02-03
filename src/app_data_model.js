import { createDataModel } from './base/data_model.js';

const dataModel = createDataModel('sTime', {
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
