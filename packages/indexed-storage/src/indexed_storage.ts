import {PLUGINS} from "../../common/plugin";
import {StorageAdapter} from "../../common/types";

/*
 Loki IndexedDb Adapter (need to include this script to use it)

 Console Usage can be used for management/diagnostic, here are a few examples :
 adapter.getDatabaseList(); // with no callback passed, this method will log results to console
 adapter.saveDatabase("UserDatabase", JSON.stringify(myDb));
 adapter.loadDatabase("UserDatabase"); // will log the serialized db to console
 adapter.deleteDatabase("UserDatabase");

 Should usercallback be still used?
 */

/**
 * @hidden
 */
declare type ANY = any;

/**
 * Loki persistence adapter class for indexedDb.
 *     This class fulfills abstract adapter interface which can be applied to other storage methods.
 *     Utilizes the included LokiCatalog app/key/value database for actual database persistence.
 *     IndexedDb storage is provided per-domain, so we implement app/key/value database to
 *     allow separate contexts for separate apps within a domain.
 */
export class IndexedStorage implements StorageAdapter {
  private _appname: string;
  private catalog: any;

  /**
   * Registers the indexed storage as plugin.
   */
  static register(): void {
    PLUGINS["IndexedStorage"] = IndexedStorage;
  }

  /**
   * Deregisters the indexed storage as plugin.
   */
  static deregister(): void {
    delete PLUGINS["IndexedStorage"];
  }

  /**
   * @param {string} [appname=loki] - Application name context can be used to distinguish subdomains, "loki" by default
   */
  constructor(appname: string = "loki") {
    this._appname = appname;

    // keep reference to catalog class for base AKV operations
    this.catalog = null;
  }

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
  loadDatabase(dbname: string) {
    const appName = this._appname;
    const adapter = this;

    // lazy open/create db reference so dont -need- callback in constructor
    if (this.catalog === null || this.catalog.db === null) {
      return new Promise((resolve) => {
        adapter.catalog = new LokiCatalog((cat: LokiCatalog) => {
          adapter.catalog = cat;
          resolve(adapter.loadDatabase(dbname));
        });
      });
    }
    // lookup up db string in AKV db
    return new Promise((resolve) => {
      this.catalog.getAppKey(appName, dbname, (result: ANY) => {
        if (result.id === 0) {
          resolve();
          return;
        }
        resolve(result.val);
      });
    });
  }

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
  saveDatabase(dbname: string, dbstring: string): Promise<void> {
    const appName = this._appname;
    const adapter = this;

    let resolve: ANY;
    let reject: ANY;
    const result = new Promise((res: ANY, rej: ANY) => {
      resolve = res;
      reject = rej;
    });

    function saveCallback(result: ANY) {
      if (result && result.success === true) {
        resolve();
      } else {
        reject(new Error("Error saving database"));
      }
    }

    // lazy open/create db reference so dont -need- callback in constructor
    if (this.catalog === null || this.catalog.db === null) {
      this.catalog = new LokiCatalog((cat: LokiCatalog) => {
        adapter.catalog = cat;

        // now that catalog has been initialized, set (add/update) the AKV entry
        cat.setAppKey(appName, dbname, dbstring, saveCallback);
      });

      return Promise.resolve() as Promise<void>;
    }

    // set (add/update) entry to AKV database
    this.catalog.setAppKey(appName, dbname, dbstring, saveCallback);

    return Promise.resolve() as Promise<void>;
  }

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
  deleteDatabase(dbname: string): Promise<void> {
    const appName = this._appname;
    const adapter = this;

    // lazy open/create db reference and pass callback ahead
    if (this.catalog === null || this.catalog.db === null) {
      return new Promise((resolve) => {
        adapter.catalog = new LokiCatalog((cat: LokiCatalog) => {
          adapter.catalog = cat;

          resolve(adapter.deleteDatabase(dbname));
        });
      });
    }

    // catalog was already initialized, so just lookup object and delete by id
    return new Promise((resolve) => {
      this.catalog.getAppKey(appName, dbname, (result: ANY) => {
        const id = result.id;

        if (id !== 0) {
          adapter.catalog.deleteAppKey(id);
        }

        resolve();
      });
    });
  }

  /**
   * Removes all database partitions and pages with the base filename passed in.
   * This utility method does not (yet) guarantee async deletions will be completed before returning
   *
   * @param {string} dbname - the base filename which container, partitions, or pages are derived
   */
  deleteDatabasePartitions(dbname: string) {
    this.getDatabaseList((result: string[]) => {
      result.forEach((str) => {
        if (str.startsWith(dbname)) {
          this.deleteDatabase(str);
        }
      });
    });
  }

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
  getDatabaseList(callback: (names: string[]) => void) {
    const appName = this._appname;
    const adapter = this;

    // lazy open/create db reference so dont -need- callback in constructor
    if (this.catalog === null || this.catalog.db === null) {
      this.catalog = new LokiCatalog((cat: LokiCatalog) => {
        adapter.catalog = cat;

        adapter.getDatabaseList(callback);
      });

      return;
    }

    // catalog already initialized
    // get all keys for current appName, and transpose results so just string array
    this.catalog.getAppKeys(appName, (results: ANY) => {
      const names = [];

      for (let idx = 0; idx < results.length; idx++) {
        names.push(results[idx].key);
      }

      if (typeof(callback) === "function") {
        callback(names);
      } else {
        names.forEach(() => {
          // console.log(obj);
        });
      }
    });
  }

  /**
   * Allows retrieval of list of all keys in catalog along with size
   * @param {function} callback - (Optional) callback to accept result array.
   */
  public getCatalogSummary(callback: (entry: Entry[]) => void) {
    const adapter = this;

    // lazy open/create db reference
    if (this.catalog === null || this.catalog.db === null) {
      this.catalog = new LokiCatalog((cat: LokiCatalog) => {
        adapter.catalog = cat;

        adapter.getCatalogSummary(callback);
      });

      return;
    }

    // catalog already initialized
    // get all keys for current appName, and transpose results so just string array
    this.catalog.getAllKeys((results: ANY) => {
      const entries = [];
      let obj;
      let size;
      let oapp;
      let okey;
      let oval;

      for (let idx = 0; idx < results.length; idx++) {
        obj = results[idx];
        oapp = obj.app || "";
        okey = obj.key || "";
        oval = obj.val || "";

        // app and key are composited into an appkey column so we will mult by 2
        size = oapp.length * 2 + okey.length * 2 + oval.length + 1;

        entries.push({
          "app": obj.app,
          "key": obj.key,
          "size": size
        });
      }

      if (typeof(callback) === "function") {
        callback(entries);
      } else {
        entries.forEach(() => {
          // console.log(obj);
        });
      }
    });
  }
}

export interface Entry {
  app: string;
  key: string;
  size: number;
}

/**
 * LokiCatalog - underlying App/Key/Value catalog persistence
 *    This non-interface class implements the actual persistence.
 *    Used by the LokiIndexedStorage class.
 */
class LokiCatalog {
  public db: ANY;

  constructor(callback: any) {
    this.db = null;
    this.initializeLokiCatalog(callback);
  }

  initializeLokiCatalog(callback: any) {
    const openRequest = indexedDB.open("LokiCatalog", 1);
    const cat = this;

    // If database doesn't exist yet or its version is lower than our version specified above (2nd param in line above)
    openRequest.onupgradeneeded = (e: ANY) => {
      const thisDB = e.target.result;
      if (thisDB.objectStoreNames.contains("LokiAKV")) {
        thisDB.deleteObjectStore("LokiAKV");
      }

      if (!thisDB.objectStoreNames.contains("LokiAKV")) {
        const objectStore = thisDB.createObjectStore("LokiAKV", {
          keyPath: "id",
          autoIncrement: true
        });
        objectStore.createIndex("app", "app", {
          unique: false
        });
        objectStore.createIndex("key", "key", {
          unique: false
        });
        // hack to simulate composite key since overhead is low (main size should be in val field)
        // user (me) required to duplicate the app and key into comma delimited appkey field off object
        // This will allow retrieving single record with that composite key as well as
        // still supporting opening cursors on app or key alone
        objectStore.createIndex("appkey", "appkey", {
          unique: true
        });
      }
    };

    openRequest.onsuccess = (e: ANY) => {
      cat.db = e.target.result;

      if (typeof(callback) === "function")
        callback(cat);
    };

    openRequest.onerror = (e: ANY) => {
      throw e;
    };
  }

  getAppKey(app: string, key: string, callback: any) {
    const transaction = this.db.transaction(["LokiAKV"], "readonly");
    const store = transaction.objectStore("LokiAKV");
    const index = store.index("appkey");
    const appkey = app + "," + key;
    const request = index.get(appkey);

    request.onsuccess = (((usercallback) => (e: ANY) => {
      let lres = e.target.result;

      if (lres === null || lres === undefined) {
        lres = {
          id: 0,
          success: false
        };
      }

      if (typeof(usercallback) === "function") {
        usercallback(lres);
      } else {
        // console.log(lres);
      }
    }))(callback);

    request.onerror = (((usercallback) => (e: ANY) => {
      if (typeof(usercallback) === "function") {
        usercallback({
          id: 0,
          success: false
        });
      } else {
        throw e;
      }
    }))(callback);
  }

  getAppKeyById(id: string, callback: ANY, data: ANY) {
    const transaction = this.db.transaction(["LokiAKV"], "readonly");
    const store = transaction.objectStore("LokiAKV");
    const request = store.get(id);

    request.onsuccess = (((data, usercallback) => (e: ANY) => {
      if (typeof(usercallback) === "function") {
        usercallback(e.target.result, data);
      } else {
        // console.log(e.target.result);
      }
    }))(data, callback);
  }

  setAppKey(app: string, key: string, val: string, callback: any) {
    const transaction = this.db.transaction(["LokiAKV"], "readwrite");
    const store = transaction.objectStore("LokiAKV");
    const index = store.index("appkey");
    const appkey = app + "," + key;
    const request = index.get(appkey);

    // first try to retrieve an existing object by that key
    // need to do this because to update an object you need to have id in object, otherwise it will append id with new autocounter and clash the unique index appkey
    request.onsuccess = (e: ANY) => {
      let res = e.target.result;

      if (res === null || res === undefined) {
        res = {
          app,
          key,
          appkey: app + "," + key,
          val
        };
      } else {
        res.val = val;
      }

      const requestPut = store.put(res);

      requestPut.onerror = (((usercallback) => () => {
        if (typeof(usercallback) === "function") {
          usercallback({
            success: false
          });
        } else {
          // console.error("LokiCatalog.setAppKey (set) onerror");
          // console.error(request.error);
        }
      }))(callback);

      requestPut.onsuccess = (((usercallback) => () => {
        if (typeof(usercallback) === "function") {
          usercallback({
            success: true
          });
        }
      }))(callback);
    };

    request.onerror = (((usercallback) => () => {
      if (typeof(usercallback) === "function") {
        usercallback({
          success: false
        });
      } else {
        // console.error("LokiCatalog.setAppKey (get) onerror");
        // console.error(request.error);
      }
    }))(callback);
  }

  deleteAppKey(id: string, callback: any) {
    const transaction = this.db.transaction(["LokiAKV"], "readwrite");
    const store = transaction.objectStore("LokiAKV");
    const request = store.delete(id);

    request.onsuccess = (((usercallback) => () => {
      if (typeof(usercallback) === "function") usercallback({
        success: true
      });
    }))(callback);

    request.onerror = (((usercallback) => () => {
      if (typeof(usercallback) === "function") {
        usercallback(false);
      } else {
        // console.error("LokiCatalog.deleteAppKey raised onerror");
        // console.error(request.error);
      }
    }))(callback);
  }

  getAppKeys(app: string, callback: any) {
    const transaction = this.db.transaction(["LokiAKV"], "readonly");
    const store = transaction.objectStore("LokiAKV");
    const index = store.index("app");

    // We want cursor to all values matching our (single) app param
    const singleKeyRange = IDBKeyRange.only(app);

    // To use one of the key ranges, pass it in as the first argument of openCursor()/openKeyCursor()
    const cursor = index.openCursor(singleKeyRange);

    // cursor internally, pushing results into this.data[] and return
    // this.data[] when done (similar to service)
    const localdata: any[] = [];

    cursor.onsuccess = (((data, callback) => (e: ANY) => {
      const cursor = e.target.result;
      if (cursor) {
        const currObject = cursor.value;

        data.push(currObject);

        cursor.continue();
      } else {
        if (typeof(callback) === "function") {
          callback(data);
        } else {
          // console.log(data);
        }
      }
    }))(localdata, callback);

    cursor.onerror = (((usercallback) => () => {
      if (typeof(usercallback) === "function") {
        usercallback(null);
      } else {
        // console.error("LokiCatalog.getAppKeys raised onerror");
        // console.error(e);
      }
    }))(callback);

  }

  // Hide "cursoring" and return array of { id: id, key: key }
  getAllKeys(callback: any) {
    const transaction = this.db.transaction(["LokiAKV"], "readonly");
    const store = transaction.objectStore("LokiAKV");
    const cursor = store.openCursor();

    const localdata: ANY[] = [];

    cursor.onsuccess = (((data, callback) => (e: ANY) => {
      const cursor = e.target.result;
      if (cursor) {
        const currObject = cursor.value;

        data.push(currObject);

        cursor.continue();
      } else {
        if (typeof(callback) === "function") {
          callback(data);
        } else {
          // console.log(data);
        }
      }
    }))(localdata, callback);

    cursor.onerror = (((usercallback) => () => {
      if (typeof(usercallback) === "function") usercallback(null);
    }))(callback);
  }
}

export default IndexedStorage;
