import {Loki} from "../../loki/src/loki";

function localStorageAvailable() {
  try {
    return (window && window.localStorage !== undefined && window.localStorage !== null);
  } catch (e) {
    return false;
  }
}

/**
 * A loki persistence adapter which persists to web browser's local storage object
 * @constructor LokiLocalStorageAdapter
 */
export class LokiLocalStorage {
  /**
	 * loadDatabase() - Load data from localstorage
	 * @param {string} dbname - the name of the database to load
	 * @returns {Promise} a Promise that resolves after the database was loaded
	 */
  loadDatabase(dbname) {
    if (localStorageAvailable()) {
      return Promise.resolve(localStorage.getItem(dbname));
    }

    return Promise.reject(new Error("localStorage is not available"));
  }

  /**
	 * saveDatabase() - save data to localstorage, will throw an error if the file can't be saved
	 * might want to expand this to avoid dataloss on partial save
	 * @param {string} dbname - the filename of the database to load
	 * @returns {Promise} a Promise that resolves after the database was saved
	 */
  saveDatabase(dbname, dbstring) {
    if (localStorageAvailable()) {
      localStorage.setItem(dbname, dbstring);

      return Promise.resolve();
    }

    return Promise.reject(new Error("localStorage is not available"));
  }

  /**
	 * deleteDatabase() - delete the database from localstorage, will throw an error if it
	 * can't be deleted
	 * @param {string} dbname - the filename of the database to delete
	 * @returns {Promise} a Promise that resolves after the database was deleted
	 */
  deleteDatabase(dbname) {
    if (localStorageAvailable()) {
      localStorage.removeItem(dbname);

      return Promise.resolve();
    }

    return Promise.reject(new Error("localStorage is not available"));
  }
}

Loki.LokiLocalStorage = LokiLocalStorage;

export default LokiLocalStorage;
