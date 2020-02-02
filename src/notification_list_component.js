import Component from './base/component.js';
import NotificationComponent from './notification_component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import { addDataModelListener } from './base/data_model.js';

export default class NotificationListComponent extends Component {
  constructor(dataModel, communicationEndpoint) {
    super();
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this._notifications = new Variable([]);

    addDataModelListener(this._data, (key, value) => {
      if (key === 'notifications') {
        this._notifications.value = value;
      }
    });
  }

  get notifications() {
    return this._notifications.value;
  }

  set notifications(value) {
    this._notifications.value = value;
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
      },
      children: mapVariables([this._notifications], notifications => notifications.map(notification => ({
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
      }))),
    });
  }
}