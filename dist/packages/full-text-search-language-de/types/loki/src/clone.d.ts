export declare enum CloneMethod {
    PARSE_STRINGIFY = 0,
    DEEP = 1,
    SHALLOW = 2,
    SHALLOW_ASSIGN = 3,
    SHALLOW_RECURSE_OBJECTS = 4,
}
/**
 * @hidden
 */
export declare function clone<T>(data: T, method?: CloneMethod): T;
