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

export default class AppDataSaver {
  constructor(dataModel) {
    this._data = dataModel;
    this._db = null;

    IndexedDB.open('sTime', 1, upgradeIndexDB).then((db) => {
      this._db = db;
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
    return this._db.transaction(
      ['tasks', 'taskSwitches'],
      'readwrite',
      stores => {
        stores.tasks.clear();
        stores.taskSwitches.clear();
      },
    ).then(() => {
      this._data.app.taskSwitches = [];
      this._data.app.tasks = [];
    });
  }
}