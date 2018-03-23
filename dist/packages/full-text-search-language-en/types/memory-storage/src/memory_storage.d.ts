import { Dict, StorageAdapter } from "../../common/types";
/**
 * An in-memory persistence adapter for an in-memory database.
 * This simple 'key/value' adapter is intended for unit testing and diagnostics.
 */
export declare class MemoryStorage implements StorageAdapter {
    hashStore: Dict<{
        savecount: number;
        lastsave: Date;
        value: string;
    }>;
    options: MemoryStorage.Options;
    /**
     * Registers the local storage as plugin.
     */
    static register(): void;
    /**
     * Deregisters the local storage as plugin.
     */
    static deregister(): void;
    /**
     * @param {object} options - memory storage options
     * @param {boolean} [options.asyncResponses=false] - whether callbacks are invoked asynchronously (default: false)
     * @param {int} [options.asyncTimeout=50] - timeout in ms to queue callbacks (default: 50)
     */
    constructor(options?: MemoryStorage.Options);
    /**
     * Loads a serialized database from its in-memory store.
     * (Loki persistence adapter interface function)
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @returns {Promise} a Promise that resolves after the database was loaded
     */
    loadDatabase(dbname: string): Promise<string>;
    /**
     * Saves a serialized database to its in-memory store.
     * (Loki persistence adapter interface function)
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @param {string} dbstring - the database content
     * @returns {Promise} a Promise that resolves after the database was persisted
     */
    saveDatabase(dbname: string, dbstring: string): Promise<void>;
    /**
     * Deletes a database from its in-memory store.
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @returns {Promise} a Promise that resolves after the database was deleted
     */
    deleteDatabase(dbname: string): Promise<void>;
}
export declare namespace MemoryStorage {
    interface Options {
        asyncResponses?: boolean;
        asyncTimeout?: number;
    }
}
