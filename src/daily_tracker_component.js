import Component from './base/component.js';
import render from './base/render.js';
import ClockComponent from './clock_component.js';
import Variable from './base/variable.js';
import TaskListComponent from './task_list_component.js';
import LabeledTextComponent from './labeled_text_component.js';
import mapVariables from './base/map_variables.js';
import { timeDurationToHoursAndMinutesString, timeDurationToDecimalHoursString, timeToHoursMinutesString } from './time_format.js';
import { addDataStoreListener } from './base/data_store.js';
import ComponentStyle from './base/component_style.js';

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

const style = new ComponentStyle();

export default class DailyTrackerComponent extends Component {
  constructor(dataModel, communicationEndpoint, debugMenu, notificationList) {
    super();
    this._data = dataModel;
    this._comm = communicationEndpoint;

    this._tasks = new Variable([]);
    this._activeTaskId = new Variable(null);

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

    addDataStoreListener(this._data, (key, value) => {
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
            this._activeTaskId.value = lastSwitch.taskId;
          } else {
            this._activeTaskId.value = null;
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

  _getTaskById(id) {
    return this._tasks.value.find(task => task.id === id);
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
        const task = this._getTaskById(id);
        task.activeTime.value = time;
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
        const activeTask = this._getTaskById(activeTaskId);
        activeTask.activeTime.value += (now - this._latestPreviewUpdateTime);
        this._latestPreviewUpdateTime = now;
      }
      this._totalTime.value = this._tasks.value.reduce(
        (accumulatedTime, task) => (accumulatedTime + task.activeTime.value),
        0
      );
    }
  }

  _onTaskClicked(task) {
    if (this._data.taskSwitches.length === 0 ||
        task.id !== this._getLatestSwitch().taskId) {
      this._comm.publish({
        type: 'set-active-task',
        taskId: task.id
      });
    } else {
      this._comm.publish({type: 'clear-active-task'});
    }
  }

  _onTaskEditClicked(task) {
    const name = prompt('Enter new task name', task.name);
    if (name) {
      this._comm.publish({
        type: 'rename-task',
        taskId: task.id,
        taskName: name,
      });
    }
  }

  _addTask() {
    const name = prompt('Enter task name', '');
    if (name) {
      this._comm.publish({
        type: 'add-task',
        taskName: name,
      });
    }
  }

  _toggleDebugMenu() {
    this._isDebugMenuVisible.value = !this._isDebugMenuVisible.value;
  }

  $render() {
    return render({
      type: 'div',
      className: style.className('daily-tracker'),
      children: [{
        type: 'div',
        className: style.className('header'),
        children: [{
          type: 'div',
          textContent: formatDate(new Date()),
          className: style.className('date'),
        }, {
          type: ClockComponent,
        }],
      }, {
        type: 'div',
        className: style.className('task-list-container'),
        children: [{
          type: TaskListComponent,
          tasks: this._tasks,
          activeTaskId: this._activeTaskId,
          onTaskClicked: task => this._onTaskClicked(task),
          onEditTaskClicked: task => this._onTaskEditClicked(task),
        }],
      }, {
        type: 'div',
        className: style.className('footer'),
        children: [{
          type: LabeledTextComponent,
          label: 'Started',
          content: mapVariables(
            [this._startTime],
            startTime => (startTime !== null ? timeToHoursMinutesString(startTime) : '--')
          ),
        }, {
          type: LabeledTextComponent,
          label: 'Summary',
          content: mapVariables([this._totalTime], totalTime => formatTimeString(totalTime)),
        }],
      }, {
        type: 'div',
        textContent: '+',
        className: style.className('add-task-button'),
        onclick: () => this._addTask(),
      }, {
        type: 'div',
        className: style.className('notification-list-container'),
        children: [this._notificationList],
      }, {
        type: 'div',
        className: mapVariables(
          [this._isDebugMenuVisible],
          isVisible => style.classNames('debug-menu-container', !isVisible ? 'hidden' : '').join(' '),
        ),
        children: [this._debugMenu],
      }, {
        type: 'div',
        textContent: '↯',
        className: style.className('debug-menu-button'),
        onclick: () => this._toggleDebugMenu(),
      }],
    });
  }
}

style.addRules(`
  .daily-tracker {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-rows: auto 1fr auto;
  }
  `, `
  .header {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 0.5em;
  }
  `, `
  .date {
    font-size: 1.25em;
    font-weight: bold;
    padding: 0.5em;
  }
  `, `
  .task-list-container {
    padding: 0.5em;
    overflow: auto;
  }
  `, `
  .footer {
    background-color: #444466;
    padding: 1em;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  `, `
  .footer > *:nth-child(2) {
    text-align: right;
  }
  `, `
  .add-task-button {
    position: absolute;
    bottom: -0.25em;
    left: 0;
    right: 0;
    margin: 0 auto;
    font-size: 4em;
    font-weight: bold;
    text-align: center;
    width: 1.5em;
    height: 1.5em;
    line-height: 1.5em;
    border-radius: 1.0em;
    background-color: #555577;
    cursor: pointer;
    border: 0.1em solid #14141b;
  }
  `, `
  .debug-menu-button {
    position: absolute;
    right: 0.5em;
    bottom: 4em;
    width: 1.5em;
    height: 1.5em;
    line-height: 1.5em;
    font-size: 1.25em;
    text-align: center;
    color: #555577;
    border-radius: 1.5em;
    border: 0.2em solid #555577;
    cursor: pointer;
  }
  `, `
  .notification-list-container {
    position: absolute;
    bottom: 8em;
    max-width: 24em;
    right: 0px;
  }
  `, `
  .debug-menu-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
  }
  `, `
  .hidden {
    display: none;
  }
`);