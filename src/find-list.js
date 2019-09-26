const re = require('block-re');
const stringList = require('./string-list');

// match conjunctions that we often see inside lists, e.g.,
// 'claims 1, 4, and 5'; 'claims 5 to 10'; 'paragraphs 17 and/or 35'
const conjunctions = /(?:AND\S*\/\S*OR|and\s*\/\s*or|&|AND|and|OR|or|TO|to|THRU|thru|THROUGH|through)/i;

// by default, match number ranges
function findList(text, { item = /\d+(?:\s*[-–]\s*\d+)?\b/g } = {}) {

  // match one or more items
  const rangePattern = re('g')`(?:
    (?: ${item} )
    // match trailing punctuation and a conjunction if there are more numbers thereafter
    (?: [\s,;]* ${conjunctions}? \s* (?= ${item}) )?
  )+`;

  const rangeToFind = re('g')`
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
  `;
  let res;
  let matches = [];
  while ((res = rangeToFind.exec(text))) {
    let { index, 0: match, groups: { range, label = `` } } = res;
    range = range.replace(/\s*(?:to|thru|through)\s*/gi, '-');
    // get a list of the individual items
    let items = match.match(item);
    // get a list of all the integers the range refers to
    let list = stringList(range);
    matches.push({ index, items, match, label, list });
  }
  return matches;
}

module.exports = {
  findList
};
