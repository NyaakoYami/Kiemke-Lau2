import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Badge } from "primereact/badge";
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
  let color = "#ef4444"; // Đỏ mặc định (lỗi / mất kết nối)
  let label = "Mất kết nối Cloud";
  let pulse = false;

  if (connectionStatus === "checking") {
    color = "#3b82f6"; // Xanh dương
    label = "Đang kiểm tra kết nối...";
    pulse = true;
  } else if (connectionStatus === "error") {
    color = "#ef4444"; // Đỏ
    label = "Lỗi kết nối Supabase";
  } else if (connectionStatus === "connected") {
    if (syncStatus === "syncing") {
      color = "#eab308"; // Vàng
      label = "Đang lưu Cloud...";
      pulse = true;
    } else if (syncStatus === "synced") {
      color = "#22c55e"; // Xanh lá
      label = "Đã đồng bộ thành công";
      pulse = false;
    } else {
      // "dirty" hoặc "idle" -> Chưa đồng bộ
      color = "#3b82f6"; // Xanh dương
      label = "Chưa lưu lên Cloud";
      pulse = true;
    }
  }

  return (
    <div className="flex align-items-center gap-2 surface-0 px-3 py-2 border-round-xl border-1 surface-border shadow-1">
      <span
        className="status-dot"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 0 3px ${color}33`,
          animation: pulse ? "pulseDot 1.1s ease-in-out infinite" : "none",
        }}
      />
      <span className="text-xs font-bold text-700">{label}</span>
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

// Tìm thông tin Team theo id, trả về Team ẩn danh nếu không tìm thấy
const getTeam = (teams, colorId) =>
  (teams || DEFAULT_TEAMS).find((t) => t.id === colorId) || {
    id: colorId || "unknown",
    name: "Khác",
    dotColor: "#9ca3af",
  };

// Style nền/viền cabin theo màu Team (dùng color-mix để tự tính sắc độ nhạt)
const teamCardStyle = (hex) => ({
  background: `linear-gradient(135deg, color-mix(in srgb, ${hex} 14%, white) 0%, color-mix(in srgb, ${hex} 26%, white) 100%)`,
  borderColor: `color-mix(in srgb, ${hex} 55%, white)`,
});

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

// Tính màu chữ tương phản (trắng/đen) dựa trên độ sáng của màu nền Team,
// để tên Team luôn đọc rõ dù thẻ được tô bằng bất kỳ màu nào.
const getContrastTextColor = (hex) => {
  if (!hex) return "#111827";
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111827" : "#ffffff";
};

// BẢNG CHỌN TEAM DẠNG LƯỚI (POPOVER) — click vào cabin để mở, mỗi Team là
// một thẻ được tô nền đúng màu đại diện của Team đó (không còn chấm màu rời).
const TeamGridMenu = ({ teams, onClick, activeColorId }) => (
  <div className="p-2">
    <div className="text-xs font-extrabold text-700 uppercase tracking-wider mb-2 border-bottom-1 surface-border pb-2 flex align-items-center justify-content-between">
      <span>👥 Chọn Team cho cabin</span>
      <span className="text-500 font-normal text-xs">{teams.length} team</span>
    </div>
    <div className="team-grid-container">
      {teams.map((t) => {
        const isSelected = activeColorId === t.id;
        const textColor = getContrastTextColor(t.dotColor);
        return (
          <button
            key={t.id}
            type="button"
            className={`team-color-card ${isSelected ? "selected" : ""}`}
            style={{
              backgroundColor: t.dotColor,
              color: textColor,
              "--team-ring-color": t.dotColor,
            }}
            onClick={() => onClick(t.id)}
            title={t.name}
          >
            <span className="team-color-card-name">{t.name}</span>
            {isSelected && (
              <i
                className="pi pi-check team-color-card-check"
                style={{ color: textColor }}
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// Nhãn Team nhỏ trên đầu mỗi cabin — click để mở popover đổi Team (đã bỏ
// trigger hover trước đây để tránh mở nhầm khi chỉ rê chuột ngang qua).
const TeamTag = ({ team, onOpen }) => (
  <div
    className="team-tag flex align-items-center gap-1 cursor-pointer"
    onClick={onOpen}
    onMouseDown={(e) => e.stopPropagation()}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen(e);
      }
    }}
    title="Click để đổi Team cho cabin"
  >
    <span className="team-tag-dot" style={{ backgroundColor: team.dotColor }} />
    <span className="team-tag-label">{team.name}</span>
    <i className="pi pi-chevron-down text-xs opacity-60" />
  </div>
);

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
    return (
      local || {
        floors: JSON.parse(JSON.stringify(defaultData)),
        inventory: {},
        colors: {},
        teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
      }
    );
  });

  // Đảm bảo dữ liệu cũ (chưa có danh sách teams) vẫn hoạt động bình thường
  const normalizeState = (state) => ({
    ...state,
    teams: state.teams && state.teams.length ? state.teams : JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
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
  const [activeSeat, setActiveSeat] = useState(null);
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

  const initChecklist = (isLead) =>
    isLead
      ? {
          thung: false,
          thung_qty: 1,
          man20: false,
          man24: false,
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
    }
  };

  const syncOnline = async () => {
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
        detail: "Không thể lưu Cloud: " + (err.message || "Lỗi mạng"),
        life: 4000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const ensureInventoryValid = (state) => {
    let newState = JSON.parse(JSON.stringify(state));
    newState.floors.forEach((f) =>
      f.lanes.forEach((l) => {
        l.leads.forEach((ld) => {
          if (!newState.inventory[ld.id])
            newState.inventory[ld.id] = initChecklist(true);
        });
        l.agents.forEach((ag) => {
          if (!newState.inventory[ag.id])
            newState.inventory[ag.id] = initChecklist(false);
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
      const next = JSON.parse(JSON.stringify(prev));
      updater(next);
      return next;
    });
    markDirty();
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
    appState.teams.forEach((c) => (counts[c.id] = 0));
    appState.floors.forEach((f) =>
      f.lanes.forEach((l) => {
        l.leads.forEach((ld) => {
          counts.total++;
          const cId = appState.colors[ld.id] || "fill-lead";
          counts[cId] = (counts[cId] || 0) + 1;
        });
        l.agents.forEach((ag) => {
          counts.total++;
          const cId = appState.colors[ag.id] || autoColor(ag.name);
          counts[cId] = (counts[cId] || 0) + 1;
        });
      }),
    );
    return counts;
  };
  const teamCounts = getTeamCounts();

  // Thao tác chỉnh sửa
  const updateProp = (fIdx, lIdx, type, sIdx, prop, val) => {
    updateState((st) => {
      const seat =
        type === "lead"
          ? st.floors[fIdx].lanes[lIdx].leads[sIdx]
          : st.floors[fIdx].lanes[lIdx].agents[sIdx];
      seat[prop] = prop === "stt" ? parseInt(val) || val : val;
    });
  };

  const updateInventory = (id, key, val) =>
    updateState((st) => {
      if (!st.inventory[id]) st.inventory[id] = initChecklist(false);
      st.inventory[id][key] = val;
    });

  const updateSttGlobal = (fIdx, lIdx, val) =>
    updateState((st) => {
      const lane = st.floors[fIdx].lanes[lIdx];
      const start = parseInt(val) || 0;
      lane.startStt = start;
      lane.agents.forEach((ag, i) => (ag.stt = start + i));
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
      const arr =
        type === "lead"
          ? st.floors[fIdx].lanes[lIdx].leads
          : st.floors[fIdx].lanes[lIdx].agents;
      const id = arr[sIdx].id;
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
      inv.man20 = true;
      inv.chuot = true;
      inv.phim = true;
      inv.tai = true;
      if (isLead) {
        inv.man24 = true;
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
      const lane = st.floors[activeLane.fIdx].lanes[activeLane.lIdx];
      lane.leads.forEach((ld) => (st.colors[ld.id] = colorId));
      lane.agents.forEach((ag) => (st.colors[ag.id] = colorId));
    });
  };

  // Drag & Drop
  const onDragStart = (e, fIdx, lIdx, type, sIdx) => {
    setDraggedItem({ fIdx, lIdx, type, sIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  // Thả vào vùng trống của dãy (không nhắm vào 1 cabin cụ thể) -> nối vào cuối.
  const onDrop = (e, targetFIdx, targetLIdx, targetType) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { fIdx, lIdx, type, sIdx } = draggedItem;
    updateState((st) => {
      const sourceArr =
        type === "lead"
          ? st.floors[fIdx].lanes[lIdx].leads
          : st.floors[fIdx].lanes[lIdx].agents;
      const targetArr =
        targetType === "lead"
          ? st.floors[targetFIdx].lanes[targetLIdx].leads
          : st.floors[targetFIdx].lanes[targetLIdx].agents;
      const [item] = sourceArr.splice(sIdx, 1);
      if (type !== targetType)
        st.inventory[item.id] = initChecklist(targetType === "lead");
      targetArr.push(item);
    });
    setDraggedItem(null);
  };

  // Thả trực tiếp lên 1 cabin cụ thể -> chèn đúng vào vị trí đó thay vì luôn
  // nhảy về cuối dãy. e.stopPropagation() để không kích hoạt luôn onDrop của
  // container cha (tránh chèn 2 lần / lệch vị trí).
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
      const sourceArr =
        type === "lead"
          ? st.floors[fIdx].lanes[lIdx].leads
          : st.floors[fIdx].lanes[lIdx].agents;
      const targetArr =
        targetType === "lead"
          ? st.floors[targetFIdx].lanes[targetLIdx].leads
          : st.floors[targetFIdx].lanes[targetLIdx].agents;
      const [item] = sourceArr.splice(sIdx, 1);
      if (type !== targetType)
        st.inventory[item.id] = initChecklist(targetType === "lead");
      // Nếu chèn trong cùng 1 mảng và vị trí gốc nằm trước vị trí đích,
      // sau khi splice(sIdx) mảng đã ngắn đi 1 phần tử -> lùi chỉ số đích lại 1.
      let insertAt = targetSIdx;
      if (sourceArr === targetArr && sIdx < targetSIdx) insertAt -= 1;
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
  Object.values(appState.inventory).forEach((inv) => {
    stats.seats++;
    if (inv.thung) stats.thung += parseInt(inv.thung_qty) || 1;
    if (inv.man20) stats.man20++;
    if (inv.man24) stats.man24++;
    if (inv.chuot) stats.chuot += parseInt(inv.chuot_qty) || 1;
    if (inv.phim) stats.phim += parseInt(inv.phim_qty) || 1;
    if (inv.tai) stats.tai += parseInt(inv.tai_qty) || 1;
    if (inv.laptop) stats.laptop++;
  });


  return (
    <div className="app-shell p-3 md:p-4 surface-ground min-h-screen" onClick={closeMenu}>
      <Toast ref={toast} />

      {/* CUSTOM DROPDOWN MENU - chọn Team cho 1 cabin hoặc cả dãy */}
      {openMenu && createPortal(
        <div
          className="fixed z-[9999] dropdown-pop-in dropdown-portal"
          style={{
            top: Math.max(12, Math.min(openMenu.y, window.innerHeight - 360)),
            left: Math.max(12, Math.min(openMenu.x, window.innerWidth - 312)),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="surface-0 shadow-4 border-round-xl border-1 surface-border overflow-hidden" style={{ minWidth: '18rem', maxHeight: '22rem', overflowY: 'auto' }}>
            {openMenu.type === 'seat' && (
              <TeamGridMenu
                teams={appState.teams}
                activeColorId={appState.colors[openMenu.seatId]}
                onClick={(cId) => { setSeatColor(openMenu.seatId, cId); closeMenu(); }}
              />
            )}
            {openMenu.type === 'bulk' && (
              <TeamGridMenu
                teams={appState.teams}
                onClick={(cId) => { applyBulkColor(cId); closeMenu(); }}
              />
            )}
          </div>
        </div>,
        document.body,
      )}

      {/* HEADER */}
      <div className="app-header text-white p-4 border-round-2xl shadow-4 mb-4 flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="m-0 text-2xl md:text-3xl font-extrabold flex align-items-center gap-2 text-white">
            <span>📋</span> Kiểm Kê Tài Sản - Sàn Lầu 2 & Lầu 3
          </h1>
          <p className="mt-2 mb-0 text-sm" style={{ color: "#cbd5e1" }}>
            Dự án ShopeeFood
          </p>
        </div>
        <div className="flex align-items-center gap-3 flex-wrap">
          <Badge
            value={new Date().toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            size="large"
            severity="info"
            className="px-3 py-2 text-sm"
          />
          {/* CHẤM TRẠNG THÁI SUPABASE */}
          <StatusDot
            connectionStatus={connectionStatus}
            syncStatus={syncStatus}
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid mb-4">
        {[
          { label: "Thùng máy", val: stats.thung, icon: "📦" },
          { label: 'Màn 20"', val: stats.man20, icon: "🖥️" },
          { label: 'Màn 24"', val: stats.man24, icon: "🖥️✨" },
          { label: "Chuột", val: stats.chuot, icon: "🖱️" },
          { label: "Phím", val: stats.phim, icon: "⌨️" },
          { label: "Tai USB", val: stats.tai, icon: "🎧" },
          { label: "Laptop", val: stats.laptop, icon: "💻" },
          { label: "Tổng chỗ", val: stats.seats, icon: "👥" },
        ].map((s) => (
          <div key={s.label} className="col-6 sm:col-4 md:col-3 lg:col-1">
            <div className="stat-card h-full">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="workspace-layout">
        {/* BẢNG QUẢN LÝ TEAM: sidebar desktop / bottom sheet mobile */}
        <aside className={`team-manager-panel mb-4 ${showTeamSheet ? "team-sheet-open" : ""}`}>
          <div className="team-sheet-mobile-handle" aria-hidden="true" />
        <div className="flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-extrabold text-800 uppercase tracking-wider flex align-items-center gap-2">
            <span>👥</span> Quản lý Team
            <span className="text-500 font-normal text-xs normal-case">
              — click để lọc, bấm 🎨 để đổi màu
            </span>
          </div>
          <div className="flex align-items-center gap-2">
            {selectedTeamId && (
              <Button
                label="Bỏ lọc"
                icon="pi pi-filter-slash"
                size="small"
                text
                severity="secondary"
                className="py-1 px-2 text-xs font-bold"
                onClick={() => { setSelectedTeamId(null); setShowTeamSheet(false); }}
              />
            )}
            <Button
              label="Thêm Team"
              icon="pi pi-plus"
              size="small"
              severity="success"
              className="py-1 px-2 text-xs font-bold"
              onClick={() => setShowAddTeam((v) => !v)}
            />
          </div>
        </div>

        <div className="flex align-items-center gap-2 flex-wrap">
          {/* Nút Tất cả */}
          <div
            className={`team-bar-item ${selectedTeamId === null ? "active" : ""}`}
            onClick={() => { setSelectedTeamId(null); setShowTeamSheet(false); }}
          >
            <span>Tất cả</span>
            <span className="team-count">{teamCounts.total}</span>
          </div>

          {/* Các nút từng Team */}
          {appState.teams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            const count = teamCounts[team.id] || 0;
            return (
              <div
                key={team.id}
                className={`team-bar-item ${isSelected ? "active" : ""}`}
                onClick={() => { setSelectedTeamId(team.id); setShowTeamSheet(false); }}
                title={`Click để lọc Team ${team.name}`}
              >
                <span className="team-tag-dot" style={{ backgroundColor: team.dotColor }} />
                <span>{team.name}</span>
                <span className="team-count">{count}</span>
                <i
                  className="pi pi-palette text-xs opacity-70 ml-1 team-edit-icon"
                  title="Đổi màu Team"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTeamId((prev) => (prev === team.id ? null : team.id));
                    setShowAddTeam(false);
                  }}
                />
                <i
                  className="pi pi-trash text-xs opacity-60 team-edit-icon team-delete-icon"
                  title={team.id === "fill-grey" ? "Team Trống không thể xoá" : "Xoá Team"}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTeam(team.id);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* FORM ĐỔI MÀU TEAM ĐANG CHỌN — hiện ngay tại chỗ, luôn trong tầm nhìn */}
        {editingTeamId && (
          <div className="team-inline-form mt-3">
            <div className="text-xs font-bold text-700 mb-2 flex align-items-center gap-2">
              🎨 Đổi màu cho Team{" "}
              <InlineEdit
                value={getTeam(appState.teams, editingTeamId).name}
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
                        className={`color-swatch ${getTeam(appState.teams, editingTeamId).dotColor === hex ? "selected" : ""}`}
                        style={{ backgroundColor: hex }}
                        onClick={() => updateTeamColor(editingTeamId, hex)}
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
              className="py-1 px-2 text-xs font-bold mt-2"
              onClick={() => setEditingTeamId(null)}
            />
          </div>
        )}

        {/* FORM THÊM TEAM MỚI — hiện ngay tại chỗ, luôn trong tầm nhìn */}
        {showAddTeam && (
          <div className="team-inline-form mt-3">
            <div className="text-xs font-bold text-700 mb-2">➕ Thêm Team mới</div>
            <div className="flex align-items-center gap-2 flex-wrap mb-2">
              <InputText
                placeholder="Tên Team mới..."
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTeam(newTeamName, newTeamColor)}
                className="w-14rem p-2 text-sm"
                autoFocus
              />
              <span
                className="new-team-preview"
                style={{ backgroundColor: newTeamColor }}
                title="Màu đã chọn"
              />
            </div>
            <div className="color-palette-grouped mb-2">
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
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                label="Thêm Team"
                icon="pi pi-check"
                size="small"
                severity="success"
                className="py-1 px-3 text-xs font-bold"
                onClick={() => addTeam(newTeamName, newTeamColor)}
              />
              <Button
                label="Hủy"
                size="small"
                text
                severity="secondary"
                className="py-1 px-2 text-xs font-bold"
                onClick={() => {
                  setShowAddTeam(false);
                  setNewTeamName("");
                }}
              />
            </div>
          </div>
        )}

          <button
            type="button"
            className="team-sheet-close p-button p-component p-button-text p-button-rounded"
            onClick={() => setShowTeamSheet(false)}
            aria-label="Đóng quản lý Team"
          >
            <i className="pi pi-times" />
          </button>
        </aside>

        <main className="workspace-main">
          {/* TOOLBAR: BỘ LỌC SÀN LẦU, TÌM KIẾM & XUẤT/NHẬP JSON */}
          <Toolbar
        className="mb-4 shadow-2 border-1 surface-border border-round-xl p-3"
        left={
          <div className="flex gap-3 align-items-center flex-wrap">
            {/* TÌM KIẾM */}
            <span className="p-input-icon-left">
              <i className="pi pi-search text-500" />
              <InputText
                placeholder="🔍 Tìm tên Agent hoặc STT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-16rem p-2 text-sm"
              />
            </span>

            {/* BỘ LỌC SÀN LẦU: Tất cả / Sàn Lầu 2 / Sàn Lầu 3 */}
            <div className="floor-filter">
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
                >
                  <i className={option.icon} />
                  {option.label}
                </button>
              ))}
            </div>

            {/* HIỂN THỊ THẺ ĐANG LỌC TEAM */}
            {selectedTeamId && (
              <div className="flex align-items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 border-round-pill text-xs font-bold shadow-1">
                <span className="team-tag-dot" style={{ backgroundColor: getTeam(appState.teams, selectedTeamId).dotColor }} />
                <span>Đang lọc: {getTeam(appState.teams, selectedTeamId).name}</span>
                <i
                  className="pi pi-times cursor-pointer hover:text-blue-900 ml-1"
                  onClick={() => setSelectedTeamId(null)}
                  title="Bỏ lọc team"
                />
              </div>
            )}
          </div>
        }
        right={
          <div className="flex align-items-center gap-2 flex-wrap">
            {/* INPUT ĐỌC FILE JSON ẨN */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={importFromJson}
              accept=".json"
              style={{ display: "none" }}
            />
            <Button
              label="Xuất JSON"
              icon="pi pi-download"
              severity="help"
              outlined
              className="font-bold px-3 py-2 text-xs"
              onClick={exportToJson}
              title="Xuất dữ liệu dự phòng ra file JSON"
            />
            <Button
              label="Nhập JSON"
              icon="pi pi-upload"
              severity="warning"
              outlined
              className="font-bold px-3 py-2 text-xs"
              onClick={() => fileInputRef.current?.click()}
              title="Nhập dữ liệu từ file JSON"
            />
            <Button
              label={isSyncing ? "Đang lưu..." : "Lưu Cloud"}
              icon="pi pi-cloud-upload"
              severity="success"
              className="font-bold px-4 py-2 text-xs"
              onClick={syncOnline}
              disabled={isSyncing}
            />
          </div>
        }
      />

      {/* RENDER SÀN & DÃY */}
      {appState.floors.map((floor, fIdx) => {
        if (selectedFloor !== "Tất cả" && floor.floorName !== selectedFloor)
          return null;

        return (
          <div key={fIdx} className="mb-5">
            <h2 className="text-xl md:text-2xl font-extrabold text-800 mb-3 border-bottom-2 surface-border pb-2 flex align-items-center gap-2">
              <span>🏢</span> {floor.floorName}
            </h2>

            {floor.lanes.map((lane, lIdx) => (
              <div
                key={lIdx}
                className="surface-card border-1 surface-border shadow-2 border-round-2xl p-3 mb-3 flex overflow-x-auto min-h-14rem lane-container"
              >
                {/* --- LEAD ZONE --- */}
                <div
                  className="flex flex-column mr-3 surface-50 p-2 border-round-xl border-1 surface-border"
                  style={{ minWidth: "210px" }}
                >
                  <div className="flex justify-content-between align-items-center mb-2 px-1">
                    <span className="text-xs font-extrabold text-700 uppercase">
                      👑 LEAD DÃY {lane.laneLetter}
                    </span>
                    <Button
                      icon="pi pi-plus"
                      size="small"
                      rounded
                      text
                      severity="success"
                      title="Thêm Lead"
                      onClick={() => addSeat(fIdx, lIdx, "lead")}
                    />
                  </div>

                  <div
                    className="flex flex-wrap gap-2 flex-1 drop-zone p-1 border-round"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, fIdx, lIdx, "lead")}
                  >
                    {lane.leads
                      .filter((s) => {
                        const q = s.name
                          .toLowerCase()
                          .includes(search.toLowerCase());
                        const colorId = appState.colors[s.id] || "fill-lead";
                        const teamMatch =
                          !selectedTeamId || colorId === selectedTeamId;
                        return q && teamMatch;
                      })
                      .map((seat, sIdx) => {
                        const colorId = appState.colors[seat.id] || "fill-lead";
                        const team = getTeam(appState.teams, colorId);
                        const inv = appState.inventory[seat.id] || {};

                        return (
                          <div
                            key={seat.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, fIdx, lIdx, "lead", sIdx)
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) =>
                              onDropOnSeat(e, fIdx, lIdx, "lead", sIdx)
                            }
                            className="seat-card p-2 border-round-xl shadow-2 border-1 cursor-move w-full"
                            style={teamCardStyle(team.dotColor)}
                          >
                            <div
                              className="flex justify-content-between align-items-center mb-2"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <div className="qa-group">
                                {/* NÚT NHANH ✔️ ĐỦ BỘ */}
                                <Button
                                  icon="pi pi-check"
                                  rounded
                                  severity="success"
                                  className="qa-btn qa-btn-lead"
                                  title="Check đủ bộ"
                                  onClick={() => markFull(seat.id, true)}
                                />
                                {/* NÚT NHANH 🔄 RESET */}
                                <Button
                                  icon="pi pi-refresh"
                                  rounded
                                  severity="secondary"
                                  outlined
                                  className="qa-btn qa-btn-lead"
                                  title="Reset checklist"
                                  onClick={() => markReset(seat.id)}
                                />
                              </div>

                              <Button
                                icon="pi pi-times"
                                rounded
                                text
                                severity="danger"
                                className="qa-btn qa-btn-lead"
                                title="Xoá cabin"
                                onClick={() =>
                                  removeSeat(fIdx, lIdx, "lead", sIdx)
                                }
                              />
                            </div>

                            {/* NHÃN TEAM TRÊN ĐẦU CABIN */}
                            <TeamTag
                              team={team}
                              onOpen={(e) => {
                                e.stopPropagation();
                                setActiveSeat(seat.id);
                                setOpenMenu({ type: "seat", seatId: seat.id, x: e.clientX, y: e.clientY });
                              }}
                            />

                            {/* TÊN LEAD INLINE EDIT: CHỮ NHỎ, FULL TÊN */}
                            <InlineEdit
                              value={seat.name}
                              onChange={(val) =>
                                updateProp(
                                  fIdx,
                                  lIdx,
                                  "lead",
                                  sIdx,
                                  "name",
                                  val,
                                )
                              }
                              placeholder="Tên Lead"
                              isName={true}
                              className="text-xs w-full mt-2"
                            />

                            {/* CHECKLIST THIẾT BỊ */}
                            <div
                              className="surface-0 p-2 border-round-lg shadow-1 mt-2 flex flex-column gap-1"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              {[
                                { key: "thung", label: "Thùng" },
                                { key: "man20", label: 'Màn 20"' },
                                { key: "man24", label: 'Màn 24"' },
                                { key: "chuot", label: "Chuột" },
                                { key: "phim", label: "Phím" },
                                { key: "tai", label: "Tai USB" },
                                { key: "laptop", label: "Laptop" },
                              ].map(({ key, label }) => (
                                <div
                                  key={key}
                                  className="flex align-items-center gap-2 text-xs"
                                >
                                  <Checkbox
                                    inputId={`${seat.id}_${key}`}
                                    checked={!!inv[key]}
                                    onChange={(e) =>
                                      updateInventory(seat.id, key, e.checked)
                                    }
                                  />
                                  <label
                                    htmlFor={`${seat.id}_${key}`}
                                    className="cursor-pointer font-medium text-700 select-none flex-1"
                                  >
                                    {label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* VÁCH NGĂN DÃY */}
                <div className="flex align-items-center mx-2 relative">
                  <div className="bg-300 w-1rem h-full border-round-xl" />
                  <Badge
                    value={lane.laneLetter}
                    size="large"
                    severity="warning"
                    className="absolute top-50 shadow-2 font-black"
                    style={{ left: "-8px", transform: "translateY(-50%)" }}
                  />
                </div>

                {/* --- AGENT ZONE --- */}
                <div className="flex flex-column ml-2 flex-1">
                  <div className="flex align-items-center gap-3 mb-2 flex-wrap px-1">
                    <span className="text-sm font-extrabold text-800 uppercase flex align-items-center gap-1">
                      <span>👥</span> AGENTS DÃY {lane.laneLetter}
                    </span>

                    {/* STT BẮT ĐẦU VẬN HÀNH NỔI BẬT CHO CẢ DÃY */}
                    <div className="flex align-items-center gap-2 bg-blue-50 border-1 border-blue-200 px-2.5 py-1 border-round-xl shadow-1">
                      <span className="text-xs font-bold text-blue-800">
                        STT Bắt đầu:
                      </span>
                      <InputText
                        type="number"
                        value={lane.startStt}
                        onChange={(e) =>
                          updateSttGlobal(fIdx, lIdx, e.target.value)
                        }
                        className="w-4rem p-1 text-center font-extrabold text-xs text-blue-900 surface-0 border-blue-300"
                      />
                      <Button
                        icon="pi pi-bolt"
                        label="Áp dụng STT"
                        size="small"
                        severity="info"
                        className="py-1 px-2 text-xs font-bold"
                        title="Tự động áp dụng đánh số thứ tự nối tiếp cho tất cả các cabin trong dãy"
                        onClick={() =>
                          updateSttGlobal(fIdx, lIdx, lane.startStt)
                        }
                      />
                    </div>

                    <Button
                      icon="pi pi-palette"
                      label="Đổi màu dãy"
                      size="small"
                      outlined
                      severity="secondary"
                      className="py-1 px-2 text-xs font-bold ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLane({ fIdx, lIdx });
                        setOpenMenu({ type: "bulk", x: e.clientX, y: e.clientY });
                      }}
                    />

                    <Button
                      icon="pi pi-plus"
                      label="Thêm Agent"
                      size="small"
                      outlined
                      severity="success"
                      className="py-1 px-2 text-xs font-bold"
                      onClick={() => addSeat(fIdx, lIdx, "agent")}
                    />
                  </div>

                  <div
                    className="flex flex-wrap gap-2 drop-zone p-1 border-round min-w-full"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, fIdx, lIdx, "agent")}
                  >
                    {lane.agents
                      .filter((s) => {
                        const q = `${s.name} ${s.stt}`
                          .toLowerCase()
                          .includes(search.toLowerCase());
                        const colorId =
                          appState.colors[s.id] || autoColor(s.name);
                        const teamMatch =
                          !selectedTeamId || colorId === selectedTeamId;
                        return q && teamMatch;
                      })
                      .map((seat, sIdx) => {
                        const colorId =
                          appState.colors[seat.id] || autoColor(seat.name);
                        const team = getTeam(appState.teams, colorId);
                        const inv = appState.inventory[seat.id] || {};

                        return (
                          <div
                            key={seat.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, fIdx, lIdx, "agent", sIdx)
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) =>
                              onDropOnSeat(e, fIdx, lIdx, "agent", sIdx)
                            }
                            className="seat-card p-2 border-round-xl shadow-1 border-1 cursor-move"
                            style={{ width: "152px", ...teamCardStyle(team.dotColor) }}
                          >
                            <div
                              className="flex justify-content-between align-items-center mb-1"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <div className="qa-group">
                                {/* NÚT NHANH ✔️ ĐỦ BỘ */}
                                <Button
                                  icon="pi pi-check"
                                  rounded
                                  severity="success"
                                  className="qa-btn"
                                  title="Check đủ bộ"
                                  onClick={() => markFull(seat.id, false)}
                                />
                                {/* NÚT NHANH 🔄 RESET */}
                                <Button
                                  icon="pi pi-refresh"
                                  rounded
                                  severity="secondary"
                                  outlined
                                  className="qa-btn"
                                  title="Reset checklist"
                                  onClick={() => markReset(seat.id)}
                                />
                              </div>

                              <Button
                                icon="pi pi-times"
                                rounded
                                text
                                severity="danger"
                                className="qa-btn"
                                title="Xoá cabin"
                                onClick={() =>
                                  removeSeat(fIdx, lIdx, "agent", sIdx)
                                }
                              />
                            </div>

                            {/* NHÃN TEAM TRÊN ĐẦU CABIN */}
                            <TeamTag
                              team={team}
                              onOpen={(e) => {
                                e.stopPropagation();
                                setActiveSeat(seat.id);
                                setOpenMenu({ type: "seat", seatId: seat.id, x: e.clientX, y: e.clientY });
                              }}
                            />

                            {/* STT & TÊN AGENT INLINE EDIT: CHỮ NHỎ, FULL TÊN (30-35 KÝ TỰ) */}
                            <div className="flex align-items-center gap-1 mt-1">
                              <InlineEdit
                                value={seat.stt || ""}
                                onChange={(val) =>
                                  updateProp(
                                    fIdx,
                                    lIdx,
                                    "agent",
                                    sIdx,
                                    "stt",
                                    val,
                                  )
                                }
                                placeholder="STT"
                                isStt={true}
                              />
                              <InlineEdit
                                value={seat.name}
                                onChange={(val) =>
                                  updateProp(
                                    fIdx,
                                    lIdx,
                                    "agent",
                                    sIdx,
                                    "name",
                                    val,
                                  )
                                }
                                placeholder="Tên Agent..."
                                isName={true}
                                className="flex-1"
                              />
                            </div>

                            {/* CHECKLIST THIẾT BỊ */}
                            <div
                              className="surface-0 p-1.5 border-round-lg shadow-1 mt-2 flex flex-column gap-1 mt-auto"
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              {[
                                { key: "thung", label: "Thùng" },
                                { key: "man20", label: 'Màn 20"' },
                                { key: "chuot", label: "Chuột" },
                                { key: "phim", label: "Phím" },
                                { key: "tai", label: "Tai nghe" },
                              ].map(({ key, label }) => (
                                <div
                                  key={key}
                                  className="flex align-items-center gap-1.5 text-xs"
                                >
                                  <Checkbox
                                    inputId={`${seat.id}_${key}`}
                                    checked={!!inv[key]}
                                    onChange={(e) =>
                                      updateInventory(seat.id, key, e.checked)
                                    }
                                  />
                                  <label
                                    htmlFor={`${seat.id}_${key}`}
                                    className="cursor-pointer font-medium text-700 select-none flex-1 text-xs"
                                  >
                                    {label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
          })}
        </main>
      </div>

      <button
        type="button"
        className="team-fab"
        onClick={() => setShowTeamSheet(true)}
        aria-label="Quản lý Team"
      >
        <i className="pi pi-users" />
        <span>Quản lý Team</span>
      </button>
    </div>
  );
}
