import re from "@ckirby/block-re";
import stringList from "./string-list.js";

// match conjunctions that we often see inside lists, e.g.,
// 'claims 1, 4, and 5'; 'claims 5 to 10'; 'paragraphs 17 and/or 35'
const conjunctions =
  /(?:AND\S*\/\S*OR|and\s*\/\s*or|&|AND|and|OR|or|TO|to|THRU|thru|THROUGH|through)/i;

type ITEM = {
  index: number;
  item: string;
};

// by default, match number ranges
export function findList(
  text: string,
  { item = /\d+(?:\s*[-–]\s*\d+)?\b/g } = {}
): {
  index: number;
  items: ITEM[];
  match: string;
  label: string;
  list: number[];
}[] {
  // match one or more items
  const rangePattern = re`/(?:
    (?: ${item} )
    // match trailing punctuation and a conjunction if there are more numbers thereafter
    (?: [\s,;]* ${conjunctions}? \s* (?= ${item}) )?
  )+/g`;

  const rangeToFind = re`/
    \b (?<label>
        // allow a label made of non-digit word chars
        [^\d\W]+
        // with an optional '(s)'
        (?:[(]s[)])?
        // and an optional dot
        [.]?
      )?
      \s*
      (?<range>${rangePattern})
  /g`;
  return matchAll(text, rangeToFind).map((found) => {
    const { index, groups } = found;
    const [match] = found;
    let { range, label = `` } = groups as { range: string; label: string };
    range = range.replace(/\s*(?:to|thru|through)\s*/gi, "-");
    // get a list of the individual items
    let items = matchAll(match, item).map(
      (x: RegExpMatchArray): ITEM => ({
        index: x.index!,
        item: x[0],
      })
    );

    // get a list of all the integers the range refers to
    let list = stringList(range).slice();
    return { index, items, match, label, list };
  });
}

function matchAll(text: string, pattern: RegExp) {
  let res;
  let matches: RegExpExecArray[] = [];
  while ((res = pattern.exec(text))) {
    matches.push(res);
  }
  return matches;
}
