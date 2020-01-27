import Component from './base/component.js';
import render from './base/render.js';
import ClockComponent from './clock_component.js';
import Variable from './base/variable.js';
import TaskListComponent from './task_list_component.js';
import LabeledTextComponent from './labeled_text_component.js';
import mapVariables from './base/map_variables.js';
import { timeToHoursAndMinutesString, timeToDecimalHoursString, dateToHoursMinutesString } from './time_format.js';
import { addDataModelListener } from './base/data_model.js';

function formatDate(date) {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function formatTimeString(time) {
  return `${timeToHoursAndMinutesString(time)} (${timeToDecimalHoursString(time)})`;
}

export default class DailyTrackerComponent extends Component {
  constructor(dataModel, communicationEndpoint, debugMenu) {
    super();
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this._tasks = new Variable([]);
    this._activeTaskIndex = new Variable(null);

    this._startTime = new Variable(null);
    this._totalTime = new Variable(0);
    this._isDebugMenuVisible = new Variable(false);
    this._debugMenu = debugMenu;
    this._debugMenu.closeAction = () => {
      this._isDebugMenuVisible.value = false;
    };

    addDataModelListener(this._data, (key, value) => {
      switch (key) {
        case 'tasks':
          this._tasks.value = value.map(task => ({
            ...task,
            activeTime: new Variable(task.activeTime),
          }));
          break;
        case 'taskSwitches':
          const taskSwitches = value;
          if (this._startTime.value === null) {
            const firstSwitch = taskSwitches[0];
            this._startTime.value = new Date(firstSwitch.time);
          }
          const lastSwitch = taskSwitches[taskSwitches.length - 1];
          this._activeTaskIndex.value = lastSwitch.taskIndex;
          this._pollTasks();
          break;
      }
    });

    // FIXME(stesim): replace polling with proper notifications
    this._pollInterval = setInterval(() => this._pollTasks(), 10000);
  }

  _pollTasks() {
    let totalSeconds = 0;
    this._data.tasks.forEach((task, index) => {
      this._tasks.value[index].activeTime.value = task.activeTime;
      totalSeconds += task.activeTime;
    });
    this._totalTime.value = totalSeconds;
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'grid',
        width: '100%',
        height: '100%',
        gridTemplateRows: 'auto 1fr auto',
      },
      children: [{
        type: 'div',
        style: {
          textAlign: 'center',
          fontSize: '1.5em',
          marginBottom: '0.5em',
        },
        children: [{
          type: 'div',
          textContent: formatDate(new Date()),
          style: {
            fontSize: '1.25em',
            fontWeight: 'bold',
            padding: '0.5em',
          },
        }, {
          type: ClockComponent,
        }],
      }, {
        type: 'div',
        style: {
          padding: '0.5em',
          overflow: 'auto',
        },
        children: [{
          type: TaskListComponent,
          tasks: this._tasks,
          activeTaskIndex: this._activeTaskIndex,
          onTaskClicked: taskIndex => this._comm.publish(
            {type: 'set-active-task', taskIndex}),
        }],
      }, {
        type: 'div',
        style: {
          backgroundColor: '#444466',
          padding: '1em',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          overflow: 'visible',
        },
        children: [{
          type: LabeledTextComponent,
          label: 'Started',
          content: mapVariables([this._startTime], () => {
            if (this._startTime.value !== null) {
              return dateToHoursMinutesString(this._startTime.value);
            } else {
              return '--';
            }
          }),
        },  {
          type: 'div',
          style: {
            textAlign: 'right',
          },
          children: [{
            type: LabeledTextComponent,
            label: 'Summary',
            content: mapVariables([this._totalTime], () => formatTimeString(this._totalTime.value)),
          }],
        }],
      }, {
        type: 'div',
        textContent: '+',
        onclick: () => {
          const name = prompt('Enter task name', '');
          if (name) {
            this._comm.publish({
              type: 'add-task',
              taskName: name,
            });
          }
        },
        style: {
          position: 'absolute',
          bottom: '-0.25em',
          left: 0,
          right: 0,
          margin: '0 auto',
          fontSize: '4em',
          fontWeight: 'bold',
          textAlign: 'center',
          width: '1.5em',
          height: '1.5em',
          lineHeight: '1.5em',
          borderRadius: '1.0em',
          backgroundColor: '#555577',
          cursor: 'pointer',
          border: '0.1em solid #14141b',
        },
      }, {
        type: 'div',
        textContent: '↯',
        style: {
          position: 'absolute',
          right: '0.5em',
          bottom: '4em',
          width: '1.5em',
          height: '1.5em',
          lineHeight: '1.5em',
          fontSize: '1.25em',
          textAlign: 'center',
          color: '#555577',
          borderRadius: '1.5em',
          border: '0.2em solid #555577',
          cursor: 'pointer',
        },
        onclick: () => {
          this._isDebugMenuVisible.value = true;
        },
      }, {
        type: 'div',
        style: mapVariables([this._isDebugMenuVisible], () => ({
          display: (this._isDebugMenuVisible.value ? '' : 'none'),
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.75,
          backgroundColor: '#000000',
        })),
        children: [this._debugMenu],
      }],
    });
  }
}