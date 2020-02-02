import Variable from './variable.js';

function callback() {
  for (const callback of this._listeners) {
    callback(this.value);
  }
}

class TransformedVariable extends Variable {
  constructor(originalVariables, transform) {
    super();
    this._originalVariables = originalVariables;
    this._transform = transform;
    this._callback = callback.bind(this);

    for (const variable of this._originalVariables) {
      variable.onChange(this._callback);
    }
  }

  get value() {
    return this._transform(...this._originalVariables.map(variable => variable.value));
  }

  set value(value) {
    throw new Error('cannot assign to mapped variables');
  }

  removeChangeListener(callback) {
    super.removeChangeListener(callback);
    for (const variable of this._originalVariables) {
      variable.removeChangeListener(this._callback);
    }
  }
}

export default function mapVariables(variables, transform) {
  return new TransformedVariable(variables, transform);
}