import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';

export default class ToggleButtonComponent extends Component {
  constructor() {
    super();
    this._activeContent = new Variable('x');
    this._inactiveContent = new Variable('-');
    this._active = new Variable(false);
    this.onChange = undefined;
    this._style = new Variable({});
  }

  get activeContent() {
    return this._activeContent.value;
  }

  set activeContent(value) {
    this._activeContent.value = value;
  }

  get inactiveContent() {
    return this._inactiveContent.value;
  }

  set inactiveContent(value) {
    this._inactiveContent.value = value;
  }

  get active() {
    return this._active.value;
  }

  set active(value) {
    if (value !== this._active) {
      this._active = value;
      if (this.onChange) {
        this.onChange(this._active);
      }
    }
  }

  get style() {
    return this._style.value;
  }

  set style(value) {
    this._style.value = value;
  }

  $render() {
    return render({
      type: 'button',
      textContent: mapVariables([this._active, this._activeContent, this._inactiveContent], () => {
        return this._active.value ? this._activeContent.value : this._inactiveContent.value;
      }),
      onclick: () => {
        this._active.value = !this._active.value;
        if (this.onChange) {
          this.onChange(this._active);
        }
      },
      style: this._style,
    });
  }
}
