export declare function generateTrimmer(wordCharacters: string): (token: string) => string;
export declare function generateStopWordFilter(stopWords: string[]): (token: string) => string;
export declare class Among {
    s_size: number;
    s: number[];
    substring_i: number;
    result: number;
    method: any;
    constructor(s: string, substring_i: number, result: number, method?: any);
}
export declare class SnowballProgram {
    current: string;
    bra: number;
    ket: number;
    limit: number;
    cursor: number;
    limit_backward: number;
    constructor();
    setCurrent(word: string): void;
    getCurrent(): string;
    in_grouping(s: number[], min: number, max: number): boolean;
    in_grouping_b(s: number[], min: number, max: number): boolean;
    out_grouping(s: number[], min: number, max: number): boolean;
    out_grouping_b(s: number[], min: number, max: number): boolean;
    eq_s(s_size: number, s: string): boolean;
    eq_s_b(s_size: number, s: string): boolean;
    find_among(v: Among[], v_size: number): number;
    find_among_b(v: Among[], v_size: number): number;
    replace_s(c_bra: number, c_ket: number, s: string): number;
    slice_check(): void;
    slice_from(s: string): void;
    slice_del(): void;
    insert(c_bra: number, c_ket: number, s: string): void;
    slice_to(): string;
    eq_v_b(s: string): boolean;
}
