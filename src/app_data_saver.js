import IndexedDB from './base/indexed_db.js';

const dbVersion = 2;

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
    case 1: {
      db.createStore(
        'settings', {
          keyPath: 'key',
        }
      );
    }
  }
}

export default class AppDataSaver {
  constructor(dataModel) {
    this._data = dataModel;
    this._db = null;

    IndexedDB.open('sTime', dbVersion, upgradeIndexDB).then((db) => {
      this._db = db;
      this._restoreSettings();
    });
  }

  updateSettings(key, value) {
    return this._db.transaction(
      'settings',
      'readwrite',
      store => store.put({...value, key}),
    ).then(() => {
      this._data.sys.settings[key] = value;
    });
  }

  addTask(task) {
    return this._db.transaction(
      'tasks',
      'readwrite',
      store => {
        store.add(task).then((id) => {
          this._data.app.tasks = [
            ...this._data.app.tasks,
            {...task, id}
          ];
        }).catch((error) => {
          alert('failed to add task to database: ' + error);
        });
      },
    );
  }

  updateTask(task) {
    return this._db.transaction(
      'tasks',
      'readwrite',
      store => {
        store.put(task).then(() => {
          this._data.app.tasks = this._data.app.tasks.map(
            originalTask => (originalTask.id === task.id ? task : originalTask));
        }).catch((error) => {
          alert('failed to update task in database: ' + error + '\n' + error.stack);
        });
      },
    );
  }

  addTaskSwitch(taskSwitch) {
    return this._db.transaction(
      'taskSwitches',
      'readwrite',
      store => {
        store.add(taskSwitch).then((id) => {
          this._data.app.taskSwitches = [
            ...this._data.app.taskSwitches, {
              ...taskSwitch,
              id,
            }
          ];
        }).catch((error) => {
          alert('failed to add task switch to database: ' + error + '\n' + error.stack);
        });
      },
    );
  }

  restore(date = Date.now()) {
    const dateWithoutTime = new Date(date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    const nextDay = new Date();
    nextDay.setDate(dateWithoutTime.getDate() + 1);

    let tasks;
    let taskSwitches;
    return this._db.transaction(
      ['tasks', 'taskSwitches'],
      'readonly',
      stores => {
        const range = IDBKeyRange.bound(
          dateWithoutTime.valueOf(),
          nextDay.valueOf(),
          false,
          true,
        );
        stores.tasks.index('creationTime').getAll(range).then(result => {
          tasks = result;
        });
        stores.taskSwitches.index('time').getAll(range).then(result => {
          taskSwitches = result;
        });
      },
    ).then(() => {
      this._data.app.taskSwitches = [];
      this._data.app.tasks = [];
      this._data.app.tasks = tasks;
      this._data.app.taskSwitches = taskSwitches;
    });
  }

  clearAll() {
    const stores = ['tasks', 'taskSwitches', 'settings'];
    return this._db.transaction(
      stores,
      'readwrite',
      dbStores => {
        stores.forEach(store => dbStores[store].clear());
      },
    ).then(() => {
      // TODO(stesim): remove?
      this._data.app.taskSwitches = [];
      this._data.app.tasks = [];
      // FIXME(stesim): this is definitely foul
      this._data.sys.settings.jira.url = '';
      this._data.sys.settings.jira.authorization = '';
      this._data.sys.settings.jira.defaultIssueKey = '';
    });
  }

  _restoreSettings() {
    return this._db.transaction(
      'settings',
      'readonly',
      store => {
        store.getAll().then(results => {
          for (const {key, ...value} of results) {
            Object.assign(this._data.sys.settings[key], value);
          }
        });
      },
    );
  }
}