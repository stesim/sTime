import AppController from './app_controller.js';
import CommunicationChannel from './base/communication_channel.js';
import AppRootComponent from './ui/app_root_component.js';
import dataStore from './app_data_store.js';

class App {
  constructor(serviceWorkerPath) {
    navigator.serviceWorker
      .register(serviceWorkerPath)
      .then(registration => this._onServiceWorkerLoaded(registration))
      .catch((error) => alert(`Failed to register service worker.\n\n${error.stack}`));

    this._dataStore = dataStore;
    this._communicationChannel = new CommunicationChannel();
    this._appController = null;
    this._ui = null;
  }

  _onServiceWorkerLoaded(serviceWorkerRegistration) {
    navigator.serviceWorker
      .addEventListener('message', evt => this._processServiceWorkerMessage(evt.data));
    
    this._createAppController(serviceWorkerRegistration);
    this._createUi();
  }

  _processServiceWorkerMessage(message) {
    switch (message) {
      case 'reload':
        window.location.reload();
        break;
    }
  }

  _createAppController(serviceWorkerRegistration) {
    this._appController = new AppController(
      serviceWorkerRegistration,
      this._dataStore,
      this._communicationChannel.endpoint1);
  }

  _createUi() {
    this._ui = new AppRootComponent(
      this._dataStore,
      this._communicationChannel.endpoint2);
    document.body.appendChild(this._ui.$render());
  }
}

window.sTime = new App('sw.js');
