import { createDataModel } from './base/data_model.js';

const dataModel = createDataModel('sTime', {
  sys: {
    version: 1,
    initTime: Date.now(),
    updateWaiting: false,
  },
  app: {
    tasks: [],
    taskSwitches: [],
  }
});

export default dataModel;
