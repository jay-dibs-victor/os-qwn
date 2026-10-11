let _singleton: LocalConfigStore | null = null;

class LocalConfigStore {
  private dataStore: { [key: string]: any };

  constructor() {
    if (!_singleton) {
      _singleton = this;
    }

    this.dataStore = {};

    return _singleton;
  }

  setItem(key: string, val: any): void {
    this.dataStore[key] = val;
  }

  getItem(key: string): any {
    return this.dataStore[key];
  }
}

const Store = new LocalConfigStore();

export default Store;
