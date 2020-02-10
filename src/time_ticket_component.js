import Component from './base/component.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';
import { timeDurationToHoursAndMinutesString, timeDurationToDecimalHoursString, timeToHoursMinutesString } from './time_format.js';

function formatTimeString(time) {
  return `${timeDurationToHoursAndMinutesString(time)} (${timeDurationToDecimalHoursString(time)})`;
}

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
      style: mapVariables([this._variables.style], (style) => ({
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridGap: '0.2em',
        alignItems: 'center',
        backgroundColor: '#555577',
        borderRadius: '0.75em',
        padding: '0.75em',
        ...style,
      })),
      children: [{
        type: 'span',
        textContent: this._variables.name,
        style: {
          fontSize: '1.5em',
          fontWeight: 'bold',
        },
      }, {
        type: 'span',
        style: {
          textAlign: 'right',
        },
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
        style: {
          textAlign: 'center',
          fontSize: '1.2em',
        },
      }],
    });
  }
}
