import Component from './base/component.js';
import render from './base/render.js';
import ClockComponent from './clock_component.js';
import Variable from './base/variable.js';
import TaskListComponent from './task_list_component.js';

function formatDate(date) {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

export default class DailyTrackerComponent extends Component {
  constructor() {
    super();
    this._tasks = new Variable([]);
    this._time = new Variable(new Date());
    this._clockInterval = setInterval(() => {
      this._time.value = new Date();
    }, 1000);
    this._flushInterval = setInterval(() => {
      if (this._activeTask !== null) {
        this._flushElapsedTime();
      }
    }, 10000)
    this._activeTaskIndex = null;
    this._lastUpdateTime = null;

    this._listComponent = new TaskListComponent();
    this._listComponent.tasks = this._tasks.value;
    this._listComponent.onActiveTaskChanged = (taskIndex) => {
      this._flushElapsedTime();
      this._activeTaskIndex = taskIndex;
    };
    this._tasks.onChange((newTasks) => {
      this._listComponent.tasks = newTasks;
    });
  }

  get _activeTask() {
    const index = this._activeTaskIndex;
    return (index !== null ? this._tasks.value[index] : null);
  }

  _flushElapsedTime() {
    const now = new Date();
    if (this._activeTask !== null) {
      const deltaMilliseconds = (now.valueOf() - this._lastUpdateTime.valueOf());
      const deltaSeconds = (deltaMilliseconds / 1000);
      this._activeTask.elapsedSeconds.value += deltaSeconds;
      // this._activeTask.elapsedSeconds.value += deltaSeconds * 60;
    }
    this._lastUpdateTime = now;
  }

  $render() {
    return render({
      type: 'div',
      children: [{
        type: 'div',
        style: {
          textAlign: 'center',
          fontSize: '1.5em',
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
      },
      this._listComponent,
      {
        type: 'div',
        innerText: '+',
        onclick: () => {
          const name = prompt('Enter task name', '');
          const elapsedSeconds = new Variable(0);
          if (name !== null) {
            this._tasks.value = this._tasks.value.concat([{name, elapsedSeconds}]);
            this._listComponent.activeTask = (this._tasks.value.length - 1);
          }
        },
        style: {
          fontSize: '2em',
          fontWeight: 'bold',
          textAlign: 'center',
          width: '3em',
          height: '3em',
          borderRadius: '1.5em',
          backgroundColor: '#555577',
          lineHeight: '3em',
          cursor: 'pointer',
          margin: '0 auto',
        },
      }],
      style: {
        display: 'grid',
        rowGap: '1em',
      }
    });
  }
}