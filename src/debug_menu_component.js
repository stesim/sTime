import Component from './base/component.js';
import render from './base/render.js';
import Variable from './base/variable.js';
import { addDataStoreListener } from './base/data_store.js';
import mapVariables from './base/map_variables.js';

export default class DebugMenuComponent extends Component {
  constructor(dataStore, communicationEndpoint) {
    super();
    this._data = dataStore;
    this._comm = communicationEndpoint;

    this.closeAction = undefined;

    this._activateUpdateVisible = new Variable(this._data.updateWaiting);
    addDataStoreListener(this._data, (key, value) => {
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
      name: 'Import task from JIRA',
      action: () => {
        const defaultKeyPrefix = this._data.settings.jira.defaultIssueKeyPrefix;
        const issueKey = prompt(
          `Enter issue key (e.g. ${defaultKeyPrefix || 'FOO'}-123)`,
          defaultKeyPrefix ? `${defaultKeyPrefix}-` : '');
        if (issueKey) {
          this._comm.publish({type: 'import-jira-issue', issueKey});
        }
      },
    }, {
      name: 'Configure JIRA access',
      action: () => {
        const prompts = {
          url: 'Enter JIRA server URL',
          userName: 'Enter JIRA login name (e-mail)',
          password: 'Enter JIRA password or API token',
          defaultIssueKeyPrefix: 'Enter default issue key prefix',
        };

        const defaults = {
          url: this._data.settings.jira.url,
          defaultIssueKeyPrefix: this._data.settings.jira.defaultIssueKeyPrefix,
        };

        let proceed = true;
        const config = {};
        for (const key in prompts) {
          const value = prompt(prompts[key], defaults[key] || '');
          if (value) {
            config[key] = value;
          } else {
            proceed = false;
            break;
          }
        }
        if (proceed) {
          this._comm.publish({type: 'configure-jira', ...config});
        }
      },
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