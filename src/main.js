import DailyTrackerComponent from './daily_tracker_component.js';
import { createDataModel } from './base/data_model.js';
import CommunicationChannel from './base/communication_channel.js';
import DomainController from './domain_controller.js';

window.dataModel = createDataModel('sTime', {
  system: {
    version: 1,
    initTime: Date.now(),
  },
  app: {
    tasks: [],
  }
});
const communicationChannel = new CommunicationChannel();
window.domainController = new DomainController(dataModel, communicationChannel.endpoint1);

window.dailyTracker = new DailyTrackerComponent(dataModel.app, communicationChannel.endpoint2);
document.body.appendChild(window.dailyTracker.$render());
