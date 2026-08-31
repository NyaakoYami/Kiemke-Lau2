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
