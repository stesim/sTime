function notImplementedHandler() {
  throw new Error('not implemented');
}

function deregisterVariableListener({variable, listener}) {
  variable.removeChangeListener(listener);
}

export default class Component {
  constructor() {
    this._variableListeners = new Set();
  }

  setProperty(name, value) {
    if (name in this) {
      this[name] = value;
    } else {
      throw new TypeError(`cannot assign non-existing property: ${name}`);
    }
  }

  addVariableListener(variable, listener) {
    this._variableListeners.add({variable, listener});
    variable.onChange(listener);
  }

  removeVariableListener(variable, listener) {
    for (const registration of this._variableListeners) {
      if (registration.variable == variable &&
          registration.listener == listener) {
        deregisterVariableListener(registration);
        this._variableListeners.delete(registration);
        break;
      }
    }
  }

  $render() {
    notImplementedHandler();
  }

  $attach() {
    notImplementedHandler();
  }

  $detach() {
    for (const registration of this._variableListeners) {
      deregisterVariableListener(registration);
    }
    this._variableListeners.clear();
  }
}