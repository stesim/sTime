import Component from './base/component.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';

const kindStyles = {
  default: {
    backgroundColor: '#333355',
  },
  affirm: {
    backgroundColor: '#335533',
  },
  error: {
    backgroundColor: '#553333',
  },
};

const kindSymbols = {
  default: '✉',
  affirm: '✓',
  error: '✗',
};

export default class NotificationComponent extends Component {
  constructor() {
    super({
      title: '',
      description: '',
    });

    this.style = {};
    this.kind = 'default';
    this.onClick = undefined;
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridGap: '0.2em',
        alignItems: 'center',
        padding: '0.75em',
        ...kindStyles[this.kind],
        ...this.style,
      },
      onclick: () => {
        if (this.onClick) {
          this.onClick();
        }
      },
      children: [{
        type: 'span',
        style: {
          textAlign: 'center',
          fontSize: '1.2em',
        },
        textContent: kindSymbols[this.kind],
      }, {
        type: 'span',
        style: {
          fontWeight: 'bold',
        },
        textContent: this._variables.title,
      }, {
        type: 'span',
        style: {
          gridColumn: '1 / span 2',
        },
        textContent: this._variables.description,
      }],
    });
  }
}