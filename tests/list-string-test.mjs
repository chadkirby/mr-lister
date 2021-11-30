import test from "tape";
import { listString } from "#src/index.js";

test("listString list strings", (assert) => {
  assert.equal(listString(["apples", "oranges"]), "apples and oranges");
  assert.equal(
    listString(["apples", "oranges", "monkeys"]),
    "apples, oranges, and monkeys"
  );
  assert.equal(
    listString(["apples", "oranges", "monkeys"], "or"),
    "apples, oranges, or monkeys"
  );
  assert.equal(
    listString(["apples", "oranges", "monkeys"], "or", "the"),
    "the apples, the oranges, or the monkeys"
  );
  assert.equal(
    listString(["apples", "oranges", "monkeys"], "or", "", "; "),
    "apples; oranges; or monkeys"
  );
  assert.equal(
    listString(["apples", "oranges", "monkeys"], {
      conjunction: "or",
      comma: "; ",
    }),
    "apples; oranges; or monkeys"
  );
  assert.equal(
    listString(["apples, oranges, and monkeys", "peaches", "bananas"]),
    "apples, oranges, and monkeys; peaches; and bananas"
  );
  assert.end();
});

function range(start, end) {
  let out = [];
  for (let ii = start; ii <= end; ii++) {
    out.push(ii);
  }
  return out;
}

test("test can list consecutive integers", (assert) => {
  assert.equal(listString(["1.0", 2]), "1–2");
  let result = listString(range(1, 10));
  assert.equal(result, "1–10");
  assert.equal(listString(range(-5, 5)), "-5–5");
  assert.equal(listString(["1.0", 2, "3.0"]), "1–3");
  assert.equal(listString(["1.0", 2, 3]), "1–3");
  assert.equal(listString(["1.0", "2.00000000", 9 / 3]), "1–3");
  assert.equal(listString(["1.0", 2, 3.1]), "1.0, 2, and 3.1");
  assert.end();
});

test("test can list consecutive letters", (assert) => {
  assert.equal(listString(["A", "B"]), "A–B");
  assert.equal(listString(["A", "C"]), "A and C");
  assert.equal(
    listString(range(65, 75).map((x) => String.fromCharCode(x))),
    "A–K"
  );
  assert.equal(
    listString(range(97, 107).map((x) => String.fromCharCode(x))),
    "a–k"
  );
  assert.end();
});

test("test can list non-consecutive integers", (assert) => {
  assert.equal(listString([1, 7]), "1 and 7");
  assert.equal(listString([1, 2, 3, 5, 6, 7]), "1–3 and 5–7");
  assert.equal(listString([3, 2, 6, 5, 6, 1, 7]), "1–3 and 5–7");
  assert.equal(listString([1, 2, 3, 5, 6, 7, 10], "&"), "1–3, 5–7, & 10");
  assert.equal(
    listString([1, 2, 5, 6, 7, 10], { conjunction: "&", minRangeDelta: 2 }),
    "1, 2, 5–7, & 10"
  );
  assert.equal(
    listString([1, 2, 5, 6, 7, 10], { conjunction: "&", minRangeDelta: 3 }),
    "1, 2, 5, 6, 7, & 10"
  );

  assert.end();
});

test("can specify a falsy conjunction", (assert) => {
  assert.equal(listString([1]), "1");
  assert.equal(listString([1], ""), "1");
  assert.equal(listString([1], "foobar"), "1");
  assert.equal(listString([1, 5]), "1 and 5");
  assert.equal(listString([1, 5], { conjunction: "" }), "1, 5");
  assert.equal(listString([1, 3, 5], { conjunction: "" }), "1, 3, 5");
  assert.equal(listString([1, 5], ""), "1, 5");
  assert.equal(listString([1, 3, 5], ""), "1, 3, 5");
  assert.equal(listString([1, 7], { conjunction: "", comma: "; " }), "1; 7");
  assert.equal(
    listString([1, 3, 7], { conjunction: "", comma: "; " }),
    "1; 3; 7"
  );

  assert.end();
});

test("test can list non-consecutive letters", (assert) => {
  assert.equal(listString(["a", "e"]), "a and e");
  assert.equal(listString(["a"]), "a");
  assert.equal(listString(["a", "b", "d", "e"]), "a–b and d–e");
  assert.equal(
    listString(["a", "b", "d", "e", "D", "A", "C"]),
    "A, C–D, a–b, and d–e"
  );
  assert.end();
});

test("listString handles very large ranges", (assert) => {
  let elapsed = [];
  let rng = [...Array(100000).keys()];
  rng.needsSort = false;
  rng.needsUnique = false;
  let output;
  let count = 20;
  while (count--) {
    let start = new Date();
    output = listString(rng);
    let end = new Date();
    elapsed.push(end - start);
  }
  let avg = elapsed.reduce((sum, val) => sum + val, 0) / elapsed.length;
  assert.ok(avg < 100, `elapsed time (${avg}ms) is acceptable`);
  assert.equal(output, "0–99999");
  assert.end();
});
