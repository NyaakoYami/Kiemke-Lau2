import assert from "node:assert/strict";
import test from "node:test";
import { moveItemBetweenArrays } from "../shared/reorder.js";

const ids = (items) => items.map((item) => item.id);

function item(id) {
  return { id };
}

test("A -> B moves A to B's position", () => {
  const list = ["A", "B", "C", "D"].map(item);
  assert.equal(moveItemBetweenArrays(list, list, 0, 1), true);
  assert.deepEqual(ids(list), ["B", "A", "C", "D"]);
});

test("B -> A moves B to the first position", () => {
  const list = ["A", "B", "C", "D"].map(item);
  assert.equal(moveItemBetweenArrays(list, list, 1, 0), true);
  assert.deepEqual(ids(list), ["B", "A", "C", "D"]);
});

test("A -> D moves A to the last position", () => {
  const list = ["A", "B", "C", "D"].map(item);
  assert.equal(moveItemBetweenArrays(list, list, 0, 3), true);
  assert.deepEqual(ids(list), ["B", "C", "D", "A"]);
});

test("D -> A moves D to the first position", () => {
  const list = ["A", "B", "C", "D"].map(item);
  assert.equal(moveItemBetweenArrays(list, list, 3, 0), true);
  assert.deepEqual(ids(list), ["D", "A", "B", "C"]);
});

test("A -> middle moves A to the requested middle slot", () => {
  const list = ["A", "B", "C", "D"].map(item);
  assert.equal(moveItemBetweenArrays(list, list, 0, 2), true);
  assert.deepEqual(ids(list), ["B", "C", "A", "D"]);
});

test("cross-array move preserves item and inserts at target index", () => {
  const leads = ["A", "B"].map(item);
  const agents = ["C", "D"].map(item);
  assert.equal(moveItemBetweenArrays(leads, agents, 0, 1), true);
  assert.deepEqual(ids(leads), ["B"]);
  assert.deepEqual(ids(agents), ["C", "A", "D"]);
});

test("resolveInsertIndex: drop after self in same lane is a no-op", async () => {
  const { resolveInsertIndex } = await import("../shared/reorder.js");
  const list = ["A", "B", "C", "D"].map(item);
  // Insert B before C (i.e. right after itself) -> stays at index 1.
  const to = resolveInsertIndex(true, 1, 2);
  moveItemBetweenArrays(list, list, 1, to);
  assert.deepEqual(ids(list), ["A", "B", "C", "D"]);
});

test("resolveInsertIndex: move forward / backward / to end", async () => {
  const { resolveInsertIndex } = await import("../shared/reorder.js");
  let list = ["A", "B", "C", "D"].map(item);
  moveItemBetweenArrays(list, list, 0, resolveInsertIndex(true, 0, 3)); // A before D
  assert.deepEqual(ids(list), ["B", "C", "A", "D"]);

  list = ["A", "B", "C", "D"].map(item);
  moveItemBetweenArrays(list, list, 3, resolveInsertIndex(true, 3, 1)); // D before B
  assert.deepEqual(ids(list), ["A", "D", "B", "C"]);

  list = ["A", "B", "C", "D"].map(item);
  moveItemBetweenArrays(list, list, 1, resolveInsertIndex(true, 1, 4)); // B to end
  assert.deepEqual(ids(list), ["A", "C", "D", "B"]);

  const a = ["A", "B"].map(item);
  const b = ["X", "Y"].map(item);
  moveItemBetweenArrays(a, b, 0, resolveInsertIndex(false, 0, 1)); // A before Y
  assert.deepEqual(ids(b), ["X", "A", "Y"]);
});
