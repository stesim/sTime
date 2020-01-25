import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import TimeTicketComponent from './time_ticket_component.js';

export default class TaskListComponent extends Component {
  constructor() {
    super();
    this._tasks = new Variable([]);
    this._activeTaskIndex = new Variable(null);
    this.onActiveTaskChanged = undefined;
    this._activeTaskIndex.onChange((value) => {
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
    this._activeTaskIndex.value = null;
  }

  get activeTaskIndex() {
    return this._activeTaskIndex.value;
  }

  set activeTaskIndex(value) {
    this._activeTaskIndex.value = value;
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
          this._activeTaskIndex.value = index;
        },
        style: mapVariables([this._activeTaskIndex], () => ({
          backgroundColor: (index === this._activeTaskIndex.value ? '#557755' : '#555577'),
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
