/**
 * @hidden
 */
import { Loki } from "../loki/src/loki";
export interface StorageAdapter {
    loadDatabase(dbname: string): Promise<any>;
    saveDatabase?(dbname: string, serialization: string): Promise<void>;
    deleteDatabase?(dbname: string): Promise<void>;
    mode?: string;
    exportDatabase?(dbname: string, dbref: Loki): Promise<void>;
}
export declare type Doc<T extends object = object> = T & {
    $loki: number;
    meta?: {
        created: number;
        revision: number;
        version: number;
        updated?: number;
    };
};
export interface Dict<T> {
    [index: string]: T;
    [index: number]: T;
}
