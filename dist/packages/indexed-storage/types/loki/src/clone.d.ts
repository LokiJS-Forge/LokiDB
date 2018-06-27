export declare type CloneMethod = "parse-stringify" | "deep" | "shallow" | "shallow-recurse";
/**
 * @hidden
 */
export declare function clone<T>(data: T, method?: CloneMethod): T;
