import Component from './base/component.js';
import render from './base/render.js';
import ClockComponent from './clock_component.js';
import Variable from './base/variable.js';
import TaskListComponent from './task_list_component.js';
import LabeledTextComponent from './labeled_text_component.js';

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
          label: 'Start',
          content: 'now',
        },  {
          type: 'div',
          style: {
            textAlign: 'right',
          },
          children: [{
            type: LabeledTextComponent,
            label: 'Summary',
            content: '0h 0m (0.0h)',
          }],
        }],
      }, {
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
      }],
    });
  }
}