import Component from '../base/component.js';
import render from '../base/render.js';
import mapVariables from '../base/map_variables.js';

export default class ClockComponent extends Component {
  constructor() {
    super({
      time: new Date(),
    });
    this._clockInterval = setInterval(this._updateTime.bind(this), 1000);
  }

  _updateTime() {
    if (!document.hidden) {
      this._setVariable('time', new Date());
    }
  }

  $detach() {
    clearInterval(this._clockInterval);
    this._clockInterval = null;
  }

  $render() {
    return render({
      type: 'div',
      textContent: mapVariables(
        [this._variables.time],
        (time) => time.toLocaleTimeString('de-DE'),
      ),
    });
  }
}