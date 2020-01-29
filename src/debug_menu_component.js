import Component from './base/component.js';
import render from './base/render.js';
import Variable from './base/variable.js';
import { addDataModelListener } from './base/data_model.js';
import mapVariables from './base/map_variables.js';

export default class DebugMenuComponent extends Component {
  constructor(dataModel, communicationEndpoint) {
    super();
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this.closeAction = undefined;

    this._activateUpdateVisible = new Variable(this._data.updateWaiting);
    addDataModelListener(this._data, (key, value) => {
      if (key === 'updateWaiting') {
        this._activateUpdateVisible.value = value;
      }
    });
    this._actions = [{
      name: 'Activate update',
      action: () => this._comm.publish({type: 'activate-update'}),
      style: {
        display: mapVariables([this._activateUpdateVisible], () => {
          return (this._activateUpdateVisible.value ? '' : 'none');
        }),
      },
    }, {
      name: 'Restore from database',
      action: () => this._comm.publish({type: 'restore-from-database'}),
    }, {
      name: 'Clear database',
      action: () => this._comm.publish({type: 'clear-database'}),
    }, {
      name: 'Clear cache',
      action: () => this._comm.publish({type: 'clear-cache'}),
    }, {
      name: 'Close',
      action: () => this._close(),
    }];
  }

  _close() {
    if (this.closeAction) {
      this.closeAction();
    }
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      },
      onclick: () => {
        this._close();
      },
      children: this._actions.map((entry) => ({
        type: 'div',
        textContent: entry.name,
        onclick: (evt) => {
          entry.action();
          evt.stopPropagation();
        },
        style: {
          backgroundColor: '#775555',
          textAlign: 'center',
          padding: '1em',
          marginBottom: '0.5em',
          ...entry.style,
        },
      })),
    });
  }
}