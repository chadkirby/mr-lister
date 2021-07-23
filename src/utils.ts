export function isNumber(n: unknown): n is number {
  return !isNaN(parseFloat(n as string)) && isFinite(n as number);
}

export function isInt(n: unknown): boolean {
  let s = n as string;
  return !isNaN(parseInt(s, 10)) && parseFloat(s) === parseInt(s, 10);
}

export function unique(arr: unknown[]): unknown[] {
  return [...new Set(arr)];
}

function consolidate(
  arr: unknown[],
  delimiter: string,
  getVal: (x: unknown) => number,
  minRangeDelta = 1
): unknown[] {
  type RangeBound = { index: number; val: unknown };
  const rangeBegs: RangeBound[] = [];
  const rangeEnds: RangeBound[] = [];
  for (let index = 0; index < arr.length; index++) {
    let curr = getVal(arr[index]);
    let prev = getVal(arr[index - 1]);
    let next = getVal(arr[index + 1]);

    if (curr !== prev + 1) {
      rangeBegs.push({ index, val: arr[index] });
    }
    if (curr !== next - 1) {
      rangeEnds.push({ index, val: arr[index] });
    }
  }
  let out: unknown[] = [];
  for (const [i, start] of rangeBegs.entries()) {
    const end = rangeEnds[i];
    if (start.val === end.val) {
      out.push(start.val);
    } else if (getVal(end.val) - getVal(start.val) < minRangeDelta) {
      out.push(...arr.slice(start.index, end.index + 1));
    } else {
      out.push(`${start.val}${delimiter}${end.val}`);
    }
  }
  return out;
}

export function consolidateRanges(
  inputArray: unknown[],
  delimiter = "–",
  { needsSort = true, needsUnique = true } = {},
  minRangeDelta: number
): unknown[] {
  let arr = inputArray.slice();
  if (needsUnique) {
    arr = unique(arr) as number[];
  }
  if (needsSort) {
    arr.sort((a, b) => <number>a - <number>b);
  }
  return consolidate(arr, delimiter, (x) => x as number, minRangeDelta);
}

export function consolidateAlphaRanges(
  inputArray: unknown[],
  delimiter = "–"
): unknown[] {
  return consolidate(unique(inputArray).sort(), delimiter, (x) =>
    x ? (x as string).charCodeAt(0) : NaN
  );
}

export function expandAlphaRange(fromChar: string, toChar: string): string[] {
  let fromCode = fromChar.charCodeAt(0);
  let toCode = toChar.charCodeAt(0);
  if (fromCode > toCode) {
    [toCode, fromCode] = [fromCode, toCode];
  }
  return [...Array(toCode - fromCode + 1).keys()]
    .map((ii) => String.fromCharCode(fromCode + ii))
    .filter((char) => /[a-z]/i.test(char));
}
