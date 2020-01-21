function invokeCallbacks(callbacks, ...args) {
  for (const callback of callbacks) {
    callback(...args);
  }
}

export default class Variable {
  constructor(value = undefined) {
    this._value = value;
    this._listeners = [];
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value !== this._value) {
      this._value = value;
      invokeCallbacks(this._listeners, this._value);
    }
  }

  onChange(callback) {
    this._listeners.push(callback);
  }

  removeChangeListener(callback) {
    this._listeners.splice(
      this._listeners.indexOf(callback),
      1);
  }
}