import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import { secondsToHoursAndMinutesString, secondsToDecimalHoursString, dateToHoursMinutesString } from './time_format.js';

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
    this._creationTime = new Variable(null);
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

  get creationTime() {
    return this._creationTime.value;
  }

  set creationTime(value) {
    this._creationTime.value = value;
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
      style: mapVariables([this._style], () => ({
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridGap: '0.2em',
        alignItems: 'center',
        backgroundColor: '#555577',
        borderRadius: '0.75em',
        padding: '0.75em',
        ...this._style.value,
      })),
      children: [{
        type: 'span',
        innerText: this._ticketName,
        style: {
          fontSize: '1.5em',
          fontWeight: 'bold',
        },
      }, {
        type: 'span',
        style: {
          textAlign: 'right',
        },
        innerText: mapVariables([this._creationTime], () => {
          if (this._creationTime.value !== null) {
            return dateToHoursMinutesString(this._creationTime.value);
          }
          return '--:--';
        }),
      }, {
        type: 'span',
        innerText: mapVariables([this._elapsedSeconds], () => {
          return `${formatTimeString(this._elapsedSeconds.value)}`
        }),
      }],
    });
  }
}
