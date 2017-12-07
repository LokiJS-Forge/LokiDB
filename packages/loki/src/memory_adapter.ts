import {Dict, StorageAdapter} from "../../common/types";

/**
 * In in-memory persistence adapter for an in-memory database.
 * This simple 'key/value' adapter is intended for unit testing and diagnostics.
 */
export class LokiMemoryAdapter implements StorageAdapter {

  private _hashStore: Dict<{
    savecount: number;
    lastsave: Date;
    value: string;
  }>;
  private _options: LokiMemoryAdapter.Options;

  /**
   * @param {object} options - memory adapter options
   * @param {boolean} [options.asyncResponses=false] - whether callbacks are invoked asynchronously (default: false)
   * @param {int} [options.asyncTimeout=50] - timeout in ms to queue callbacks (default: 50)
   */
  constructor(options?: LokiMemoryAdapter.Options) {
    this._hashStore = {};
    this._options = options || {};

    if (this._options.asyncResponses === undefined) {
      this._options.asyncResponses = false;
    }

    if (this._options.asyncTimeout === undefined) {
      this._options.asyncTimeout = 50; // 50 ms default
    }
  }

  /**
   * Loads a serialized database from its in-memory store.
   * (Loki persistence adapter interface function)
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  loadDatabase(dbname: string): Promise<string> {
    if (this._options.asyncResponses) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (this._hashStore[dbname] !== undefined) {
            resolve(this._hashStore[dbname].value);
          }
          else {
            reject(new Error("unable to load database, " + dbname + " was not found in memory adapter"));
          }
        }, this._options.asyncTimeout);
      });
    }
    else {
      if (this._hashStore[dbname] !== undefined) {
        return Promise.resolve(this._hashStore[dbname].value);
      }
      else {
        return Promise.reject(new Error("unable to load database, " + dbname + " was not found in memory adapter"));
      }
    }
  }

  /**
   * Saves a serialized database to its in-memory store.
   * (Loki persistence adapter interface function)
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @returns {Promise} a Promise that resolves after the database was persisted
   */
  saveDatabase(dbname: string, dbstring: string): Promise<void> {
    if (this._options.asyncResponses) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const saveCount = (this._hashStore[dbname] !== undefined ? this._hashStore[dbname].savecount : 0);

          this._hashStore[dbname] = {
            savecount: saveCount + 1,
            lastsave: new Date(),
            value: dbstring
          };

          resolve();
        }, this._options.asyncTimeout);
        return Promise.resolve();
      });
    } else {
      const saveCount = (this._hashStore[dbname] !== undefined ? this._hashStore[dbname].savecount : 0);

      this._hashStore[dbname] = {
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
  deleteDatabase(dbname: string): Promise<void> {
    delete this._hashStore[dbname];
    return Promise.resolve();
  }
}

export namespace LokiMemoryAdapter {
  export interface Options {
    asyncResponses?: boolean;
    asyncTimeout?: number;
  }
}
