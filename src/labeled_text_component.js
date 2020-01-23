import Component from './base/component.js';
import render from './base/render.js';
import Variable from './base/variable.js';

export default class LabeledTextComponent extends Component {
  constructor() {
    super();
    this._label = new Variable('');
    this._content = new Variable('');
  }

  get label() {
    return this._label.value;
  }

  set label(value) {
    this._label.value = value;
  }

  get content() {
    return this._content.value;
  }

  set content(value) {
    this._content.value = value;
  }

  $render() {
    return render({
      type: 'span',
      children: [{
        type: 'div',
        innerText: this._label,
        style: {
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }
      }, {
        type: 'div',
        innerText: this._content,
      }],
    });
  }
}