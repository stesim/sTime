import DailyTrackerComponent from './daily_tracker_component.js';
import CommunicationChannel from './base/communication_channel.js';
import AppController from './app_controller.js';
import DebugMenuComponent from './debug_menu_component.js';
import dataStore from './app_data_store.js';
import NotificationListComponent from './notification_list_component.js';

const communicationChannel = new CommunicationChannel();
const appController = new AppController(
  dataStore,
  communicationChannel.endpoint1,
);

const dailyTracker = new DailyTrackerComponent(
  dataStore.app,
  communicationChannel.endpoint2,
  new DebugMenuComponent(dataStore.sys, communicationChannel.endpoint2),
  new NotificationListComponent(dataStore.sys, communicationChannel.endpoint2),
);
document.body.appendChild(dailyTracker.$render());

window.sTime = {
  dataStore,
  communicationChannel,
  appController,
  dailyTracker,
};
