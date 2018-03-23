import { StorageAdapter } from "../../common/types";
/**
 * A loki persistence adapter which persists using node fs module.
 */
export declare class FSStorage implements StorageAdapter {
    /**
     * Registers the fs storage as plugin.
     */
    static register(): void;
    /**
     * Deregisters the fs storage as plugin.
     */
    static deregister(): void;
    /**
     * Load data from file, will throw an error if the file does not exist
     * @param {string} dbname - the filename of the database to load
     * @returns {Promise} a Promise that resolves after the database was loaded
     */
    loadDatabase(dbname: string): Promise<any>;
    /**
     * Save data to file, will throw an error if the file can't be saved
     * might want to expand this to avoid dataloss on partial save
     * @param {string} dbname - the filename of the database to load
     * @returns {Promise} a Promise that resolves after the database was persisted
     */
    saveDatabase(dbname: string, dbstring: string): Promise<void>;
    /**
     * Delete the database file, will throw an error if the
     * file can't be deleted
     * @param {string} dbname - the filename of the database to delete
     * @returns {Promise} a Promise that resolves after the database was deleted
     */
    deleteDatabase(dbname: string): Promise<void>;
}
