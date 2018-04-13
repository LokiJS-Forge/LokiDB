
/**
 * A loki persistence adapter which persists to web browser's local storage object
 * @constructor LocalStorageAdapter
 */
export class LegacyLoader {

}
 // export namespace LokiJS {
 //
 //    let r: Loki = {
 //      "filename": "test",
 //      "collections": [{
 //        "name": "abc",
 //        "data": [{"meta": {"revision": 0, "created": 1523392965746, "version": 0}, "$loki": 1}, {
 //          "meta": {"revision": 0, "created": 1523392965747, "version": 0},
 //          "$loki": 2
 //        }],
 //        "idIndex": [1, 2],
 //        "binaryIndices": {"a": {"name": "a", "dirty": false, "values": [0, 1]}},
 //        // "constraints": null,
 //        "uniqueNames": ["b"],
 //        "transforms": {"abc": [{"type": "find", "value": {"owner": "odin"}}]},
 //        "objType": "abc",
 //        "dirty": true,
 //        // "cachedIndex": null,
 //        // "cachedBinaryIndex": null,
 //        // "cachedData": null,
 //        "adaptiveBinaryIndices": true,
 //        "transactional": false,
 //        "cloneObjects": false,
 //        "cloneMethod": "parse-stringify",
 //        // "asyncListeners": false,
 //        "disableMeta": false,
 //        "disableChangesApi": true,
 //        "disableDeltaChangesApi": true,
 //        "autoupdate": false,
 //        "serializableIndices": true,
 //        // "ttl": null,
 //        "maxId": 2,
 //        "DynamicViews": [{
 //          // "collection": null,
 //          "name": "test3",
 //          "rebuildPending": false,
 //          "options": {"persistent": true, "sortPriority": "passive", "minRebuildInterval": 1},
 //          "resultset": {/*"collection": null, */"filteredrows": [], "filterInitialized": true},
 //          // "resultdata": [],
 //          // "resultsdirty": true,
 //          // "cachedresultset": null,
 //          "filterPipeline": [{"type": "find", "val": {"age": {"$gt": 24}}}],
 //          // "sortFunction": null,
 //          "sortCriteria": null,
 //          "sortCriteriaSimple": {"propname": "age", "options": false},
 //          "sortDirty": true,
 //          // "events": {"rebuild": []}
 //        }],
 //        "events": {
 //          "insert": [null],
 //          "update": [null],
 //          "pre-insert": [],
 //          "pre-update": [],
 //          "close": [],
 //          "flushbuffer": [],
 //          "error": [],
 //          "delete": [null],
 //          "warning": [null]
 //        },
 //        "changes": []
 //      }],
 //      "databaseVersion": 1.5,
 //      "engineVersion": 1.5,
 //      // "autosave": false,
 //      // "autosaveInterval": 5000,
 //      // "autosaveHandle": null,
 //      "throttledSaves": true,
 //      // "options": {"serializationMethod": "normal", "destructureDelimiter": "$<\n"},
 //      // "persistenceMethod": "fs",
 //      // "persistenceAdapter": null,
 //      // "verbose": false,
 //      // "events": {"init": [null], "loaded": [], "flushChanges": [], "close": [], "changes": [], "warning": []},
 //      "ENV": "NODEJS"
 //    }
 //    console.log(r);
 //
 //
 //
 //
 //
 //
 //    export interface Loki {
 //      filename: string;
 //      collections: Collection[];
 //      databaseVersion: 1.5;
 //      engineVersion: 1.5;
 //      throttledSaves: boolean;
 //      ENV: "NODEJS" | "NATIVESCRIPT" | "CORDOVA" | "BROWSER";
 //    }
 //
 //    export interface BinaryIndex {
 //      name: string;
 //      dirty: boolean;
 //      values: number[];
 //    }
 //
 //    export interface Transform {
 //
 //    }
 //
 //
 //    export interface Collection {
 //      name: string;
 //      data: Data[];
 //      idIndex: number[];
 //      binaryIndices: {
 //        [key: string]: BinaryIndex
 //      };
 //      uniqueNames: string[];
 //      transforms: {
 //        [key: string]: Transform;
 //      };
 //      objType: string; // ??
 //      dirty: boolean; // ??
 //      adaptiveBinaryIndices: boolean;
 //      transactional: boolean;
 //      cloneObjects: boolean;
 //      cloneMethod: "parse-stringify" | "??";
 //
 //      disableMeta: boolean;
 //      disableChangesApi: boolean;
 //      disableDeltaChangesApi: boolean;
 //      autoupdate: boolean;
 //      serializableIndices: boolean;
 //      maxId: number;
 //      DynamicViews: DynamicView[];
 //      events: {};
 //      changes: any[];
 //    }
 //
 //    export interface SimplesortOptions {
 //      desc?: boolean;
 //      disableIndexIntersect?: boolean;
 //      forceIndexIntersect?: boolean;
 //      useJavascriptSorting?: boolean;
 //    }
 //
 //    export interface DynamicView {
 //      name: string;
 //      rebuildPending: boolean;
 //      options: {
 //        persistent: true,
 //        sortPriority: "passive" | "active",
 //        minRebuildInterval: number;
 //      };
 //      resultset: ResultSet;
 //      filterPipeline: {
 //        type: "find",
 //        val: any;
 //      } | {
 //        type: "where"
 //      };
 //      sortCriteria: (string | [string, boolean])[];
 //      sortCriteriaSimple: {
 //        propname: string;
 //        options: boolean | SimplesortOptions;
 //      };
 //      sortDirty: boolean;
 //    }
 //
 //    export interface ResultSet {
 //      filteredrows: number[];
 //      filterInitialized: boolean;
 //    }
 //
 //    export interface Data {
 //      $loki: number;
 //      meta: {
 //        revision: number;
 //        created: number;
 //        version: number;
 //        updated?: number;
 //      };
 //    }
 //
 //    export interface Serialization {
 //
 //    }
 //  }
 //
