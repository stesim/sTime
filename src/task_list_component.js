import Component from './base/component.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import TimeTicketComponent from './time_ticket_component.js';

export default class TaskListComponent extends Component {
  constructor() {
    super({
      tasks: [],
      activeTaskId: null,
    });

    this.onTaskClicked = undefined;
    this.onEditTaskClicked = undefined;
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
      },
      children: mapVariables(
        [this._variables.tasks],
        (tasks) => tasks.map(task => ({
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
          style: mapVariables([this._variables.activeTaskId], activeTaskId => ({
            backgroundColor: (task.id === activeTaskId ? '#557755' : '#555577'),
            marginBottom: '0.5em',
          })),
        }))
      ),
    });
  }
}
