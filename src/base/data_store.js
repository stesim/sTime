const META_DATA = Symbol();

function createMetaData(storeName) {
  return {
    name: storeName,
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
    receiver[META_DATA].listeners.forEach(
      listener => listener(key, value, receiver));
    return true;
  },

  deleteProperty(target, key) {
    throw new TypeError('cannot delete property of DataStore');
  },

  // ownKeys(target) { },

  // apply(target, thisArg, args) { },

  // construct(target, args, newTarget) { },
};

export function createDataStore(name, data = {}) {
  const proxifiedData = {};
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // TODO(stesim): array proxy
      proxifiedData[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      proxifiedData[key] = createDataStore(`${name}.${key}`, value);
    } else {
      proxifiedData[key] = value;
    }
  });
  proxifiedData[META_DATA] = createMetaData(name);
  Object.preventExtensions(proxifiedData);
  return new Proxy(proxifiedData, proxyHandler);
}

export function addDataStoreListener(store, listener) {
  store[META_DATA].listeners.add(listener);
}

export function removeDataStoreListener(store, listener) {
  store[META_DATA].listeners.delete(listener);
}