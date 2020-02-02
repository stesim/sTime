import Component from './base/component.js';
import render from './base/render.js';
import Variable from './base/variable.js';
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
    super();
    
    this.style = {};
    this.onClick = undefined;
    this._kind = new Variable('default');
    this._title = new Variable('');
    this._description = new Variable('');
  }

  get kind() {
    return this._kind.value;
  }

  set kind(value) {
    this._kind.value = value;
  }

  get title() {
    return this._title.value;
  }

  set title(value) {
    this._title.value = value;
  }

  get description() {
    return this._description.value;
  }

  set description(value) {
    this._description.value = value;
  }

  $render() {
    return render({
      type: 'div',
      style: mapVariables([this._kind], kind => ({
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridGap: '0.2em',
        alignItems: 'center',
        padding: '0.75em',
        ...kindStyles[kind],
        ...this.style,
      })),
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
        textContent: mapVariables([this._kind], kind => kindSymbols[kind]),
      }, {
        type: 'span',
        style: {
          fontWeight: 'bold',
        },
        textContent: this._title,
      }, {
        type: 'span',
        style: {
          gridColumn: '1 / span 2',
        },
        textContent: this._description,
      }],
    });
  }
}