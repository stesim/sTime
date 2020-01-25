export default class DomainController {
  constructor(dataModel, communicationEndpoint) {
    this._data = dataModel;
    this._comm = communicationEndpoint;
    this._comm.subscribe(message => this._handleMessage(message));

    this._serviceWorker = undefined;
    navigator.serviceWorker.ready.then((registration) => {
      this._serviceWorker = registration;
    });
  }

  _handleMessage(message) {
    const supportedActions = {
      'activate-update': () => this._activateUpdate(),
      'add-task': () => this._addTask(message.task),
      'clear-cache': () => this._clearCache(),
    };
    const action = supportedActions[message.type];
    if (action !== undefined) {
      action();
    } else {
      console.error('LogicController received unsupported message:', message)
    }
  }

  _activateUpdate() {
    if (this._serviceWorker.waiting) {
      this._serviceWorker.waiting.postMessage('skip-waiting');
    } else {
      alert('No waiting ServiceWorker registration');
    }
  }

  _addTask(task) {
    // this._data.app.tasks.push(task);
    this._data.app.tasks = [...this._data.app.tasks, task];
  }

  _clearCache() {
    if (this._serviceWorker.active) {
      this._serviceWorker.active.postMessage('clear-cache');
    } else {
      alert('No active ServiceWorker registration');
    }
  }
}