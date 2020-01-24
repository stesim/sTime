import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import TimeTicketComponent from './time_ticket_component.js';

export default class TaskListComponent extends Component {
  constructor() {
    super();
    this._tasks = new Variable([]);
    this._activeTask = new Variable(null);
    this.onActiveTaskChanged = undefined;
    this._activeTask.onChange((value) => {
      if (this.onActiveTaskChanged) {
        this.onActiveTaskChanged(value);
      }
    });
  }

  get tasks() {
    return this._tasks.value;
  }

  set tasks(value) {
    this._tasks.value = value;
    this._activeTask.value = null;
  }

  get activeTask() {
    return this._activeTask.value;
  }

  set activeTask(value) {
    this._activeTask.value = value;
  }

  $render() {
    return render({
      type: 'div',
      children: mapVariables([this._tasks], () => this._tasks.value.map((task, index) => ({
        type: TimeTicketComponent,
        name: task.name,
        elapsedSeconds: task.elapsedSeconds,
        creationTime: task.creationTime,
        onClick: () => {
          this._activeTask.value = index;
        },
        style: mapVariables([this._activeTask], () => ({
          backgroundColor: (index === this._activeTask.value ? '#557755' : '#555577'),
          marginBottom: '0.5em',
        })),
      }))),
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
      }
    });
  }
}
