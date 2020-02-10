import Component from './base/component.js';
import render from './base/render.js';
import ComponentStyle from './base/component_style.js';

const style = new ComponentStyle();

export default class LabeledTextComponent extends Component {
  constructor() {
    super({
      label: '',
      content: '',
    });
  }

  $render() {
    return render({
      type: 'div',
      className: style.className('labeled-text'),
      children: [{
        type: 'div',
        textContent: this._variables.label,
        className: style.className('label'),
      }, {
        type: 'div',
        textContent: this._variables.content,
      }],
    });
  }
}

style.addRules(`
  .labeled-text .label {
    text-transform: uppercase;
    font-weight: bold;
  }
`);
