import Component from './base/component.js';
import render from './base/render.js';
import ComponentStyle from './base/component_style.js';

const kindSymbols = {
  default: '✉',
  affirm: '✓',
  error: '✗',
};

const style = new ComponentStyle();

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
      className: style.classNames('notification', this.kind).join(' '),
      style: {...this.style},
      onclick: () => {
        if (this.onClick) {
          this.onClick();
        }
      },
      children: [{
        type: 'span',
        className: style.className('icon'),
        textContent: kindSymbols[this.kind],
      }, {
        type: 'span',
        className: style.className('title'),
        textContent: this._variables.title,
      }, {
        type: 'span',
        className: style.className('description'),
        textContent: this._variables.description,
      }],
    });
  }
}

style.addRules(`
  .notification {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 0.2em;
    align-items: center;
    padding: 0.75em;
  }
  `, `
  .default {
    background-color: #333355;
  }
  `, `
  .affirm {
    background-color: #335533;
  }
  `, `
  .error {
    background-color: #553333;
  }
  `, `
  .icon {
    text-align: center;
    font-size: 1.2em;
  }
  `, `
  .title {
    font-weight: bold;
  }
  `, `
  .description {
    grid-column: 1 / span 2;
  }
`);
