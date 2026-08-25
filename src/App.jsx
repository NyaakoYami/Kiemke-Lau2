import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";


// -------------------------------------------------------------
// COMPONENT NHẬP LIỆU INLINE (Click để sửa)
// Hiển thị dạng chữ đậm chìm, gọn - chỉ hiện khung InputText khi click
// -------------------------------------------------------------
function InlineEdit({ value, onChange, placeholder, className, isStt = false, isName = false }) {
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

  if (isEdit) {
    return (
      <InputText
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        className={`p-1 text-xs font-bold w-full ${isStt ? "w-4rem text-center" : ""}`}
      />
    );
  }

  return (
    <div
      className={`${className || ""} inline-edit-display ${isStt ? "stt-display" : ""} ${isName ? "inline-edit-name" : "text-overflow-ellipsis white-space-nowrap overflow-hidden"} cursor-pointer`}
      onClick={() => setIsEdit(true)}
      onMouseDown={(e) => e.stopPropagation()}
      title="Click để sửa"
    >
      {value || placeholder}
    </div>
  );
}

// -------------------------------------------------------------
// CHẤM TRẠNG THÁI KẾT NỐI & ĐỒNG BỘ SUPABASE
// 🔵 xanh dương chớp: đang kiểm tra kết nối, hoặc đã kết nối nhưng có thay đổi chưa lưu lên cloud
// 🟡 vàng chớp: đang trong lúc bấm "Lưu Cloud"
// 🟢 xanh lá: vừa đồng bộ thành công
// 🔴 đỏ: mất kết nối / lỗi khi gọi Supabase
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// CẤU HÌNH SUPABASE & DỮ LIỆU GỐC
// -------------------------------------------------------------
const SYNC_ENDPOINT = "/api/sync";

async function syncRequest(options = {}) {
  const response = await fetch(SYNC_ENDPOINT, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || `Sync API returned HTTP ${response.status}`);
  }

  return payload;
}

const genId = () => "s_" + Math.random().toString(36).substr(2, 9);

// Danh sách Team mặc định (có thể thêm mới / đổi màu trong bảng quản lý Team)
const DEFAULT_TEAMS = [
  { id: "fill-lead", name: "Lead", dotColor: "#2563eb" },
  { id: "fill-pink", name: "User", dotColor: "#ec4899" },
  { id: "fill-orange", name: "Social", dotColor: "#f97316" },
  { id: "fill-cyan", name: "Merchant", dotColor: "#06b6d4" },
  { id: "fill-yellow", name: "Night/Senior", dotColor: "#eab308" },
  { id: "fill-purple", name: "SPT/PT", dotColor: "#8b5cf6" },
  { id: "fill-grey", name: "Trống", dotColor: "#6b7280" },
];

// Bảng màu theo nhóm màu sắc: mỗi hàng là 1 tông màu, mỗi cột là 1 độ đậm nhạt
// (Nhạt → Vừa nhạt → Đậm → Rất đậm)
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

// Mảng phẳng dùng cho addTeam default & legacy
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


// Tìm thông tin Team theo id, trả về Team ẩn danh nếu không tìm thấy
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

// Menu chọn Team dùng chung cho cabin và thao tác bulk.
// Đặt ở module scope để không thể gặp lỗi TeamGridMenu is not defined khi render portal.
const TeamGridMenu = ({ teams, activeColorId, onClick }) => {
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
              onClick={() => onClick?.(team.id)}
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

// Nhãn Team nhỏ trên đầu mỗi cabin — click để mở popover đổi Team (đã bỏ
// trigger hover trước đây để tránh mở nhầm khi chỉ rê chuột ngang qua).
const TeamTag = ({ team, onOpen }) => {
  const safeTeam = team || getTeam([], "unknown");
  return (
    <button
      type="button"
      className="team-tag"
      onClick={onOpen}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={`Đổi Team cho cabin. Team hiện tại: ${safeTeam.name}`}
      title="Click để đổi Team cho cabin"
    >
      <span
        className="team-tag-dot"
        style={{ backgroundColor: safeTeam.dotColor }}
        aria-hidden="true"
      />
      <span className="team-tag-label">{safeTeam.name}</span>
      <i className="pi pi-chevron-down text-xs opacity-60" aria-hidden="true" />
    </button>
  );
};

// Chuẩn hóa state ở module scope để initializer của useState không truy cập
// một const chưa được khởi tạo (Temporal Dead Zone).
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
          normalized[qtyKey] = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1;
        });
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

  // openMenu: { type: 'seat'|'bulk'|'team', seatId, laneKey, event }
  const [openMenu, setOpenMenu] = useState(null);
  const closeMenu = useCallback(() => setOpenMenu(null), []);

  // Portal menus live under document.body, so close them with a document-level outside-click listener.
  useEffect(() => {
    if (!openMenu) return undefined;
    const handlePointerDown = (event) => {
      if (!event.target.closest(".dropdown-portal")) closeMenu();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openMenu, closeMenu]);

  // Khoá lưu bản nháp local (chống mất dữ liệu khi F5 / mất mạng / quên bấm "Lưu Cloud")
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

  // Khi mở app: ưu tiên bản nháp local đã lưu trước đó (nếu có) thay vì luôn
  // reset về dữ liệu mẫu mặc định. loadOnline() sẽ chạy sau và ghi đè bằng
  // bản trên Cloud nếu tải thành công.
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

// Tự động lưu MỌI thay đổi vào localStorage ngay lập tức, độc lập với việc
  // đồng bộ Cloud. Đây là lưới an toàn: dù mất mạng hay quên bấm "Lưu Cloud",
  // F5 vẫn khôi phục đúng dữ liệu vừa chỉnh sửa.
  useEffect(() => {
    writeLocalState(appState);
  }, [appState]);

  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [activeLane, setActiveLane] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Tất cả"); // Lọc Sàn Lầu
  const [selectedTeamId, setSelectedTeamId] = useState(null); // Lọc Team
  const [editingTeamId, setEditingTeamId] = useState(null); // Team đang đổi màu
  const [showAddTeam, setShowAddTeam] = useState(false); // Hiện form thêm Team mới
  const [showTeamSheet, setShowTeamSheet] = useState(false); // Mobile: mở Team Management dạng bottom sheet
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState(COLOR_PALETTE[0]);

  // Trạng thái kết nối / đồng bộ Supabase
  const [connectionStatus, setConnectionStatus] = useState("checking"); // checking | connected | error
  const [syncStatus, setSyncStatus] = useState("synced"); // synced | dirty | syncing | error
  const hasHydratedRef = useRef(false);
  const autoSyncTimerRef = useRef(null);
  const isAutoSyncingRef = useRef(false);

  const initChecklist = (isLead) =>
    isLead
      ? {
          thung: false,
          thung_qty: 1,
          man20: false,
          man20_qty: 1,
          man24: false,
          man24_qty: 1,
          chuot: false,
          chuot_qty: 1,
          phim: false,
          phim_qty: 1,
          tai: false,
          tai_qty: 1,
          laptop: false,
        }
      : {
          thung: false,
          thung_qty: 1,
          man20: false,
          man20_qty: 1,
          chuot: false,
          chuot_qty: 1,
          phim: false,
          phim_qty: 1,
          tai: false,
          tai_qty: 1,
        };

  const autoColor = (name) => {
    const n = (name || "").toUpperCase();
    if (n.includes("TRỐNG") || n === "") return "fill-grey";
    if (n.includes("SENIOR") || n.includes("TRAINER")) return "fill-yellow";
    if (n.startsWith("PT") || n.includes("PT -") || n.includes("PT ")) return "fill-purple";
    if (n.includes("NB ")) return "fill-orange";
    if (n === "FULL") return "fill-cyan";
    return "fill-pink";
  };

  useEffect(() => {
    loadOnline();
  }, []);

  const loadOnline = async () => {
    setConnectionStatus("checking");
    try {
      const payload = await syncRequest({ method: "GET" });
      const data = payload?.data;

      setConnectionStatus("connected");
      if (data && data.floors) {
        setAppState(normalizeState(data));
        setSyncStatus("synced");
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã tải dữ liệu mới nhất từ Cloud",
          life: 3000,
        });
      } else {
        ensureInventoryValid(appState);
        setSyncStatus("synced");
      }
    } catch (err) {
      console.error("Supabase load error:", err);
      setConnectionStatus("error");
      ensureInventoryValid(appState);
    } finally {
      // Chỉ bật auto-save sau lần load/khởi tạo đầu tiên để không ghi đè Cloud
      // bằng local state cũ ngay khi ứng dụng vừa mount.
      hasHydratedRef.current = true;
    }
  };

  const syncOnline = async () => {
    if (autoSyncTimerRef.current) {
      clearTimeout(autoSyncTimerRef.current);
      autoSyncTimerRef.current = null;
    }
    isAutoSyncingRef.current = true;
    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      await syncRequest({
        method: "POST",
        body: JSON.stringify({ data: appState }),
      });

      setConnectionStatus("connected");
      setSyncStatus("synced");
      toast.current?.show({
        severity: "success",
        summary: "Đồng bộ thành công",
        detail: "Dữ liệu đã được lưu lên Cloud Supabase",
        life: 3000,
      });
    } catch (err) {
      console.error("Supabase sync error:", err);
      setConnectionStatus("error");
      setSyncStatus("error");
      toast.current?.show({
        severity: "error",
        summary: "Lỗi đồng bộ",
        detail: "Không thể lưu Cloud: " + (err?.message || "Lỗi mạng"),
        life: 4000,
      });
    } finally {
      setIsSyncing(false);
      isAutoSyncingRef.current = false;
    }
  };

  // Auto-save Supabase: debounce 750ms sau mỗi thay đổi state.
  // Nút "Lưu Cloud" thủ công vẫn dùng syncOnline() như cũ.
  useEffect(() => {
    if (!hasHydratedRef.current) return undefined;
    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);

    autoSyncTimerRef.current = setTimeout(async () => {
      if (isAutoSyncingRef.current || isSyncing) return;
      isAutoSyncingRef.current = true;
      setSyncStatus("syncing");
      try {
        await syncRequest({
          method: "POST",
          body: JSON.stringify({ data: appState }),
        });
        setConnectionStatus("connected");
        setSyncStatus("synced");
      } catch (err) {
        console.error("Supabase auto-sync error:", err);
        setConnectionStatus("error");
        setSyncStatus("error");
      } finally {
        isAutoSyncingRef.current = false;
      }
    }, 750);

    return () => {
      if (autoSyncTimerRef.current) {
        clearTimeout(autoSyncTimerRef.current);
        autoSyncTimerRef.current = null;
      }
    };
  }, [appState, isSyncing]);

  const ensureInventoryValid = (state) => {
    const source = normalizeState(state);
    const newState = JSON.parse(JSON.stringify(source));

    newState.floors.forEach((floor) =>
      floor.lanes.forEach((lane) => {
        lane.leads.forEach((lead) => {
          if (!lead?.id) return;
          if (!newState.inventory[lead.id] || typeof newState.inventory[lead.id] !== "object") {
            newState.inventory[lead.id] = initChecklist(true);
          }
        });
        lane.agents.forEach((agent) => {
          if (!agent?.id) return;
          if (!newState.inventory[agent.id] || typeof newState.inventory[agent.id] !== "object") {
            newState.inventory[agent.id] = initChecklist(false);
          }
        });
      }),
    );

    setAppState(newState);
  };

  // Đánh dấu dữ liệu đã thay đổi (chưa lưu) -> chuyển chấm trạng thái sang Xanh Dương chớp
  const markDirty = () => {
    setSyncStatus("dirty");
  };

  const updateState = (updater) => {
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

  // XUẤT VÀ NHẬP JSON
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

  // Thêm Team mới (tên + màu chọn từ bảng màu)
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

  // Đổi màu của một Team (áp dụng ngay cho mọi cabin thuộc Team đó)
  const updateTeamColor = (teamId, dotColor) => {
    updateState((st) => {
      const t = st.teams.find((x) => x.id === teamId);
      if (t) t.dotColor = dotColor;
    });
    setEditingTeamId(null);
  };

  // Xoá Team: các cabin đang dùng Team bị xoá sẽ chuyển về Team Trống.
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

  // Đổi tên Team
  const renameTeam = (teamId, name) => {
    if (!name || !name.trim()) return;
    updateState((st) => {
      const t = st.teams.find((x) => x.id === teamId);
      if (t) t.name = name.trim();
    });
  };

  // Thống kê số lượng theo từng Team
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

  // Thao tác chỉnh sửa
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

  const updateInventory = (id, key, val) =>
    updateState((st) => {
      if (!id) return;
      if (!st.inventory[id] || typeof st.inventory[id] !== "object") {
        st.inventory[id] = initChecklist(false);
      }
      st.inventory[id][key] = Boolean(val);
      if (val) {
        const qtyKey = `${key}_qty`;
        const qty = Number(st.inventory[id][qtyKey]);
        if (!Number.isFinite(qty) || qty < 1) st.inventory[id][qtyKey] = 1;
      }
    });

  const updateInventoryQuantity = (id, key, value) =>
    updateState((st) => {
      if (!id) return;
      if (!st.inventory[id] || typeof st.inventory[id] !== "object") {
        st.inventory[id] = initChecklist(false);
      }
      const qty = Number.parseInt(value, 10);
      st.inventory[id][`${key}_qty`] = Number.isFinite(qty) && qty > 0 ? qty : 1;
    });

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

  // Nút Nhanh ✔️ (Đủ bộ)
  const markFull = (id, isLead) => {
    updateState((st) => {
      if (!st.inventory[id]) st.inventory[id] = initChecklist(isLead);
      const inv = st.inventory[id];
      inv.thung = true;
      inv.thung_qty = Number.isFinite(Number(inv.thung_qty)) && Number(inv.thung_qty) > 0 ? Math.floor(Number(inv.thung_qty)) : 1;
      inv.man20 = true;
      inv.man20_qty = Number.isFinite(Number(inv.man20_qty)) && Number(inv.man20_qty) > 0 ? Math.floor(Number(inv.man20_qty)) : 1;
      inv.chuot = true;
      inv.chuot_qty = Number.isFinite(Number(inv.chuot_qty)) && Number(inv.chuot_qty) > 0 ? Math.floor(Number(inv.chuot_qty)) : 1;
      inv.phim = true;
      inv.phim_qty = Number.isFinite(Number(inv.phim_qty)) && Number(inv.phim_qty) > 0 ? Math.floor(Number(inv.phim_qty)) : 1;
      inv.tai = true;
      inv.tai_qty = Number.isFinite(Number(inv.tai_qty)) && Number(inv.tai_qty) > 0 ? Math.floor(Number(inv.tai_qty)) : 1;
      if (isLead) {
        inv.man24 = true;
        inv.man24_qty = Number.isFinite(Number(inv.man24_qty)) && Number(inv.man24_qty) > 0 ? Math.floor(Number(inv.man24_qty)) : 1;
        inv.laptop = true;
      }
    });
  };

  // Nút Nhanh 🔄 (Reset)
  const markReset = (id) => {
    updateState((st) => {
      if (!st.inventory[id]) return;
      const inv = st.inventory[id];
      Object.keys(inv).forEach((k) => {
        if (typeof inv[k] === "boolean") inv[k] = false;
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

  // Drag & Drop — only the explicit handle is draggable.
  const onDragStart = (e, fIdx, lIdx, type, sIdx) => {
    if (!e.currentTarget?.dataset?.dragHandle) return;
    setDraggedItem({ fIdx, lIdx, type, sIdx });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "kiem-ke-seat");
  };

  const onDrop = (e, targetFIdx, targetLIdx, targetType) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { fIdx, lIdx, type, sIdx } = draggedItem;
    updateState((st) => {
      const sourceLane = st.floors?.[fIdx]?.lanes?.[lIdx];
      const targetLane = st.floors?.[targetFIdx]?.lanes?.[targetLIdx];
      const sourceArr = type === "lead" ? sourceLane?.leads : sourceLane?.agents;
      const targetArr = targetType === "lead" ? targetLane?.leads : targetLane?.agents;
      if (!Array.isArray(sourceArr) || !Array.isArray(targetArr)) return;

      const [item] = sourceArr.splice(sIdx, 1);
      if (!item) return;
      if (type !== targetType) {
        st.inventory[item.id] = initChecklist(targetType === "lead");
      }
      targetArr.push(item);
    });
    setDraggedItem(null);
  };

  const onDropOnSeat = (e, targetFIdx, targetLIdx, targetType, targetSIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    const { fIdx, lIdx, type, sIdx } = draggedItem;
    if (
      fIdx === targetFIdx &&
      lIdx === targetLIdx &&
      type === targetType &&
      sIdx === targetSIdx
    ) {
      setDraggedItem(null);
      return;
    }

    updateState((st) => {
      const sourceLane = st.floors?.[fIdx]?.lanes?.[lIdx];
      const targetLane = st.floors?.[targetFIdx]?.lanes?.[targetLIdx];
      const sourceArr = type === "lead" ? sourceLane?.leads : sourceLane?.agents;
      const targetArr = targetType === "lead" ? targetLane?.leads : targetLane?.agents;
      if (!Array.isArray(sourceArr) || !Array.isArray(targetArr)) return;

      const [item] = sourceArr.splice(sIdx, 1);
      if (!item) return;
      if (type !== targetType) {
        st.inventory[item.id] = initChecklist(targetType === "lead");
      }

      let insertAt = Number.isInteger(targetSIdx) ? targetSIdx : targetArr.length;
      if (sourceArr === targetArr && sIdx < insertAt) insertAt -= 1;
      insertAt = Math.max(0, Math.min(insertAt, targetArr.length));
      targetArr.splice(insertAt, 0, item);
    });
    setDraggedItem(null);
  };

  // Thống kê tài sản
  const stats = {
    thung: 0,
    man20: 0,
    man24: 0,
    chuot: 0,
    phim: 0,
    tai: 0,
    laptop: 0,
    seats: 0,
  };

  Object.values(appState?.inventory || {}).forEach((rawInv) => {
    const inv = rawInv && typeof rawInv === "object" ? rawInv : {};
    stats.seats++;
    if (inv.thung) stats.thung += parseInt(inv.thung_qty, 10) || 1;
    if (inv.man20) stats.man20 += parseInt(inv.man20_qty, 10) || 1;
    if (inv.man24) stats.man24 += parseInt(inv.man24_qty, 10) || 1;
    if (inv.chuot) stats.chuot += parseInt(inv.chuot_qty, 10) || 1;
    if (inv.phim) stats.phim += parseInt(inv.phim_qty, 10) || 1;
    if (inv.tai) stats.tai += parseInt(inv.tai_qty, 10) || 1;
    if (inv.laptop) stats.laptop++;
  });

  const getChecklistItems = (isLead) =>
    isLead
      ? [
          { key: "thung", label: "Thùng" },
          { key: "man20", label: 'Màn 20"' },
          { key: "man24", label: 'Màn 24"' },
          { key: "chuot", label: "Chuột" },
          { key: "phim", label: "Phím" },
          { key: "tai", label: "Tai USB" },
          { key: "laptop", label: "Laptop" },
        ]
      : [
          { key: "thung", label: "Thùng" },
          { key: "man20", label: 'Màn 20"' },
          { key: "chuot", label: "Chuột" },
          { key: "phim", label: "Phím" },
          { key: "tai", label: "Tai USB" },
        ];

  const getSeatProgress = (inv, isLead) => {
    const items = getChecklistItems(isLead);
    const checked = items.filter((item) => Boolean(inv?.[item.key])).length;
    return {
      checked,
      total: items.length,
      percent: items.length ? Math.round((checked / items.length) * 100) : 0,
      complete: checked === items.length,
    };
  };

  const safeFloors = Array.isArray(appState?.floors) ? appState.floors : [];
  stats.seats = safeFloors.reduce(
    (sum, floor) =>
      sum +
      (Array.isArray(floor?.lanes) ? floor.lanes : []).reduce(
        (laneSum, lane) =>
          laneSum +
          (Array.isArray(lane?.leads) ? lane.leads.length : 0) +
          (Array.isArray(lane?.agents) ? lane.agents.length : 0),
        0,
      ),
    0,
  );
  const safeTeams = Array.isArray(appState?.teams) ? appState.teams : DEFAULT_TEAMS;
  const selectedTeam = selectedTeamId ? getTeam(safeTeams, selectedTeamId) : null;

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
          </div>
        </div>

        <div className="header-rule" aria-hidden="true" />
        <div className="header-summary">
          <span><strong>{stats.seats}</strong> vị trí đang theo dõi</span>
          <span className="summary-separator" aria-hidden="true">/</span>
          <span><strong>{safeTeams.length}</strong> team</span>
          <span className="summary-separator" aria-hidden="true">/</span>
          <span>{syncStatus === "synced" ? "Cloud đã đồng bộ" : "Có thay đổi chưa đồng bộ"}</span>
        </div>
      </header>

      <section className="overview-section" aria-labelledby="overview-heading">
        <div className="section-head">
          <div>
            <span className="section-kicker">Tổng quan</span>
            <h2 id="overview-heading">Tài sản đang được kiểm soát</h2>
          </div>
          <span className="section-note">Cập nhật theo dữ liệu hiện tại</span>
        </div>

        <div className="stat-grid">
          {[
            { label: "Thùng máy", val: stats.thung, icon: "pi pi-box" },
            { label: 'Màn 20"', val: stats.man20, icon: "pi pi-desktop" },
            { label: 'Màn 24"', val: stats.man24, icon: "pi pi-desktop" },
            { label: "Chuột", val: stats.chuot, icon: "pi pi-circle" },
            { label: "Phím", val: stats.phim, icon: "pi pi-table" },
            { label: "Tai USB", val: stats.tai, icon: "pi pi-volume-up" },
            { label: "Laptop", val: stats.laptop, icon: "pi pi-mobile" },
            { label: "Tổng chỗ", val: stats.seats, icon: "pi pi-users" },
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
                    aria-label={team.id === "fill-grey" ? "Team Trống không thể xoá" : `Xoá Team ${team.name}`}
                    title={team.id === "fill-grey" ? "Team Trống không thể xoá" : "Xoá Team"}
                    disabled={team.id === "fill-grey"}
                  >
                    <i className="pi pi-trash" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>

          {editingTeamId && (() => {
            const editingTeam = getTeam(safeTeams, editingTeamId);
            return (
              <div className="team-inline-form">
                <div className="form-title">
                  <span>Đổi màu</span>
                  <InlineEdit
                    value={editingTeam?.name || ""}
                    onChange={(val) => renameTeam(editingTeamId, val)}
                    className="font-extrabold"
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
            );
          })()}

          {showAddTeam && (
            <div className="team-inline-form">
              <div className="form-title">Thêm Team mới</div>
              <div className="new-team-row">
                <InputText
                  placeholder="Tên Team mới..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTeam(newTeamName, newTeamColor)}
                  className="new-team-input"
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
            <div className="control-primary">
              <div className="search-field">
                <i className="pi pi-search" aria-hidden="true" />
                <InputText
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

              {selectedTeam && (
                <button
                  type="button"
                  className="active-filter"
                  onClick={() => setSelectedTeamId(null)}
                  aria-label={`Bỏ lọc Team ${selectedTeam.name}`}
                >
                  <span className="team-tag-dot" style={{ backgroundColor: selectedTeam.dotColor }} aria-hidden="true" />
                  <span>{selectedTeam.name}</span>
                  <i className="pi pi-times" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="control-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={importFromJson}
                accept=".json"
                hidden
              />
              <Button
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
                label="Nhập JSON"
                icon="pi pi-upload"
                severity="secondary"
                outlined
                className="toolbar-button"
                onClick={() => fileInputRef.current?.click()}
                title="Nhập dữ liệu từ file JSON"
              />
              <Button
                label={isSyncing ? "Đang lưu..." : "Lưu Cloud"}
                icon="pi pi-cloud-upload"
                severity="success"
                className="toolbar-button primary"
                onClick={syncOnline}
                disabled={isSyncing}
              />
            </div>
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
                  <span className="floor-total">
                    {(floor?.lanes || []).reduce(
                      (sum, lane) => sum + (lane?.leads?.length || 0) + (lane?.agents?.length || 0),
                      0,
                    )} cabin
                  </span>
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

                    return (
                      <article
                        key={seat?.id || `${type}-${currentIndex}`}
                        className={`seat-card ${isLead ? "seat-card-lead" : "seat-card-agent"} status-${statusClass} ${draggedItem?.fIdx === fIdx && draggedItem?.lIdx === lIdx && draggedItem?.type === type && draggedItem?.sIdx === currentIndex ? "is-dragging" : ""}`}
                        style={teamCardStyle(team?.dotColor)}
                        onDragOver={(e) => {
                          if (draggedItem) e.preventDefault();
                        }}
                        onDrop={(e) => onDropOnSeat(e, fIdx, lIdx, type, currentIndex)}
                      >
                        <div className="seat-card-accent" aria-hidden="true" />

                        <div className="seat-topline">
                          <button
                            type="button"
                            className="drag-handle"
                            draggable
                            data-drag-handle="true"
                            onDragStart={(e) => onDragStart(e, fIdx, lIdx, type, currentIndex)}
                            onDragEnd={() => setDraggedItem(null)}
                            title="Kéo để đổi vị trí cabin"
                            aria-label={`Kéo cabin ${seat?.name || "chưa đặt tên"} để đổi vị trí`}
                          >
                            <i className="pi pi-arrows-alt" aria-hidden="true" />
                          </button>

                          <span className={`seat-type ${isLead ? "lead" : "agent"}`}>
                            {isLead ? "LEAD" : "AGENT"}
                          </span>

                          <div
                            className="qa-group"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Button
                              icon="pi pi-check"
                              rounded
                              severity="success"
                              className="qa-btn"
                              title="Đánh dấu đủ bộ"
                              aria-label={`Đánh dấu đủ bộ cho ${seat?.name || "cabin"}`}
                              onClick={() => markFull(seat?.id, isLead)}
                            />
                            <Button
                              icon="pi pi-refresh"
                              rounded
                              severity="secondary"
                              outlined
                              className="qa-btn"
                              title="Reset checklist"
                              aria-label={`Đặt lại checklist cho ${seat?.name || "cabin"}`}
                              onClick={() => markReset(seat?.id)}
                            />
                            <Button
                              icon="pi pi-times"
                              rounded
                              text
                              severity="danger"
                              className="qa-btn"
                              title="Xoá cabin"
                              aria-label={`Xoá cabin ${seat?.name || "chưa đặt tên"}`}
                              onClick={() => removeSeat(fIdx, lIdx, type, currentIndex)}
                            />
                          </div>
                        </div>

                        <div
                          className="seat-identity"
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TeamTag
                            team={team}
                            onOpen={(e) => {
                              e.stopPropagation();
                              setOpenMenu({
                                type: "seat",
                                seatId: seat?.id,
                                x: e.clientX || 12,
                                y: e.clientY || 12,
                              });
                            }}
                          />

                          <div className="seat-name-row">
                            {isLead ? (
                              <InlineEdit
                                value={seat?.name || ""}
                                onChange={(val) => updateProp(fIdx, lIdx, "lead", currentIndex, "name", val)}
                                placeholder="Tên Lead"
                                isName
                                className="seat-name"
                              />
                            ) : (
                              <>
                                <InlineEdit
                                  value={seat?.stt ?? ""}
                                  onChange={(val) => updateProp(fIdx, lIdx, "agent", currentIndex, "stt", val)}
                                  placeholder="STT"
                                  isStt
                                />
                                <InlineEdit
                                  value={seat?.name || ""}
                                  onChange={(val) => updateProp(fIdx, lIdx, "agent", currentIndex, "name", val)}
                                  placeholder="Tên Agent..."
                                  isName
                                  className="seat-name"
                                />
                              </>
                            )}
                          </div>
                        </div>

                        <div className="seat-progress-row" aria-label={`Tiến độ kiểm kê ${progress.checked} trên ${progress.total}`}>
                          <div className="seat-progress-meta">
                            <span className={`status-badge ${statusClass}`}>
                              <i
                                className={progress.complete ? "pi pi-check" : progress.checked ? "pi pi-minus" : "pi pi-circle"}
                                aria-hidden="true"
                              />
                              {progress.complete ? "Đủ bộ" : progress.checked ? "Đang kiểm" : "Chưa kiểm"}
                            </span>
                            <span className="progress-count">{progress.checked}/{progress.total}</span>
                          </div>
                          <div className="progress-track" aria-hidden="true">
                            <span style={{ width: `${progress.percent}%` }} />
                          </div>
                        </div>

                        <div
                          className="inventory-chips"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          {getChecklistItems(isLead).map(({ key, label }) => {
                            const checked = Boolean(inv?.[key]);
                            const qtyKey = `${key}_qty`;
                            const quantity = Number(inv?.[qtyKey]) > 0 ? Number(inv[qtyKey]) : 1;
                            return (
                              <div
                                key={key}
                                className={`inventory-chip ${checked ? "checked" : ""}`}
                                title={label}
                              >
                                <label className="inventory-check" htmlFor={`${seat?.id}_${key}`}>
                                  <Checkbox
                                    inputId={`${seat?.id}_${key}`}
                                    checked={checked}
                                    onChange={(e) => updateInventory(seat?.id, key, e.checked)}
                                  />
                                  <span className="chip-label">{label}</span>
                                </label>
                                {checked && key !== "laptop" && (
                                  <div className="inventory-quantity" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                                    <span className="quantity-label">SL</span>
                                    <input
                                      className="quantity-input"
                                      type="number"
                                      min="1"
                                      step="1"
                                      inputMode="numeric"
                                      aria-label={`Số lượng ${label}`}
                                      value={quantity}
                                      onChange={(e) => updateInventoryQuantity(seat?.id, key, e.target.value)}
                                      onBlur={(e) => updateInventoryQuantity(seat?.id, key, e.target.value || 1)}
                                      onWheel={(e) => e.currentTarget.blur()}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
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

                  return (
                    <article key={`${floor?.floorName}-${lane?.laneLetter}-${lIdx}`} className="lane-container">
                      <div className="lane-header">
                        <div className="lane-title">
                          <span className="lane-index">{lane?.laneLetter || "—"}</span>
                          <div>
                            <span className="section-kicker">Dãy</span>
                            <h3>Dãy {lane?.laneLetter || "—"}</h3>
                          </div>
                        </div>

                        <div className="lane-actions">
                          <label className="stt-field">
                            <span>STT bắt đầu</span>
                            <InputText
                              value={lane?.startStt ?? ""}
                              onChange={(e) => updateLaneProp(fIdx, lIdx, "startStt", e.target.value)}
                              aria-label={`STT bắt đầu dãy ${lane?.laneLetter || ""}`}
                              className="stt-input"
                            />
                          </label>
                          <Button
                            icon="pi pi-bolt"
                            label="Áp dụng STT"
                            size="small"
                            severity="info"
                            className="compact-button"
                            onClick={() => updateSttGlobal(fIdx, lIdx, lane?.startStt)}
                            title="Tự động đánh số nối tiếp"
                          />
                          <Button
                            icon="pi pi-palette"
                            label="Đổi màu dãy"
                            size="small"
                            outlined
                            severity="secondary"
                            className="compact-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLane({ fIdx, lIdx });
                              setOpenMenu({ type: "bulk", x: e.clientX, y: e.clientY });
                            }}
                          />
                        </div>
                      </div>

                      <div className="lane-columns">
                        <section className="role-zone lead-zone">
                          <div className="zone-header">
                            <div>
                              <span className="zone-kicker">01 · Điều phối</span>
                              <h4>Lead</h4>
                            </div>
                            <div className="zone-tools">
                              <span className="zone-count">{visibleLeads.length}/{leads.length}</span>
                              <Button
                                icon="pi pi-plus"
                                rounded
                                text
                                severity="success"
                                className="zone-add"
                                title="Thêm Lead"
                                aria-label={`Thêm Lead vào dãy ${lane?.laneLetter || ""}`}
                                onClick={() => addSeat(fIdx, lIdx, "lead")}
                              />
                            </div>
                          </div>

                          <div
                            className="seat-grid lead-grid drop-zone"
                            onDragOver={(e) => {
                              if (draggedItem) e.preventDefault();
                            }}
                            onDrop={(e) => onDrop(e, fIdx, lIdx, "lead")}
                          >
                            {visibleLeads.map((seat) => {
                              const idx = leads.findIndex((item) => item?.id === seat?.id);
                              return renderSeatCard(seat, "lead", idx);
                            })}
                            {!visibleLeads.length && (
                              <div className="zone-empty">
                                <i className="pi pi-user" aria-hidden="true" />
                                <span>Chưa có Lead phù hợp</span>
                              </div>
                            )}
                          </div>
                        </section>

                        <div className="lane-divider" aria-hidden="true">
                          <span>{lane?.laneLetter || "—"}</span>
                        </div>

                        <section className="role-zone agent-zone">
                          <div className="zone-header">
                            <div>
                              <span className="zone-kicker">02 · Vận hành</span>
                              <h4>Agents</h4>
                            </div>
                            <div className="zone-tools">
                              <span className="zone-count">{visibleAgents.length}/{agents.length}</span>
                              <Button
                                icon="pi pi-plus"
                                label="Thêm Agent"
                                size="small"
                                outlined
                                severity="success"
                                className="compact-button"
                                onClick={() => addSeat(fIdx, lIdx, "agent")}
                              />
                            </div>
                          </div>

                          <div
                            className="seat-grid agent-grid drop-zone"
                            onDragOver={(e) => {
                              if (draggedItem) e.preventDefault();
                            }}
                            onDrop={(e) => onDrop(e, fIdx, lIdx, "agent")}
                          >
                            {visibleAgents.map((seat) => {
                              const idx = agents.findIndex((item) => item?.id === seat?.id);
                              return renderSeatCard(seat, "agent", idx);
                            })}
                            {!visibleAgents.length && (
                              <div className="zone-empty">
                                <i className="pi pi-users" aria-hidden="true" />
                                <span>Không có cabin phù hợp bộ lọc</span>
                              </div>
                            )}
                          </div>
                        </section>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })}
        </main>
      </div>

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