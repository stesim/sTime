import App from './pwa-base/app.js';
import AppController from './app_controller.js';
import AppRootComponent from './ui/app_root_component.js';
import appDataStore from './app_data_store.js';

const app = new App(
  'sw.js',
  appDataStore,
  (dataStore, appCommunication, uiCommunication) => new AppController(dataStore, appCommunication, uiCommunication),
  (dataStore, controllerCommunication) => new AppRootComponent(dataStore, controllerCommunication),
);

window.addEventListener('beforeunload', () => {
  app.unload();
});

window.sTime = app;
