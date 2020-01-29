import AppDataSaver from './app_data_saver.js';
import IndexedDB from './base/indexed_db.js';

function upgradeIndexDB(db, oldVersion) {
  switch (oldVersion) {
    case 0: {
      const taskStore = db.createStore(
        'tasks', {
          keyPath: 'id',
          autoIncrement: true,
        }
      );
      taskStore.createIndex(
        'creationTime',
        'creationTime',
        {unique: false});

      const taskSwitchStore = db.createStore(
        'taskSwitches', {
          keyPath: 'id',
          autoIncrement: true,
        }
      );
      taskSwitchStore.createIndex(
        'time',
        'time',
        {unique: true});
      taskSwitchStore.createIndex(
        'taskId',
        'taskId',
        {unique: false});
    }
  }
}

export default class DomainController {
  constructor(dataModel, communicationEndpoint) {
    this._data = dataModel;
    this._comm = communicationEndpoint;
    this._comm.subscribe(message => this._handleMessage(message));

    this._db = null;
    this._dataSaver = null;
    this._initDatabase();

    this._serviceWorker = undefined;
    navigator.serviceWorker.ready.then((registration) => {
      this._serviceWorker = registration;
      this._checkForWaitingUpdate();
    });

    this._supportedMessageActions = {
      'activate-update'       : (message) => this._activateUpdate(),
      'add-task'              : (message) => this._addTask(message.taskName),
      'clear-cache'           : (message) => this._clearCache(),
      'clear-database'        : (message) => this._clearDatabase(),
      'rename-task'           : (message) => this._renameTask(message.taskId, message.taskName),
      'restore-from-database' : (message) => this._restoreFromDatabase(),
      'set-active-task'       : (message) => this._addTaskSwitch(message.taskId),
    };
  }

  _initDatabase() {
    IndexedDB.open('sTime', 1, upgradeIndexDB).then((db) => {
      this._db = db;
      this._dataSaver = new AppDataSaver(this._data, this._db);
    });
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
      alert('Controller received unsupported message:', message)
    }
  }

  _activateUpdate() {
    if (this._serviceWorker.waiting) {
      this._serviceWorker.waiting.postMessage('skip-waiting');
    } else {
      alert('No waiting ServiceWorker registration');
    }
  }

  _addTask(name) {
    const task = {
      name,
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

  _clearCache() {
    if (this._serviceWorker.active) {
      this._serviceWorker.active.postMessage('clear-cache');
    } else {
      alert('No active ServiceWorker registration');
    }
  }

  _clearDatabase() {
    this._dataSaver.clearAll();
  }

  _restoreFromDatabase() {
    this._dataSaver.restoreAll();
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