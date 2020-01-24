import Component from './base/component.js';
import render from './base/render.js';

export default class DebugMenuComponent extends Component {
  constructor() {
    super();
    this.closeAction = undefined;
    this._serviceWorker = undefined;
    navigator.serviceWorker.ready.then((registration) => {
      this._serviceWorker = registration;
    });
    this._actions = [{
      name: 'Clear cache',
      action: () => {
        if (this._serviceWorker.active) {
          this._serviceWorker.active.postMessage('clear-cache');
        } else {
          alert('No active ServiceWorker registration');
        }
      }
    }, {
      name: 'Activate update',
      action: () => {
        if (this._serviceWorker.waiting) {
          this._serviceWorker.waiting.postMessage('skip-waiting');
        } else {
          alert('No waiting ServiceWorker registration');
        }
      }
    }, {
      name: 'Close',
      action: () => {
        this._close();
      }
    }];
  }

  _close() {
    if (this.closeAction) {
      this.closeAction();
    }
  }

  $render() {
    return render({
      type: 'div',
      style: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      },
      onclick: () => {
        this._close();
      },
      children: this._actions.map((entry) => ({
        type: 'div',
        innerText: entry.name,
        onclick: (evt) => {
          entry.action();
          evt.stopPropagation();
        },
        style: {
          backgroundColor: '#775555',
          textAlign: 'center',
          padding: '1em',
          marginBottom: '0.5em',
        },
      })),
    });
  }
}