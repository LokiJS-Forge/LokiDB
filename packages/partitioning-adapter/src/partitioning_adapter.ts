import {Loki} from "../../loki/src/loki";
import {ANY, StorageAdapter} from "../../common/types";
import {PLUGINS} from "../../common/plugin";

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
export class LokiPartitioningAdapter implements StorageAdapter {

  public mode: string;
  private _adapter: StorageAdapter;
  private _dbref: ANY;
  private _dbname: string;
  private _pageIterator: LokiPartitioningAdapter.PageIterator;
  private _paging: boolean;
  private _pageSize: number;
  private _delimiter: string;
  private _dirtyPartitions: number[];

  /**
   * Registers the partitioning adapter as plugin.
   */
  static register(): void {
    PLUGINS["LokiPartitioningAdapter"] = LokiPartitioningAdapter;
  }

  /**
   * Deregisters the partitioning storage as plugin.
   */
  static deregister(): void {
    delete PLUGINS["LokiPartitioningAdapter"];
  }

  /**
   * @param {object} adapter - reference to a 'non-reference' mode loki adapter instance.
   * @param {boolean} paging - (default: false) set to true to enable paging collection data.
   * @param {number} pageSize - (default : 25MB) you can use this to limit size of strings passed to inner adapter.
   * @param {string} delimiter - allows you to override the default delimiter
   */
  constructor(adapter: StorageAdapter, {paging = false, pageSize = 25 * 1024 * 1024, delimiter = "$<\n"} = {}) {
    this.mode = "reference";
    this._adapter = null;
    this._dbref = null;
    this._dbname = "";
    this._pageIterator = {};

    // verify user passed an appropriate adapter
    if (adapter) {
      if (adapter.mode === "reference") {
        throw new Error("LokiPartitioningAdapter cannot be instantiated with a reference mode adapter.");
      } else {
        this._adapter = adapter;
      }
    } else {
      throw new Error("LokiPartitioningAdapter requires a (non-reference mode) adapter on construction.");
    }

    this._paging = paging;
    this._pageSize = pageSize;
    this._delimiter = delimiter;
  }

  /**
   * Loads a database which was partitioned into several key/value saves.
   * (Loki persistence adapter interface function)
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @returns {Promise} a Promise that resolves after the database was loaded
   */
  public loadDatabase(dbname: string): Promise<any> {
    this._dbname = dbname;
    this._dbref = new Loki(dbname);

    // load the db container (without data)
    return this._adapter.loadDatabase(dbname).then((result: string) => {
      if (typeof result !== "string") {
        throw new Error("LokiPartitioningAdapter received an unexpected response from inner adapter loadDatabase()");
      }

      // I will want to use loki destructuring helper methods so i will inflate into typed instance
      let db = JSON.parse(result);
      this._dbref.loadJSONObject(db);
      db = null;

      if (this._dbref._collections.length === 0) {
        return this._dbref;
      }

      this._pageIterator = {
        collection: 0,
        pageIndex: 0
      };

      return this._loadNextPartition(0).then(() => this._dbref);
    });
  }

  /**
   * Used to sequentially load each collection partition, one at a time.
   *
   * @param {int} partition - ordinal collection position to load next
   * @returns {Promise} a Promise that resolves after the next partition is loaded
   */
  private _loadNextPartition(partition: number): Promise<void> {
    const keyname = this._dbname + "." + partition;

    if (this._paging === true) {
      this._pageIterator.pageIndex = 0;
      return this._loadNextPage();
    }

    return this._adapter.loadDatabase(keyname).then((result: string) => {
      this._dbref._collections[partition]._data = this._dbref.deserializeCollection(result, {
        delimited: true,
        collectionIndex: partition
      });

      if (++partition < this._dbref._collections.length) {
        return this._loadNextPartition(partition);
      }
    });
  }

  /**
   * Used to sequentially load the next page of collection partition, one at a time.
   *
   * @returns {Promise} a Promise that resolves after the next page is loaded
   */
  private _loadNextPage(): Promise<void> {
    // calculate name for next saved page in sequence
    const keyname = this._dbname + "." + this._pageIterator.collection + "." + this._pageIterator.pageIndex;

    // load whatever page is next in sequence
    return this._adapter.loadDatabase(keyname).then((result: string) => {
      let data = result.split(this._delimiter);
      result = ""; // free up memory now that we have split it into array
      let dlen = data.length;
      let idx;

      // detect if last page by presence of final empty string element and remove it if so
      const isLastPage = (data[dlen - 1] === "");
      if (isLastPage) {
        data.pop();
        dlen = data.length;
        // empty collections are just a delimiter meaning two blank items
        if (data[dlen - 1] === "" && dlen === 1) {
          data.pop();
          dlen = data.length;
        }
      }

      // convert stringified array elements to object instances and push to collection data
      for (idx = 0; idx < dlen; idx++) {
        this._dbref._collections[this._pageIterator.collection]._data.push(JSON.parse(data[idx]));
        data[idx] = null;
      }
      data = [];

      // if last page, we are done with this partition
      if (isLastPage) {
        // if there are more partitions, kick off next partition load
        if (++this._pageIterator.collection < this._dbref._collections.length) {
          return this._loadNextPartition(this._pageIterator.collection);
        }
      } else {
        this._pageIterator.pageIndex++;
        return this._loadNextPage();
      }
    });
  }

  /**
   * Saves a database by partioning into separate key/value saves.
   * (Loki 'reference mode' persistence adapter interface function)
   *
   * @param {string} dbname - name of the database (filename/keyname)
   * @param {object} dbref - reference to database which we will partition and save.
   * @returns {Promise} a Promise that resolves after the database was deleted
   *
   */
  public exportDatabase(dbname: string, dbref: ANY): Promise<void> {
    let idx;
    const clen = dbref._collections.length;

    this._dbref = dbref;
    this._dbname = dbname;

    // queue up dirty partitions to be saved
    this._dirtyPartitions = [-1];
    for (idx = 0; idx < clen; idx++) {
      if (dbref._collections[idx].dirty) {
        this._dirtyPartitions.push(idx);
      }
    }

    return this._saveNextPartition();
  }

  /**
   * Helper method used internally to save each dirty collection, one at a time.
   *
   * @returns {Promise} a Promise that resolves after the next partition is saved
   */
  private _saveNextPartition(): Promise<void> {
    const partition = this._dirtyPartitions.shift();
    const keyname = this._dbname + ((partition === -1) ? "" : ("." + partition));

    // if we are doing paging and this is collection partition
    if (this._paging && partition !== -1) {
      this._pageIterator = {
        collection: partition,
        docIndex: 0,
        pageIndex: 0
      };

      // since saveNextPage recursively calls itself until done, our callback means this whole paged partition is finished
      return this._saveNextPage().then(() => {
        if (this._dirtyPartitions.length !== 0) {
          return this._saveNextPartition();
        }
      });
    }

    // otherwise this is 'non-paged' partioning...
    const result = this._dbref.serializeDestructured({
      partitioned: true,
      delimited: true,
      partition
    });

    return this._adapter.saveDatabase(keyname, result).then(() => {
      if (this._dirtyPartitions.length !== 0) {
        return this._saveNextPartition();
      }
    });
  }

  /**
   * Helper method used internally to generate and save the next page of the current (dirty) partition.
   *
   * @returns {Promise} a Promise that resolves after the next partition is saved
   */
  private _saveNextPage(): Promise<void> {
    const coll = this._dbref._collections[this._pageIterator.collection];
    const keyname = this._dbname + "." + this._pageIterator.collection + "." + this._pageIterator.pageIndex;
    let pageLen = 0;
    const cdlen = coll._data.length;
    const delimlen = this._delimiter.length;
    let serializedObject = "";
    let pageBuilder = "";
    let doneWithPartition = false;
    let doneWithPage = false;

    const pageSaveCallback = () => {
      pageBuilder = "";

      // update meta properties then continue process by invoking callback
      if (!doneWithPartition) {
        this._pageIterator.pageIndex++;
        return this._saveNextPage();
      }
    };

    if (coll._data.length === 0) {
      doneWithPartition = true;
    }

    while (!doneWithPartition && !doneWithPage) {
      if (!doneWithPartition) {
        // serialize object
        serializedObject = JSON.stringify(coll._data[this._pageIterator.docIndex]);
        pageBuilder += serializedObject;
        pageLen += serializedObject.length;

        // if no more documents in collection to add, we are done with partition
        if (++this._pageIterator.docIndex >= cdlen) doneWithPartition = true;
      }
      // if our current page is bigger than defined pageSize, we are done with page
      if (pageLen >= this._pageSize) doneWithPage = true;

      // if not done with current page, need delimiter before next item
      // if done with partition we also want a delmiter to indicate 'end of pages' final empty row
      if (!doneWithPage || doneWithPartition) {
        pageBuilder += this._delimiter;
        pageLen += delimlen;
      }
    }
    // if we are done with page save it and pass off to next recursive call or callback
    return this._adapter.saveDatabase(keyname, pageBuilder).then(pageSaveCallback);
  }
}

namespace LokiPartitioningAdapter {
  export interface PageIterator {
    collection?: ANY;
    docIndex?: number;
    pageIndex?: number;
  }
}

export default LokiPartitioningAdapter;
