export default function stringList(
  str: string,
  { sort = true, unique = true } = {}
): number[] {
  let groups: number[][] = [];
  // allow dash, en-dash, or em-dash between ranges
  // allow a dot after the first number in a range
  let pat = /(?<start>\d+)(?:[.]?\s*[-\u2013\u2014]\s*(?<end>\d+))?/g;
  let res: RegExpExecArray | null;
  while ((res = pat.exec(str))) {
    let { start, end = start } = res.groups as { start: string; end: string };
    if (end.length < start.length) {
      // if we have a range such as 110-15, then copy
      // the leading chars from the first num
      end = `${start.slice(0, -end.length)}${end}`;
    }

    let startNum = parseInt(start, 10);
    let endNum = parseInt(end, 10);

    if (endNum < startNum) {
      [endNum, startNum] = [startNum, endNum];
    }

    groups.push(
      Array(endNum - startNum + 1)
        .fill(startNum)
        .map((n, i) => n + i)
    );
  }

  // sort range groups by their start value
  let sortedGroups = groups.slice().sort(([a], [b]) => a - b);

  let needsSort = false;
  let needsUnique = false;
  for (const [i, range] of sortedGroups.slice(1).entries()) {
    let prev = sortedGroups[i][sortedGroups[i].length - 1];
    let curr = range[0];
    needsSort = needsSort || curr < prev;
    needsUnique = needsUnique || curr <= prev;
    if (needsSort && needsUnique) {
      break;
    }
  }

  let numbers = ([] as number[]).concat(...(sort ? sortedGroups : groups));

  if (groups.length > 1) {
    if (unique && needsUnique) {
      needsUnique = false;
      numbers = [...new Set(numbers)];
    }
    if (sort && needsSort) {
      needsSort = false;
      numbers.sort((a, b) => a - b);
    }
  }

  return Object.defineProperties(numbers, {
    needsSort: { value: needsSort, writable: false, enumerable: false },
    needsUnique: { value: needsUnique, writable: false, enumerable: false },
  });
}
