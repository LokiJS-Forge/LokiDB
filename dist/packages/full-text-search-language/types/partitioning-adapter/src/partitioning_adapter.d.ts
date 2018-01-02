import { Loki } from "../../loki/src/loki";
import { StorageAdapter } from "../../common/types";
/**
 * An adapter for adapters. Converts a non reference mode adapter into a reference mode adapter
 * which can perform destructuring and partitioning. Each collection will be stored in its own key/save and
 * only dirty collections will be saved. If you  turn on paging with default page size of 25megs and save
 * a 75 meg collection it should use up roughly 3 save slots (key/value pairs sent to inner adapter).
 * A dirty collection that spans three pages will save all three pages again
 * Paging mode was added mainly because Chrome has issues saving 'too large' of a string within a
 * single IndexedDB row. If a single document update causes the collection to be flagged as dirty, all
 * of that collection's pages will be written on next save.
 */
export declare class PartitioningAdapter implements StorageAdapter {
    mode: string;
    private _adapter;
    private _dbref;
    private _dbname;
    private _pageIterator;
    private _paging;
    private _pageSize;
    private _delimiter;
    private _dirtyPartitions;
    /**
     * Registers the partitioning adapter as plugin.
     */
    static register(): void;
    /**
     * Deregisters the partitioning storage as plugin.
     */
    static deregister(): void;
    /**
     * @param {object} adapter - reference to a 'non-reference' mode loki adapter instance.
     * @param {boolean} paging - (default: false) set to true to enable paging collection data.
     * @param {number} pageSize - (default : 25MB) you can use this to limit size of strings passed to inner adapter.
     * @param {string} delimiter - allows you to override the default delimiter
     */
    constructor(adapter: StorageAdapter, {paging, pageSize, delimiter}?: {
        paging?: boolean;
        pageSize?: number;
        delimiter?: string;
    });
    /**
     * Loads a database which was partitioned into several key/value saves.
     * (Loki persistence adapter interface function)
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @returns {Promise} a Promise that resolves after the database was loaded
     */
    loadDatabase(dbname: string): Promise<any>;
    /**
     * Used to sequentially load each collection partition, one at a time.
     *
     * @param {int} partition - ordinal collection position to load next
     * @returns {Promise} a Promise that resolves after the next partition is loaded
     */
    private _loadNextPartition(partition);
    /**
     * Used to sequentially load the next page of collection partition, one at a time.
     *
     * @returns {Promise} a Promise that resolves after the next page is loaded
     */
    private _loadNextPage();
    /**
     * Saves a database by partioning into separate key/value saves.
     * (Loki 'reference mode' persistence adapter interface function)
     *
     * @param {string} dbname - name of the database (filename/keyname)
     * @param {object} dbref - reference to database which we will partition and save.
     * @returns {Promise} a Promise that resolves after the database was deleted
     *
     */
    exportDatabase(dbname: string, dbref: Loki): Promise<void>;
    /**
     * Helper method used internally to save each dirty collection, one at a time.
     *
     * @returns {Promise} a Promise that resolves after the next partition is saved
     */
    private _saveNextPartition();
    /**
     * Helper method used internally to generate and save the next page of the current (dirty) partition.
     *
     * @returns {Promise} a Promise that resolves after the next partition is saved
     */
    private _saveNextPage();
}
