/**
 * This file contains LokiOperatorPackages, RangedIndex and Comparator interfaces, as well as
 * global map object instances for registered LokiOperatorPackages, RangedIndex implementations, and Comparator functions
 */

import { aeqHelper, ltHelper } from "./operator_packages";

/* Loki Comparator interface for dependency injection to ranged indexes */
export interface ILokiComparer<T> {
  (a: T, b: T): -1 | 0 | 1;
}

export interface IComparatorMap {
  [name: string]: ILokiComparer<any>;
}

/** Map/Register of named ILokiComparer functions returning -1, 0, 1 for lt/eq/gt assertions for two passed parameters */
export let ComparatorMap: IComparatorMap = {
  "js": CreateJavascriptComparator<any>(),
  "abstract-js": CreateAbstractJavascriptComparator<any>(),
  "abstract-date": CreateAbstractDateJavascriptComparator<any>(),
  "loki": CreateLokiComparator()
};

/** Typescript-friendly factory for strongly typed 'js' comparators */
export function CreateJavascriptComparator<T>(): ILokiComparer<T> {
  return (val: T, val2: T) => {
    if (val === val2) return 0;
    if (val < val2) return -1;
    return 1;
  };
}

/** Typescript-friendly factory for strongly typed 'abstract js' comparators */
export function CreateAbstractJavascriptComparator<T>(): ILokiComparer<T> {
  return (val: T, val2: T) => {
    if (val == val2) return 0;
    if (val < val2) return -1;
    return 1;
  };
}

/**
 * Comparator which attempts to deal with deal with dates at comparator level.
 * Should work for dates in any of the object, string, and number formats
 */
export function CreateAbstractDateJavascriptComparator<T>(): ILokiComparer<T> {
  return (val: T, val2: T) => {
    let v1: string = (new Date(val as any).toISOString());
    let v2: string = (new Date(val2 as any).toISOString());
    if (v1 == v2) return 0;
    if (v1 < v2) return -1;
    return 1;
  };
}

/** Typescript-friendly factory for strongly typed 'loki' comparators */
export function CreateLokiComparator(): ILokiComparer<any> {
  return (val: any, val2: any) => {
    if (aeqHelper(val, val2)) return 0;
    if (ltHelper(val, val2, false)) return -1;
    return 1;
  };
}


