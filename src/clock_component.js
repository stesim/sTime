import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';

export default class ClockComponent extends Component {
  constructor() {
    super();
    this._time = null;
    this._timeString = new Variable('');
    this._updateTime();
    this._clockInterval = setInterval(() => {
      if (!document.hidden) {
        this._updateTime();
      }
    }, 1000);
  }

  get time() {
    return this._time.value;
  }

  _updateTime() {
    this._time = new Date();
    this._timeString.value = this._time.toLocaleTimeString('de-DE');
  }

  $render() {
    return render({
      type: 'div',
      textContent: this._timeString,
    });
  }
}