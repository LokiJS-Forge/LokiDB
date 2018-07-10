import { PLUGINS } from "../../common/plugin";
import { Dict, StorageAdapter } from "../../common/types";

/**
 * An in-memory persistence adapter for an in-memory database.
 * This simple 'key/value' adapter is intended for unit testing and diagnostics.
 */
export class MemoryStorage implements StorageAdapter {

  public hashStore: Dict<{
    savecount: number;
    lastsave: Date;
    value: string;
  }>;
  public options: MemoryStorage.Options;

  /**
   * Registers the local storage as plugin.
   */
  static register(): void {
    PLUGINS["MemoryStorage"] = MemoryStorage;
  }

  /**
   * Deregisters the local storage as plugin.
   */
  static deregister(): void {
    delete PLUGINS["MemoryStorage"];
  }

  /**
   * @param {object} options - memory storage options
   * @param {boolean} [options.asyncResponses=false] - whether callbacks are invoked asynchronously (default: false)
   * @param {int} [options.asyncTimeout=50] - timeout in ms to queue callbacks (default: 50)
   */
  constructor(options?: MemoryStorage.Options) {
    this.hashStore = {};
    this.options = options || {};

    if (this.options.asyncResponses === undefined) {
      this.options.asyncResponses = false;
    }

    if (this.options.asyncTimeout === undefined) {
      this.options.asyncTimeout = 50; // 50 ms default
    }
  }

  /**
   * Loads a serialized database from its in-memory store.
   * (Loki persistence adapter interface function)
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  public loadDatabase(dbname: string): Promise<string> {
    if (this.options.asyncResponses) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this.hashStore[dbname] !== undefined) {
            resolve(this.hashStore[dbname].value);
          }
          else {
            reject(new Error("unable to load database, " + dbname + " was not found in memory storage"));
          }
        }, this.options.asyncTimeout);
      });
    }
    else {
      if (this.hashStore[dbname] !== undefined) {
        return Promise.resolve(this.hashStore[dbname].value);
      }
      else {
        return Promise.reject(new Error("unable to load database, " + dbname + " was not found in memory storage"));
      }
    }
  }

  /**
   * Saves a serialized database to its in-memory store.
   * (Loki persistence adapter interface function)
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @param {string} dbstring - the database content
   * @returns {Promise} a Promise that resolves after the database was persisted
   */
  public saveDatabase(dbname: string, dbstring: string): Promise<void> {
    if (this.options.asyncResponses) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const saveCount = (this.hashStore[dbname] !== undefined ? this.hashStore[dbname].savecount : 0);

          this.hashStore[dbname] = {
            savecount: saveCount + 1,
            lastsave: new Date(),
            value: dbstring
          };

          resolve();
        }, this.options.asyncTimeout);
        return Promise.resolve();
      });
    } else {
      const saveCount = (this.hashStore[dbname] !== undefined ? this.hashStore[dbname].savecount : 0);

      this.hashStore[dbname] = {
        savecount: saveCount + 1,
        lastsave: new Date(),
        value: dbstring
      };

      return Promise.resolve();
    }
  }

  /**
   * Deletes a database from its in-memory store.
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @returns {Promise} a Promise that resolves after the database was deleted
   */
  public deleteDatabase(dbname: string): Promise<void> {
    delete this.hashStore[dbname];
    return Promise.resolve();
  }
}

export namespace MemoryStorage {
  export interface Options {
    asyncResponses?: boolean;
    asyncTimeout?: number;
  }
}
