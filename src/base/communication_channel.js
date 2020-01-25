function invokeListeners(listeners, arg) {
  listeners.forEach(listener => listener(arg));
}

export default class CommunicationChannel {
  constructor() {
    this._endpoint1Listeners = [];
    this._endpoint2Listeners = [];

    this._endpoint1 = {
      subscribe: listener => this._endpoint1Listeners.push(listener),
      publish: message => invokeListeners(this._endpoint2Listeners, message),
    };

    this._endpoint2 = {
      subscribe: listener => this._endpoint2Listeners.push(listener),
      publish: message => invokeListeners(this._endpoint1Listeners, message),
    };
  }

  get endpoint1() {
    return this._endpoint1;
  }

  get endpoint2() {
    return this._endpoint2;
  }
}