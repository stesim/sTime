import AppDataSaver from './app_data_saver.js';

export default class AppController {
  constructor(dataStore, appChannel, uiChannel) {
    this._data = dataStore;
    this._appComm = appChannel;
    this._appComm.subscribe(message => this._handleAppMessage(message));
    this._uiComm = uiChannel;
    this._uiComm.subscribe(message => this._handleUiMessage(message));

    this._dataSaver = new AppDataSaver(this._data);

    this._supportedUiMessages = {
      'activate-update'       : (message) => this._activateUpdate(),
      'add-task'              : (message) => this._addTask(message.taskName),
      'clear-active-task'     : (message) => this._clearActiveTask(),
      'clear-cache'           : (message) => this._clearCache(),
      'clear-database'        : (message) => this._clearDatabase(),
      'configure-jira'        : (message) => this._configureJira(message.url, message.userName, message.password, message.defaultIssueKeyPrefix),
      'dismiss-notification'  : (message) => this._dismissNotification(message.notificationId),
      'import-jira-issue'     : (message) => this._importJiraIssue(message.issueKey),
      'rename-task'           : (message) => this._renameTask(message.taskId, message.taskName),
      'restore-from-database' : (message) => this._restoreFromDatabase(),
      'set-active-task'       : (message) => this._addTaskSwitch(message.taskId),
    };
  }

  _handleAppMessage(message) {
    if (message.type === 'update-available') {
      this._data.sys.updateWaiting = true;

      this._addNotification({
        type: 'default',
        summary: 'Update available',
        details: 'Apply from the debug menu.',
      });
    }
  }

  _handleUiMessage(message) {
    const action = this._supportedUiMessages[message.type];
    if (action !== undefined) {
      action(message);
    } else {
      alert('Controller received unsupported message:' + message)
    }
  }

  _addNotification(notification) {
    notification.id = this._generateNotificationId();
    this._data.sys.notifications = [
      ...this._data.sys.notifications, {
        ...notification,
        timestamp: Date.now(),
      },
    ];
  }

  _generateNotificationId() {
    const notifications = this._data.sys.notifications;
    let generatedId;
    do {
      generatedId = Math.floor(Math.random() * 2**32);
    } while (notifications.some(existing => (existing.id === generatedId)));
    return generatedId;
  }

  _activateUpdate() {
    this._appComm.publish({type: 'activate-update'});
  }

  _addTask(name) {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      this._addNotification({
        type: 'error',
        summary: 'Task creation failed',
        details: 'Task name must not be empty.',
      });
      return;
    }

    const task = {
      name: trimmedName,
      creationTime: Date.now(),
    };

    this._dataSaver.addTask(task).then(() => {
      const newTask = this._data.app.tasks[this._data.app.tasks.length - 1];
      this._addTaskSwitch(
        newTask.id,
        newTask.creationTime,
      );
    });
  }

  _clearActiveTask() {
    this._addTaskSwitch(null);
  }

  _clearCache() {
    this._appComm.publish({type: 'clear-cache'});
  }

  _clearDatabase() {
    this._dataSaver.clearAll();
  }

  _restoreFromDatabase() {
    this._dataSaver.restore().then(() => {
      this._addNotification({
        type: 'affirm',
        summary: 'Data restored',
        details: 'Data has been restored from the database.',
      });
    }).catch((error) => {
      this._addNotification({
        type: 'error',
        summary: 'Data restoration failed',
        details: error.message,
      });
    });
  }

  _configureJira(url, userName, password, defaultIssueKeyPrefix) {
    if (!atob) {
      return;
    }

    const authorization = btoa(`${userName}:${password}`);
    const settings = {url, authorization, defaultIssueKeyPrefix};
    return this._dataSaver.updateSettings('jira', settings)
      .then(() => this._sendJiraRequest(`search?maxResults=0`))
      .then(() => {
        this._addNotification({
          type: 'affirm',
          summary: 'JIRA configured',
          details: `Configured access for JIRA instance: ${this._data.sys.settings.jira.url}`,
        });
      })
      .catch(error => this._addNotification({
        type: 'error',
        summary: 'JIRA configuration failed',
        details: error.message,
      }));
  }

  _sendJiraRequest(restResource) {
    const jiraSettings = this._data.sys.settings.jira;
    if (jiraSettings.url && jiraSettings.authorization) {
      const requestUrl = `${jiraSettings.url}/rest/api/latest/${restResource}`;
      const requestOptions = {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Authorization': `Basic ${jiraSettings.authorization}`,
        },
      };
      return fetch(requestUrl, requestOptions)
        .then(response => response.text())
        .then(responseText => {
          const responseJson = JSON.parse(responseText);
          if (Array.isArray(responseJson.errorMessages)) {
            throw new Error(`JIRA error: ${responseJson.errorMessages[0]}`);
          }
          return responseJson;
        });
    } else {
      return Promise.reject(new Error('Access to JIRA instance is not configured properly.'));
    }
  }

  _dismissNotification(id) {
    this._data.sys.notifications =
      this._data.sys.notifications.filter(notification => (notification.id !== id));
  }

  _importJiraIssue(issueKey) {
    return this._sendJiraRequest(`issue/${issueKey}`)
      .then((responseJson) => {
        this._addTask(`${issueKey}: ${responseJson.fields.summary}`);
      })
      .catch(error => this._addNotification({
        type: 'error',
        summary: 'JIRA issue import failed',
        details: error.message,
      }));
  }

  get _latestSwitch() {
    if (this._data.app.taskSwitches.length > 0) {
      return this._data.app.taskSwitches[this._data.app.taskSwitches.length - 1];
    } else {
      return null;
    }
  }

  _addTaskSwitch(taskId, time = Date.now()) {
    const latestSwitch = this._latestSwitch;
    if (latestSwitch !== null &&
        taskId === latestSwitch.taskId) {
      return;
    }
    const switchEntry = {taskId, time};
    this._dataSaver.addTaskSwitch(switchEntry);
  }

  _renameTask(id, name) {
    const task = this._data.app.tasks.find(task => (task.id === id));
    this._dataSaver.updateTask({
      ...task,
      name
    });
  }
}