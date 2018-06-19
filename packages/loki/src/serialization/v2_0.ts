import {Dict} from "../../../common/types";

export namespace V2_0 {

  export interface Serialized {
    databaseVersion: number;
  }

  export interface Loki {
    collections: Collection[];
    databaseVersion: 2.0;
    engineVersion: number;
    filename: string;
  }

  export type Doc = {
    $loki: number;
    meta?: {
      created: number;
      revision: number;
      version: number,
      updated?: number;
    };
    [index: string]: any;
    [index: number]: any;
  };

  export interface Collection {
    name: string;
    dynamicViews: DynamicView[];
    nestedProperties: { name: string, path: string[] }[];
    uniqueNames: string[];
    transforms: Dict<Transform[]>;
    binaryIndices: Dict<BinaryIndex>;
    data: Doc[];
    idIndex: number[];
    maxId: number;
    dirty: boolean;
    adaptiveBinaryIndices: boolean;
    transactional: boolean;
    asyncListeners: boolean;
    disableMeta: boolean;
    disableChangesApi: boolean;
    disableDeltaChangesApi: boolean;
    cloneObjects: boolean;
    cloneMethod: CloneMethod;
    serializableIndices: boolean;
    ttl: number;
    ttlInterval: number;
    changes: any;
    fullTextSearch: FullTextSearch;
  }

  export interface BinaryIndex {
    dirty: boolean;
    values: number[];
  }

  export type CloneMethod = "parse-stringify" | "deep" | "shallow" | "shallow-recurse";

  export type Transform = {
    type: "find";
    value: Query | string;
  } | {
    type: "where";
    value: ((obj: Doc) => boolean) | string;
  } | {
    type: "simplesort";
    property: string;
    options?: boolean | ResultSet.SimpleSortOptions;
  } | {
    type: "compoundsort";
    value: (string | [string, boolean])[];
  } | {
    type: "sort";
    value: (a: Doc, b: Doc) => number;
  } | {
    type: "sortByScoring";
    desc?: boolean;
  } | {
    type: "limit";
    value: number;
  } | {
    type: "offset";
    value: number;
  } | {
    type: "map";
    value: (obj: Doc, index: number, array: Doc[]) => any;
    dataOptions?: ResultSet.DataOptions;
  } | {
    type: "eqJoin";
    joinData: any; // Collection | ResultSet;
    leftJoinKey: string | ((obj: any) => string);
    rightJoinKey: string | ((obj: any) => string);
    mapFun?: (left: any, right: any) => any;
    dataOptions?: ResultSet.DataOptions;
  } | {
    type: "mapReduce";
    mapFunction: (item: Doc, index: number, array: Doc[]) => any;
    reduceFunction: (array: any[]) => any;
  } | {
    type: "update";
    value: (obj: Doc) => any;
  } | {
    type: "remove";
  };


  export interface DynamicView {
    name: string;
    persistent: boolean;
    sortPriority: "passive" | "active";
    minRebuildInterval: number;
    resultSet: ResultSet;
    filterPipeline: Filter[];
    sortCriteria: (string | [string, boolean])[];
    sortCriteriaSimple: { field: string, options: boolean | ResultSet.SimpleSortOptions };
    sortByScoring: boolean;
    sortDirty: boolean;
  }

  export interface ResultSet {
    filterInitialized: boolean;
    filteredRows: number[];
    scoring: FullTextSearch.ScoreResults;
  }

  export namespace ResultSet {
    export interface DataOptions {
      forceClones?: boolean;
      forceCloneMethod?: CloneMethod;
      removeMeta?: boolean;
    }

    export interface SimpleSortOptions {
      desc?: boolean;
      disableIndexIntersect?: boolean;
      forceIndexIntersect?: boolean;
      useJavascriptSorting?: boolean;
    }
  }

  export type Filter = {
    type: "find";
    val: Query;
    uid: number | string;
  } | {
    type: "where";
    val: (obj: Doc) => boolean;
    uid: number | string;
  };

  export type LokiOps = {
    $eq: any;
  } | {
    $aeq: any;
  } | {
    $ne: any;
  } | {
    $dteq: Date;
  } | {
    $gt: any;
  } | {
    $gte: any;
  } | {
    $lt: any;
  } | {
    $lte: any;
  } | {
    $between: [any, any];
  } | {
    $in: any[];
  } | {
    $nin: any[];
  } | {
    $keyin: object;
  } | {
    $nkeyin: object;
  } | {
    $definedin: object;
  } | {
    $undefinedin: object;
  } | {
    $regex: RegExp | string | [string, string] // string and [string, string] are better for serialization
  } | {
    $containsNone: any;
  } | {
    $containsAny: any;
  } | {
    $contains: any;
  } | {
    $type: string;
  } | {
    $finite: boolean;
  } | {
    $size: number;
  } | {
    $len: number;
  } | {
    $where: (val: any) => boolean;
  } | {
    $jgt: any;
  } | {
    $jgte: any;
  } | {
    $jlt: any;
  } | {
    $jlte: any;
  } | {
    $jbetween: [any, any];
  };

  export type Query =
    { [P: string]: LokiOps | any }
    & { $and?: Query[] }
    & { $or?: Query[] }
    & { $fts?: FullTextSearch.Query };

  export interface FullTextSearch {
    id: string;
    ii: Dict<FullTextSearch.InvertedIndex>;
  }

  export namespace FullTextSearch {
    export type DocumentIndex = number | string;

    export type InvertedIndex = SpareSerialized | FullSerialized;

    export interface Index {
      d?: {
        df: number;
        dc: [DocumentIndex, number][]
      };
      k?: number[];
      v?: Index[];
    }

    export type SpareSerialized = {
      store: false;
      optimizeChanges: boolean;
    };

    export type FullSerialized = {
      store: true;
      optimizeChanges: boolean;
      docCount: number;
      docStore: [DocumentIndex, DocStore][];
      totalFieldLength: number;
      root: Index;
    };

    export interface DocStore {
      fieldLength?: number;
    }

    export interface BaseQuery<Type> {
      type: Type;
      boost?: number;
    }

    export interface TermQuery extends BaseQuery<"term"> {
      field: string;
      value: string;
    }

    export interface TermsQuery extends BaseQuery<"terms"> {
      field: string;
      value: string[];
    }

    export interface WildcardQuery extends BaseQuery<"wildcard"> {
      field: string;
      value: string;
      enable_scoring?: boolean;
    }

    export interface FuzzyQuery extends BaseQuery<"fuzzy"> {
      field: string;
      value: string;
      fuzziness?: 0 | 1 | 2 | "AUTO";
      prefix_length?: number;
      extended?: boolean;
    }

    export interface PrefixQuery extends BaseQuery<"prefix"> {
      field: string;
      value: string;
      enable_scoring?: boolean;
    }

    export interface ExistsQuery extends BaseQuery<"exists"> {
      /// The field name.
      field: string;
    }

    export interface MatchQuery extends BaseQuery<"match"> {
      field: string;
      value: string;
      minimum_should_match?: number;
      operator?: "and" | "or";
      fuzziness?: 0 | 1 | 2 | "AUTO";
      prefix_length?: number;
      extended?: boolean;
    }

    export interface MatchQueryAll extends BaseQuery<"match_all"> {
    }

    export interface ConstantScoreQuery extends BaseQuery<"constant_score"> {
      filter: QueryTypes[];
    }

    export interface BoolQuery extends BaseQuery<"bool"> {
      must?: QueryTypes[];
      filter?: QueryTypes[];
      should?: QueryTypes[];
      not?: QueryTypes[];
      minimum_should_match?: number;
    }

    export type QueryTypes = BoolQuery | ConstantScoreQuery | TermQuery | TermsQuery | WildcardQuery | FuzzyQuery
      | MatchQuery | MatchQueryAll | PrefixQuery | ExistsQuery;

    export interface Query {
      query: QueryTypes;
      calculate_scoring?: boolean;
      explain?: boolean;
      bm25?: {
        k1: number;
        b: number;
      };
    }


    export interface BM25Explanation {
      boost: number;
      score: number;
      docID: number;
      fieldName: string;
      index: string;
      idf: number;
      tfNorm: number;
      tf: number;
      fieldLength: number;
      avgFieldLength: number;
    }

    export interface ConstantExplanation {
      boost: number;
      score: number;
    }

    export type ScoreExplanation = BM25Explanation | ConstantExplanation;
    export type ScoreResult = { score: number, explanation?: ScoreExplanation[] };
    export type ScoreResults = Dict<ScoreResult>;
  }
}
