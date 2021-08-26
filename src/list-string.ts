
import {
  isInt,
  consolidateRanges,
  consolidateAlphaRanges
} from './utils';

type ListStringOptions = {
  article?: string;
  comma?: string;
  conjunction?: string;
  minRangeDelta?: number;
}

type List = unknown[] & { needsSort?: boolean, needsUnique?: boolean };

function isString(value: unknown): value is string {
  return toString.call(value) === '[object String]'
}

export default function listString(list: List, options: ListStringOptions | string = {}) {
  if (list.length <= 1) {
    return list.join('');
  }

  let andor: string;

  if (isString(options)) {
    // compatability with old-style fn call
    andor = options;
    let [ ,, article, comma ] = arguments;
    options = { article, comma };
  } else {
    andor = options.conjunction ?? 'and';
  }

  const andOrProvided = Boolean(andor);
  // ensure whitespace around andor
  if (andor) andor = andor.replace(/^(?=\S)|(?<=\S)$/g, ' ');

  const { article } = options;

  const comma = options.comma ?? ', ';
  const minRangeDelta = options.minRangeDelta || 1;

  // is the list an array of numbers or string-versions of numbers?
  let isNumeric = list.every(isInt);
  let isAlpha = false;
  let ranges: string[] | undefined;
  if (isNumeric) {
    let numberList = (Array.from(list) as (string|number)[]).map((a) => parseInt(a as string, 10))
    // is numeric range
    ranges = consolidateRanges(
      numberList,
      '–',
      list,
      minRangeDelta
    );
  } else { // test if alphabetic range
    isAlpha = list.every((x) => /^[a-z]$/i.test(x as string));
    if (isAlpha) {
      ranges = consolidateAlphaRanges(list);
    }
  }

  let delimiter = comma;
  if (ranges) {
    list = ranges;
  } else {
    if (list.length > 1) {
        const complex = list.find((x) => /,/.test(`${x}`));
        if (complex) {
          delimiter = comma.replace(/,/, ';');
        }
    } else {
      delimiter = andOrProvided ? andor : '';
      delimiter = delimiter.replace(/^(?![,.;:\s])/, ' ').replace(/[^,.;:\s]$/, '$& ');
    }

    // add articles
    if (article) {
      list = list.map((item) => `${article} ${item}`);
    }
  }
  if (andOrProvided && (list.length > 2)) {
    list.push(`${andor.replace(/^\s+/, '')}${list.pop()}`);
  }
  return list.join(list.length === 2 ? andor || delimiter : delimiter);
}
