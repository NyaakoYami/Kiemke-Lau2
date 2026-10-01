export const LAPTOP_STANDARD = "Laptop + Sạc + Chuột";
export const LAPTOP_BAG = "Laptop + Sạc + Chuột + Túi chống sốc";

// Thiết bị mà từng loại cabin thực sự hiển thị trên thẻ. Dashboard chỉ được đếm
// đúng những thiết bị này để số liệu luôn khớp với cabin.
export const AGENT_QTY_KEYS = Object.freeze(["thung", "man20", "chuot", "phim", "tai"]);
export const LEAD_QTY_KEYS = Object.freeze(["thung", "man20", "man24", "chuot", "phim", "tai"]);

export const emptyDeviceTotals = () => ({
  thung: 0,
  man20: 0,
  man24: 0,
  chuot: 0,
  phim: 0,
  tai: 0,
  laptop_standard: 0,
  laptop_bag: 0,
});

const qtyOf = (inv, key) => {
  const qty = Number.parseInt(inv?.[`${key}_qty`], 10);
  return Number.isFinite(qty) && qty > 0 ? qty : 0;
};

// Gói laptop của một cabin Lead, đúng như thẻ cabin đánh dấu (null nếu không có).
export function laptopPackageOf(inv) {
  if (!inv?.laptop) return null;
  if (inv.laptop_package === LAPTOP_BAG) return "laptop_bag";
  if (inv.laptop_package === LAPTOP_STANDARD) return "laptop_standard";
  return null;
}

export function addSeatDevices(totals, inv, isLead) {
  const keys = isLead ? LEAD_QTY_KEYS : AGENT_QTY_KEYS;
  keys.forEach((key) => {
    totals[key] += qtyOf(inv, key);
  });
  if (isLead) {
    const pkg = laptopPackageOf(inv);
    if (pkg) totals[pkg] += 1;
  }
  return totals;
}

// Tổng hợp theo từng lầu, duyệt qua cabin THỰC TẾ (Lead + Agent) thay vì toàn bộ
// object inventory — tránh đếm cả bản ghi mồ côi của cabin đã xoá.
export function summarizeFloor(floor, inventory = {}) {
  const lanes = Array.isArray(floor?.lanes) ? floor.lanes : [];
  const devices = emptyDeviceTotals();
  let leadCabins = 0;
  let agentSeats = 0;
  lanes.forEach((lane) => {
    (Array.isArray(lane?.leads) ? lane.leads : []).forEach((seat) => {
      if (!seat?.id) return;
      leadCabins += 1;
      addSeatDevices(devices, inventory[seat.id], true);
    });
    (Array.isArray(lane?.agents) ? lane.agents : []).forEach((seat) => {
      if (!seat?.id) return;
      agentSeats += 1;
      addSeatDevices(devices, inventory[seat.id], false);
    });
  });
  return { devices, leadCabins, agentSeats };
}

export function sumDeviceTotals(list) {
  return list.reduce((acc, devices) => {
    Object.keys(acc).forEach((key) => {
      acc[key] += devices?.[key] || 0;
    });
    return acc;
  }, emptyDeviceTotals());
}
