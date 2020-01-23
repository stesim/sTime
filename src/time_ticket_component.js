import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';

function secondsToHoursAndMinutesString(seconds) {
  const minutes = Math.floor(seconds / 60) % 60;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function secondsToDecimalHoursString(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${(minutes / 60).toFixed(1)}h`;
}

function formatTimeString(seconds) {
  return `${secondsToHoursAndMinutesString(seconds)} (${secondsToDecimalHoursString(seconds)})`;
}

export default class TimeTicketComponent extends Component {
  constructor() {
    super();
    this._ticketName = new Variable('unnamed');
    this._elapsedSeconds = new Variable(0);
    this.onClick = undefined;
    this._style = new Variable({});
  }

  get name() {
    return this._ticketName.value;
  }

  set name(value) {
    this._ticketName.value = value;
  }

  get elapsedSeconds() {
    return this._elapsedSeconds.value;
  }

  set elapsedSeconds(value) {
    this._elapsedSeconds.value = value;
  }

  get style() {
    return this._style.value;
  }

  set style(value) {
    this._style.value = value;
  }

  $render() {
    return render({
      type: 'div',
      onclick: () => {
        if (this.onClick) {
          this.onClick();
        }
      },
      children: [{
        type: 'div',
        innerText: this._ticketName,
        style: {
          margin: '0.1em',
          fontSize: '1.5em',
          fontWeight: 'bold',
        },
      }, {
        type: 'div',
        innerText: mapVariables([this._elapsedSeconds], () => {
          return `${formatTimeString(this._elapsedSeconds.value)}`
        }),
        style: {
          margin: '0.2em',
        },
      }],
      style: mapVariables([this._style], () => ({
        backgroundColor: '#555577',
        borderRadius: '0.75em',
        padding: '0.75em',
        ...this._style.value,
      })),
    });
  }
}
