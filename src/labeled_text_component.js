import Component from './base/component.js';
import render from './base/render.js';

export default class LabeledTextComponent extends Component {
  constructor() {
    super({
      label: '',
      content: '',
    });
  }

  $render() {
    return render({
      type: 'span',
      children: [{
        type: 'div',
        textContent: this._variables.label,
        style: {
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }
      }, {
        type: 'div',
        textContent: this._variables.content,
      }],
    });
  }
}