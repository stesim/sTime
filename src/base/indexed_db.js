function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = (evt => resolve(evt.target.result));
    request.onerror = (evt => reject(evt.target.error));
  });
}

class TransactionStore {
  constructor(store) {
    this._store = store;
  }

  add(value, key) {
    return promisifyRequest(
      this._store.add(value, key));
  }

  getAll(query, count) {
    return promisifyRequest(
      this._store.getAll(query, count));
  }

  clear() {
    return promisifyRequest(
      this._store.clear());
  }
}

export default class IndexedDB {
  constructor(name, version, onOpen, onError, onUpgradeNeeded) {
    const request = indexedDB.open(name, version);
    request.onsuccess = (evt) => {
      this._db = evt.target.result;
      if (onOpen) {
        onOpen();
      }
    };
    request.onerror = (evt) => {
      if (onError) {
        onError(evt.target.error);
      }
    };
    request.onupgradeneeded = (evt) => {
      if (onUpgradeNeeded) {
        this._upgradeDb = evt.target.result;
        onUpgradeNeeded(evt.oldVersion);
        this._upgradeDb = null;
      }
    };
    
    this._db = null;
    this._upgradeDb = null;
  }

  static open(name, version, onUpgradeNeeded) {
    return new Promise((resolve, reject) => {
      const db = new IndexedDB(
        name,
        version,
        () => resolve(db),
        (error) => reject(error),
        (oldVersion) => onUpgradeNeeded(db, oldVersion));
    });
  }

  static delete(name) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      // FIXME(stesim): callbacks are never called
      request.onsuccess = () => resolve();
      request.onerror = (evt) => reject(evt.target.error);
    });
  }

  close() {
    this._db.close();
  }

  containsStore(name) {
    if (this._upgradeDb === null) {
      throw new Error('IndexedDB.containsStore() can be called only from the upgradeNeeded callback');
    }
    return this._upgradeDb.objectStoreNames.contains(name);
  }

  createStore(name, options) {
    if (this._upgradeDb === null) {
      throw new Error('IndexedDB.createStore() can be called only from the upgradeNeeded callback');
    }
    return this._upgradeDb.createObjectStore(name, options);
  }

  transaction(stores, access, action) {
    return new Promise((resolve, reject) => {
      const transaction = this._db.transaction(stores, access);
      transaction.oncomplete = () => {
        resolve();
      }
      transaction.onabort = (evt) => reject(evt.target.error);
      // transaction.onerror = (evt) => console.error('IndexedDB transaction error', evt.target.error);

      if (Array.isArray(stores)) {
        const transactionStores = {};
        for (const store of stores) {
          transactionStores[store] =
            new TransactionStore(transaction.objectStore(store));
        }
        action(transactionStores);
      } else {
        const transactionStore =
          new TransactionStore(transaction.objectStore(stores));
        action(transactionStore);
      }
    });
  }
}