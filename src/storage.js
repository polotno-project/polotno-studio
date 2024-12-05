import localforage from 'localforage';

const inMemoryStorage = {
  data: new Map(),
  async getItem(key) {
    return this.data.get(key);
  },
  async setItem(key, value) {
    this.data.set(key, value);
  },
  async removeItem(key) {
    this.data.delete(key);
  },
  async clear() {
    this.data.clear();
  },
};

let storage = localforage;
// Check if any storage is supported, otherwise use in-memory
if (
  !localforage.supports(localforage.INDEXEDDB) &&
  !localforage.supports(localforage.WEBSQL) &&
  !localforage.supports(localforage.LOCALSTORAGE)
) {
  storage = inMemoryStorage;
}

window.storage = storage;

export { storage };
