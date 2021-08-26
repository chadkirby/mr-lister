declare type ListStringOptions = {
    article?: string;
    comma?: string;
    conjunction?: string;
    minRangeDelta?: number;
};
declare type List = unknown[] & {
    needsSort?: boolean;
    needsUnique?: boolean;
};
export default function listString(list: List, options?: ListStringOptions | string): string;
export {};
