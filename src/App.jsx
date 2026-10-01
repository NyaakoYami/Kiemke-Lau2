import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { isAdminEmail, normalizeAdminEmail } from "../shared/admin.js";
import { moveItemBetweenArrays, resolveInsertIndex } from "../shared/reorder.js";
import { createPortal } from "react-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import "primeicons/primeicons.css";
import "./App.css";

const HERO_PATHS = {
  eye: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  lock: 'M16.5 10.5V7a4.5 4.5 0 0 0-9 0v3.5m-1 0h11a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-7A1.5 1.5 0 0 1 5.5 10.5Z',
  login: 'M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15 M12 9l3 3-3 3m3-3H3',
  logout: 'M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15 M15 12H3m0 0 3-3m-3 3 3 3',
  plus: 'M12 4.5v15m7.5-7.5h-15',
  x: 'M6 18 18 6M6 6l12 12',
  check: 'm4.5 12.75 6 6 9-13.5',
  search: 'm21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
  building: 'M3.75 21h16.5M6 21V5.25L12 3l6 2.25V21M9 21v-3h6v3M9 8.25h.01M9 11.25h.01M9 14.25h.01M15 8.25h.01M15 11.25h.01M15 14.25h.01',
  chart: 'M3 13.5 8.25 8.25l3.75 3.75L21 3m0 0v6m0-6h-6',
  users: 'M15 19.128a9.003 9.003 0 0 0-6 0M12 12.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM19.5 9.75a3 3 0 1 0-2.12-5.12M21 19.128a8.997 8.997 0 0 0-2.25-1.49',
  cloud: 'M3.75 15.75a4.5 4.5 0 0 1 4.5-4.5h.33A5.25 5.25 0 0 1 18.75 12h.75a3.75 3.75 0 0 1 0 7.5H7.5a3.75 3.75 0 0 1-3.75-3.75Z',
  download: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 10.5 12 15m0 0-4.5-4.5M12 15V3',
  upload: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 7.5 12 3m0 0 4.5 4.5M12 3v12',
  filter: 'M10.5 6h10.75M2.75 6h3.5M2.75 12h10.75M16.25 12h5M10.5 18h10.75M2.75 18h3.5',
  refresh: 'M4.5 12a7.5 7.5 0 0 1 12.75-5.303L19.5 9m0 0V4.5M19.5 9H15M19.5 12a7.5 7.5 0 0 1-12.75 5.303L4.5 15m0 0v4.5M4.5 15H9',
  trash: 'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.327L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-9.392.563c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.934 0L17.25 3.75h-10.5l-.75 1.478',
  palette: 'M9.75 3.104c-3.786.88-6.75 4.28-6.75 8.396A8.5 8.5 0 0 0 11.5 20h1.25a2.25 2.25 0 0 0 2.25-2.25v-.5A2.25 2.25 0 0 1 17.25 15H18a3 3 0 0 0 3-3c0-4.686-4.03-8.5-9-8.5-.77 0-1.524.1-2.25.286Z',
};

const LAPTOP_PACKAGES = Object.freeze([
  { value: "Laptop + Sạc + Chuột", label: "Laptop + Sạc + Chuột" },
  { value: "Laptop + Sạc + Chuột + Túi chống sốc", label: "Laptop + Sạc + Chuột + Túi chống sốc" },
]);

const AGENT_DEVICE_ITEMS = Object.freeze([
  { key: "man20", label: 'Màn 20"', icon: "pi pi-desktop" },
  { key: "thung", label: "Thùng máy", icon: "pi pi-box" },
  { key: "chuot", label: "Chuột", icon: "pi pi-circle" },
  { key: "phim", label: "Phím", icon: "pi pi-table" },
  { key: "tai", label: "Tai USB", icon: "pi pi-headphones" },
]);

const LEAD_DEVICE_ITEMS = Object.freeze([
  { key: "man20", label: 'Màn 20"', icon: "pi pi-desktop" },
  { key: "man24", label: 'Màn 24"', icon: "pi pi-desktop" },
  { key: "thung", label: "Thùng máy", icon: "pi pi-box" },
  { key: "chuot", label: "Chuột", icon: "pi pi-circle" },
  { key: "phim", label: "Phím", icon: "pi pi-table" },
  { key: "tai", label: "Tai USB", icon: "pi pi-headphones" },
  { key: "laptop_standard", label: LAPTOP_PACKAGES[0].label, short: "Laptop + Sạc + Chuột", icon: "pi pi-mobile", packageValue: LAPTOP_PACKAGES[0].value },
  { key: "laptop_bag", label: LAPTOP_PACKAGES[1].label, short: "Laptop + Túi chống sốc", icon: "pi pi-briefcase", packageValue: LAPTOP_PACKAGES[1].value },
]);

function GripIcon() {
  return (
    <svg viewBox="0 0 12 18" width="10" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="3" r="1.6" /><circle cx="9" cy="3" r="1.6" />
      <circle cx="3" cy="9" r="1.6" /><circle cx="9" cy="9" r="1.6" />
      <circle cx="3" cy="15" r="1.6" /><circle cx="9" cy="15" r="1.6" />
    </svg>
  );
}

function HeroIcon({ name, size = 18, className = '', title }) {
  const path = HERO_PATHS[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title ? <title>{title}</title> : null}
      {path.split(' M').map((d, i) => <path key={i} d={(i ? 'M' : '') + d} />)}
    </svg>
  );
}

function InlineEdit({ value, onChange, placeholder, className, isName = false, readOnly = false }) {
  const [isEdit, setIsEdit] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleSave = () => {
    if (val !== value) {
      onChange(val);
    }
    setIsEdit(false);
  };

  if (isEdit && !readOnly) {
    return (
      <InputText
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setVal(value);
            setIsEdit(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        draggable={false}
        className={`inline-edit-input ${isName ? "compact-cabin-name-input" : ""}`}
        aria-label={placeholder || "Chỉnh sửa tên"}
      />
    );
  }

  return (
    <div
      className={`${className || ""} inline-edit-display ${isName ? "inline-edit-name" : "inline-edit-ellipsis"}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly) {
          setVal(value);
          setIsEdit(true);
        }
      }}
      onDoubleClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDragStart={(e) => e.preventDefault()}
      title={readOnly ? "Chế độ xem" : "Click để sửa"}
      aria-readonly={readOnly}
    >
      {value || placeholder}
    </div>
  );
}

function StatusDot({ connectionStatus, syncStatus }) {
  let statusClass = "error";
  let label = "Mất kết nối Cloud";
  let pulse = false;

  if (connectionStatus === "checking") {
    statusClass = "checking";
    label = "Đang kiểm tra kết nối...";
    pulse = true;
  } else if (connectionStatus === "connected") {
    if (syncStatus === "syncing") {
      statusClass = "syncing";
      label = "Đang lưu Cloud...";
      pulse = true;
    } else if (syncStatus === "synced") {
      statusClass = "synced";
      label = "Đã đồng bộ";
    } else if (syncStatus === "dirty") {
      statusClass = "dirty";
      label = "Chưa lưu lên Cloud";
      pulse = true;
    } else {
      statusClass = "error";
      label = "Đồng bộ lỗi";
    }
  }

  return (
    <div className="status-pill" aria-live="polite">
      <span
        className={`status-dot status-${statusClass}${pulse ? " is-pulsing" : ""}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

const SYNC_ENDPOINT = "/api/sync";

const SYNC_TIMEOUT_MS = 15000;

async function syncRequest(options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(SYNC_ENDPOINT, {
      ...options,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("Máy chủ phản hồi quá lâu (timeout 15 giây).", { cause: err });
    throw new Error(navigator.onLine === false ? "Thiết bị đang mất mạng." : "Không kết nối được tới máy chủ /api/sync.", { cause: err });
  } finally {
    clearTimeout(timer);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false || payload === null) {
    throw new Error(
      payload?.error ||
        (payload === null
          ? `API /api/sync không trả về JSON (HTTP ${response.status}). Kiểm tra deploy Vercel.`
          : `API /api/sync lỗi HTTP ${response.status}`),
    );
  }

  return payload;
}

const DIRTY_STORAGE_KEY = "kiemke-lau2:dirty";

const readDirtyFlag = () => {
  try {
    return localStorage.getItem(DIRTY_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeDirtyFlag = (dirty) => {
  try {
    if (dirty) localStorage.setItem(DIRTY_STORAGE_KEY, "1");
    else localStorage.removeItem(DIRTY_STORAGE_KEY);
  } catch {
    /* localStorage không khả dụng: bỏ qua */
  }
};

const genId = () => "s_" + Math.random().toString(36).substr(2, 9);

const DEFAULT_TEAMS = [
  { id: "fill-lead", name: "Lead", dotColor: "#2563eb" },
  { id: "fill-pink", name: "User", dotColor: "#ec4899" },
  { id: "fill-orange", name: "Social", dotColor: "#f97316" },
  { id: "fill-cyan", name: "Merchant", dotColor: "#06b6d4" },
  { id: "fill-yellow", name: "Night/Senior", dotColor: "#eab308" },
  { id: "fill-purple", name: "SPT/PT", dotColor: "#8b5cf6" },
  { id: "fill-grey", name: "Trống", dotColor: "#6b7280" },
];

const COLOR_PALETTE_GROUPS = [
  { label: "Xanh dương",  shades: ["#93c5fd", "#3b82f6", "#2563eb", "#1e40af"] },
  { label: "Tím",         shades: ["#c4b5fd", "#a78bfa", "#8b5cf6", "#6d28d9"] },
  { label: "Hồng",        shades: ["#f9a8d4", "#f472b6", "#ec4899", "#be185d"] },
  { label: "Đỏ",          shades: ["#fca5a5", "#f87171", "#ef4444", "#b91c1c"] },
  { label: "Cam",         shades: ["#fdba74", "#fb923c", "#f97316", "#c2410c"] },
  { label: "Vàng",        shades: ["#fde68a", "#fbbf24", "#eab308", "#a16207"] },
  { label: "Xanh lá",    shades: ["#6ee7b7", "#34d399", "#10b981", "#065f46"] },
  { label: "Xanh ngọc",  shades: ["#67e8f9", "#22d3ee", "#06b6d4", "#0e7490"] },
  { label: "Trung tính", shades: ["#e2e8f0", "#94a3b8", "#64748b", "#334155"] },
];

const COLOR_PALETTE = COLOR_PALETTE_GROUPS.flatMap((g) => g.shades);

const defaultData = [
  {
    floorName: "Sàn Lầu 3",
    lanes: [
      {
        laneLetter: "A",
        startStt: 18,
        leads: [{ id: genId(), name: "Thu Hiền - TL" }],
        agents: [
          "Trần Chi", "Nguyễn Trâm", "Trần Trinh", "Nguyễn Thiên", "Đoàn Giao",
          "NB Content", "NB Content", "Lê Trinh", "Nguyễn Tỷ", "Cao Nhung",
          "Huỳnh Ngà", "Huỳnh Châu", "Lê Châu", "Trống", "Trống"
        ].map((n, i) => ({ id: genId(), name: n, stt: 18 + i })),
      },
      {
        laneLetter: "B",
        startStt: 38,
        leads: [{ id: genId(), name: "Vy - DA" }],
        agents: [
          "Nguyễn Khanh", "Lý - Senior", "Nguyễn Hậu", "Võ Hiền", "Phan Loan",
          "Võ Lan", "NB Content", "NB Content", "Tuyến - Senior", "Nguyễn Thúy"
        ].map((n, i) => ({ id: genId(), name: n, stt: 38 + i })),
      },
      {
        laneLetter: "C",
        startStt: 48,
        leads: [{ id: genId(), name: "Lead Hỗ Trợ" }],
        agents: [
          "Huỳnh Giang", "Trần Tâm", "Nguyễn Phương", "Ngô Hằng", "Lai Nghi",
          "NB Tele", "Trống", "Trống", "Trống", "Trống"
        ].map((n, i) => ({ id: genId(), name: n, stt: 48 + i })),
      },
      {
        laneLetter: "D",
        startStt: 58,
        leads: [{ id: genId(), name: "Anh Thư - SUP" }],
        agents: [
          "Full", "Full", "PT - Phúc Hậu", "Trung Hiếu", "Quốc Khánh",
          "Trống", "Nhung Huỳnh", "Yến Ly", "Gia Hưng", "Bích Quỳnh",
          "PT - Phương Thy", "PT - Khánh Vy", "PT - Liên Anh", "PT - Thu Hồng",
          "PT - Loan", "PT - Cắt Tường", "PT - Khoa"
        ].map((n, i) => ({ id: genId(), name: n, stt: 58 + i })),
      },
    ],
  },
  {
    floorName: "Sàn Lầu 2",
    lanes: [
      {
        laneLetter: "A",
        startStt: 1,
        leads: [{ id: genId(), name: "Oanh - Senior TL" }],
        agents: [
          "Trống", "Thiên Kim Senior", "Kim Ái Senior", "Huy Hoàng", "Diệu Trinh",
          "PT Thảo Phương", "PT Sỹ Danh", "PT Trúc Linh", "PT Thu Hiền", "Full",
          "PT Thành Đạt", "Full", "PT - Gia Hân", "PT - Sang", "PT - Trang",
          "PT - Huy", "PT - Gia Bội", "PT - Hào"
        ].map((n, i) => ({ id: genId(), name: n, stt: 1 + i })),
      },
      {
        laneLetter: "B",
        startStt: 19,
        leads: [{ id: genId(), name: "Chinh - TL" }],
        agents: [
          "Thiên Ngân", "Tú Trinh", "Trung Nghị", "Minh Tâm", "Minh Thư",
          "Duy Khánh", "Hồng Ân", "Nhật Lam", "Khánh Ly", "Hoàng Gấm NB",
          "Hoàng Khải", "Phi Phụng", "Bảo Anh Senior", "Ngọc Tú", "Uyên",
          "Thanh", "PT Bảo My", "Full", "Cảnh", "Trúc"
        ].map((n, i) => ({ id: genId(), name: n, stt: 19 + i })),
      },
      {
        laneLetter: "C",
        startStt: 39,
        leads: [{ id: genId(), name: "Lead Hỗ Trợ 2" }],
        agents: [
          "Thiếu 1 màn hình", "Full", "Trực", "Kim Ngân", "Đan Vy",
          "Nguyễn Senior", "Thắng", "Full", "Nguyễn Kim Ngân", "Thị Thủy",
          "Ý Lan", "Hải Yến", "Ái Linh", "Hân Senior", "Minh Thái",
          "Quang Hậu", "Công Hiệp", "Full", "Minh Hoàng"
        ].map((n, i) => ({ id: genId(), name: n, stt: 39 + i })),
      },
      {
        laneLetter: "D",
        startStt: 59,
        leads: [{ id: genId(), name: "Phương - TL QA" }],
        agents: [
          "Hoàng Khôi", "Minh Đạo", "Văn Anh", "Kim Chi", "Thảo Vi",
          "Thừa Nghiên", "Mai Xuân", "Thị Quỳnh", "Nguyễn Nhi", "Thị Hồng",
          "Chấn Điền", "Nhật Khánh", "Tú Quyền", "Tân Tài", "Tuấn Anh", "Toàn"
        ].map((n, i) => ({ id: genId(), name: n, stt: 59 + i })),
      },
    ],
  },
];

const getTeam = (teams, colorId) => {
  const safeTeams = Array.isArray(teams) ? teams : DEFAULT_TEAMS;
  return (
    safeTeams.find((t) => t?.id === colorId) || {
      id: colorId || "unknown",
      name: "Khác",
      dotColor: "#9ca3af",
    }
  );
};

const teamCardStyle = (hex) => ({
  "--team-color": hex || "#9ca3af",
});

const TeamGridMenu = ({ teams, activeColorId, onClick, readOnly = false }) => {
  const safeTeams = Array.isArray(teams) ? teams.filter((team) => team?.id) : [];
  return (
    <div className="team-grid-container" role="menu" aria-label="Chọn Team">
      <div className="team-grid-title">Chọn Team</div>
      <div className="team-grid">
        {safeTeams.map((team) => {
          const active = team.id === activeColorId;
          return (
            <button
              key={team.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              className={`team-grid-item ${active ? "is-active" : ""}`}
              onClick={() => !readOnly && onClick?.(team.id)}
              disabled={readOnly}
            >
              <span className="team-grid-dot" style={{ backgroundColor: team.dotColor || "#9ca3af" }} aria-hidden="true" />
              <span className="team-grid-name">{team.name || "Khác"}</span>
              {active && <i className="pi pi-check" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TeamTag = ({ team, onOpen, readOnly = false }) => {
  const safeTeam = team || getTeam([], "unknown");
  return (
    <button
      type="button"
      className="team-tag"
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly && onOpen) {
          onOpen(e);
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={`Đổi Team cho cabin. Team hiện tại: ${safeTeam.name}`}
      title={readOnly ? "Chế độ xem" : "Click để đổi Team cho cabin"}
      aria-disabled={readOnly}
      disabled={readOnly}
    >
      <span
        className="team-tag-dot"
        style={{ backgroundColor: safeTeam.dotColor }}
        aria-hidden="true"
      />
      <span className="team-tag-label">{safeTeam.name}</span>
      <i className="pi pi-chevron-down team-tag-caret" aria-hidden="true" />
    </button>
  );
};

const initChecklist = (isLead) =>
  isLead
    ? {
        checked: false,
        status: "CHƯA KIỂM",
        thung: false,
        thung_qty: 0,
        man20: false,
        man20_qty: 0,
        man24: false,
        man24_qty: 0,
        chuot: false,
        chuot_qty: 0,
        phim: false,
        phim_qty: 0,
        tai: false,
        tai_qty: 0,
        laptop: false,
        laptop_package: "",
      }
    : {
        checked: false,
        status: "CHƯA KIỂM",
        thung: false,
        thung_qty: 0,
        man20: false,
        man20_qty: 0,
        chuot: false,
        chuot_qty: 0,
        phim: false,
        phim_qty: 0,
        tai: false,
        tai_qty: 0,
      };

const ensureInventoryState = (state) => {
  const source = normalizeState(state);
  const next = JSON.parse(JSON.stringify(source));

  next.floors.forEach((floor) =>
    floor.lanes.forEach((lane) => {
      lane.leads.forEach((lead) => {
        if (lead?.id && (!next.inventory[lead.id] || typeof next.inventory[lead.id] !== "object")) {
          next.inventory[lead.id] = initChecklist(true);
        }
      });
      lane.agents.forEach((agent) => {
        if (agent?.id && (!next.inventory[agent.id] || typeof next.inventory[agent.id] !== "object")) {
          next.inventory[agent.id] = initChecklist(false);
        }
      });
    }),
  );

  return next;
};

const normalizeState = (state) => {
  const source = state && typeof state === "object" ? state : {};
  const floors = Array.isArray(source.floors) ? source.floors : [];
  const teams = Array.isArray(source.teams) && source.teams.length
    ? source.teams.filter((team) => team?.id)
    : JSON.parse(JSON.stringify(DEFAULT_TEAMS));

  return {
    floors: floors.map((floor) => ({
      floorName: floor?.floorName || "Sàn chưa đặt tên",
      lanes: Array.isArray(floor?.lanes)
        ? floor.lanes.map((lane) => ({
            laneLetter: lane?.laneLetter || "—",
            startStt: Number.isFinite(Number(lane?.startStt)) ? Number(lane.startStt) : 1,
            leads: Array.isArray(lane?.leads) ? lane.leads.filter(Boolean) : [],
            agents: Array.isArray(lane?.agents) ? lane.agents.filter(Boolean) : [],
          }))
        : [],
    })),
    inventory: Object.fromEntries(
      Object.entries(source.inventory && typeof source.inventory === "object" ? source.inventory : {}).map(([id, raw]) => {
        const inv = raw && typeof raw === "object" ? raw : {};
        const normalized = { ...inv };
        ["thung", "man20", "man24", "chuot", "phim", "tai"].forEach((key) => {
          const qtyKey = `${key}_qty`;
          const qty = Number(normalized[qtyKey]);
          normalized[qtyKey] = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0;
          normalized[key] = normalized[qtyKey] > 0;
        });
        if (normalized.laptop_package && !LAPTOP_PACKAGES.some((item) => item.value === normalized.laptop_package)) {
          normalized.laptop_package = LAPTOP_PACKAGES[0].value;
        }
        return [id, normalized];
      }),
    ),
    colors: source.colors && typeof source.colors === "object" ? { ...source.colors } : {},
    teams,
    performanceSetting:
      source.performanceSetting && typeof source.performanceSetting === "object"
        ? {
            enabled: source.performanceSetting?.enabled === true,
            items: Array.isArray(source.performanceSetting?.items)
              ? source.performanceSetting.items
              : [],
          }
        : { enabled: false, items: [] },
  };
};

export default function App() {
  const toast = useRef(null);
  const fileInputRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(null);
  const closeMenu = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    if (!openMenu) return undefined;
    const handlePointerDown = (event) => {
      if (!event.target.closest(".dropdown-portal") && !event.target.closest(".team-tag")) closeMenu();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openMenu, closeMenu]);

  const LOCAL_STORAGE_KEY = "kiemke-lau2:appState";

  const readLocalState = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.floors)) return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const writeLocalState = (state) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Không thể lưu bản nháp local:", err);
    }
  };

  const [appState, setAppState] = useState(() => {
    const local = readLocalState();
    return normalizeState(
      local || {
        floors: JSON.parse(JSON.stringify(defaultData)),
        inventory: {},
        colors: {},
        teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
        performanceSetting: { enabled: false, items: [] },
      },
    );
  });

  useEffect(() => {
    writeLocalState(appState);
  }, [appState]);

  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [activeLane, setActiveLane] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Tất cả");
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showTeamSheet, setShowTeamSheet] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState(COLOR_PALETTE[0]);

  const [authState, setAuthState] = useState({
    status: "loading",
    role: "non-admin",
    email: "",
  });
  const isAdmin = authState.status === "authenticated" && authState.role === "admin";
  const adminEmail = authState.email;
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Session state is deliberately revalidated against the single whitelist.
    // No role is trusted from appState/localStorage.
    const savedEmail = normalizeAdminEmail(sessionStorage.getItem("kiemke-lau2:adminEmail"));
    if (isAdminEmail(savedEmail)) {
      setAuthState({ status: "authenticated", role: "admin", email: savedEmail });
    } else {
      sessionStorage.removeItem("kiemke-lau2:adminEmail");
      setAuthState({ status: "unauthenticated", role: "non-admin", email: "" });
    }
  }, []);

  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [syncStatus, setSyncStatus] = useState(() => (readDirtyFlag() ? "dirty" : "synced"));
  const [syncError, setSyncError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const hasHydratedRef = useRef(false);
  // localRevision tăng mỗi lần sửa; syncedRevision = revision đã lưu Cloud thành công.
  const localRevisionRef = useRef(readDirtyFlag() ? 1 : 0);
  const syncedRevisionRef = useRef(0);
  const autoSyncTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryDelayRef = useRef(5000);
  const syncInFlightRef = useRef(false);
  const appStateRef = useRef(appState);
  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  const autoColor = (name) => {
    const n = (name || "").toUpperCase();
    if (n.includes("TRỐNG") || n === "") return "fill-grey";
    if (n.includes("SENIOR") || n.includes("TRAINER")) return "fill-yellow";
    if (n.startsWith("PT") || n.includes("PT -") || n.includes("PT ")) return "fill-purple";
    if (n.includes("NB ")) return "fill-orange";
    if (n === "FULL") return "fill-cyan";
    return "fill-pink";
  };

  const loadOnline = useCallback(async ({ silent = false } = {}) => {
    setConnectionStatus("checking");
    const revisionAtStart = localRevisionRef.current;
    try {
      const payload = await syncRequest({ method: "GET" });
      const data = payload?.data;

      setConnectionStatus("connected");
      setSyncError("");
      if (payload?.updatedAt) setLastSyncedAt(payload.updatedAt);

      const hasUnsyncedLocal = localRevisionRef.current > syncedRevisionRef.current;
      if (data && Array.isArray(data.floors)) {
        if (hasUnsyncedLocal || localRevisionRef.current !== revisionAtStart) {
          // Bản nháp trên máy có thay đổi chưa lưu Cloud (ví dụ lần trước lưu lỗi):
          // KHÔNG ghi đè, giữ bản local và để auto-sync đẩy lên.
          setSyncStatus("dirty");
          if (!silent) {
            toast.current?.show({
              severity: "warn",
              summary: "Giữ bản nháp trên máy",
              detail: "Máy này có thay đổi chưa lưu Cloud. Đăng nhập Admin để đồng bộ lên Cloud.",
              life: 4500,
            });
          }
        } else {
          setAppState(normalizeState(data));
          setSyncStatus("synced");
          if (!silent) {
            toast.current?.show({
              severity: "success",
              summary: "Đã tải dữ liệu Cloud",
              detail: "Dữ liệu mới nhất đã được tải về",
              life: 2500,
            });
          }
        }
      } else {
        setAppState((prev) => ensureInventoryState(prev));
        // Cloud trống: đánh dấu cần đẩy bản hiện tại lên.
        if (localRevisionRef.current === syncedRevisionRef.current) localRevisionRef.current += 1;
        setSyncStatus("dirty");
      }
    } catch (err) {
      console.error("Supabase load error:", err);
      setConnectionStatus("error");
      setSyncError(err?.message || "Lỗi mạng");
      setAppState((prev) => ensureInventoryState(prev));
      if (!silent) {
        toast.current?.show({
          severity: "warn",
          summary: "Không tải được Cloud",
          detail: `${err?.message || "Lỗi mạng"} — Đang dùng dữ liệu lưu trên máy.`,
          life: 6000,
        });
      }
    } finally {
      hasHydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    void loadOnline();
  }, [loadOnline]);

  // Đẩy state hiện tại lên Cloud. Dùng chung cho nút "Lưu Cloud" và auto-sync.
  // pushToCloudRef giúp timer thử lại luôn gọi phiên bản mới nhất (email admin hiện tại).
  const pushToCloudRef = useRef(null);
  const pushToCloud = useCallback(async ({ manual = false } = {}) => {
    if (!isAdmin || syncInFlightRef.current) return false;
    if (autoSyncTimerRef.current) {
      clearTimeout(autoSyncTimerRef.current);
      autoSyncTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    const revision = localRevisionRef.current;
    syncInFlightRef.current = true;
    if (manual) setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      const payload = await syncRequest({
        method: "POST",
        headers: { "X-Admin-Email": adminEmail },
        body: JSON.stringify({ data: appStateRef.current }),
      });

      syncedRevisionRef.current = Math.max(syncedRevisionRef.current, revision);
      retryDelayRef.current = 5000;
      setConnectionStatus("connected");
      setSyncError("");
      setLastSyncedAt(payload?.updatedAt || new Date().toISOString());
      const stillDirty = localRevisionRef.current > syncedRevisionRef.current;
      setSyncStatus(stillDirty ? "dirty" : "synced");
      writeDirtyFlag(stillDirty);
      if (manual) {
        toast.current?.show({
          severity: "success",
          summary: "Đã lưu Cloud",
          detail: "Dữ liệu đã được lưu lên Supabase",
          life: 2500,
        });
      }
      return true;
    } catch (err) {
      console.error("Supabase sync error:", err);
      const message = err?.message || "Lỗi mạng";
      setConnectionStatus("error");
      setSyncStatus("error");
      setSyncError(message);
      writeDirtyFlag(true);
      if (manual) {
        toast.current?.show({
          severity: "error",
          summary: "Không thể lưu Cloud",
          detail: `${message} Dữ liệu vẫn được lưu tạm trên máy và sẽ tự đồng bộ lại.`,
          life: 7000,
        });
      }
      // Tự thử lại với backoff 5s → 10s → 20s → … tối đa 60s.
      const delay = retryDelayRef.current;
      retryDelayRef.current = Math.min(delay * 2, 60000);
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        if (localRevisionRef.current > syncedRevisionRef.current) void pushToCloudRef.current?.();
      }, delay);
      return false;
    } finally {
      syncInFlightRef.current = false;
      if (manual) setIsSyncing(false);
    }
  }, [isAdmin, adminEmail]);

  useEffect(() => {
    pushToCloudRef.current = pushToCloud;
  }, [pushToCloud]);

  const syncOnline = () => {
    if (!isAdmin) { setShowLogin(true); return; }
    retryDelayRef.current = 5000;
    void pushToCloud({ manual: true });
  };

  // Auto-sync: chỉ gửi khi có thay đổi chưa lưu, gom các thao tác liên tiếp (debounce 1s).
  useEffect(() => {
    if (!hasHydratedRef.current || !isAdmin) return undefined;
    if (localRevisionRef.current <= syncedRevisionRef.current) return undefined;
    if (retryTimerRef.current) return undefined; // đang chờ thử lại sau lỗi

    autoSyncTimerRef.current = setTimeout(() => {
      autoSyncTimerRef.current = null;
      void pushToCloudRef.current?.();
    }, 1000);

    return () => {
      if (autoSyncTimerRef.current) {
        clearTimeout(autoSyncTimerRef.current);
        autoSyncTimerRef.current = null;
      }
    };
  }, [appState, isAdmin]);

  // Có mạng trở lại / quay lại tab: thử đồng bộ ngay.
  useEffect(() => {
    const retryNow = () => {
      if (document.visibilityState === "hidden") return;
      if (!isAdmin) {
        if (connectionStatus === "error") void loadOnline({ silent: true });
        return;
      }
      if (localRevisionRef.current > syncedRevisionRef.current) {
        retryDelayRef.current = 5000;
        void pushToCloudRef.current?.();
      }
    };
    window.addEventListener("online", retryNow);
    document.addEventListener("visibilitychange", retryNow);
    return () => {
      window.removeEventListener("online", retryNow);
      document.removeEventListener("visibilitychange", retryNow);
    };
  }, [isAdmin, connectionStatus, loadOnline]);

  useEffect(() => () => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
  }, []);

  const markDirty = () => {
    localRevisionRef.current += 1;
    writeDirtyFlag(true);
    setSyncStatus("dirty");
  };

  const updateState = (updater) => {
    if (!isAdmin) { setShowLogin(true); return; }
    setAppState((prev) => {
      const next = normalizeState(prev);
      updater(next);
      return next;
    });
    markDirty();
  };

  const resetAllInventory = () => {
    const confirmed = window.confirm(
      "Xoá toàn bộ dữ liệu kiểm kê? Tên cabin, vị trí, Team và cách sắp xếp sẽ được giữ nguyên."
    );
    if (!confirmed) return;

    updateState((next) => {
      const inventory = {};
      next.floors.forEach((floor) => {
        (floor?.lanes || []).forEach((lane) => {
          [...(lane?.leads || []), ...(lane?.agents || [])].forEach((seat) => {
            if (seat?.id) inventory[seat.id] = initChecklist(Boolean((lane?.leads || []).some((x) => x?.id === seat.id)));
          });
        });
      });
      next.inventory = inventory;
    });

    toast.current?.show({
      severity: "info",
      summary: "Đã reset kiểm kê",
      detail: "Toàn bộ checkbox và số lượng đã được xoá. Cấu trúc cabin vẫn được giữ nguyên.",
      life: 3500,
    });
  };

  const exportToJson = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(appState, null, 2));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `kiem_ke_tai_san_backup_${dateStr}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.current?.show({
        severity: "success",
        summary: "Xuất dữ liệu",
        detail: "Đã xuất file JSON thành công",
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi xuất JSON",
        detail: err.message || "Không thể xuất file JSON",
        life: 3000,
      });
    }
  };

  const importFromJson = (e) => {
    if (!isAdmin) { setShowLogin(true); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.floors && Array.isArray(parsed.floors)) {
          setAppState(normalizeState(parsed));
          markDirty();
          toast.current?.show({
            severity: "success",
            summary: "Nhập dữ liệu thành công",
            detail: "Đã nạp thành công dữ liệu từ file JSON",
            life: 3000,
          });
        } else {
          throw new Error("Cấu trúc file JSON không đúng định dạng kiểm kê");
        }
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi đọc file JSON",
          detail: err.message || "File JSON không hợp lệ",
          life: 4000,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const addTeam = (name, dotColor) => {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      toast.current?.show({
        severity: "warn",
        summary: "Thiếu tên Team",
        detail: "Vui lòng nhập tên Team trước khi thêm",
        life: 2500,
      });
      return;
    }
    const newId = "team_" + genId();
    updateState((st) => {
      if (!st.teams) st.teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
      st.teams.push({ id: newId, name: trimmed, dotColor });
    });
    setShowAddTeam(false);
    setNewTeamName("");
    setNewTeamColor(COLOR_PALETTE[0]);
    toast.current?.show({
      severity: "success",
      summary: "Đã thêm Team",
      detail: `Đã thêm Team "${trimmed}"`,
      life: 2500,
    });
  };

  const updateTeamColor = (teamId, dotColor) => {
    updateState((st) => {
      const t = st.teams.find((x) => x.id === teamId);
      if (t) t.dotColor = dotColor;
    });
    setEditingTeamId(null);
  };

  const deleteTeam = (teamId) => {
    const team = getTeam(appState.teams, teamId);
    if (!team || teamId === "fill-grey") {
      toast.current?.show({
        severity: "warn",
        summary: "Không thể xoá",
        detail: "Team Trống được giữ lại làm trạng thái mặc định cho cabin chưa phân công.",
        life: 3000,
      });
      return;
    }

    updateState((st) => {
      st.teams = st.teams.filter((t) => t.id !== teamId);
      Object.keys(st.colors).forEach((seatId) => {
        if (st.colors[seatId] === teamId) st.colors[seatId] = "fill-grey";
      });
    });
    if (selectedTeamId === teamId) setSelectedTeamId(null);
    if (editingTeamId === teamId) setEditingTeamId(null);
    toast.current?.show({
      severity: "success",
      summary: "Đã xoá Team",
      detail: `Team "${team.name}" đã được xoá. Các cabin liên quan đã chuyển về Trống.`,
      life: 3000,
    });
  };

  const renameTeam = (teamId, name) => {
    if (!name || !name.trim()) return;
    updateState((st) => {
      const t = st.teams.find((x) => x.id === teamId);
      if (t) t.name = name.trim();
    });
  };

  const getTeamCounts = () => {
    const counts = { total: 0 };
    const teams = Array.isArray(appState?.teams) ? appState.teams : DEFAULT_TEAMS;
    teams.forEach((team) => {
      if (team?.id) counts[team.id] = 0;
    });

    (Array.isArray(appState?.floors) ? appState.floors : []).forEach((floor) =>
      (Array.isArray(floor?.lanes) ? floor.lanes : []).forEach((lane) => {
        (Array.isArray(lane?.leads) ? lane.leads : []).forEach((lead) => {
          if (!lead?.id) return;
          counts.total++;
          const colorId = appState?.colors?.[lead.id] || "fill-lead";
          counts[colorId] = (counts[colorId] || 0) + 1;
        });
        (Array.isArray(lane?.agents) ? lane.agents : []).forEach((agent) => {
          if (!agent?.id) return;
          counts.total++;
          const colorId = appState?.colors?.[agent.id] || autoColor(agent?.name);
          counts[colorId] = (counts[colorId] || 0) + 1;
        });
      }),
    );

    return counts;
  };
  const teamCounts = getTeamCounts();

  const updateProp = (fIdx, lIdx, type, sIdx, prop, val) => {
    updateState((st) => {
      const floor = st.floors?.[fIdx];
      const lane = floor?.lanes?.[lIdx];
      const collection = type === "lead" ? lane?.leads : lane?.agents;
      const seat = collection?.[sIdx];
      if (!seat) return;
      seat[prop] = prop === "stt" ? parseInt(val, 10) || val : val;
    });
  };

  const updateLaneProp = (fIdx, lIdx, prop, val) => {
    updateState((st) => {
      const lane = st.floors?.[fIdx]?.lanes?.[lIdx];
      if (!lane) return;
      lane[prop] = prop === "startStt" ? parseInt(val, 10) || val : val;
    });
  };

  const updateLaptopPackage = (id, packageValue, nextChecked) =>
    updateState((st) => {
      if (!id) return;
      if (!st.inventory[id] || typeof st.inventory[id] !== "object") {
        st.inventory[id] = initChecklist(true);
      }

      const inv = st.inventory[id];
      const isSamePackage = inv.laptop_package === packageValue;

      if (isSamePackage && nextChecked === false) {
        inv.laptop = false;
        inv.laptop_package = "";
        return;
      }

      if (nextChecked === true) {
        inv.laptop = true;
        inv.laptop_package = packageValue;
        return;
      }

      if (isSamePackage) {
        inv.laptop = false;
        inv.laptop_package = "";
      }
    });

  const updateInventoryQuantity = (id, key, value) =>
    updateState((st) => {
      if (!id) return;
      if (!st.inventory[id] || typeof st.inventory[id] !== "object") {
        st.inventory[id] = initChecklist(false);
      }
      const qty = Number.parseInt(value, 10);
      const nextQty = Number.isFinite(qty) ? Math.max(0, Math.floor(qty)) : 0;
      st.inventory[id][`${key}_qty`] = nextQty;
      st.inventory[id][key] = nextQty > 0;
    });

  const quickToggleEquipment = (id, key, event, packageValue = null) => {
    if (!isAdmin || !id) return;

    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (key === "laptop_standard" || key === "laptop_bag") {
      const value = packageValue || (key === "laptop_bag" ? LAPTOP_PACKAGES[1].value : LAPTOP_PACKAGES[0].value);
      const inv = appState?.inventory?.[id] || {};
      const active = Boolean(inv.laptop) && inv.laptop_package === value;
      updateLaptopPackage(id, value, !active);
      return;
    }

    const inv = appState?.inventory?.[id] || {};
    const currentQty = Math.max(0, Number.parseInt(inv[`${key}_qty`], 10) || 0);
    const decrease = Boolean(event?.shiftKey || event?.button === 2);

    if (decrease) {
      const nextQty = Math.max(0, currentQty - 1);
      updateInventoryQuantity(id, key, nextQty);
      return;
    }

    const nextQty = currentQty > 0 ? 0 : 1;
    updateInventoryQuantity(id, key, nextQty);
  };

  const handleEquipmentContextMenu = (id, key, event, packageValue = null) => {
    event.preventDefault();
    quickToggleEquipment(id, key, event, packageValue);
  };

  const setEquipmentQuantity = (id, key, value) => {
    if (!isAdmin || !id) return;
    const nextQty = Math.max(0, Number.parseInt(value, 10) || 0);
    updateInventoryQuantity(id, key, nextQty);
  };

  const adjustEquipmentQuantity = (id, key, delta) => {
    if (!isAdmin || !id) return;
    const inv = appState?.inventory?.[id] || {};
    const currentQty = Math.max(0, Number.parseInt(inv?.[`${key}_qty`], 10) || 0);
    setEquipmentQuantity(id, key, currentQty + delta);
  };

  const updateSttGlobal = (fIdx, lIdx, val) =>
    updateState((st) => {
      const lane = st.floors?.[fIdx]?.lanes?.[lIdx];
      if (!lane) return;
      const start = parseInt(val, 10) || 0;
      lane.startStt = start;
      (Array.isArray(lane.agents) ? lane.agents : []).forEach((agent, i) => {
        if (agent) agent.stt = start + i;
      });
    });

  const addSeat = (fIdx, lIdx, type) =>
    updateState((st) => {
      const id = genId();
      st.inventory[id] = initChecklist(type === "lead");
      const lane = st.floors[fIdx].lanes[lIdx];
      if (type === "lead") lane.leads.push({ id, name: "Lead Mới" });
      else
        lane.agents.push({
          id,
          name: "Trống",
          stt:
            lane.agents.length > 0
              ? (parseInt(lane.agents[lane.agents.length - 1].stt) || 0) + 1
              : lane.startStt,
        });
    });

  const removeSeat = (fIdx, lIdx, type, sIdx) => {
    if (!window.confirm("Bạn muốn xoá cabin này?")) return;
    updateState((st) => {
      const lane = st.floors?.[fIdx]?.lanes?.[lIdx];
      const arr = type === "lead" ? lane?.leads : lane?.agents;
      const item = arr?.[sIdx];
      if (!Array.isArray(arr) || !item?.id) return;
      const id = item.id;
      arr.splice(sIdx, 1);
      delete st.inventory[id];
      delete st.colors[id];
    });
  };

  const markFull = (id, isLead) => {
    updateState((st) => {
      if (!st.inventory[id]) st.inventory[id] = initChecklist(isLead);
      const inv = st.inventory[id];
      inv.thung = true;
      inv.thung_qty = 1;
      inv.man20 = true;
      inv.man20_qty = 1;
      inv.chuot = true;
      inv.chuot_qty = 1;
      inv.phim = true;
      inv.phim_qty = 1;
      inv.tai = true;
      inv.tai_qty = 1;
      if (isLead) {
        inv.man24 = true;
        inv.man24_qty = 1;
        inv.laptop = true;
        inv.laptop_package = inv.laptop_package || LAPTOP_PACKAGES[0].value;
      }
    });
  };

  const markReset = (id) => {
    updateState((st) => {
      if (!st.inventory[id]) return;
      const inv = st.inventory[id];
      Object.keys(inv).forEach((k) => {
        if (k.endsWith("_qty")) {
          inv[k] = 0;
        } else if (typeof inv[k] === "boolean") {
          inv[k] = false;
        } else if (k === "laptop_package") {
          inv[k] = "";
        }
      });
    });
  };

  const setSeatColor = (id, colorId) =>
    updateState((st) => (st.colors[id] = colorId));

  const applyBulkColor = (colorId) => {
    if (!activeLane) return;
    updateState((st) => {
      const lane = st.floors?.[activeLane.fIdx]?.lanes?.[activeLane.lIdx];
      if (!lane) return;
      (Array.isArray(lane.leads) ? lane.leads : []).forEach((lead) => {
        if (lead?.id) st.colors[lead.id] = colorId;
      });
      (Array.isArray(lane.agents) ? lane.agents : []).forEach((agent) => {
        if (agent?.id) st.colors[agent.id] = colorId;
      });
    });
  };

  // ───────────────────────── Kéo thả cabin ─────────────────────────
  // Một cơ chế pointer duy nhất cho chuột + cảm ứng:
  //  • Chuột: nhấn giữ và kéo (ngưỡng 6px) từ tay nắm hoặc vùng trống của cabin.
  //  • Cảm ứng: kéo ngay từ tay nắm ⋮⋮, hoặc nhấn giữ 350ms trên thân cabin.
  // Cabin "bóng" bám theo ngón tay, vạch xanh báo vị trí chèn, gần mép màn hình
  // thì tự cuộn, thả xong các cabin trượt về vị trí mới (FLIP animation).
  const dragRef = useRef(null);
  const flipRef = useRef(null);

  const sameDropTarget = (a, b) =>
    a === b ||
    Boolean(a && b && a.fIdx === b.fIdx && a.lIdx === b.lIdx && a.type === b.type &&
      a.insertBefore === b.insertBefore && a.targetId === b.targetId && a.side === b.side);

  const captureSeatRects = () => {
    const rects = new Map();
    document.querySelectorAll(".seat-card[data-seat-id]").forEach((el) => {
      if (el.dataset.seatId) rects.set(el.dataset.seatId, el.getBoundingClientRect());
    });
    return rects;
  };

  const commitSeatMove = (source, target) => {
    if (!isAdmin || !source || !target) return false;
    const sameArray = source.fIdx === target.fIdx && source.lIdx === target.lIdx && source.type === target.type;
    const toIndex = resolveInsertIndex(sameArray, source.sIdx, target.insertBefore);
    if (sameArray && toIndex === source.sIdx) return false;

    updateState((st) => {
      const sourceLane = st.floors?.[source.fIdx]?.lanes?.[source.lIdx];
      const targetLane = st.floors?.[target.fIdx]?.lanes?.[target.lIdx];
      const sourceArr = source.type === "lead" ? sourceLane?.leads : sourceLane?.agents;
      const targetArr = target.type === "lead" ? targetLane?.leads : targetLane?.agents;
      if (!Array.isArray(sourceArr) || !Array.isArray(targetArr)) return;

      const item = sourceArr[source.sIdx];
      if (!item || item.id !== source.id) return;
      if (!moveItemBetweenArrays(sourceArr, targetArr, source.sIdx, toIndex)) return;
      if (source.type !== target.type) {
        st.inventory[item.id] = initChecklist(target.type === "lead");
      }
    });
    return true;
  };

  const resolveDropTarget = (clientX, clientY) => {
    const hit = document.elementFromPoint(clientX, clientY);
    if (!hit) return null;
    const card = hit.closest(".seat-card[data-seat-id]");
    if (card) {
      const rect = card.getBoundingClientRect();
      const zone = card.closest(".drop-zone");
      const zoneWidth = zone?.getBoundingClientRect().width || rect.width;
      // Lưới nhiều cột: chia trái/phải; lưới 1 cột (Lead, điện thoại): chia trên/dưới.
      const vertical = rect.width > zoneWidth * 0.6;
      const before = vertical
        ? clientY < rect.top + rect.height / 2
        : clientX < rect.left + rect.width / 2;
      const sIdx = Number(card.dataset.seatIndex);
      return {
        fIdx: Number(card.dataset.floorIndex),
        lIdx: Number(card.dataset.laneIndex),
        type: card.dataset.seatType,
        insertBefore: before ? sIdx : sIdx + 1,
        targetId: card.dataset.seatId,
        side: before ? (vertical ? "top" : "left") : (vertical ? "bottom" : "right"),
      };
    }
    const zone = hit.closest(".drop-zone[data-seat-type]");
    if (zone) {
      return {
        fIdx: Number(zone.dataset.floorIndex),
        lIdx: Number(zone.dataset.laneIndex),
        type: zone.dataset.seatType,
        insertBefore: Number(zone.dataset.count) || 0,
        targetId: null,
        side: "end",
      };
    }
    return null;
  };

  const updateDragOver = (x, y) => {
    const drag = dragRef.current;
    if (!drag?.active) return;
    const over = resolveDropTarget(x, y);
    if (!sameDropTarget(over, drag.over)) {
      drag.over = over;
      setDragOverTarget(over);
    }
  };

  const stopAutoScroll = (drag) => {
    if (drag?.scrollRaf) cancelAnimationFrame(drag.scrollRaf);
    if (drag) drag.scrollRaf = null;
  };

  const runAutoScroll = () => {
    const drag = dragRef.current;
    if (!drag || !drag.active) return;
    const edge = Math.min(90, window.innerHeight * 0.14);
    const y = drag.lastY;
    let speed = 0;
    if (y < edge) speed = -Math.ceil(((edge - y) / edge) * 18);
    else if (y > window.innerHeight - edge) speed = Math.ceil(((y - (window.innerHeight - edge)) / edge) * 18);
    if (speed !== 0) {
      window.scrollBy(0, speed);
      updateDragOver(drag.lastX, drag.lastY);
    }
    drag.scrollRaf = requestAnimationFrame(runAutoScroll);
  };

  const positionGhost = (drag) => {
    if (!drag.ghost) return;
    const x = drag.lastX - drag.offsetX;
    const y = drag.lastY - drag.offsetY;
    drag.ghost.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(1.5deg) scale(1.03)`;
  };

  const activateDrag = () => {
    const drag = dragRef.current;
    if (!drag || drag.active) return;
    drag.active = true;
    window.clearTimeout(drag.pressTimer);

    const rect = drag.cardEl.getBoundingClientRect();
    drag.offsetX = drag.startX - rect.left;
    drag.offsetY = drag.startY - rect.top;
    const ghost = drag.cardEl.cloneNode(true);
    ghost.classList.add("seat-drag-ghost");
    ghost.classList.remove("is-dragging", "drop-left", "drop-right", "drop-top", "drop-bottom");
    ghost.removeAttribute("data-seat-id");
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    positionGhost(drag);

    document.body.classList.add("is-seat-dragging");
    try { drag.cardEl.setPointerCapture?.(drag.pointerId); } catch { /* không hỗ trợ */ }
    if (navigator.vibrate && drag.pointerType !== "mouse") navigator.vibrate(15);

    setDraggedItem(drag.source);
    drag.over = null;
    updateDragOver(drag.lastX, drag.lastY);
    drag.scrollRaf = requestAnimationFrame(runAutoScroll);
  };

  const endDrag = (commit) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    window.clearTimeout(drag.pressTimer);
    stopAutoScroll(drag);
    try { drag.cardEl.releasePointerCapture?.(drag.pointerId); } catch { /* bỏ qua */ }
    document.body.classList.remove("is-seat-dragging");

    let moved = false;
    if (drag.active && commit && drag.over) {
      const rects = captureSeatRects();
      if (drag.ghost) rects.set(drag.source.id, drag.ghost.getBoundingClientRect());
      flipRef.current = rects;
      moved = commitSeatMove(drag.source, drag.over);
      if (!moved) flipRef.current = null;
    }

    if (drag.ghost) {
      const ghost = drag.ghost;
      if (moved) {
        ghost.remove();
      } else {
        // Thả ra ngoài / huỷ: bóng bay về chỗ cũ rồi biến mất.
        const home = drag.cardEl.getBoundingClientRect();
        ghost.style.transition = "transform 180ms cubic-bezier(.2,.8,.2,1), opacity 180ms";
        ghost.style.transform = `translate3d(${home.left}px, ${home.top}px, 0)`;
        ghost.style.opacity = "0.4";
        window.setTimeout(() => ghost.remove(), 190);
      }
    }

    if (drag.active) {
      // Chặn cú click "ma" ngay sau khi thả (không mở menu / không sửa tên).
      const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      window.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 60);
      setDraggedItem(null);
      setDragOverTarget(null);
    }
  };

  const handleSeatPointerDown = (e, source) => {
    if (!isAdmin || dragRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const fromHandle = Boolean(e.target.closest(".drag-handle"));
    if (!fromHandle && e.target.closest("button, input, select, textarea, label, a, .inline-edit-display, .p-inputtext, .device-row")) return;

    dragRef.current = {
      source,
      cardEl: e.currentTarget,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      active: false,
      over: null,
      ghost: null,
      pressTimer: null,
      scrollRaf: null,
    };

    if (e.pointerType !== "mouse") {
      if (fromHandle) {
        e.preventDefault();
        activateDrag();
      } else {
        dragRef.current.pressTimer = window.setTimeout(activateDrag, 350);
      }
    }
  };

  useEffect(() => {
    const onMove = (event) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;

      if (!drag.active) {
        const dist = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
        if (drag.pointerType === "mouse") {
          if (dist > 6) activateDrag();
        } else if (dist > 10) {
          // Ngón tay di chuyển trước khi đủ thời gian giữ => người dùng đang cuộn trang.
          window.clearTimeout(drag.pressTimer);
          dragRef.current = null;
        }
        return;
      }

      event.preventDefault();
      positionGhost(drag);
      updateDragOver(event.clientX, event.clientY);
    };

    const onUp = (event) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      endDrag(event.type === "pointerup");
    };

    // Trên mobile phải chặn touchmove (passive: false) thì trang mới không cuộn khi đang kéo.
    const onTouchMove = (event) => {
      if (dragRef.current?.active) event.preventDefault();
    };
    const onKey = (event) => {
      if (event.key === "Escape" && dragRef.current) endDrag(false);
    };
    const onContextMenu = (event) => {
      if (dragRef.current && dragRef.current.pointerType !== "mouse") event.preventDefault();
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onContextMenu);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  });

  // Dọn dẹp nếu component unmount giữa lúc kéo.
  useEffect(() => () => {
    const drag = dragRef.current;
    if (drag) {
      stopAutoScroll(drag);
      drag.ghost?.remove();
      document.body.classList.remove("is-seat-dragging");
    }
  }, []);

  // FLIP: sau khi thứ tự cabin đổi, trượt mượt từ vị trí cũ sang vị trí mới.
  useLayoutEffect(() => {
    const before = flipRef.current;
    if (!before) return;
    flipRef.current = null;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".seat-card[data-seat-id]").forEach((el) => {
      const prev = before.get(el.dataset.seatId);
      if (!prev || typeof el.animate !== "function") return;
      const next = el.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
        { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    });
  });

  const stats = {
    thung: 0,
    man20: 0,
    man24: 0,
    chuot: 0,
    phim: 0,
    tai: 0,
    laptop_standard: 0,
    laptop_bag: 0,
    totalAssets: 0,
  };

  Object.values(appState?.inventory || {}).forEach((rawInv) => {
    const inv = rawInv && typeof rawInv === "object" ? rawInv : {};
    if (inv.thung) stats.thung += parseInt(inv.thung_qty, 10) || 0;
    if (inv.man20) stats.man20 += parseInt(inv.man20_qty, 10) || 0;
    if (inv.man24) stats.man24 += parseInt(inv.man24_qty, 10) || 0;
    if (inv.chuot) stats.chuot += parseInt(inv.chuot_qty, 10) || 0;
    if (inv.phim) stats.phim += parseInt(inv.phim_qty, 10) || 0;
    if (inv.tai) stats.tai += parseInt(inv.tai_qty, 10) || 0;
    if (inv.laptop) {
      if (inv.laptop_package === LAPTOP_PACKAGES[1].value) stats.laptop_bag += 1;
      else stats.laptop_standard += 1;
    }
  });
  stats.totalAssets = stats.thung + stats.man20 + stats.man24 + stats.chuot + stats.phim + stats.tai + stats.laptop_standard + stats.laptop_bag;

  const getSeatProgress = (inv, isLead) => {
    if (isLead) {
      const fixedKeys = ["thung", "man20", "man24", "chuot", "phim", "tai"];
      const fixedChecked = fixedKeys.filter((k) => Boolean(inv?.[k])).length;
      const laptopChecked = Boolean(inv?.laptop);
      const total = fixedKeys.length + 1;
      const checked = fixedChecked + (laptopChecked ? 1 : 0);
      return {
        checked,
        total,
        percent: Math.round((checked / total) * 100),
        complete: checked === total,
      };
    }
    const keys = ["thung", "man20", "chuot", "phim", "tai"];
    const checked = keys.filter((k) => Boolean(inv?.[k])).length;
    return {
      checked,
      total: keys.length,
      percent: Math.round((checked / keys.length) * 100),
      complete: checked === keys.length,
    };
  };

  const handleAdminLogin = () => {
    const email = normalizeAdminEmail(loginEmail);
    if (!isAdminEmail(email)) {
      setLoginError("Email này không nằm trong danh sách Admin được phép.");
      setAuthState({ status: "unauthenticated", role: "non-admin", email: "" });
      return;
    }

    sessionStorage.setItem("kiemke-lau2:adminEmail", email);
    setAuthState({ status: "authenticated", role: "admin", email });
    setLoginError("");
    setShowLogin(false);
    toast.current?.show({
      severity: "success",
      summary: "Đã mở quyền chỉnh sửa",
      detail: "Bạn đang ở chế độ Admin / Write mode.",
      life: 2500,
    });
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("kiemke-lau2:adminEmail");
    setAuthState({ status: "unauthenticated", role: "non-admin", email: "" });
    setEditingTeamId(null);
    setShowAddTeam(false);
    setShowTeamSheet(false);
    setShowLogin(false);
    setOpenMenu(null);
  };

  const safeFloors = Array.isArray(appState?.floors) ? appState.floors : [];
  const safeTeams = Array.isArray(appState?.teams) ? appState.teams : DEFAULT_TEAMS;
  const selectedTeam = selectedTeamId ? getTeam(safeTeams, selectedTeamId) : null;
  const editingTeam = editingTeamId ? getTeam(safeTeams, editingTeamId) : null;

  const isSpecialTeam = (team, kind) => {
    const id = String(team?.id || "").toLowerCase();
    const name = String(team?.name || "").trim().toLowerCase();
    if (kind === "full") return id === "fill-cyan" || name === "full";
    if (kind === "empty") return id === "fill-grey" || name === "trống" || name === "empty";
    return false;
  };

  const floorBreakdown = safeFloors.map((floor) => {
    const agents = (floor?.lanes || []).flatMap((lane) => Array.isArray(lane?.agents) ? lane.agents : []);
    const fullCabins = agents.filter((seat) => {
      const colorId = appState?.colors?.[seat?.id] || autoColor(seat?.name);
      return isSpecialTeam(getTeam(safeTeams, colorId), "full");
    }).length;
    const emptyCabins = agents.filter((seat) => {
      const colorId = appState?.colors?.[seat?.id] || autoColor(seat?.name);
      return isSpecialTeam(getTeam(safeTeams, colorId), "empty");
    }).length;
    const agentCabins = Math.max(agents.length - fullCabins - emptyCabins, 0);
    const devices = {
      thung: 0,
      man20: 0,
      man24: 0,
      phim: 0,
      chuot: 0,
      tai: 0,
      laptop_standard: 0,
      laptop_bag: 0,
    };
    agents.forEach((seat) => {
      const inv = appState?.inventory?.[seat?.id] || {};
      if (inv.thung) devices.thung += Number(inv.thung_qty) || 0;
      if (inv.man20) devices.man20 += Number(inv.man20_qty) || 0;
      if (inv.man24) devices.man24 += Number(inv.man24_qty) || 0;
      if (inv.phim) devices.phim += Number(inv.phim_qty) || 0;
      if (inv.chuot) devices.chuot += Number(inv.chuot_qty) || 0;
      if (inv.tai) devices.tai += Number(inv.tai_qty) || 0;
      if (inv.laptop) {
        if (inv.laptop_package === LAPTOP_PACKAGES[1].value) devices.laptop_bag += 1;
        else devices.laptop_standard += 1;
      }
    });
    return {
      name: floor?.floorName || "Sàn chưa đặt tên",
      cabins: agents.length,
      agentCabins,
      fullCabins,
      emptyCabins,
      devices,
    };
  });

  return (
    <div className="app-shell" onClick={closeMenu}>
      <Toast ref={toast} />

      {openMenu && createPortal(
        <div
          className="dropdown-portal dropdown-pop-in"
          style={{
            top: Math.max(12, Math.min(openMenu.y || 12, window.innerHeight - 360)),
            left: Math.max(12, Math.min(openMenu.x || 12, window.innerWidth - 312)),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dropdown-surface">
            {openMenu.type === "seat" && (
              <TeamGridMenu
                readOnly={!isAdmin}
                teams={safeTeams}
                activeColorId={appState?.colors?.[openMenu.seatId]}
                onClick={(cId) => {
                  setSeatColor(openMenu.seatId, cId);
                  closeMenu();
                }}
              />
            )}
            {openMenu.type === "bulk" && (
              <TeamGridMenu
                readOnly={!isAdmin}
                teams={safeTeams}
                onClick={(cId) => {
                  applyBulkColor(cId);
                  closeMenu();
                }}
              />
            )}
          </div>
        </div>,
        document.body,
      )}

      <header className="app-header">
        <div className="header-main">
          <div className="header-copy">
            <div className="eyebrow">
              <span className="eyebrow-mark" aria-hidden="true">02</span>
              <span>OPERATIONS / ASSET CONTROL</span>
            </div>
            <h1>Kiểm kê tài sản</h1>
            <p>Sàn Lầu 2 & Lầu 3 · ShopeeFood</p>
          </div>

          <div className="header-meta">
            <div className={`mode-pill ${isAdmin ? "is-admin" : "is-readonly"}`}>
              <HeroIcon name={isAdmin ? "lock" : "eye"} size={16} />
              <span>{isAdmin ? "Admin · Chỉnh sửa" : "Chế độ xem"}</span>
              {isAdmin ? <small>{adminEmail}</small> : null}
            </div>
            <div className="header-date">
              <span className="meta-label">Ngày kiểm kê</span>
              <strong>
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </strong>
            </div>
            <StatusDot connectionStatus={connectionStatus} syncStatus={syncStatus} />
            {isAdmin ? (
              <button type="button" className="header-auth-btn" onClick={handleAdminLogout}>
                <HeroIcon name="logout" size={16} />
                <span>Thoát Admin</span>
              </button>
            ) : (
              <button type="button" className="header-auth-btn primary" onClick={() => { setLoginError(""); setShowLogin(true); }}>
                <HeroIcon name="login" size={16} />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        <div className="header-rule" aria-hidden="true" />
        <div className="header-summary">
          <span><strong>{safeTeams.length}</strong> team đang quản lý</span>
          <span className="summary-separator" aria-hidden="true">/</span>
          <span>
            {syncStatus === "synced" ? "Cloud đã đồng bộ" : "Có thay đổi chưa đồng bộ"}
            {lastSyncedAt ? ` · lần cuối ${new Date(lastSyncedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </span>
        </div>

        {connectionStatus === "error" && syncError && (
          <div className="sync-alert" role="alert">
            <i className="pi pi-exclamation-triangle" aria-hidden="true" />
            <div>
              <strong>Không kết nối được Cloud</strong>
              <span>{syncError} Dữ liệu vẫn được lưu tạm trên máy này{isAdmin ? " và sẽ tự đồng bộ khi kết nối lại" : ""}.</span>
            </div>
            <button
              type="button"
              onClick={() => (isAdmin && syncStatus !== "synced" ? syncOnline() : loadOnline())}
            >
              <i className="pi pi-refresh" aria-hidden="true" /> Thử lại
            </button>
          </div>
        )}
      </header>

      <section className="overview-section" aria-labelledby="overview-heading">
        <div className="section-head">
          <div>
            <span className="section-kicker">Tổng quan</span>
            <h2 id="overview-heading">Tài sản đang được kiểm soát</h2>
          </div>
          <span className="section-note">Cập nhật theo dữ liệu hiện tại</span>
        </div>

        <div className="overview-groups">
          <section className="overview-group fixed-assets" aria-labelledby="fixed-assets-heading">
            <header className="overview-group-head">
              <div>
                <span className="group-kicker">01 · Thiết bị cố định</span>
                <h3 id="fixed-assets-heading">Bàn làm việc</h3>
              </div>
              <span className="group-total">{stats.thung + stats.man20 + stats.man24 + stats.chuot + stats.phim + stats.tai} thiết bị</span>
            </header>
            <div className="stat-grid stat-grid-fixed">
              {[
                { label: "Thùng máy", val: stats.thung, icon: "pi pi-box" },
                { label: 'Màn 20"', val: stats.man20, icon: "pi pi-desktop" },
                { label: 'Màn 24"', val: stats.man24, icon: "pi pi-desktop" },
                { label: "Chuột", val: stats.chuot, icon: "pi pi-circle" },
                { label: "Phím", val: stats.phim, icon: "pi pi-table" },
                { label: "Tai USB", val: stats.tai, icon: "pi pi-volume-up" },
              ].map((item) => (
                <article className="stat-card" key={item.label}>
                  <div className="stat-card-top">
                    <span className="stat-icon" aria-hidden="true"><i className={item.icon} /></span>
                    <span className="stat-label">{item.label}</span>
                  </div>
                  <strong className="stat-value">{item.val}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="overview-group mobile-assets" aria-labelledby="mobile-assets-heading">
            <header className="overview-group-head">
              <div>
                <span className="group-kicker">02 · Thiết bị di động</span>
                <h3 id="mobile-assets-heading">Laptop</h3>
              </div>
              <span className="group-total">{stats.laptop_standard + stats.laptop_bag} thiết bị</span>
            </header>
            <div className="stat-grid stat-grid-mobile">
              {[
                { label: "Laptop + Sạc + Chuột", val: stats.laptop_standard, icon: "pi pi-mobile" },
                { label: "Laptop + Sạc + Chuột + Túi chống sốc", val: stats.laptop_bag, icon: "pi pi-mobile" },
              ].map((item) => (
                <article className="stat-card stat-card-laptop" key={item.label}>
                  <div className="stat-card-top">
                    <span className="stat-icon" aria-hidden="true"><i className={item.icon} /></span>
                    <span className="stat-label">{item.label}</span>
                  </div>
                  <strong className="stat-value">{item.val}</strong>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="floor-breakdown-section" aria-labelledby="floor-breakdown-heading">
        <div className="section-head">
          <div>
            <span className="section-kicker">Floor breakdown</span>
            <h2 id="floor-breakdown-heading">Phân rã tài sản theo từng lầu</h2>
          </div>
          <span className="section-note">Theo dõi cabin và chi tiết thiết bị theo từng lầu</span>
        </div>
        <nav className="floor-quick-tabs" role="tablist" aria-label="Chuyển nhanh giữa các lầu">
          <button type="button" role="tab" className={`floor-quick-tab ${selectedFloor === "Tất cả" ? "active" : ""}`} onClick={() => setSelectedFloor("Tất cả")} aria-selected={selectedFloor === "Tất cả"}>
            <HeroIcon name="building" size={16} />
            <span>Tất cả</span>
            <b>{floorBreakdown.reduce((sum, item) => sum + item.cabins, 0)}</b>
          </button>
          {floorBreakdown.map((item) => (
            <button type="button" role="tab" className={`floor-quick-tab ${selectedFloor === item.name ? "active" : ""}`} key={item.name} onClick={() => setSelectedFloor(item.name)} aria-selected={selectedFloor === item.name}>
              <HeroIcon name="building" size={16} />
              <span>{item.name.replace("Sàn ", "")}</span>
              <b>{item.cabins}</b>
            </button>
          ))}
        </nav>

        <div className="floor-breakdown-grid">
          {floorBreakdown.filter((item) => selectedFloor === "Tất cả" || selectedFloor === item.name).map((item) => (
            <article className="floor-breakdown-card" key={item.name}>
              <header className="floor-breakdown-card-head">
                <span className="floor-breakdown-icon"><HeroIcon name="building" size={18} /></span>
                <div>
                  <h3>{item.name}</h3>
                  <p>Chi tiết thiết bị được cập nhật theo cabin Agent</p>
                </div>
              </header>

              <div className="floor-breakdown-summary cabin-summary" aria-label={`Tóm tắt cabin ${item.name}`}>
                <span className="summary-total"><b>{item.cabins}</b><small>Tổng cabin</small></span>
                <span className="summary-agent"><b>{item.agentCabins}</b><small>Cabin Agent</small></span>
                <span className="summary-full"><b>{item.fullCabins}</b><small>Cabin còn lại · Full</small></span>
                <span className="summary-empty"><b>{item.emptyCabins}</b><small>Cabin trống · Trống</small></span>
              </div>

              <section className="floor-device-report" aria-labelledby={`device-report-${item.name.replace(/\s+/g, "-")}`}>
                <h4 id={`device-report-${item.name.replace(/\s+/g, "-")}`}>Chi tiết thiết bị</h4>
                <dl className="floor-device-grid">
                  <div><dt>Thùng máy</dt><dd>{item.devices.thung}</dd></div>
                  <div><dt>Màn 20&quot;</dt><dd>{item.devices.man20}</dd></div>
                  <div><dt>Màn 24&quot;</dt><dd>{item.devices.man24}</dd></div>
                  <div><dt>Chuột</dt><dd>{item.devices.chuot}</dd></div>
                  <div><dt>Phím</dt><dd>{item.devices.phim}</dd></div>
                  <div><dt>Tai USB</dt><dd>{item.devices.tai}</dd></div>
                  <div className="is-wide"><dt>Laptop + Sạc + Chuột</dt><dd>{item.devices.laptop_standard}</dd></div>
                  <div className="is-wide"><dt>Laptop + Sạc + Chuột + Túi chống sốc</dt><dd>{item.devices.laptop_bag}</dd></div>
                </dl>
              </section>
            </article>
          ))}
        </div>
      </section>

      <div className="workspace-layout">
        <aside className={`team-manager-panel ${showTeamSheet ? "team-sheet-open" : ""}`}>
          <div className="team-sheet-mobile-handle" aria-hidden="true" />
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Bộ lọc</span>
              <h2>Team</h2>
            </div>
            <button
              type="button"
              className="icon-btn team-sheet-close"
              onClick={() => setShowTeamSheet(false)}
              aria-label="Đóng quản lý Team"
              title="Đóng"
            >
              <i className="pi pi-times" aria-hidden="true" />
            </button>
          </div>

          <div className="panel-actions">
            {selectedTeamId && (
              <Button
                label="Bỏ lọc"
                icon="pi pi-filter-slash"
                size="small"
                text
                severity="secondary"
                className="compact-button"
                onClick={() => {
                  setSelectedTeamId(null);
                  setShowTeamSheet(false);
                }}
              />
            )}
            <Button
              label="Thêm Team"
              disabled={!isAdmin}
              icon="pi pi-plus"
              size="small"
              severity="success"
              className="compact-button"
              onClick={() => setShowAddTeam((v) => !v)}
            />
          </div>

          <div className="team-list" role="list" aria-label="Danh sách Team">
            <button
              type="button"
              className={`team-bar-item ${selectedTeamId === null ? "active" : ""}`}
              onClick={() => {
                setSelectedTeamId(null);
                setShowTeamSheet(false);
              }}
            >
              <span className="team-list-swatch all" aria-hidden="true"><i className="pi pi-th-large" /></span>
              <span>Tất cả</span>
              <span className="team-count">{teamCounts.total}</span>
            </button>

            {safeTeams.map((team) => {
              const isSelected = selectedTeamId === team.id;
              const count = teamCounts[team.id] || 0;
              return (
                <div
                  key={team.id}
                  className={`team-bar-item-wrap ${isSelected ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className={`team-bar-item ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setShowTeamSheet(false);
                    }}
                    title={`Lọc Team ${team.name}`}
                  >
                    <span className="team-list-swatch" style={{ backgroundColor: team.dotColor }} aria-hidden="true" />
                    <span className="team-item-name">{team.name}</span>
                    <span className="team-count">{count}</span>
                  </button>
                  <button
                    type="button"
                    className="team-icon-action"
                    disabled={!isAdmin}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTeamId((prev) => (prev === team.id ? null : team.id));
                      setShowAddTeam(false);
                    }}
                    aria-label={`Đổi màu Team ${team.name}`}
                    title="Đổi màu"
                  >
                    <i className="pi pi-palette" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="team-icon-action danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTeam(team.id);
                    }}
                    disabled={!isAdmin || team.id === "fill-grey"}
                    aria-label={team.id === "fill-grey" ? "Team Trống không thể xoá" : `Xoá Team ${team.name}`}
                    title={team.id === "fill-grey" ? "Team Trống không thể xoá" : "Xoá Team"}
                  >
                    <i className="pi pi-trash" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>

          {editingTeam && (
              <div className="team-inline-form">
                <div className="form-title">
                  <span>Đổi màu</span>
                  <InlineEdit
                    value={editingTeam?.name || ""}
                    onChange={(val) => renameTeam(editingTeamId, val)}
                    className="font-extrabold"
                    readOnly={!isAdmin}
                  />
                </div>
                <div className="color-palette-grouped">
                  {COLOR_PALETTE_GROUPS.map((group) => (
                    <div key={group.label} className="color-palette-row">
                      <span className="color-palette-row-label">{group.label}</span>
                      <div className="color-palette-row-swatches">
                        {group.shades.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            className={`color-swatch ${editingTeam?.dotColor === hex ? "selected" : ""}`}
                            style={{ backgroundColor: hex }}
                            disabled={!isAdmin}
                            onClick={() => updateTeamColor(editingTeamId, hex)}
                            aria-label={`Chọn màu ${hex}`}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  label="Đóng"
                  size="small"
                  text
                  severity="secondary"
                  className="compact-button"
                  onClick={() => setEditingTeamId(null)}
                />
              </div>
          )}

          {showAddTeam && (
            <div className="team-inline-form">
              <div className="form-title">Thêm Team mới</div>
              <div className="new-team-row">
                <label className="sr-only" htmlFor="new-team-name">Tên Team mới</label>
                <InputText
                  id="new-team-name"
                  placeholder="Tên Team mới..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTeam(newTeamName, newTeamColor)}
                  className="new-team-input"
                  disabled={!isAdmin}
                  autoFocus
                  aria-label="Tên Team mới"
                />
                <span className="new-team-preview" style={{ backgroundColor: newTeamColor }} aria-hidden="true" />
              </div>
              <div className="color-palette-grouped">
                {COLOR_PALETTE_GROUPS.map((group) => (
                  <div key={group.label} className="color-palette-row">
                    <span className="color-palette-row-label">{group.label}</span>
                    <div className="color-palette-row-swatches">
                      {group.shades.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          className={`color-swatch ${newTeamColor === hex ? "selected" : ""}`}
                          style={{ backgroundColor: hex }}
                          disabled={!isAdmin}
                          onClick={() => setNewTeamColor(hex)}
                          aria-label={`Chọn màu ${hex}`}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <Button
                  label="Thêm Team"
                  icon="pi pi-check"
                  size="small"
                  severity="success"
                  className="compact-button"
                  onClick={() => addTeam(newTeamName, newTeamColor)}
                />
                <Button
                  label="Hủy"
                  size="small"
                  text
                  severity="secondary"
                  className="compact-button"
                  onClick={() => {
                    setShowAddTeam(false);
                    setNewTeamName("");
                  }}
                />
              </div>
            </div>
          )}
        </aside>

        <main className="workspace-main">
          <div className="control-bar">
            <section className="filter-panel" aria-labelledby="filter-panel-heading">
              <header className="filter-panel-head">
                <div>
                  <span className="section-kicker">Bộ lọc dữ liệu</span>
                  <h2 id="filter-panel-heading">Tìm kiếm & phạm vi</h2>
                </div>
                {selectedTeam && (
                  <button type="button" className="active-filter" onClick={() => setSelectedTeamId(null)} aria-label={`Bỏ lọc Team ${selectedTeam.name}`}>
                    <span className="team-tag-dot" style={{ backgroundColor: selectedTeam.dotColor }} aria-hidden="true" />
                    <span>{selectedTeam.name}</span>
                    <i className="pi pi-times" aria-hidden="true" />
                  </button>
                )}
              </header>
              <div className="control-primary">
                <div className="search-field">
                  <label className="sr-only" htmlFor="asset-search">Tìm tên Agent hoặc STT</label>
                  <i className="pi pi-search" aria-hidden="true" />
                  <InputText
                    id="asset-search"
                    placeholder="Tìm tên Agent hoặc STT..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Tìm tên Agent hoặc STT"
                  />
                  {search && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => setSearch("")}
                      aria-label="Xoá tìm kiếm"
                      title="Xoá tìm kiếm"
                    >
                      <i className="pi pi-times" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="floor-filter" role="tablist" aria-label="Lọc sàn">
                  {[
                    { label: "Tất cả", icon: "pi pi-th-large" },
                    { label: "Sàn Lầu 2", icon: "pi pi-building" },
                    { label: "Sàn Lầu 3", icon: "pi pi-building" },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className={`floor-filter-btn ${selectedFloor === option.label ? "active" : ""}`}
                      onClick={() => setSelectedFloor(option.label)}
                      role="tab"
                      aria-selected={selectedFloor === option.label}
                    >
                      <i className={option.icon} aria-hidden="true" />
                      <span>{option.label.replace("Sàn ", "")}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside className="control-actions" aria-label="Hành động hệ thống">
              <div className="action-panel-label">
                <span className="section-kicker">Hệ thống</span>
                <strong>Thao tác dữ liệu</strong>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={importFromJson}
                accept=".json"
                hidden
              />
              <Button
                disabled={!isAdmin}
                label="Reset kiểm kê"
                icon="pi pi-refresh"
                severity="danger"
                outlined
                className="toolbar-button reset-button"
                onClick={resetAllInventory}
                title="Xoá toàn bộ checkbox và số lượng thiết bị, giữ nguyên cabin và bố cục"
              />
              <Button
                label="Xuất JSON"
                icon="pi pi-download"
                severity="secondary"
                outlined
                className="toolbar-button"
                onClick={exportToJson}
                title="Xuất dữ liệu dự phòng ra file JSON"
              />
              <Button
                disabled={!isAdmin}
                label="Nhập JSON"
                icon="pi pi-upload"
                severity="secondary"
                outlined
                className="toolbar-button"
                onClick={() => fileInputRef.current?.click()}
                title="Nhập dữ liệu từ file JSON"
              />
              <Button
                disabled={!isAdmin || isSyncing}
                label={isSyncing ? "Đang lưu..." : "Lưu Cloud"}
                icon="pi pi-cloud-upload"
                severity="success"
                className="toolbar-button primary"
                onClick={syncOnline}
              />
            </aside>
          </div>

          {safeFloors.length === 0 && (
            <div className="empty-state">
              <i className="pi pi-inbox" aria-hidden="true" />
              <strong>Chưa có dữ liệu sàn</strong>
              <span>Hãy nhập JSON hoặc tải dữ liệu từ Cloud để bắt đầu.</span>
            </div>
          )}

          {safeFloors.map((floor, fIdx) => {
            if (selectedFloor !== "Tất cả" && floor?.floorName !== selectedFloor) return null;

            return (
              <section key={`${floor?.floorName || "floor"}-${fIdx}`} className="floor-section">
                <div className="floor-heading">
                  <div>
                    <span className="section-kicker">Sàn</span>
                    <h2>{floor?.floorName || "Sàn chưa đặt tên"}</h2>
                  </div>
                </div>

                {(Array.isArray(floor?.lanes) ? floor.lanes : []).map((lane, lIdx) => {
                  const leads = Array.isArray(lane?.leads) ? lane.leads : [];
                  const agents = Array.isArray(lane?.agents) ? lane.agents : [];

                  const renderSeatCard = (seat, type, sIdx) => {
                    const isLead = type === "lead";
                    const colorId = appState?.colors?.[seat?.id] || (isLead ? "fill-lead" : autoColor(seat?.name));
                    const team = getTeam(safeTeams, colorId);
                    const inv = appState?.inventory?.[seat?.id] || {};
                    const progress = getSeatProgress(inv, isLead);
                    const statusClass = progress.complete ? "complete" : progress.checked > 0 ? "partial" : "empty";
                    const collection = isLead ? leads : agents;
                    const originalIndex = collection.findIndex((item) => item?.id === seat?.id);
                    const currentIndex = originalIndex >= 0 ? originalIndex : sIdx;
                    const isDragging = draggedItem?.id === seat?.id;
                    const dropSide = dragOverTarget?.targetId && dragOverTarget.targetId === seat?.id && !isDragging
                      ? dragOverTarget.side
                      : null;
                    const deviceItems = isLead ? LEAD_DEVICE_ITEMS : AGENT_DEVICE_ITEMS;
                    const seatLabel = seat?.name || (isLead ? "Lead" : "Agent");

                    return (
                      <article
                        key={seat?.id || `${type}-${currentIndex}`}
                        className={`seat-card ${isLead ? "seat-card-lead" : "seat-card-agent"} status-${statusClass}${isDragging ? " is-dragging" : ""}${dropSide ? ` drop-${dropSide}` : ""}`}
                        style={teamCardStyle(team?.dotColor)}
                        data-seat-id={seat?.id || ""}
                        data-floor-index={fIdx}
                        data-lane-index={lIdx}
                        data-seat-type={type}
                        data-seat-index={currentIndex}
                        onPointerDown={(e) => handleSeatPointerDown(e, { fIdx, lIdx, type, sIdx: currentIndex, id: seat?.id })}
                        aria-label={`${isLead ? "Lead" : "Agent"} ${seat?.name || "chưa đặt tên"}${!isLead ? `, STT ${seat?.stt ?? "—"}` : ""}`}
                      >
                        <header className="seat-head">
                          {isAdmin && (
                            <span className="drag-handle" title="Kéo để di chuyển cabin" aria-label="Kéo để di chuyển cabin" role="img">
                              <GripIcon />
                            </span>
                          )}
                          <span className={`seat-pos ${isLead ? "is-lead" : ""}`}>
                            {isLead ? (
                              <><i className="pi pi-star-fill" aria-hidden="true" /> Lead · {lane?.laneLetter || "—"}</>
                            ) : (
                              <>#{seat?.stt ?? "—"}</>
                            )}
                          </span>
                          {isAdmin && (
                            <div className="seat-actions">
                              <button
                                type="button"
                                className="seat-action seat-action-full"
                                title="Đánh dấu đủ bộ thiết bị"
                                aria-label={`Đánh dấu đủ bộ thiết bị cho ${seatLabel}`}
                                onClick={(e) => { e.stopPropagation(); markFull(seat?.id, isLead); }}
                              >
                                <i className="pi pi-check" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="seat-action"
                                title="Reset kiểm kê thiết bị"
                                aria-label={`Reset kiểm kê thiết bị cho ${seatLabel}`}
                                onClick={(e) => { e.stopPropagation(); markReset(seat?.id); }}
                              >
                                <i className="pi pi-refresh" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="seat-action seat-action-danger"
                                title={`Xoá ${isLead ? "Lead" : "Agent"}`}
                                aria-label={`Xoá ${isLead ? "Lead" : "Agent"} ${seat?.name || ""}`}
                                onClick={(e) => { e.stopPropagation(); removeSeat(fIdx, lIdx, type, currentIndex); }}
                              >
                                <i className="pi pi-trash" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                        </header>

                        <InlineEdit
                          value={seat?.name || ""}
                          placeholder={isLead ? "Chưa có Lead" : "Chưa có nhân sự"}
                          onChange={(val) => updateProp(fIdx, lIdx, type, currentIndex, "name", val.trim())}
                          className="seat-name"
                          isName
                          readOnly={!isAdmin}
                        />

                        <TeamTag
                          team={team}
                          readOnly={!isAdmin}
                          onOpen={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setOpenMenu({ type: "seat", seatId: seat.id, x: rect.left, y: rect.bottom + 4 });
                          }}
                        />

                        <ul className="device-list" aria-label={`Thiết bị của ${seatLabel}`}>
                          {deviceItems.map((item) => {
                            const isLaptopPackage = Boolean(item.packageValue);
                            const checked = isLaptopPackage
                              ? Boolean(inv?.laptop) && inv?.laptop_package === item.packageValue
                              : Boolean(inv?.[item.key]) || Number(inv?.[`${item.key}_qty`]) > 0;
                            const qty = isLaptopPackage
                              ? (checked ? 1 : 0)
                              : Math.max(0, Number.parseInt(inv?.[`${item.key}_qty`], 10) || 0);

                            return (
                              <li key={item.key} className={`device-row ${checked ? "is-present" : "is-missing"}`}>
                                <button
                                  type="button"
                                  className="device-toggle"
                                  disabled={!isAdmin}
                                  title={`${item.label}${checked ? ` · SL ${qty}` : " · Chưa có"}${isAdmin ? " · Chạm để bật/tắt" : ""}`}
                                  aria-pressed={checked}
                                  aria-label={checked ? `${item.label}, số lượng ${qty}` : `${item.label}, chưa có`}
                                  onClick={(e) => { e.stopPropagation(); quickToggleEquipment(seat?.id, item.key, e, item.packageValue || null); }}
                                  onContextMenu={(e) => handleEquipmentContextMenu(seat?.id, item.key, e, item.packageValue || null)}
                                >
                                  <span className="device-check" aria-hidden="true">
                                    {checked ? <i className="pi pi-check" /> : null}
                                  </span>
                                  <i className={`device-icon ${item.icon}`} aria-hidden="true" />
                                  <span className="device-name">{item.short || item.label}</span>
                                </button>

                                {isAdmin && !isLaptopPackage ? (
                                  <div className="device-stepper" role="group" aria-label={`Số lượng ${item.label}`}>
                                    <button type="button" aria-label={`Giảm ${item.label}`} disabled={qty <= 0} onClick={(e) => { e.stopPropagation(); adjustEquipmentQuantity(seat?.id, item.key, -1); }}>−</button>
                                    <output aria-live="polite">{qty}</output>
                                    <button type="button" aria-label={`Tăng ${item.label}`} onClick={(e) => { e.stopPropagation(); adjustEquipmentQuantity(seat?.id, item.key, 1); }}>+</button>
                                  </div>
                                ) : (
                                  <span className="device-qty">×{qty}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>

                        <footer className="seat-foot">
                          <span className={`status-badge ${statusClass}`}>
                            <i className={progress.complete ? "pi pi-check-circle" : progress.checked > 0 ? "pi pi-exclamation-circle" : "pi pi-clock"} aria-hidden="true" />
                            {progress.complete ? "Đủ bộ" : progress.checked > 0 ? "Thiếu" : "Chưa kiểm"}
                          </span>
                          <span className="seat-progress" aria-hidden="true">
                            <span style={{ width: `${progress.percent}%` }} />
                          </span>
                          <span className="progress-count">{progress.checked}/{progress.total}</span>
                        </footer>
                      </article>
                    );
                  };

                  const query = search.trim().toLowerCase();
                  const visibleLeads = leads.filter((seat) => {
                    const q = (seat?.name || "").toLowerCase().includes(query);
                    const colorId = appState?.colors?.[seat?.id] || "fill-lead";
                    return q && (!selectedTeamId || colorId === selectedTeamId);
                  });

                  const visibleAgents = agents.filter((seat) => {
                    const q = `${seat?.name || ""} ${seat?.stt ?? ""}`.toLowerCase().includes(query);
                    const colorId = appState?.colors?.[seat?.id] || autoColor(seat?.name);
                    return q && (!selectedTeamId || colorId === selectedTeamId);
                  });

                  const zoneDropActive = (zoneType) =>
                    Boolean(draggedItem) &&
                    dragOverTarget?.fIdx === fIdx &&
                    dragOverTarget?.lIdx === lIdx &&
                    dragOverTarget?.type === zoneType;

                  const renderZone = (zoneType, visible, all) => {
                    const isLeadZone = zoneType === "lead";
                    return (
                      <section className={`role-zone ${isLeadZone ? "lead-zone" : "agent-zone"}`}>
                        <div className="zone-header">
                          <h4>
                            <i className={isLeadZone ? "pi pi-star" : "pi pi-users"} aria-hidden="true" />
                            {isLeadZone ? "Lead" : "Agents"}
                            <span className="zone-count">{visible.length}/{all.length}</span>
                          </h4>
                          {isAdmin && (
                            <button
                              type="button"
                              className="zone-add"
                              onClick={() => addSeat(fIdx, lIdx, zoneType)}
                              aria-label={`Thêm ${isLeadZone ? "Lead" : "Agent"} vào dãy ${lane?.laneLetter || ""}`}
                            >
                              <i className="pi pi-plus" aria-hidden="true" />
                              <span>{isLeadZone ? "Lead" : "Agent"}</span>
                            </button>
                          )}
                        </div>

                        <div
                          className={`seat-grid ${isLeadZone ? "lead-grid" : "agent-grid"} drop-zone${zoneDropActive(zoneType) ? " is-drop-active" : ""}${zoneDropActive(zoneType) && dragOverTarget?.side === "end" ? " is-drop-end" : ""}`}
                          data-floor-index={fIdx}
                          data-lane-index={lIdx}
                          data-seat-type={zoneType}
                          data-count={all.length}
                        >
                          {visible.map((seat) => {
                            const idx = all.findIndex((item) => item?.id === seat?.id);
                            return renderSeatCard(seat, zoneType, idx);
                          })}
                          {!visible.length && (
                            <div className="zone-empty">
                              <i className={isLeadZone ? "pi pi-user" : "pi pi-users"} aria-hidden="true" />
                              <span>{draggedItem ? "Thả cabin vào đây" : isLeadZone ? "Chưa có Lead" : "Không có cabin phù hợp"}</span>
                            </div>
                          )}
                        </div>
                      </section>
                    );
                  };

                  return (
                    <article key={`${floor?.floorName}-${lane?.laneLetter}-${lIdx}`} className="lane-container">
                      <div className="lane-header">
                        <div className="lane-title">
                          <span className="lane-index">{lane?.laneLetter || "—"}</span>
                          <div>
                            <h3>Dãy {lane?.laneLetter || "—"}</h3>
                            <span className="lane-sub">{leads.length} Lead · {agents.length} cabin</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="lane-actions">
                            <label className="stt-field">
                              <span>STT từ</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={lane?.startStt ?? ""}
                                onChange={(e) => updateLaneProp(fIdx, lIdx, "startStt", e.target.value)}
                                aria-label={`STT bắt đầu dãy ${lane?.laneLetter || ""}`}
                                className="stt-input"
                              />
                            </label>
                            <button
                              type="button"
                              className="lane-btn"
                              onClick={() => updateSttGlobal(fIdx, lIdx, lane?.startStt)}
                              title="Đánh lại STT nối tiếp theo thứ tự cabin hiện tại"
                            >
                              <i className="pi pi-sort-numeric-down" aria-hidden="true" />
                              <span>Đánh lại STT</span>
                            </button>
                            <button
                              type="button"
                              className="lane-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActiveLane({ fIdx, lIdx });
                                setOpenMenu({ type: "bulk", x: rect.left, y: rect.bottom + 4 });
                              }}
                            >
                              <i className="pi pi-palette" aria-hidden="true" />
                              <span>Team cả dãy</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="lane-columns">
                        {renderZone("lead", visibleLeads, leads)}
                        {renderZone("agent", visibleAgents, agents)}
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </main>
      </div>

      {showLogin && (
        <div className="auth-overlay" role="presentation" onMouseDown={() => setShowLogin(false)}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="auth-close" onClick={() => setShowLogin(false)} aria-label="Đóng cửa sổ đăng nhập"><HeroIcon name="x" size={20} /></button>
            <div className="auth-icon"><HeroIcon name="lock" size={24} /></div>
            <span className="section-kicker">Admin access</span>
            <h2 id="auth-title">Mở chế độ chỉnh sửa</h2>
            <p>Ứng dụng mặc định ở chế độ Xem. Nhập email công ty để mở quyền thêm, sửa, xoá và đồng bộ dữ liệu.</p>
            <label htmlFor="admin-email">Email công ty</label>
            <input id="admin-email" className="auth-input" type="email" autoFocus value={loginEmail} onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()} placeholder="Email công ty" autoComplete="email" />
            {loginError && <p className="auth-error" role="alert">{loginError}</p>}
            <button type="button" className="auth-submit" onClick={handleAdminLogin}><HeroIcon name="login" size={17} /> Xác nhận quyền Admin</button>
            <small>Không yêu cầu mật khẩu · Chỉ chấp nhận @vietmyssu.com</small>
          </section>
        </div>
      )}

      <button
        type="button"
        className="team-fab"
        onClick={() => setShowTeamSheet(true)}
        aria-label="Mở quản lý Team"
      >
        <i className="pi pi-users" aria-hidden="true" />
        <span>Quản lý Team</span>
      </button>
    </div>
  );
}
