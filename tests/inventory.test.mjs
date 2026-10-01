import assert from "node:assert/strict";
import test from "node:test";
import { LAPTOP_BAG, LAPTOP_STANDARD, summarizeFloor, sumDeviceTotals } from "../shared/inventory.js";

const floor = {
  lanes: [
    {
      leads: [{ id: "L1" }, { id: "L2" }],
      agents: [{ id: "A1" }, { id: "A2" }],
    },
    { leads: [{ id: "L3" }], agents: [] },
  ],
};

test("laptops on Lead cabins are counted per floor", () => {
  const inventory = {
    L1: { laptop: true, laptop_package: LAPTOP_STANDARD },
    L2: { laptop: true, laptop_package: LAPTOP_BAG },
    L3: { laptop: true, laptop_package: LAPTOP_BAG },
  };
  const { devices, leadCabins, agentSeats } = summarizeFloor(floor, inventory);
  assert.equal(devices.laptop_standard, 1);
  assert.equal(devices.laptop_bag, 2);
  assert.equal(leadCabins, 3);
  assert.equal(agentSeats, 2);
});

test("laptop flag without a package shown on the card is not counted", () => {
  const { devices } = summarizeFloor(floor, { L1: { laptop: true, laptop_package: "" } });
  assert.equal(devices.laptop_standard + devices.laptop_bag, 0);
});

test("agent cabins never contribute laptops or 24-inch screens", () => {
  const { devices } = summarizeFloor(floor, {
    A1: { laptop: true, laptop_package: LAPTOP_STANDARD, man24: true, man24_qty: 1, thung: true, thung_qty: 2 },
  });
  assert.equal(devices.laptop_standard, 0);
  assert.equal(devices.man24, 0);
  assert.equal(devices.thung, 2);
});

test("orphan inventory records of deleted cabins are ignored", () => {
  const { devices } = summarizeFloor(floor, {
    GONE: { laptop: true, laptop_package: LAPTOP_STANDARD, thung: true, thung_qty: 1 },
  });
  assert.equal(devices.laptop_standard, 0);
  assert.equal(devices.thung, 0);
});

test("overall totals equal the sum of floors", () => {
  const a = summarizeFloor(floor, { L1: { laptop: true, laptop_package: LAPTOP_STANDARD }, A1: { chuot: true, chuot_qty: 3 } });
  const b = summarizeFloor(floor, { L2: { laptop: true, laptop_package: LAPTOP_BAG }, A2: { chuot: true, chuot_qty: 1 } });
  const total = sumDeviceTotals([a.devices, b.devices]);
  assert.equal(total.laptop_standard, 1);
  assert.equal(total.laptop_bag, 1);
  assert.equal(total.chuot, 4);
});
