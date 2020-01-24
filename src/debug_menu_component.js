import Component from './base/component.js';
import render from './base/render.js';

export default class DebugMenuComponent extends Component {
  constructor() {
    super();
    this.closeAction = undefined;
    this._activeServiceWorker = undefined;
    navigator.serviceWorker.ready.then((registration) => {
      this._activeServiceWorker = registration.active;
    });
    this._actions = [{
      name: 'Clear cache',
      action: () => {
        if (this._activeServiceWorker) {
          this._activeServiceWorker.postMessage('clear-cache');
          console.debug('sent clear-cache message');
        } else {
          alert('No active ServiceWorker registration');
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