import {LokiEventEmitter} from "./event_emitter";
import {ResultSet} from "./result_set";
import {Collection} from "./collection";
import {Doc, Filter} from "../../common/types";
import {ScoreResult} from "../../full-text-search/src/scorer";

/**
 * DynamicView class is a versatile 'live' view class which can have filters and sorts applied.
 *    Collection.addDynamicView(name) instantiates this DynamicView object and notifies it
 *    whenever documents are add/updated/removed so it can remain up-to-date. (chainable)
 *
 * @example
 * let mydv = mycollection.addDynamicView('test');  // default is non-persistent
 * mydv.applyFind({ 'doors' : 4 });
 * mydv.applyWhere(function(obj) { return obj.name === 'Toyota'; });
 * let results = mydv.data();
 *
 * @extends LokiEventEmitter

 * @see {@link Collection#addDynamicView} to construct instances of DynamicView
 */
export class DynamicView<E extends object = object> extends LokiEventEmitter {

  private _collection: Collection<E>;
  private _persistent: boolean;
  private _sortPriority: DynamicView.SortPriority;
  private _minRebuildInterval: number;
  public name: string;
  private _rebuildPending: boolean;

  private _resultset: ResultSet<E>;
  private _resultdata: Doc<E>[];
  private _resultsdirty: boolean;

  private _cachedresultset: ResultSet<E>;

  private _filterPipeline: Filter<E>[];


  private _sortFunction: (lhs: E, rhs: E) => number;
  private _sortCriteria: (string | [string, boolean])[];
  private _sortByScoring: boolean;
  private _sortDirty: boolean;

  /**
   * Constructor.
   * @param {Collection} collection - a reference to the collection to work agains
   * @param {string} name - the name of this dynamic view
   * @param {object} options - the options
   * @param {boolean} [options.persistent=false] - indicates if view is to main internal results array in 'resultdata'
   * @param {string} [options.sortPriority="passive"] - the sort priority
   * @param {number} [options.minRebuildInterval=1] - minimum rebuild interval (need clarification to docs here)
   */
  constructor(collection: Collection<E>, name: string, options: DynamicView.Options = {}) {
    super();
    (
      {
        persistent: this._persistent = false,
        sortPriority: this._sortPriority = "passive",
        minRebuildInterval: this._minRebuildInterval = 1
      } = options
    );

    this._collection = collection;
    this.name = name;
    this._rebuildPending = false;

    // 'passive' will defer the sort phase until they call data(). (most efficient overall)
    // 'active' will sort async whenever next idle. (prioritizes read speeds)

    this._resultset = new ResultSet(collection);
    this._resultdata = [];
    this._resultsdirty = false;

    this._cachedresultset = null;

    // keep ordered filter pipeline
    this._filterPipeline = [];

    // sorting member variables
    // we only support one active search, applied using applySort() or applySimpleSort()
    this._sortFunction = null;
    this._sortCriteria = null;
    this._sortByScoring = null;
    this._sortDirty = false;

    // for now just have 1 event for when we finally rebuilt lazy view
    // once we refactor transactions, i will tie in certain transactional events

    this.events = {
      "rebuild": []
    };
  }

  /**
   * Internally used immediately after deserialization (loading)
   *    This will clear out and reapply filterPipeline ops, recreating the view.
   *    Since where filters do not persist correctly, this method allows
   *    restoring the view to state where user can re-apply those where filters.
   *
   * @param removeWhereFilters
   * @returns {DynamicView} This dynamic view for further chained ops.
   * @fires DynamicView.rebuild
   */
  _rematerialize({removeWhereFilters = false}): DynamicView<E> {
    this._resultdata = [];
    this._resultsdirty = true;
    this._resultset = new ResultSet(this._collection);

    if (this._sortFunction || this._sortCriteria || this._sortByScoring !== null) {
      this._sortDirty = true;
    }

    if (removeWhereFilters) {
      // for each view see if it had any where filters applied... since they don't
      // serialize those functions lets remove those invalid filters
      let fpi = this._filterPipeline.length;
      while (fpi--) {
        if (this._filterPipeline[fpi].type === "where") {
          if (fpi !== this._filterPipeline.length - 1) {
            this._filterPipeline[fpi] = this._filterPipeline[this._filterPipeline.length - 1];
          }
          this._filterPipeline.length--;
        }
      }
    }

    // back up old filter pipeline, clear filter pipeline, and reapply pipeline ops
    const ofp = this._filterPipeline;
    this._filterPipeline = [];

    // now re-apply 'find' filterPipeline ops
    for (let idx = 0; idx < ofp.length; idx++) {
      this.applyFind(ofp[idx].val);
    }

    // during creation of unit tests, i will remove this forced refresh and leave lazy
    this.data();

    // emit rebuild event in case user wants to be notified
    this.emit("rebuild", this);

    return this;
  }

  /**
   * Makes a copy of the internal resultset for branched queries.
   * Unlike this dynamic view, the branched resultset will not be 'live' updated,
   * so your branched query should be immediately resolved and not held for future evaluation.
   *
   * @param {(string|array=)} transform - Optional name of collection transform, or an array of transform steps
   * @param {object} parameters - optional parameters (if optional transform requires them)
   * @returns {ResultSet} A copy of the internal resultset for branched queries.
   */
  public branchResultset(transform: string | Collection.Transform[], parameters?: object): ResultSet<E> {
    const rs = this._resultset.branch();
    if (transform === undefined) {
      return rs;
    }
    return rs.transform(transform, parameters);
  }

  /**
   * Override of toJSON to avoid circular references.
   */
  public toJSON(): DynamicView.Serialized {
    return {
      name: this.name,
      _persistent: this._persistent,
      _sortPriority: this._sortPriority,
      _minRebuildInterval: this._minRebuildInterval,
      _resultset: this._resultset,
      _filterPipeline: this._filterPipeline,
      _sortCriteria: this._sortCriteria,
      _sortByScoring: this._sortByScoring,
      _sortDirty: this._sortDirty,
    };
  }

  public static fromJSONObject(collection: Collection, obj: DynamicView.Serialized): DynamicView {
    let dv = new DynamicView(collection, obj.name);
    dv._resultsdirty = true;
    dv._filterPipeline = obj._filterPipeline;
    dv._resultdata = [];
    dv._sortCriteria = obj._sortCriteria;
    dv._sortByScoring = obj._sortByScoring;
    dv._sortDirty = obj._sortDirty;
    dv._resultset._filteredRows = obj._resultset._filteredRows;
    dv._resultset._filterInitialized = obj._resultset._filterInitialized;
    dv._rematerialize({
      removeWhereFilters: true
    });
    return dv;
  }

  /**
   * Used to clear pipeline and reset dynamic view to initial state.
   *     Existing options should be retained.
   * @param {boolean} queueSortPhase - (default: false) if true we will async rebuild view (maybe set default to true in future?)
   */
  public removeFilters({queueSortPhase = false} = {}): void {
    this._rebuildPending = false;
    this._resultset.reset();
    this._resultdata = [];
    this._resultsdirty = true;

    this._cachedresultset = null;

    // keep ordered filter pipeline
    this._filterPipeline = [];

    // sorting member variables
    // we only support one active search, applied using applySort() or applySimpleSort()
    this._sortFunction = null;
    this._sortCriteria = null;
    this._sortByScoring = null;
    this._sortDirty = false;

    if (queueSortPhase === true) {
      this._queueSortPhase();
    }
  }

  /**
   * Used to apply a sort to the dynamic view
   * @example
   * dv.applySort(function(obj1, obj2) {
	 *   if (obj1.name === obj2.name) return 0;
	 *   if (obj1.name > obj2.name) return 1;
	 *   if (obj1.name < obj2.name) return -1;
	 * });
   *
   * @param {function} comparefun - a javascript compare function used for sorting
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public applySort(comparefun: (lhs: E, rhs: E) => number): DynamicView<E> {
    this._sortFunction = comparefun;
    this._sortCriteria = null;
    this._sortByScoring = null;
    this._queueSortPhase();
    return this;
  }

  /**
   * Used to specify a property used for view translation.
   * @example
   * dv.applySimpleSort("name");
   *
   * @param {string} propname - Name of property by which to sort.
   * @param {boolean} isdesc - (Optional) If true, the sort will be in descending order.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public applySimpleSort(propname: string, isdesc?: boolean): DynamicView<E> {
    this._sortCriteria = [
      [propname, isdesc || false]
    ];
    this._sortFunction = null;
    this._sortByScoring = null;
    this._queueSortPhase();
    return this;
  }

  /**
   * Allows sorting a resultset based on multiple columns.
   * @example
   * // to sort by age and then name (both ascending)
   * dv.applySortCriteria(['age', 'name']);
   * // to sort by age (ascending) and then by name (descending)
   * dv.applySortCriteria(['age', ['name', true]);
   * // to sort by age (descending) and then by name (descending)
   * dv.applySortCriteria(['age', true], ['name', true]);
   *
   * @param {Array} criteria - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
   * @returns {DynamicView} Reference to this DynamicView, sorted, for future chain operations.
   */
  public applySortCriteria(criteria: (string | [string, boolean])[]): DynamicView<E> {
    this._sortCriteria = criteria;
    this._sortFunction = null;
    this._sortByScoring = null;
    this._queueSortPhase();
    return this;
  }

  /**
   * Used to apply a sort by the latest full-text-search scoring.
   * @param {boolean} [ascending=false] - sort ascending
   */
  public applySortByScoring(ascending = false): DynamicView<E> {
    this._sortFunction = null;
    this._sortCriteria = null;
    this._sortByScoring = ascending;
    this._queueSortPhase();
    return this;
  }

  /**
   * Returns the scoring of the last full-text-search.
   * @returns {ScoreResult}
   */
  public getScoring(): ScoreResult {
    return this._resultset.getScoring();
  }

  /**
   * Marks the beginning of a transaction.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public startTransaction(): DynamicView<E> {
    this._cachedresultset = this._resultset.copy();
    return this;
  }

  /**
   * Commits a transaction.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public commit(): DynamicView<E> {
    this._cachedresultset = null;
    return this;
  }

  /**
   * Rolls back a transaction.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public rollback(): DynamicView<E> {
    this._resultset = this._cachedresultset;

    if (this._persistent) {
      // for now just rebuild the persistent dynamic view data in this worst case scenario
      // (a persistent view utilizing transactions which get rolled back), we already know the filter so not too bad.
      this._resultdata = this._resultset.data();

      this.emit("rebuild", this);
    }
    return this;
  }

  /**
   * Find the index of a filter in the pipeline, by that filter's ID.
   *
   * @param {(string|number)} uid - The unique ID of the filter.
   * @returns {number}: index of the referenced filter in the pipeline; -1 if not found.
   */
  private _indexOfFilterWithId(uid: string | number): number {
    if (typeof uid === "string" || typeof uid === "number") {
      for (let idx = 0, len = this._filterPipeline.length; idx < len; idx += 1) {
        if (uid === this._filterPipeline[idx].uid) {
          return idx;
        }
      }
    }
    return -1;
  }

  /**
   * Add the filter object to the end of view's filter pipeline and apply the filter to the resultset.
   *
   * @param {object} filter - The filter object. Refer to applyFilter() for extra details.
   */
  private _addFilter(filter: Filter<E>): void {
    this._filterPipeline.push(filter);
    this._resultset[filter.type](filter.val);
  }

  /**
   * Reapply all the filters in the current pipeline.
   *
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public reapplyFilters(): DynamicView<E> {
    this._resultset.reset();

    this._cachedresultset = null;
    if (this._persistent) {
      this._resultdata = [];
      this._resultsdirty = true;
    }

    const filters = this._filterPipeline;
    this._filterPipeline = [];

    for (let idx = 0, len = filters.length; idx < len; idx += 1) {
      this._addFilter(filters[idx]);
    }

    if (this._sortFunction || this._sortCriteria || this._sortByScoring !== null) {
      this._queueSortPhase();
    } else {
      this._queueRebuildEvent();
    }

    return this;
  }

  /**
   * Adds or updates a filter in the DynamicView filter pipeline
   *
   * @param {object} filter - A filter object to add to the pipeline.
   *    The object is in the format { 'type': filter_type, 'val', filter_param, 'uid', optional_filter_id }
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public applyFilter(filter: Filter<E>): DynamicView<E> {
    const idx = this._indexOfFilterWithId(filter.uid);
    if (idx >= 0) {
      this._filterPipeline[idx] = filter;
      return this.reapplyFilters();
    }

    this._cachedresultset = null;
    if (this._persistent) {
      this._resultdata = [];
      this._resultsdirty = true;
    }

    this._addFilter(filter);

    if (this._sortFunction || this._sortCriteria || this._sortByScoring !== null) {
      this._queueSortPhase();
    } else {
      this._queueRebuildEvent();
    }
    return this;
  }

  /**
   * applyFind() - Adds or updates a mongo-style query option in the DynamicView filter pipeline
   *
   * @param {object} query - A mongo-style query object to apply to pipeline
   * @param {(string|number)} uid - Optional: The unique ID of this filter, to reference it in the future.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public applyFind(query: object, uid: string | number = ""): DynamicView<E> {
    this.applyFilter({
      type: "find",
      val: query,
      uid
    });
    return this;
  }

  /**
   * applyWhere() - Adds or updates a javascript filter function in the DynamicView filter pipeline
   *
   * @param {function} fun - A javascript filter function to apply to pipeline
   * @param {(string|number)} uid - Optional: The unique ID of this filter, to reference it in the future.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public applyWhere(fun: (obj: E) => boolean, uid?: string | number): DynamicView<E> {
    this.applyFilter({
      type: "where",
      val: fun,
      uid
    });
    return this;
  }

  /**
   * removeFilter() - Remove the specified filter from the DynamicView filter pipeline
   *
   * @param {(string|number)} uid - The unique ID of the filter to be removed.
   * @returns {DynamicView} this DynamicView object, for further chain ops.
   */
  public removeFilter(uid: string | number): DynamicView<E> {
    const idx = this._indexOfFilterWithId(uid);
    if (idx < 0) {
      throw new Error("Dynamic view does not contain a filter with ID: " + uid);
    }

    this._filterPipeline.splice(idx, 1);
    this.reapplyFilters();
    return this;
  }

  /**
   * Returns the number of documents representing the current DynamicView contents.
   * @returns {number} The number of documents representing the current DynamicView contents.
   */
  public count(): number {
    // in order to be accurate we will pay the minimum cost (and not alter dv state management)
    // recurring resultset data resolutions should know internally its already up to date.
    // for persistent data this will not update resultdata nor fire rebuild event.
    if (this._resultsdirty) {
      this._resultdata = this._resultset.data();
    }

    return this._resultset.count();
  }

  /**
   * Resolves and pending filtering and sorting, then returns document array as result.
   *
   * @param {object} options - optional parameters to pass to resultset.data() if non-persistent
   * @param {boolean} [options.forceClones] - Allows forcing the return of cloned objects even when
   *        the collection is not configured for clone object.
   * @param {string} [options.forceCloneMethod] - Allows overriding the default or collection specified cloning method.
   *        Possible values include 'parse-stringify', 'jquery-extend-deep', 'shallow', 'shallow-assign'
   * @param {boolean} [options.removeMeta] - will force clones and strip $loki and meta properties from documents
   *
   * @returns {Array} An array of documents representing the current DynamicView contents.
   */
  public data(options: ResultSet.DataOptions = {}): Doc<E>[] {
    // using final sort phase as 'catch all' for a few use cases which require full rebuild
    if (this._sortDirty || this._resultsdirty) {
      this._performSortPhase({
        suppressRebuildEvent: true
      });
    }
    return (this._persistent) ? (this._resultdata) : (this._resultset.data(options));
  }

  /**
   * When the view is not sorted we may still wish to be notified of rebuild events.
   * This event will throttle and queue a single rebuild event when batches of updates affect the view.
   */
  private _queueRebuildEvent(): void {
    if (this._rebuildPending) {
      return;
    }
    this._rebuildPending = true;

    setTimeout(() => {
      if (this._rebuildPending) {
        this._rebuildPending = false;
        this.emit("rebuild", this);
      }
    }, this._minRebuildInterval);
  }

  /**
   * If the view is sorted we will throttle sorting to either :
   *    (1) passive - when the user calls data(), or
   *    (2) active - once they stop updating and yield js thread control
   */
  private _queueSortPhase(): void {
    // already queued? exit without queuing again
    if (this._sortDirty) {
      return;
    }
    this._sortDirty = true;

    if (this._sortPriority === "active") {
      // active sorting... once they are done and yield js thread, run async performSortPhase()
      setTimeout(() => {
        this._performSortPhase();
      }, this._minRebuildInterval);
    } else {
      // must be passive sorting... since not calling performSortPhase (until data call), lets use queueRebuildEvent to
      // potentially notify user that data has changed.
      this._queueRebuildEvent();
    }
  }

  /**
   * Invoked synchronously or asynchronously to perform final sort phase (if needed)
   */
  private _performSortPhase(options: { suppressRebuildEvent?: boolean } = {}): void {
    // async call to this may have been pre-empted by synchronous call to data before async could fire
    if (!this._sortDirty && !this._resultsdirty) {
      return;
    }

    if (this._sortDirty) {
      if (this._sortFunction) {
        this._resultset.sort(this._sortFunction);
      } else if (this._sortCriteria) {
        this._resultset.compoundsort(this._sortCriteria);
      } else if (this._sortByScoring !== null) {
        this._resultset.sortByScoring(this._sortByScoring);
      }

      this._sortDirty = false;
    }

    if (this._persistent) {
      // persistent view, rebuild local resultdata array
      this._resultdata = this._resultset.data();
      this._resultsdirty = false;
    }

    if (!options.suppressRebuildEvent) {
      this.emit("rebuild", this);
    }
  }

  /**
   * (Re)evaluating document inclusion.
   *    Called by : collection.insert() and collection.update().
   *
   * @param {int} objIndex - index of document to (re)run through filter pipeline.
   * @param {boolean} isNew - true if the document was just added to the collection.
   */
  _evaluateDocument(objIndex: number, isNew: boolean) {
    // if no filter applied yet, the result 'set' should remain 'everything'
    if (!this._resultset._filterInitialized) {
      if (this._persistent) {
        this._resultdata = this._resultset.data();
      }
      // need to re-sort to sort new document
      if (this._sortFunction || this._sortCriteria) {
        this._queueSortPhase();
      } else {
        this._queueRebuildEvent();
      }
      return;
    }

    const ofr = this._resultset._filteredRows;
    const oldPos = (isNew) ? (-1) : (ofr.indexOf(+objIndex));
    const oldlen = ofr.length;

    // creating a 1-element resultset to run filter chain ops on to see if that doc passes filters;
    // mostly efficient algorithm, slight stack overhead price (this function is called on inserts and updates)
    const evalResultset = new ResultSet(this._collection);
    evalResultset._filteredRows = [objIndex];
    evalResultset._filterInitialized = true;
    let filter;
    for (let idx = 0, len = this._filterPipeline.length; idx < len; idx++) {
      filter = this._filterPipeline[idx];
      evalResultset[filter.type](filter.val);
    }

    // not a true position, but -1 if not pass our filter(s), 0 if passed filter(s)
    const newPos = (evalResultset._filteredRows.length === 0) ? -1 : 0;

    // wasn't in old, shouldn't be now... do nothing
    if (oldPos === -1 && newPos === -1) return;

    // wasn't in resultset, should be now... add
    if (oldPos === -1 && newPos !== -1) {
      ofr.push(objIndex);

      if (this._persistent) {
        this._resultdata.push(this._collection.data[objIndex]);
      }

      // need to re-sort to sort new document
      if (this._sortFunction || this._sortCriteria) {
        this._queueSortPhase();
      } else {
        this._queueRebuildEvent();
      }

      return;
    }

    // was in resultset, shouldn't be now... delete
    if (oldPos !== -1 && newPos === -1) {
      if (oldPos < oldlen - 1) {
        ofr.splice(oldPos, 1);

        if (this._persistent) {
          this._resultdata.splice(oldPos, 1);
        }
      } else {
        ofr.length = oldlen - 1;

        if (this._persistent) {
          this._resultdata.length = oldlen - 1;
        }
      }

      // in case changes to data altered a sort column
      if (this._sortFunction || this._sortCriteria) {
        this._queueSortPhase();
      } else {
        this._queueRebuildEvent();
      }
      return;
    }

    // was in resultset, should still be now... (update persistent only?)
    if (oldPos !== -1 && newPos !== -1) {
      if (this._persistent) {
        // in case document changed, replace persistent view data with the latest collection.data document
        this._resultdata[oldPos] = this._collection.data[objIndex];
      }

      // in case changes to data altered a sort column
      if (this._sortFunction || this._sortCriteria) {
        this._queueSortPhase();
      } else {
        this._queueRebuildEvent();
      }
    }
  }

  /**
   * internal function called on collection.delete()
   */
  _removeDocument(objIndex: number) {
    // if no filter applied yet, the result 'set' should remain 'everything'
    if (!this._resultset._filterInitialized) {
      if (this._persistent) {
        this._resultdata = this._resultset.data();
      }
      // in case changes to data altered a sort column
      if (this._sortFunction || this._sortCriteria) {
        this._queueSortPhase();
      } else {
        this._queueRebuildEvent();
      }
      return;
    }

    const ofr = this._resultset._filteredRows;
    const oldPos = ofr.indexOf(+objIndex);
    let oldlen = ofr.length;
    let idx;

    if (oldPos !== -1) {
      // if not last row in resultdata, swap last to hole and truncate last row
      if (oldPos < oldlen - 1) {
        ofr[oldPos] = ofr[oldlen - 1];
        ofr.length = oldlen - 1;

        if (this._persistent) {
          this._resultdata[oldPos] = this._resultdata[oldlen - 1];
          this._resultdata.length = oldlen - 1;
        }
      }
      // last row, so just truncate last row
      else {
        ofr.length = oldlen - 1;

        if (this._persistent) {
          this._resultdata.length = oldlen - 1;
        }
      }

      // in case changes to data altered a sort column
      if (this._sortFunction || this._sortCriteria) {
        this._queueSortPhase();
      } else {
        this._queueRebuildEvent();
      }
    }

    // since we are using filteredRows to store data array positions
    // if they remove a document (whether in our view or not),
    // we need to adjust array positions -1 for all document array references after that position
    oldlen = ofr.length;
    for (idx = 0; idx < oldlen; idx++) {
      if (ofr[idx] > objIndex) {
        ofr[idx]--;
      }
    }
  }

  /**
   * Data transformation via user supplied functions
   *
   * @param {function} mapFunction - this function accepts a single document for you to transform and return
   * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
   * @returns The output of your reduceFunction
   */
  public mapReduce<T, U>(mapFunction: (item: E, index: number, array: E[]) => T, reduceFunction: (array: T[]) => U): U {
    try {
      return reduceFunction(this.data().map(mapFunction));
    } catch (err) {
      throw err;
    }
  }
}

export namespace DynamicView {
  export interface Options {
    persistent?: boolean;
    sortPriority?: SortPriority;
    minRebuildInterval?: number;
  }

  export type SortPriority = "passive" | "active";

  export interface Serialized {
    name: string;
    _persistent: boolean;
    _sortPriority: SortPriority;
    _minRebuildInterval: number;
    _resultset: ResultSet;
    _filterPipeline: Filter<any>[];
    _sortCriteria: (string | [string, boolean])[];
    _sortByScoring: boolean;
    _sortDirty: boolean;
  }
}
