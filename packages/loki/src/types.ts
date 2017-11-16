export namespace lokijs {

  export interface Storage {
    loadDatabase(dbname: string): Promise<string | object>;

    saveDatabase(dbname: string, serialization: string): Promise<void> | Promise<{}>;

    deleteDatabase(dbname: string): Promise<void>;

    mode?: string;

    exportDatabase?: Function;
  }


  export interface _Document {
    $loki: number;
    meta: any;
  }

  export type Doc<T extends object = object> = _Document & T;

  export interface Dict<T> {
    [index: string]: T;
    [index: number]: T;
  }


  export interface Query {

  }

  export interface Filter<E> {
    type: string; /*'find', 'where'*/
    val: Query | ((obj: E, index: number, array: E[]) => boolean);
    uid: number | string;
  }
}
