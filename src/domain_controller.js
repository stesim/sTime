export default class DomainController {
  constructor(dataModel, communicationEndpoint) {
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this._comm.subscribe(message => this._handleMessage(message));
  }

  _handleMessage(message) {
    if (message.type === 'add-task') {
      this._addTask(message.task);
    } else {
      console.error('LogicController received unsupported message:', message);
    }
  }

  _addTask(task) {
    // this._data.app.tasks.push(task);
    this._data.app.tasks = [...this._data.app.tasks, task];
  }
}