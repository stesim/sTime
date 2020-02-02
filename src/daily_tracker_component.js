import Component from './base/component.js';
import render from './base/render.js';
import ClockComponent from './clock_component.js';
import Variable from './base/variable.js';
import TaskListComponent from './task_list_component.js';
import LabeledTextComponent from './labeled_text_component.js';
import mapVariables from './base/map_variables.js';
import { timeDurationToHoursAndMinutesString, timeDurationToDecimalHoursString, timeToHoursMinutesString } from './time_format.js';
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
  return `${timeDurationToHoursAndMinutesString(time)} (${timeDurationToDecimalHoursString(time)})`;
}

export default class DailyTrackerComponent extends Component {
  constructor(dataModel, communicationEndpoint, debugMenu, notificationList) {
    super();
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this._tasks = new Variable([]);
    this._activeTaskIndex = new Variable(null);

    this._startTime = new Variable(null);
    this._totalTime = new Variable(0);
    this._latestPreviewUpdateTime = Date.now();
    this._previewTimeUpdateInterval = setInterval(() => {
      this._updatePreviewTimes();
    }, 60000);

    this._isDebugMenuVisible = new Variable(false);
    this._debugMenu = debugMenu;
    this._debugMenu.closeAction = () => {
      this._isDebugMenuVisible.value = false;
    };

    this._notificationList = notificationList;

    addDataModelListener(this._data, (key, value) => {
      switch (key) {
        case 'tasks':
          this._tasks.value = value.map(task => ({
            ...task,
            activeTime: new Variable(0),
          }));
          this._updateTaskTimes();
          break;
        case 'taskSwitches':
          const taskSwitches = value;
          if (taskSwitches.length > 0) {
            if (this._startTime.value === null) {
              const firstSwitch = taskSwitches[0];
              this._startTime.value = firstSwitch.time;
            }
            const lastSwitch = taskSwitches[taskSwitches.length - 1];
            this._activeTaskIndex.value =
              this._getTaskIndexFromId(lastSwitch.taskId);
          } else {
            this._activeTaskIndex.value = null;
          }
          this._updateTaskTimes();
          break;
      }
    });
  }

  _getLatestSwitch() {
    return this._data.taskSwitches[this._data.taskSwitches.length - 1]
  }

  _getTimeSinceLatestSwitch() {
    return (Date.now() - this._getLatestSwitch().time);
  }

  _getTaskIndexFromId(id) {
    if (id === null) {
      return null;
    }
    return this._tasks.value.findIndex(task => (task.id == id));
  }

  _updateTaskTimes() {
    const idToTimesMap = new Map();
    const taskSwitches = this._data.taskSwitches;
    if (taskSwitches.length > 0) {
      this._latestPreviewUpdateTime = taskSwitches[taskSwitches.length - 1].time;
    }
    taskSwitches.forEach((taskSwitch, index) => {
      if (index > 0) {
        const previousSwitch = taskSwitches[index - 1];
        const taskId = previousSwitch.taskId;
        const currentTime = (idToTimesMap.get(taskId) || 0);
        const timeUntilSwitch = (taskSwitch.time - previousSwitch.time);
        idToTimesMap.set(taskId, currentTime + timeUntilSwitch);
      } else {
        this._startTime.value = taskSwitch.time;
      }
    });
    idToTimesMap.forEach((time, id) => {
      if (id !== null) {
        const taskIndex = this._getTaskIndexFromId(id);
        this._tasks.value[taskIndex].activeTime.value = time;
      } else {
        // console.log('Break time', time);
      }
    });

    this._updatePreviewTimes();
  }

  _updatePreviewTimes() {
    const now = Date.now();
    if (this._data.taskSwitches.length > 0) {
      const activeTaskId = this._getLatestSwitch().taskId;
      if (activeTaskId !== null) {
        const taskIndex = this._getTaskIndexFromId(activeTaskId);
        this._tasks.value[taskIndex].activeTime.value +=
          (now - this._latestPreviewUpdateTime);
        this._latestPreviewUpdateTime = now;
      }
      this._totalTime.value = this._tasks.value.reduce(
        (accumulatedTime, task) => (accumulatedTime + task.activeTime.value),
        0
      );
    }
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
          onTaskClicked: taskIndex => {
            const task = this._data.tasks[taskIndex];
            if (this._data.taskSwitches.length === 0 ||
                task.id !== this._data.taskSwitches[this._data.taskSwitches.length - 1].taskId) {
              this._comm.publish({
                type: 'set-active-task',
                taskId: task.id
              });
            } else {
              this._comm.publish({
                type: 'clear-active-task',
              });
            }
          },
          onEditTaskClicked: taskIndex => {
            const task = this._data.tasks[taskIndex];
            const name = prompt(
              'Enter new task name',
              task.name);
            if (name) {
              this._comm.publish({
                type: 'rename-task',
                taskId: task.id,
                taskName: name,
              });
            }
          },
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
              return timeToHoursMinutesString(this._startTime.value);
            } else {
              return '--';
            }
          }),
        }, {
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
        style: {
          position: 'absolute',
          bottom: '8em',
          left: '20%',
          right: '0px',
        },
        children: [this._notificationList],
      }, {
        type: 'div',
        style: mapVariables([this._isDebugMenuVisible], () => ({
          display: (this._isDebugMenuVisible.value ? '' : 'none'),
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        })),
        children: [this._debugMenu],
      }],
    });
  }
}