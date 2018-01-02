import { StorageAdapter } from "../../common/types";
/**
 * Loki persistence adapter class for indexedDb.
 *     This class fulfills abstract adapter interface which can be applied to other storage methods.
 *     Utilizes the included LokiCatalog app/key/value database for actual database persistence.
 *     IndexedDb storage is provided per-domain, so we implement app/key/value database to
 *     allow separate contexts for separate apps within a domain.
 */
export declare class IndexedStorage implements StorageAdapter {
    private _appname;
    private catalog;
    /**
     * Registers the indexed storage as plugin.
     */
    static register(): void;
    /**
     * Deregisters the indexed storage as plugin.
     */
    static deregister(): void;
    /**
     * @param {string} [appname=loki] - Application name context can be used to distinguish subdomains, "loki" by default
     */
    constructor(appname?: string);
    /**
     * Retrieves a serialized db string from the catalog.
     *
     * @example
     * // LOAD
     * var idbAdapter = new LokiIndexedAdapter("finance");
     * var db = new loki("test", { adapter: idbAdapter });
     *   db.base(function(result) {
       *   console.log("done");
       * });
     *
     * @param {string} dbname - the name of the database to retrieve.
     * @returns {Promise} a Promise that resolves after the database was loaded
     */
    loadDatabase(dbname: string): Promise<{}>;
    /**
     * Saves a serialized db to the catalog.
     *
     * @example
     * // SAVE : will save App/Key/Val as "finance"/"test"/{serializedDb}
     * let idbAdapter = new LokiIndexedAdapter("finance");
     * let db = new loki("test", { adapter: idbAdapter });
     * let coll = db.addCollection("testColl");
     * coll.insert({test: "val"});
     * db.saveDatabase();  // could pass callback if needed for async complete
     *
     * @param {string} dbname - the name to give the serialized database within the catalog.
     * @param {string} dbstring - the serialized db string to save.
     * @returns {Promise} a Promise that resolves after the database was persisted
     */
    saveDatabase(dbname: string, dbstring: string): Promise<void>;
    /**
     * Deletes a serialized db from the catalog.
     *
     * @example
     * // DELETE DATABASE
     * // delete "finance"/"test" value from catalog
     * idbAdapter.deleteDatabase("test", function {
       *   // database deleted
       * });
     *
     * @param {string} dbname - the name of the database to delete from the catalog.
     * @returns {Promise} a Promise that resolves after the database was deleted
     */
    deleteDatabase(dbname: string): Promise<void>;
    /**
     * Removes all database partitions and pages with the base filename passed in.
     * This utility method does not (yet) guarantee async deletions will be completed before returning
     *
     * @param {string} dbname - the base filename which container, partitions, or pages are derived
     */
    deleteDatabasePartitions(dbname: string): void;
    /**
     * Retrieves object array of catalog entries for current app.
     *
     * @example
     * idbAdapter.getDatabaseList(function(result) {
       *   // result is array of string names for that appcontext ("finance")
       *   result.forEach(function(str) {
       *     console.log(str);
       *   });
       * });
     *
     * @param {function} callback - should accept array of database names in the catalog for current app.
     */
    getDatabaseList(callback: (names: string[]) => void): void;
    /**
     * Allows retrieval of list of all keys in catalog along with size
     * @param {function} callback - (Optional) callback to accept result array.
     */
    getCatalogSummary(callback: (entry: Entry[]) => void): void;
}
export interface Entry {
    app: string;
    key: string;
    size: number;
}
export default IndexedStorage;
