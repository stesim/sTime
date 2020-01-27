import DailyTrackerComponent from './daily_tracker_component.js';
import CommunicationChannel from './base/communication_channel.js';
import DomainController from './domain_controller.js';
import DebugMenuComponent from './debug_menu_component.js';
import dataModel from './app_data_model.js';

window.dataModel = dataModel;

const communicationChannel = new CommunicationChannel();
const domainController = new DomainController(
  dataModel,
  communicationChannel.endpoint1);

const dailyTracker = new DailyTrackerComponent(
  dataModel.app,
  communicationChannel.endpoint2,
  new DebugMenuComponent(dataModel.sys, communicationChannel.endpoint2));
document.body.appendChild(dailyTracker.$render());

window.sTime = {
  dataModel,
  communicationChannel,
  domainController,
  dailyTracker,
}
