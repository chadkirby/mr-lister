export declare function isNumber(n: unknown): n is number;
export declare function isInt(n: unknown): boolean;
export declare function unique(arr: unknown[]): unknown[];
export declare function consolidateRanges(inputArray: unknown[], delimiter: string | undefined, { needsSort, needsUnique }: {
    needsSort?: boolean | undefined;
    needsUnique?: boolean | undefined;
} | undefined, minRangeDelta: number): string[];
export declare function consolidateAlphaRanges(inputArray: unknown[], delimiter?: string): string[];
export declare function expandAlphaRange(fromChar: string, toChar: string): string[];
