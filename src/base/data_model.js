function createMetaData(modelName) {
  return {
    name: modelName,
    listeners: new Set(),
  };
}

const proxyHandler = {
  // getPrototypeOf(target) { },

  // setPrototypeOf(target, prototype) { },

  // isExtensible(target) { },

  // preventExtensions(target) { },

  // getOwnPropertyDescriptor(target, key) { },

  // defineProperty(target, key, descriptor) { },

  // has(target, key) { },

  // get(target, key) { },

  set(target, key, value, receiver) {
    target[key] = value;
    receiver.__meta__.listeners.forEach(
      listener => listener(key, value, receiver));
    return true;
  },

  deleteProperty(target, key) {
    throw new TypeError('cannot delete property of DataModel');
  },

  // ownKeys(target) { },

  // apply(target, thisArg, args) { },

  // construct(target, args, newTarget) { },
};

export function createDataModel(name, model = {}) {
  const proxifiedModel = {};
  for (const key in model) {
    const value = model[key];
    if (typeof value === 'object' && !Array.isArray(value)) {
      proxifiedModel[key] = createDataModel(`${name}.${key}`, value);
    } else {
      proxifiedModel[key] = value;
    }
  }
  proxifiedModel.__meta__ = createMetaData(name);
  Object.preventExtensions(proxifiedModel);
  return new Proxy(proxifiedModel, proxyHandler);
}

export function addDataModelListener(model, listener) {
  model.__meta__.listeners.add(listener);
}

export function removeDataModelListener(model, listener) {
  model.__meta__.listeners.delete(listener);
}