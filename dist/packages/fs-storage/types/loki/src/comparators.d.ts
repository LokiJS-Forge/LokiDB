export interface ILokiComparer<T> {
    (a: T, b: T): -1 | 0 | 1;
}
export interface IComparatorMap {
    [name: string]: ILokiComparer<any>;
}
/** Map/Register of named ILokiComparer functions returning -1, 0, 1 for lt/eq/gt assertions for two passed parameters */
export declare let ComparatorMap: IComparatorMap;
/** Typescript-friendly factory for strongly typed 'js' comparators */
export declare function CreateJavascriptComparator<T>(): ILokiComparer<T>;
/** Typescript-friendly factory for strongly typed 'abstract js' comparators */
export declare function CreateAbstractJavascriptComparator<T>(): ILokiComparer<T>;
/**
 * Comparator which attempts to deal with deal with dates at comparator level.
 * Should work for dates in any of the object, string, and number formats
 */
export declare function CreateAbstractDateJavascriptComparator<T>(): ILokiComparer<T>;
/** Typescript-friendly factory for strongly typed 'loki' comparators */
export declare function CreateLokiComparator(): ILokiComparer<any>;
