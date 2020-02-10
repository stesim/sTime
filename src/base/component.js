import Variable from './variable.js';

function notImplementedHandler() {
  throw new Error('not implemented');
}

function deregisterVariableListener({variable, listener}) {
  variable.removeChangeListener(listener);
}

function createVariables(initialValues) {
  const variables = {};
  for (const key in initialValues) {
    variables[key] = new Variable(initialValues[key]);
  }
  return variables;
}

// function defineVariableAccessors(componentClass, variables) {
//   variables.forEach(variable => {
//     Object.defineProperty(componentClass.prototype, variable, {
//       get: function() {
//         return this._variables[key].value;
//       },
//       set: function(value) {
//         this._variables[variable].value = value;
//       },
//     });
//   });
// }

export default class Component {
  constructor(variables = {}) {
    this._variables = createVariables(variables);
    this._variableListeners = new Set();
  }

  setProperty(name, value) {
    if (name in this) {
      this[name] = value;
    } else if (name in this._variables) {
      this._setVariable(name, value);
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
      if (registration.variable === variable &&
          registration.listener === listener) {
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

  _setVariable(key, value) {
    this._variables[key].value = value;
  }
}