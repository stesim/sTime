import Component from './base/component.js';
import render from './base/render.js';
import ClockComponent from './clock_component.js';
import Variable from './base/variable.js';
import TaskListComponent from './task_list_component.js';
import LabeledTextComponent from './labeled_text_component.js';
import mapVariables from './base/map_variables.js';
import { secondsToHoursAndMinutesString, secondsToDecimalHoursString, dateToHoursMinutesString } from './time_format.js';
import { addDataModelListener } from './base/data_model.js';

function formatDate(date) {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function formatTimeString(seconds) {
  return `${secondsToHoursAndMinutesString(seconds)} (${secondsToDecimalHoursString(seconds)})`;
}

export default class DailyTrackerComponent extends Component {
  constructor(dataModel, communicationEndpoint, debugMenu) {
    super();
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this._time = new Variable(new Date());
    this._clockInterval = setInterval(() => {
      if (!document.hidden) {
        this._time.value = new Date();
      }
    }, 1000);
    this._flushInterval = setInterval(() => {
      if (!document.hidden && this._activeTask !== null) {
        this._flushElapsedTime();
      }
    }, 10000)
    this._activeTaskIndex = null;
    this._lastUpdateTime = null;

    this._listComponent = new TaskListComponent();
    this._listComponent.tasks = this._data.tasks;
    this._listComponent.onActiveTaskChanged = (taskIndex) => {
      this._flushElapsedTime();
      this._activeTaskIndex = taskIndex;
    };
    this._startTime = new Variable(null);
    this._totalSeconds = new Variable(0);
    this._isDebugMenuVisible = new Variable(false);
    this._debugMenu = debugMenu;
    this._debugMenu.closeAction = () => {
      this._isDebugMenuVisible.value = false;
    };

    addDataModelListener(this._data, (key, value) => {
      if (key === 'tasks') {
        this._listComponent.tasks = value;
        this._listComponent.activeTaskIndex = (this._data.tasks.length - 1);

        if (this._startTime.value === null) {
          this._startTime.value = new Date();
        }
      }
    });
  }

  get _activeTask() {
    const index = this._activeTaskIndex;
    return (index !== null ? this._data.tasks[index] : null);
  }

  _flushElapsedTime() {
    const now = new Date();
    if (this._activeTask !== null) {
      const deltaMilliseconds = (now.valueOf() - this._lastUpdateTime.valueOf());
      const deltaSeconds = (deltaMilliseconds / 1000);
      this._activeTask.elapsedSeconds.value += deltaSeconds;
      // this._activeTask.elapsedSeconds.value += deltaSeconds * 60;

      this._totalSeconds.value = this._data.tasks.reduce((accumulator, currentValue) => {
        return (accumulator + currentValue.elapsedSeconds.value);
      }, 0);
    }
    this._lastUpdateTime = now;
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
          innerText: formatDate(new Date()),
          style: {
            fontSize: '1.25em',
            fontWeight: 'bold',
            padding: '0.5em',
          },
        }, {
          type: ClockComponent,
          time: this._time,
        }],
      }, {
        type: 'div',
        style: {
          padding: '0.5em',
          overflow: 'auto',
        },
        children: [this._listComponent],
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
            content: mapVariables([this._totalSeconds], () => formatTimeString(this._totalSeconds.value)),
          }],
        }],
      }, {
        type: 'div',
        innerText: '+',
        onclick: () => {
          const name = prompt('Enter task name', '');
          const elapsedSeconds = new Variable(0);
          const creationTime = new Date();
          if (name !== null && name !== '') {
            this._comm.publish({
              type: 'add-task',
              task: {name, elapsedSeconds, creationTime},
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
        innerText: '↯',
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