import Component from '../base/component.js';
import DailyTrackerComponent from './daily_tracker_component.js';
import DebugMenuComponent from './debug_menu_component.js';
import NotificationListComponent from './notification_list_component.js';

export default class AppRootComponent extends Component {
  constructor(dataStore, communicationEndpoint) {
    super();

    this._data = dataStore;
    this._comm = communicationEndpoint;
  }

  $render() {
    return new DailyTrackerComponent(
      this._data.app,
      this._comm,
      new DebugMenuComponent(
        this._data.sys,
        this._comm),
      new NotificationListComponent(
        this._data.sys,
        this._comm),
    ).$render();
  }
}