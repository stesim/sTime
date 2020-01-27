export default class DomainController {
  constructor(dataModel, communicationEndpoint) {
    this._data = dataModel;
    this._comm = communicationEndpoint;
    this._comm.subscribe(message => this._handleMessage(message));

    this._serviceWorker = undefined;
    navigator.serviceWorker.ready.then((registration) => {
      this._serviceWorker = registration;
      this._checkForWaitingUpdate();
    });

    this._supportedMessageActions = {
      'activate-update' : (message) => this._activateUpdate(),
      'add-task'        : (message) => this._addTask(message.taskName),
      'clear-cache'     : (message) => this._clearCache(),
      'set-active-task' : (message) => this._addTaskSwitch(message.taskIndex),
    };

    this._previousUpdateTime = 0;
    this._updateInterval = setInterval(() => {
      this._updateActiveTaskTime();
    }, 10000);
  }

  _checkForWaitingUpdate() {
    const setUpdateIsWaiting = () => {
      this._data.sys.updateWaiting = true;
    };

    const registration = this._serviceWorker;
    if (registration.waiting) {
      setUpdateIsWaiting();
    } else {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker.state === 'installed') {
          setUpdateIsWaiting();
        } else {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              setUpdateIsWaiting();
            }
          });
        }
      });
    }
  }

  _handleMessage(message) {
    const action = this._supportedMessageActions[message.type];
    if (action !== undefined) {
      action(message);
    } else {
      console.error('LogicController received unsupported message:', message)
    }
  }

  _activateUpdate() {
    if (this._serviceWorker.waiting) {
      this._serviceWorker.waiting.postMessage('skip-waiting');
    } else {
      console.error('No waiting ServiceWorker registration');
    }
  }

  _addTask(name) {
    const task = {
      name,
      activeTime: 0,
      creationTime: Date.now(),
    };
    // this._data.app.tasks.push(task);
    this._data.app.tasks = [...this._data.app.tasks, task];
    this._addTaskSwitch(this._data.app.tasks.length - 1, task.creationTime);
  }

  _clearCache() {
    if (this._serviceWorker.active) {
      this._serviceWorker.active.postMessage('clear-cache');
    } else {
      alert('No active ServiceWorker registration');
    }
  }

  get _activeTaskIndex() {
    const taskSwitches = this._data.app.taskSwitches;
    if (taskSwitches.length > 0) {
      return taskSwitches[taskSwitches.length - 1].taskIndex;
    }
    return null;
  }

  get _activeTask() {
    const taskIndex = this._activeTaskIndex;
    return (taskIndex !== null ? this._data.app.tasks[taskIndex] : null);
  }

  _addTaskSwitch(taskIndex, time = Date.now()) {
    if (taskIndex === this._activeTaskIndex) {
      return;
    }

    this._updateActiveTaskTime(time);

    const switchEntry = {taskIndex, time};
    this._data.app.taskSwitches = [...this._data.app.taskSwitches, switchEntry];
  }

  _updateActiveTaskTime(now = Date.now()) {
    const activeTask = this._activeTask;
    if (activeTask !== null) {
      const timeSincePreviousSwitch = (now - this._previousUpdateTime);
      activeTask.activeTime += timeSincePreviousSwitch;
    }
    this._previousUpdateTime = now;
  }
}