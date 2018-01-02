import { StorageAdapter } from "../../common/types";
/**
 * A loki persistence adapter which persists to web browser's local storage object
 * @constructor LocalStorageAdapter
 */
export declare class LocalStorage implements StorageAdapter {
    /**
     * Registers the local storage as plugin.
     */
    static register(): void;
    /**
     * Deregisters the local storage as plugin.
     */
    static deregister(): void;
    /**
     * loadDatabase() - Load data from localstorage
     * @param {string} dbname - the name of the database to load
     * @returns {Promise} a Promise that resolves after the database was loaded
     */
    loadDatabase(dbname: string): Promise<string>;
    /**
     * saveDatabase() - save data to localstorage, will throw an error if the file can't be saved
     * might want to expand this to avoid dataloss on partial save
     * @param {string} dbname - the filename of the database to load
     * @returns {Promise} a Promise that resolves after the database was saved
     */
    saveDatabase(dbname: string, dbstring: string): Promise<void>;
    /**
     * deleteDatabase() - delete the database from localstorage, will throw an error if it
     * can't be deleted
     * @param {string} dbname - the filename of the database to delete
     * @returns {Promise} a Promise that resolves after the database was deleted
     */
    deleteDatabase(dbname: string): Promise<void>;
}
export default LocalStorage;
