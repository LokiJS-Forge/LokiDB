import { PLUGINS } from "../../common/plugin";
import { StorageAdapter } from "../../common/types";
import { Storage } from "./types";

/**
 * A loki persistence adapter which persists to web browser's local storage object
 * @constructor LocalStorageAdapter
 */
export class LocalStorage implements StorageAdapter {
  private storage: Storage;

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
   * @param {Storage} [constructor=window.localStorage] - Application name context can be used to distinguish subdomains, "loki" by default
   */
  constructor(storage: Storage = window.localStorage) {
    this.storage = storage;
  }

  /**
   * loadDatabase() - Load data from localstorage
   * @param {string} dbname - the name of the database to load
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  async loadDatabase(dbname: string) {
    return this.storage.getItem(dbname);
  }

  /**
   * saveDatabase() - save data to localstorage, will throw an error if the file can't be saved
   * might want to expand this to avoid dataloss on partial save
   * @param {string} dbname - the filename of the database to load
   * @returns {Promise} a Promise that resolves after the database was saved
   */
  async saveDatabase(dbname: string, dbstring: string) {
    return this.storage.setItem(dbname, dbstring);
  }

  /**
   * deleteDatabase() - delete the database from localstorage, will throw an error if it
   * can't be deleted
   * @param {string} dbname - the filename of the database to delete
   * @returns {Promise} a Promise that resolves after the database was deleted
   */
  async deleteDatabase(dbname: string) {
    return this.storage.removeItem(dbname);
  }
}

export default LocalStorage;
