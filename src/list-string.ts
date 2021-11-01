import { isInt, consolidateRanges, consolidateAlphaRanges } from "./utils.js";

type ListStringOptions = {
  article?: string;
  comma?: string;
  conjunction?: string;
  minRangeDelta?: number;
};

type List = unknown[] & { needsSort?: boolean; needsUnique?: boolean };

const toString = Object.prototype.toString;
function isString(value: unknown): value is string {
  return toString.call(value) === "[object String]";
}

type OptionsArgs = [list: List, options?: ListStringOptions];
type OldArgs = [list: List, andor?: string, article?: string, comma?: string];

export default function listString(
  list: List,
  options?: ListStringOptions
): string;
export default function listString(
  list: List,
  andor?: string,
  article?: string,
  comma?: string
): string;
export default function listString(...args: OptionsArgs | OldArgs): string {
  let [list] = args;
  if (list.length <= 1) {
    return list.join("");
  }

  let andor = "and";
  let options: ListStringOptions;

  if (isString(args[1])) {
    // compatability with old-style fn call
    andor = (args as OldArgs)[1]!;
    options = { article: args[2], comma: args[3] };
  } else {
    [, options = {}] = args as OptionsArgs;
    andor = options.conjunction ?? andor;
  }

  const andOrProvided = Boolean(andor);
  // ensure whitespace around andor
  if (andor) andor = andor.replace(/^(?=\S)|(?<=\S)$/g, " ");

  const { article } = options;

  const comma = options.comma ?? ", ";
  const minRangeDelta = options.minRangeDelta || 1;

  // is the list an array of numbers or string-versions of numbers?
  let isNumeric = list.every(isInt);
  let isAlpha = false;
  let ranges: string[] | undefined;
  if (isNumeric) {
    let numberList = Array.from(list, (a) => parseInt(a as string, 10));
    // is numeric range
    ranges = consolidateRanges(numberList, "–", list, minRangeDelta);
  } else {
    // test if alphabetic range
    let strings = Array.from(list, (x) => `${x}`);
    isAlpha = strings.every((x) => /^[a-z]$/i.test(x));
    if (isAlpha) {
      ranges = consolidateAlphaRanges(strings);
    }
  }

  let delimiter = comma;
  if (ranges) {
    list = ranges;
  } else {
    if (list.length > 1) {
      const complex = list.find((x) => /,/.test(`${x}`));
      if (complex) {
        delimiter = comma.replace(/,/, ";");
      }
    } else {
      delimiter = andOrProvided ? andor : "";
      delimiter = delimiter
        .replace(/^(?![,.;:\s])/, " ")
        .replace(/[^,.;:\s]$/, "$& ");
    }

    // add articles
    if (article) {
      list = list.map((item) => `${article} ${item}`);
    }
  }
  if (andOrProvided && list.length > 2) {
    list.push(`${andor.replace(/^\s+/, "")}${list.pop()}`);
  }
  return list.join(list.length === 2 ? andor || delimiter : delimiter);
}
