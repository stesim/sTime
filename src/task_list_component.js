import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import TimeTicketComponent from './time_ticket_component.js';

export default class TaskListComponent extends Component {
  constructor() {
    super();
    this._tasks = new Variable([]);
    this._activeTaskId = new Variable(null);
    this.onTaskClicked = undefined;
    this.onEditTaskClicked = undefined;
  }

  get tasks() {
    return this._tasks.value;
  }

  set tasks(value) {
    this._tasks.value = value;
  }

  get activeTaskId() {
    return this._activeTaskId.value;
  }

  set activeTaskId(value) {
    this._activeTaskId.value = value;
  }

  $render() {
    return render({
      type: 'div',
      children: mapVariables([this._tasks], () => this._tasks.value.map(task => ({
        type: TimeTicketComponent,
        name: task.name,
        activeTime: task.activeTime,
        creationTime: task.creationTime,
        onClick: () => {
          if (this.onTaskClicked) {
            this.onTaskClicked(task);
          }
        },
        onEditClick: () => {
          if (this.onEditTaskClicked) {
            this.onEditTaskClicked(task);
          }
        },
        style: mapVariables([this._activeTaskId], (activeTaskId) => ({
          backgroundColor: (task.id === activeTaskId ? '#557755' : '#555577'),
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
