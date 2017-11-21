import {Loki} from "../loki/src/loki";

export type ANY = any;

export interface StorageAdapter {
  loadDatabase(dbname: string): Promise<any>;

  saveDatabase?(dbname: string, serialization: string): Promise<void>;

  deleteDatabase?(dbname: string): Promise<void>;

  mode?: string;

  exportDatabase?(dbname: string, dbref: ANY): Promise<void>;
}

export type Doc<T extends object = object> = T & { $loki: number; meta: any; };

export interface Dict<T> {
  [index: string]: T;

  [index: number]: T;
}


export interface Query {

}

export interface Filter<E> {
  type: string;
  /*'find', 'where'*/
  val: Query | ((obj: E, index: number, array: E[]) => boolean);
  uid: number | string;
}
