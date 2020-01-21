import Component from './base/component.js';
import Variable from './base/variable.js';
import render from './base/render.js';
import mapVariables from './base/map_variables.js';

export default class ClockComponent extends Component {
  constructor() {
    super();
    this._time = new Variable(new Date());
  }

  get time() {
    return this._time.value;
  }

  set time(value) {
    this._time.value = value;
  }

  $render() {
    return render({
      type: 'div',
      innerText: mapVariables([this._time], () => this.time.toLocaleTimeString('de-DE')),
    });
  }
}