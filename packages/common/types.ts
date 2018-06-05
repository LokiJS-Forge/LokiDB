/**
 * @hidden
 */
import {Loki} from "../loki/src";
import {Serialization} from "../loki/src/serialization/migration";

export interface StorageAdapter {
  loadDatabase(dbname: string): Promise<string | Loki | Serialization.Serialized>;

  saveDatabase?(dbname: string, serialization: string): Promise<void>;

  deleteDatabase?(dbname: string): Promise<void>;

  mode?: string;

  exportDatabase?(dbname: string, dbref: Loki): Promise<void>;
}

export type Doc<T extends object = object> = T & {
  $loki: number;
  meta?: {
    created: number;
    revision: number;
    version: number,
    updated?: number;
  };
};

export type Dict<T> = {
  [index: string]: T;
  [index: number]: T;
};




