import { PLUGINS } from "../../common/plugin";
import { StorageAdapter } from "../../common/types";

/**
 * A loki persistence adapter which persists to web browser's local storage object
 * @constructor LocalStorageAdapter
 */
export class LocalStorage implements StorageAdapter {
  /**
   * Registers the local storage as plugin.
   */
  static register(): void {
    PLUGINS["LocalStorage"] = LocalStorage;
  }

  /**
   * Deregisters the local storage as plugin.
   */
  static deregister(): void {
    delete PLUGINS["LocalStorage"];
  }

  /**
   * loadDatabase() - Load data from localstorage
   * @param {string} dbname - the name of the database to load
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  loadDatabase(dbname: string) {
    return Promise.resolve(localStorage.getItem(dbname));
  }

  /**
   * saveDatabase() - save data to localstorage, will throw an error if the file can't be saved
   * might want to expand this to avoid dataloss on partial save
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was saved
   */
  saveDatabase(dbname: string, dbstring: string) {
    return Promise.resolve(localStorage.setItem(dbname, dbstring));
  }

  /**
   * deleteDatabase() - delete the database from localstorage, will throw an error if it
   * can't be deleted
   * @param {string} dbname - the filename of the database to delete
   * @returns {Promise} a Promise that resolves after the database was deleted
   */
  deleteDatabase(dbname: string) {
    return Promise.resolve(localStorage.removeItem(dbname));
  }
}

export default LocalStorage;
