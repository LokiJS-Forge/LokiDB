import {Loki} from './loki';

/**
 * An adapter for adapters.  Converts a non reference mode adapter into a reference mode adapter
 * which can perform destructuring and partioning.  Each collection will be stored in its own key/save and
 * only dirty collections will be saved.  If you  turn on paging with default page size of 25megs and save
 * a 75 meg collection it should use up roughly 3 save slots (key/value pairs sent to inner adapter).
 * A dirty collection that spans three pages will save all three pages again
 * Paging mode was added mainly because Chrome has issues saving 'too large' of a string within a
 * single indexeddb row.  If a single document update causes the collection to be flagged as dirty, all
 * of that collection's pages will be written on next save.
 *
 * @param {object} adapter - reference to a 'non-reference' mode loki adapter instance.
 * @param {object=} options - configuration options for partitioning and paging
 * @param {bool} options.paging - (default: false) set to true to enable paging collection data.
 * @param {int} options.pageSize - (default : 25MB) you can use this to limit size of strings passed to inner adapter.
 * @param {string} options.delimiter - allows you to override the default delimeter
 * @constructor LokiPartitioningAdapter
 */
export class LokiPartitioningAdapter {

  constructor(adapter, options = {}) {
    this.mode = "reference";
    this.adapter = null;
    this.options = options;
    this.dbref = null;
    this.dbname = "";
    this.pageIterator = {};

		// verify user passed an appropriate adapter
    if (adapter) {
      if (adapter.mode === "reference") {
        throw new Error("LokiPartitioningAdapter cannot be instantiated with a reference mode adapter");
      } else {
        this.adapter = adapter;
      }
    } else {
      throw new Error("LokiPartitioningAdapter requires a (non-reference mode) adapter on construction");
    }

		// set collection paging defaults
    if (this.options.paging === undefined) {
      this.options.paging = false;
    }

		// default to page size of 25 megs (can be up to your largest serialized object size larger than this)
    if (this.options.pageSize === undefined) {
      this.options.pageSize = 25 * 1024 * 1024;
    }

    if (this.options.delimiter === undefined) {
      this.options.delimiter = '$<\n';
    }
  }

	/**
	 * Loads a database which was partitioned into several key/value saves.
	 * (Loki persistence adapter interface function)
	 *
	 * @param {string} dbname - name of the database (filename/keyname)
	 * @returns {Promise} a Promise that resolves after the database was loaded
	 * @memberof LokiMemoryAdapter
	 */
  loadDatabase(dbname) {
    this.dbname = dbname;
    this.dbref = new Loki(dbname);

		// load the db container (without data)
    return this.adapter.loadDatabase(dbname).then((result) => {
      if (typeof result !== "string") {
        throw new Error("LokiPartitioningAdapter received an unexpected response from inner adapter loadDatabase()");
      }

			// I will want to use loki destructuring helper methods so i will inflate into typed instance
      let db = JSON.parse(result);
      this.dbref.loadJSONObject(db);
      db = null;

      const clen = this.dbref.collections.length;

      if (this.dbref.collections.length === 0) {
        return this.dbref;
      }

      this.pageIterator = {
        collection: 0,
        pageIndex: 0
      };

      return this.loadNextPartition(0).then(() => this.dbref);
    });
  }

	/**
	 * Used to sequentially load each collection partition, one at a time.
	 *
	 * @param {int} partition - ordinal collection position to load next
	 * @returns {Promise} a Promise that resolves after the next partition is loaded
	 */
  loadNextPartition(partition) {
    const keyname = this.dbname + "." + partition;

    if (this.options.paging === true) {
      this.pageIterator.pageIndex = 0;
      return this.loadNextPage();
    }

    return this.adapter.loadDatabase(keyname).then((result) => {
      const data = this.dbref.deserializeCollection(result, {
        delimited: true,
        collectionIndex: partition
      });
      this.dbref.collections[partition].data = data;

      if (++partition < this.dbref.collections.length) {
        return this.loadNextPartition(partition);
      }
    });
  }

	/**
	 * Used to sequentially load the next page of collection partition, one at a time.
	 *
	 * @returns {Promise} a Promise that resolves after the next page is loaded
	 */
  loadNextPage() {
		// calculate name for next saved page in sequence
    const keyname = this.dbname + "." + this.pageIterator.collection + "." + this.pageIterator.pageIndex;

		// load whatever page is next in sequence
    return this.adapter.loadDatabase(keyname).then((result) => {
      let data = result.split(this.options.delimiter);
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
        this.dbref.collections[this.pageIterator.collection].data.push(JSON.parse(data[idx]));
        data[idx] = null;
      }
      data = [];

			// if last page, we are done with this partition
      if (isLastPage) {
				// if there are more partitions, kick off next partition load
        if (++this.pageIterator.collection < this.dbref.collections.length) {
          return this.loadNextPartition(this.pageIterator.collection);
        }
      } else {
        this.pageIterator.pageIndex++;
        return this.loadNextPage();
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
	 * @memberof LokiPartitioningAdapter
	 */
  exportDatabase(dbname, dbref) {
    let idx;
    const clen = dbref.collections.length;

    this.dbref = dbref;
    this.dbname = dbname;

		// queue up dirty partitions to be saved
    this.dirtyPartitions = [-1];
    for (idx = 0; idx < clen; idx++) {
      if (dbref.collections[idx].dirty) {
        this.dirtyPartitions.push(idx);
      }
    }

    return this.saveNextPartition();
  }

	/**
	 * Helper method used internally to save each dirty collection, one at a time.
	 *
	 * @returns {Promise} a Promise that resolves after the next partition is saved
	 */
  saveNextPartition() {
    const partition = this.dirtyPartitions.shift();
    const keyname = this.dbname + ((partition === -1) ? "" : ("." + partition));

		// if we are doing paging and this is collection partition
    if (this.options.paging && partition !== -1) {
      this.pageIterator = {
        collection: partition,
        docIndex: 0,
        pageIndex: 0
      };

			// since saveNextPage recursively calls itself until done, our callback means this whole paged partition is finished
      return this.saveNextPage().then(() => {
        if (this.dirtyPartitions.length !== 0) {
          return this.saveNextPartition();
        }
      });
    }

		// otherwise this is 'non-paged' partioning...
    const result = this.dbref.serializeDestructured({
      partitioned: true,
      delimited: true,
      partition
    });

    return this.adapter.saveDatabase(keyname, result).then(() => {
      if (this.dirtyPartitions.length !== 0) {
        return this.saveNextPartition();
      }
    });
  }

	/**
	 * Helper method used internally to generate and save the next page of the current (dirty) partition.
	 *
	 * @returns {Promise} a Promise that resolves after the next partition is saved
	 */
  saveNextPage() {
    const coll = this.dbref.collections[this.pageIterator.collection];
    const keyname = this.dbname + "." + this.pageIterator.collection + "." + this.pageIterator.pageIndex;
    let pageLen = 0;
    const cdlen = coll.data.length;
    const delimlen = this.options.delimiter.length;
    let serializedObject = "";
    let pageBuilder = "";
    let doneWithPartition = false;
    let doneWithPage = false;

    const pageSaveCallback = () => {
      pageBuilder = "";

			// update meta properties then continue process by invoking callback
      if (!doneWithPartition) {
        this.pageIterator.pageIndex++;
        return this.saveNextPage();
      }
    };

    if (coll.data.length === 0) {
      doneWithPartition = true;
    }

    while (true) {
      if (!doneWithPartition) {
				// serialize object
        serializedObject = JSON.stringify(coll.data[this.pageIterator.docIndex]);
        pageBuilder += serializedObject;
        pageLen += serializedObject.length;

				// if no more documents in collection to add, we are done with partition
        if (++this.pageIterator.docIndex >= cdlen) doneWithPartition = true;
      }
			// if our current page is bigger than defined pageSize, we are done with page
      if (pageLen >= this.options.pageSize) doneWithPage = true;

			// if not done with current page, need delimiter before next item
			// if done with partition we also want a delmiter to indicate 'end of pages' final empty row
      if (!doneWithPage || doneWithPartition) {
        pageBuilder += this.options.delimiter;
        pageLen += delimlen;
      }

			// if we are done with page save it and pass off to next recursive call or callback
      if (doneWithPartition || doneWithPage) {
        return this.adapter.saveDatabase(keyname, pageBuilder).then(pageSaveCallback);
      }
    }
  }
}
