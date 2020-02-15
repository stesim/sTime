import Component from '../pwa-base/component.js';
import render from '../pwa-base/render.js';
import mapVariables from '../pwa-base/map_variables.js';
import { timeDurationToHoursAndMinutesString, timeDurationToDecimalHoursString, timeToHoursMinutesString } from '../time_format.js';
import ComponentStyle from '../pwa-base/component_style.js';

function formatTimeString(time) {
  return `${timeDurationToHoursAndMinutesString(time)} (${timeDurationToDecimalHoursString(time)})`;
}

const style = new ComponentStyle();

export default class TimeTicketComponent extends Component {
  constructor() {
    super({
      name: '[[unnamed]]',
      activeTime: 0,
      style: {},
      creationTime: null,
    });

    this.onClick = undefined;
    this.onEditClick = undefined;
  }

  $render() {
    return render({
      type: 'div',
      onclick: () => {
        if (this.onClick) {
          this.onClick();
        }
      },
      style: this._variables.style,
      className: style.className('time-ticket'),
      children: [{
        type: 'span',
        textContent: this._variables.name,
        className: style.className('name'),
      }, {
        type: 'span',
        className: style.className('creation-time'),
        textContent: mapVariables([this._variables.creationTime], creationTime => {
          if (creationTime !== null) {
            return timeToHoursMinutesString(creationTime);
          }
          return '--:--';
        }),
      }, {
        type: 'span',
        textContent: mapVariables(
          [this._variables.activeTime],
          activeTime => `${formatTimeString(activeTime)}`,
        ),
      }, {
        type: 'div',
        textContent: '✎',
        onclick: evt => {
          if (this.onEditClick) {
            this.onEditClick();
          }
          evt.stopPropagation();
        },
        className: style.className('edit-button'),
      }],
    });
  }
}

style.addRules(`
  .time-ticket {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-gap: 0.2em;
    align-items: center;
    background-color: #555577;
    border-radius: 0.75em;
    padding: 0.75em;
  }
  `, `
  .time-ticket .name {
    font-size: 1.5em;
    font-weight: bold;
  }
  `, `
  .time-ticket .creation-time {
    text-align: right;
  }
  `, `
  .time-ticket .edit-button {
    text-align: center;
    font-size: 1.2em;
  }
`);
