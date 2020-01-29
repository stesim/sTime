export default class AppDataSaver {
  constructor(dataModel, indexedDB) {
    this._data = dataModel;
    this._db = indexedDB;
  }

  addTask(task) {
    return this._db.transaction(
      'tasks',
      'readwrite',
      store => {
        store.add(task).then((id) => {
          this._data.app.tasks = [
            ...this._data.app.tasks, {
              ...task,
              id,
            }
          ];
        }).catch((error) => {
          alert('failed to add task to database', error);
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
          alert('failed to add task switch to database', error);
        });
      },
    );
  }

  restoreAll() {
    let tasks;
    let taskSwitches;
    return this._db.transaction(
      ['tasks', 'taskSwitches'],
      'readonly',
      stores => {
        stores.tasks.getAll().then(result => {
          tasks = result;
        });
        stores.taskSwitches.getAll().then(result => {
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