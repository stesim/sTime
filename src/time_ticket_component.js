import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import { timeDurationToHoursAndMinutesString, timeDurationToDecimalHoursString, timeToHoursMinutesString } from './time_format.js';

function formatTimeString(time) {
  return `${timeDurationToHoursAndMinutesString(time)} (${timeDurationToDecimalHoursString(time)})`;
}

export default class TimeTicketComponent extends Component {
  constructor() {
    super();
    this._ticketName = new Variable('unnamed');
    this._activeTime = new Variable(0);
    this.onClick = undefined;
    this.onEditClick = undefined;
    this._style = new Variable({});
    this._creationTime = new Variable(null);
  }

  get name() {
    return this._ticketName.value;
  }

  set name(value) {
    this._ticketName.value = value;
  }

  get activeTime() {
    return this._activeTime.value;
  }

  set activeTime(value) {
    this._activeTime.value = value;
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
        textContent: this._ticketName,
        style: {
          fontSize: '1.5em',
          fontWeight: 'bold',
        },
      }, {
        type: 'span',
        style: {
          textAlign: 'right',
        },
        textContent: mapVariables([this._creationTime], () => {
          if (this._creationTime.value !== null) {
            return timeToHoursMinutesString(this._creationTime.value);
          }
          return '--:--';
        }),
      }, {
        type: 'span',
        textContent: mapVariables([this._activeTime], () => {
          return `${formatTimeString(this._activeTime.value)}`
        }),
      }, {
        type: 'div',
        textContent: '✎',
        onclick: (evt) => {
          if (this.onEditClick) {
            this.onEditClick();
          }
          evt.stopPropagation();
        },
        style: {
          textAlign: 'center',
          fontSize: '1.2em',
        },
      }],
    });
  }
}
