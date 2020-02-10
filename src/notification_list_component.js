import Component from './base/component.js';
import NotificationComponent from './notification_component.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import { addDataStoreListener } from './base/data_store.js';

export default class NotificationListComponent extends Component {
  constructor(dataStore, communicationEndpoint) {
    super({
      notifications: [],
    });
    this._data = dataStore;
    this._comm = communicationEndpoint;

    addDataStoreListener(this._data, (key, value) => {
      if (key === 'notifications') {
        this._setVariable('notifications', value);
      }
    });
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
      },
      children: mapVariables(
        [this._variables.notifications],
        notifications => notifications.map(notification => ({
          type: NotificationComponent,
          kind: notification.type,
          title: notification.summary,
          description: notification.details,
          onClick: () => {
            this._comm.publish({
              type: 'dismiss-notification',
              notificationId: notification.id,
            });
          },
          style: {
            marginBottom: '0.5em',
          },
        }))
      ),
    });
  }
}