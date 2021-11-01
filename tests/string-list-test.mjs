import test from "tape";
import { stringList } from "#src/index.js";

test("stringList strings lists", (assert) => {
  assert.deepEqual(stringList("1").slice(), [1]);
  assert.deepEqual(stringList("1-3").slice(), [1, 2, 3], "simple range");
  assert.deepEqual(
    stringList("1 - 3").slice(),
    [1, 2, 3],
    "spaces around dash"
  );
  assert.deepEqual(stringList("1. - 3.").slice(), [1, 2, 3], "dots");
  assert.deepEqual(stringList("1–3").slice(), [1, 2, 3], "en dash");
  assert.deepEqual(stringList("1—3").slice(), [1, 2, 3], "em dash");
  assert.equal(stringList("1—3").needsSort, false, "not needsSort");
  assert.equal(stringList("1—3").needsUnique, false, "not needsUnique");
  assert.end();
});

test("stringList strings lists with abbreviated endNums", (assert) => {
  assert.deepEqual(stringList("401-3").slice(), [401, 402, 403]);
  assert.deepEqual(stringList("411-13").slice(), [411, 412, 413]);
  assert.deepEqual(stringList("042-44").slice(), [42, 43, 44]);
  assert.deepEqual(stringList("0142-44").slice(), [142, 143, 144]);
  assert.end();
});

test("stringList handles very large ranges", (assert) => {
  let elapsed = [];
  let range;
  let count = 10;
  while (count--) {
    let start = new Date();
    range = stringList("0033-00360038, 1-10");
    let end = new Date();
    elapsed.push(end - start);
  }
  let avg = elapsed.reduce((sum, val) => sum + val, 0) / elapsed.length;
  assert.ok(avg < 100, `elapsed time (${avg}ms) is acceptable`);
  assert.equal(range.length, 360016);
  assert.end();
});
