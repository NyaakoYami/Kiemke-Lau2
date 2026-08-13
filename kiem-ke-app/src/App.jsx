import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Popover } from "primereact/popover";
import { Toolbar } from "primereact/toolbar";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";

// -------------------------------------------------------------
// COMPONENT NHẬP LIỆU INLINE (Click để sửa) - hiển thị dạng text
// chìm/gọn, chỉ hiện khung nhập khi click vào.
// -------------------------------------------------------------
function InlineEdit({ value, onChange, placeholder, className }) {
  const [isEdit, setIsEdit] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  const handleSave = () => {
    onChange(val);
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
        className={`${className} p-1 w-full`}
      />
    );
  }
  return (
    <div
      className={`${className} inline-edit-display cursor-pointer text-overflow-ellipsis white-space-nowrap overflow-hidden`}
      onClick={() => setIsEdit(true)}
      title="Click để sửa"
    >
      {value || placeholder}
    </div>
  );
}

// -------------------------------------------------------------
// CHẤM TRẠNG THÁI KẾT NỐI SUPABASE
// Xanh dương (chớp) = đang kết nối / đã kết nối nhưng chưa đồng bộ
// Vàng (chớp)       = đang đồng bộ
// Xanh lá           = đã đồng bộ thành công
// Đỏ                = mất kết nối / lỗi
// -------------------------------------------------------------
function StatusDot({ connectionStatus, syncStatus }) {
  let color = "#ef4444"; // đỏ mặc định
  let label = "Mất kết nối Cloud";
  let pulse = false;

  if (connectionStatus === "checking") {
    color = "#3b82f6"; // xanh dương
    label = "Đang kết nối...";
    pulse = true;
  } else if (connectionStatus === "error") {
    color = "#ef4444"; // đỏ
    label = "Mất kết nối Cloud";
  } else if (connectionStatus === "connected") {
    if (syncStatus === "syncing") {
      color = "#eab308"; // vàng
      label = "Đang đồng bộ...";
      pulse = true;
    } else if (syncStatus === "synced") {
      color = "#22c55e"; // xanh lá
      label = "Đã đồng bộ";
    } else {
      color = "#3b82f6"; // xanh dương
      label = "Đã kết nối (chưa đồng bộ)";
    }
  }

  return (
    <div className="flex align-items-center gap-2">
      <span
        className="status-dot"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 0 3px ${color}33`,
          animation: pulse ? "pulseDot 1.1s ease-in-out infinite" : "none",
        }}
      />
      <span className="text-xs text-300 font-medium">{label}</span>
    </div>
  );
}

// -------------------------------------------------------------
// CẤU HÌNH SUPABASE & DỮ LIỆU GỐC
// -------------------------------------------------------------
const SUPABASE_URL = "https://josvegctuwnxfpjynlxn.supabase.co";
const SUPABASE_KEY = "sb_publishable_76ErkOKmFh5t1ykxRKBfIA_DDn9srEc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genId = () => "s_" + Math.random().toString(36).substr(2, 9);
const teamColors = [
  { id: "fill-lead", name: "Lead" },
  { id: "fill-pink", name: "User" },
  { id: "fill-orange", name: "Social" },
  { id: "fill-cyan", name: "Merchant" },
  { id: "fill-yellow", name: "Night/Senior" },
  { id: "fill-purple", name: "SPT/PT" },
  { id: "fill-grey", name: "Trống" },
];
const defaultData = [
  {
    floorName: "Sàn Lầu 3",
    lanes: [
      {
        laneLetter: "A",
        startStt: 18,
        leads: [{ id: genId(), name: "Thu Hiền - TL" }],
        agents: [
          "Trần Chi",
          "Nguyễn Trâm",
          "Trần Trinh",
          "Nguyễn Thiên",
          "Đoàn Giao",
          "NB Content",
          "NB Content",
          "Lê Trinh",
          "Nguyễn Tỷ",
          "Cao Nhung",
          "Huỳnh Ngà",
          "Huỳnh Châu",
          "Lê Châu",
          "Trống",
          "Trống",
        ].map((n, i) => ({ id: genId(), name: n, stt: 18 + i })),
      },
      {
        laneLetter: "B",
        startStt: 38,
        leads: [{ id: genId(), name: "Vy - DA" }],
        agents: [
          "Nguyễn Khanh",
          "Lý - Senior",
          "Nguyễn Hậu",
          "Võ Hiền",
          "Phan Loan",
          "Võ Lan",
          "NB Content",
          "NB Content",
          "Tuyến - Senior",
          "Nguyễn Thúy",
        ].map((n, i) => ({ id: genId(), name: n, stt: 38 + i })),
      },
      {
        laneLetter: "C",
        startStt: 48,
        leads: [{ id: genId(), name: "Lead Hỗ Trợ" }],
        agents: [
          "Huỳnh Giang",
          "Trần Tâm",
          "Nguyễn Phương",
          "Ngô Hằng",
          "Lai Nghi",
          "NB Tele",
          "Trống",
          "Trống",
          "Trống",
          "Trống",
        ].map((n, i) => ({ id: genId(), name: n, stt: 48 + i })),
      },
      {
        laneLetter: "D",
        startStt: 58,
        leads: [{ id: genId(), name: "Anh Thư - SUP" }],
        agents: [
          "Full",
          "Full",
          "PT - Phúc Hậu",
          "Trung Hiếu",
          "Quốc Khánh",
          "Trống",
          "Nhung Huỳnh",
          "Yến Ly",
          "Gia Hưng",
          "Bích Quỳnh",
          "PT - Phương Thy",
          "PT - Khánh Vy",
          "PT - Liên Anh",
          "PT - Thu Hồng",
          "PT - Loan",
          "PT - Cắt Tường",
          "PT - Khoa",
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
          "Trống",
          "Thiên Kim Senior",
          "Kim Ái Senior",
          "Huy Hoàng",
          "Diệu Trinh",
          "PT Thảo Phương",
          "PT Sỹ Danh",
          "PT Trúc Linh",
          "PT Thu Hiền",
          "Full",
          "PT Thành Đạt",
          "Full",
          "PT - Gia Hân",
          "PT - Sang",
          "PT - Trang",
          "PT - Huy",
          "PT - Gia Bội",
          "PT - Hào",
        ].map((n, i) => ({ id: genId(), name: n, stt: 1 + i })),
      },
      {
        laneLetter: "B",
        startStt: 19,
        leads: [{ id: genId(), name: "Chinh - TL" }],
        agents: [
          "Thiên Ngân",
          "Tú Trinh",
          "Trung Nghị",
          "Minh Tâm",
          "Minh Thư",
          "Duy Khánh",
          "Hồng Ân",
          "Nhật Lam",
          "Khánh Ly",
          "Hoàng Gấm NB",
          "Hoàng Khải",
          "Phi Phụng",
          "Bảo Anh Senior",
          "Ngọc Tú",
          "Uyên",
          "Thanh",
          "PT Bảo My",
          "Full",
          "Cảnh",
          "Trúc",
        ].map((n, i) => ({ id: genId(), name: n, stt: 19 + i })),
      },
      {
        laneLetter: "C",
        startStt: 39,
        leads: [{ id: genId(), name: "Lead Hỗ Trợ 2" }],
        agents: [
          "Thiếu 1 màn hình",
          "Full",
          "Trực",
          "Kim Ngân",
          "Đan Vy",
          "Nguyễn Senior",
          "Thắng",
          "Full",
          "Nguyễn Kim Ngân",
          "Thị Thủy",
          "Ý Lan",
          "Hải Yến",
          "Ái Linh",
          "Hân Senior",
          "Minh Thái",
          "Quang Hậu",
          "Công Hiệp",
          "Full",
          "Minh Hoàng",
        ].map((n, i) => ({ id: genId(), name: n, stt: 39 + i })),
      },
      {
        laneLetter: "D",
        startStt: 59,
        leads: [{ id: genId(), name: "Phương - TL QA" }],
        agents: [
          "Hoàng Khôi",
          "Minh Đạo",
          "Văn Anh",
          "Kim Chi",
          "Thảo Vi",
          "Thừa Nghiên",
          "Mai Xuân",
          "Thị Quỳnh",
          "Nguyễn Nhi",
          "Thị Hồng",
          "Chấn Điền",
          "Nhật Khánh",
          "Tú Quyền",
          "Tân Tài",
          "Tuấn Anh",
          "Toàn",
        ].map((n, i) => ({ id: genId(), name: n, stt: 59 + i })),
      },
    ],
  },
];

export default function App() {
  const toast = useRef(null);
  const colorPanel = useRef(null);
  const bulkColorPanel = useRef(null);
  const [appState, setAppState] = useState({
    floors: defaultFloorsInit(),
    inventory: {},
    colors: {},
  });
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [activeSeat, setActiveSeat] = useState(null);
  const [activeLane, setActiveLane] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Tất cả"); // Lọc Sàn
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Trạng thái kết nối / đồng bộ Supabase
  const [connectionStatus, setConnectionStatus] = useState("checking"); // checking | connected | error
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error

  function defaultFloorsInit() {
    return JSON.parse(JSON.stringify(defaultData));
  }

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
    if (n.startsWith("PT") || n.includes("PT -")) return "fill-purple";
    if (n.includes("NB ")) return "fill-orange";
    if (n === "FULL") return "fill-cyan";
    return "fill-pink";
  };

  const teamNameOf = (colorId) =>
    teamColors.find((c) => c.id === colorId)?.name || "Khác";

  useEffect(() => {
    loadOnline();
  }, []);

  const loadOnline = async () => {
    setConnectionStatus("checking");
    try {
      const { data, error } = await supabase
        .from("inventory_sync")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      setConnectionStatus("connected");
      if (data && data.data) {
        setAppState(data.data);
        setSyncStatus("synced");
        toast.current.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã tải dữ liệu từ Cloud",
          life: 3000,
        });
      } else {
        ensureInventoryValid(appState);
      }
    } catch (err) {
      console.log("No existing data or error:", err);
      setConnectionStatus("error");
      ensureInventoryValid(appState);
    }
  };

  const syncOnline = async () => {
    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      const { error } = await supabase.from("inventory_sync").upsert({
        id: 1,
        data: appState,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setConnectionStatus("connected");
      setSyncStatus("synced");
      toast.current.show({
        severity: "success",
        summary: "Thành công",
        detail: "Đã lưu đồng bộ lên Cloud",
        life: 3000,
      });
    } catch (err) {
      setConnectionStatus("error");
      setSyncStatus("error");
      toast.current.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể đồng bộ: " + err.message,
        life: 3000,
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

  const markDirty = () => {
    setConnectionStatus((prev) => (prev === "error" ? "error" : "connected"));
    setSyncStatus((prev) => (prev === "syncing" ? "syncing" : "idle"));
  };

  const updateState = (updater) => {
    setAppState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      updater(next);
      return next;
    });
    markDirty();
  };

  // Các thao tác
  const updateProp = (fIdx, lIdx, type, sIdx, prop, val) => {
    updateState((st) => {
      const seat =
        type === "lead"
          ? st.floors[fIdx].lanes[lIdx].leads[sIdx]
          : st.floors[fIdx].lanes[lIdx].agents[sIdx];
      seat[prop] = prop === "stt" ? parseInt(val) || "" : val;
    });
  };

  const updateInventory = (id, key, val) =>
    updateState((st) => {
      st.inventory[id][key] = val;
    });

  const updateSttGlobal = (fIdx, lIdx, val) =>
    updateState((st) => {
      const lane = st.floors[fIdx].lanes[lIdx];
      lane.startStt = parseInt(val) || 0;
      lane.agents.forEach((ag, i) => (ag.stt = lane.startStt + i));
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
              ? lane.agents[lane.agents.length - 1].stt + 1
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

  const markFull = (id, isLead) => {
    updateState((st) => {
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

  const markReset = (id) => {
    updateState((st) => {
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

  // Drag Drop
  const onDragStart = (e, fIdx, lIdx, type, sIdx) => {
    setDraggedItem({ fIdx, lIdx, type, sIdx });
    e.dataTransfer.effectAllowed = "move";
  };

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

  // Thống Kê
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

  const ColorMenu = ({ onClick, activeColorId }) => (
    <div className="flex flex-column gap-1 w-13rem p-1">
      <div className="text-sm font-bold text-600 mb-2 border-bottom-1 surface-border pb-1">
        Chọn Team
      </div>
      {teamColors.map((c) => (
        <div
          key={c.id}
          className={`flex align-items-center gap-3 p-2 border-round cursor-pointer hover:surface-200 transition-colors ${
            activeColorId === c.id ? "surface-200 border-1 border-primary" : ""
          }`}
          onClick={() => onClick(c.id)}
        >
          <div className={`w-2rem h-2rem border-round shadow-1 ${c.id}`}></div>
          <span className="font-semibold text-sm text-700 flex-1">
            {c.name}
          </span>
          {activeColorId === c.id && (
            <i className="pi pi-check text-primary text-sm" />
          )}
        </div>
      ))}
    </div>
  );

  // Nhãn Team nhỏ hiện ngay trên cabin:
  // - click: lọc tất cả cabin cùng team
  // - hover: mở bảng chọn màu để đổi team ngay
  const TeamTag = ({ colorId, onOpen, onFilter, isSelected }) => (
    <div
      className={`team-tag flex align-items-center gap-1 cursor-pointer ${isSelected ? "team-tag-selected" : ""}`}
      onClick={onFilter}
      onMouseEnter={onOpen}
      title="Click để lọc team / rê chuột để đổi màu"
    >
      <span className={`team-tag-dot ${colorId}`}></span>
      <span className="team-tag-label">{teamNameOf(colorId)}</span>
      <i className="pi pi-chevron-down text-xs opacity-60" />
    </div>
  );

  return (
    <div
      className="p-4"
      style={{ backgroundColor: "var(--surface-ground)", minHeight: "100vh" }}
    >
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.7; }
        }
        .status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .inline-edit-display,
        .inline-edit-display.p-inputtext {
          font-weight: 700;
          opacity: 0.92;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid transparent;
          background: transparent;
          box-shadow: none;
          color: #1f2937;
        }
        .inline-edit-display:hover,
        .inline-edit-display:focus,
        .inline-edit-display.p-inputtext:focus {
          opacity: 1;
          border-color: rgba(59, 91, 219, 0.28);
          background: rgba(255,255,255,0.55);
          box-shadow: none;
        }
        .team-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .02em;
          background: rgba(255,255,255,0.55);
          border-radius: 999px;
          padding: 1px 6px;
          width: fit-content;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        .team-tag:hover { background: rgba(255,255,255,0.85); border-color: rgba(59, 91, 219, 0.2); }
        .team-tag-selected { background: rgba(219,234,254,0.9); border-color: rgba(59, 91, 219, 0.45); }
        .team-tag-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .team-tag-label { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fill-lead { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
        .fill-pink { background: linear-gradient(135deg, #fce7f3, #f9a8d4); }
        .fill-orange { background: linear-gradient(135deg, #ffedd5, #fdba74); }
        .fill-cyan { background: linear-gradient(135deg, #cffafe, #67e8f9); }
        .fill-yellow { background: linear-gradient(135deg, #fef3c7, #fcd34d); }
        .fill-purple { background: linear-gradient(135deg, #ede9fe, #c4b5fd); }
        .fill-grey { background: linear-gradient(135deg, #e5e7eb, #d1d5db); }
        .team-tag-dot.fill-lead { background: #2563eb; }
        .team-tag-dot.fill-pink { background: #ec4899; }
        .team-tag-dot.fill-orange { background: #f97316; }
        .team-tag-dot.fill-cyan { background: #06b6d4; }
        .team-tag-dot.fill-yellow { background: #eab308; }
        .team-tag-dot.fill-purple { background: #8b5cf6; }
        .team-tag-dot.fill-grey { background: #6b7280; }
      `}</style>
      <Toast ref={toast} />
      {/* Popovers */}
      <Popover ref={colorPanel}>
        <ColorMenu
          activeColorId={appState.colors[activeSeat]}
          onClick={(cId) => {
            setSeatColor(activeSeat, cId);
            colorPanel.current?.hide();
          }}
        />
      </Popover>
      <Popover ref={bulkColorPanel}>
        <ColorMenu
          onClick={(cId) => {
            applyBulkColor(cId);
            bulkColorPanel.current?.hide();
          }}
        />
      </Popover>
      <div className="surface-900 text-white p-4 border-round-xl shadow-4 mb-4 flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="m-0 text-3xl font-bold">
            📋 Kiểm Kê Tài Sản - Sàn Lầu 2 & Lầu 3
          </h1>
          <p className="mt-2 text-400">
            Inline Edit, Chọn màu theo Team, Tính năng Đủ bộ/Reset.
          </p>
        </div>
        <div className="flex flex-column align-items-end gap-2">
          <Badge
            value={new Date().toLocaleDateString("vi-VN")}
            size="large"
            severity="info"
          />
          <StatusDot
            connectionStatus={connectionStatus}
            syncStatus={syncStatus}
          />
        </div>
      </div>
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
          <div key={s.label} className="col-12 md:col-3 lg:col-1">
            <Card className="shadow-2 border-1 surface-border h-full text-center p-2">
              <div className="text-500 text-xs font-bold uppercase mb-2">
                {s.icon} {s.label}
              </div>
              <div className="text-3xl font-extrabold text-900">{s.val}</div>
            </Card>
          </div>
        ))}
      </div>
      {/* Toolbar & Sàn Lọc */}
      <Toolbar
        className="mb-4 shadow-2 border-1 surface-border"
        left={
          <div className="flex gap-4 align-items-center flex-wrap">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                placeholder="Tìm kiếm Agent/STT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-18rem"
              />
            </span>
            <div className="flex align-items-center gap-2 p-1 border-round surface-100">
              {["Tất cả", "Sàn Lầu 2", "Sàn Lầu 3"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`px-3 py-2 border-round text-sm font-semibold border-none cursor-pointer transition-colors ${
                    selectedFloor === option
                      ? "surface-900 text-white"
                      : "surface-0 text-700"
                  }`}
                  onClick={() => setSelectedFloor(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        }
        right={
          <Button
            label={isSyncing ? "Đang đồng bộ..." : "Lưu Cloud"}
            icon="pi pi-cloud-upload"
            severity="success"
            onClick={syncOnline}
            disabled={isSyncing}
          />
        }
      />
      {/* Render Sàn & Dãy */}
      {appState.floors.map((floor, fIdx) => {
        if (selectedFloor !== "Tất cả" && floor.floorName !== selectedFloor)
          return null;
        return (
          <div key={fIdx} className="mb-6">
            <h2 className="text-2xl font-extrabold text-800 mb-3 border-bottom-1 surface-border pb-2">
              {floor.floorName}
            </h2>
            {floor.lanes.map((lane, lIdx) => (
              <div
                key={lIdx}
                className="surface-card border-1 surface-border shadow-2 border-round-xl p-3 mb-3 flex overflow-x-auto min-h-15rem lane-container"
              >
                {/* --- LEAD ZONE --- */}
                <div
                  className="flex flex-column mr-3"
                  style={{ minWidth: "220px" }}
                >
                  <div className="flex justify-content-between align-items-center mb-2">
                    <span className="text-xs font-bold text-500 uppercase">
                      LEAD DÃY {lane.laneLetter}
                    </span>
                    <Button
                      icon="pi pi-plus"
                      size="small"
                      rounded
                      text
                      severity="success"
                      onClick={() => addSeat(fIdx, lIdx, "lead")}
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-2 flex-1 drop-zone p-2 border-round"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, fIdx, lIdx, "lead")}
                  >
                    {lane.leads
                      .filter((s) => {
                        const q = s.name
                          .toLowerCase()
                          .includes(search.toLowerCase());
                        const teamMatch =
                          !selectedTeamId ||
                          (appState.colors[s.id] || autoColor(s.name)) ===
                            selectedTeamId;
                        return q && teamMatch;
                      })
                      .map((seat, sIdx) => {
                        const colorId = appState.colors[seat.id] || "fill-lead";
                        return (
                          <div
                            key={seat.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, fIdx, lIdx, "lead", sIdx)
                            }
                            className={`p-2 border-round shadow-2 w-full cursor-move transition-transform hover:shadow-4 ${colorId}`}
                          >
                            <div className="flex justify-content-between align-items-start mb-2">
                              <div className="flex gap-1">
                                <Button
                                  icon="pi pi-check-circle"
                                  size="small"
                                  rounded
                                  text
                                  severity="success"
                                  className="p-0 w-1.5rem h-1.5rem"
                                  title="Đủ bộ"
                                  onClick={() => markFull(seat.id, true)}
                                />
                                <Button
                                  icon="pi pi-refresh"
                                  size="small"
                                  rounded
                                  text
                                  severity="secondary"
                                  className="p-0 w-1.5rem h-1.5rem"
                                  title="Reset"
                                  onClick={() => markReset(seat.id)}
                                />
                              </div>
                              <Button
                                icon="pi pi-times"
                                size="small"
                                rounded
                                text
                                severity="danger"
                                className="p-0 w-1.5rem h-1.5rem"
                                title="Xoá"
                                onClick={() =>
                                  removeSeat(fIdx, lIdx, "lead", sIdx)
                                }
                              />
                            </div>
                            <TeamTag
                              colorId={colorId}
                              isSelected={selectedTeamId === colorId}
                              onFilter={() =>
                                setSelectedTeamId((prev) =>
                                  prev === colorId ? null : colorId,
                                )
                              }
                              onOpen={(e) => {
                                setActiveSeat(seat.id);
                                colorPanel.current?.show(e);
                              }}
                            />
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
                              className="text-sm w-full mt-1"
                            />
                            <div className="surface-0 p-2 border-round shadow-1 mt-2">
                              {[
                                "thung",
                                "man20",
                                "man24",
                                "chuot",
                                "phim",
                                "tai",
                                "laptop",
                              ].map((k) => (
                                <div
                                  key={k}
                                  className="flex align-items-center mb-1 gap-2"
                                >
                                  <Checkbox
                                    inputId={`${seat.id}_${k}`}
                                    checked={
                                      !!(appState.inventory[seat.id] || {})[k]
                                    }
                                    onChange={(e) =>
                                      updateInventory(seat.id, k, e.checked)
                                    }
                                  />
                                  <label
                                    htmlFor={`${seat.id}_${k}`}
                                    className="text-xs flex-1 cursor-pointer font-medium text-color-secondary"
                                  >
                                    {k === "thung"
                                      ? "Thùng"
                                      : k === "man20"
                                        ? 'Màn 20"'
                                        : k === "man24"
                                          ? 'Màn 24"'
                                          : k === "chuot"
                                            ? "Chuột"
                                            : k === "phim"
                                              ? "Phím"
                                              : k === "tai"
                                                ? "Tai USB"
                                                : "Laptop"}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="flex align-items-center mx-2 relative">
                  <div className="bg-300 w-1rem h-full border-round-xl"></div>
                  <Badge
                    value={lane.laneLetter}
                    size="large"
                    severity="warning"
                    className="absolute top-50"
                    style={{ left: "-8px" }}
                  />
                </div>
                {/* --- AGENT ZONE --- */}
                <div className="flex flex-column ml-3 flex-1">
                  <div className="flex align-items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-500 uppercase">
                      AGENTS DÃY {lane.laneLetter}
                    </span>
                    <Button
                      icon="pi pi-palette"
                      label="Đổi màu dãy"
                      size="small"
                      outlined
                      severity="info"
                      className="py-1 px-2 text-xs font-bold"
                      onClick={(e) => {
                        setActiveLane({ fIdx, lIdx });
                        bulkColorPanel.current.toggle(e);
                      }}
                    />
                    <div className="flex align-items-center gap-2 surface-100 p-1 border-round ml-auto">
                      <span className="text-xs font-semibold text-600">
                        STT Bắt đầu:
                      </span>
                      <InputText
                        type="number"
                        value={lane.startStt}
                        onChange={(e) =>
                          updateSttGlobal(fIdx, lIdx, e.target.value)
                        }
                        className="w-4rem p-1 text-center font-bold"
                      />
                    </div>
                    <Button
                      icon="pi pi-plus"
                      label="Thêm Agent"
                      size="small"
                      outlined
                      severity="success"
                      onClick={() => addSeat(fIdx, lIdx, "agent")}
                    />
                  </div>
                  <div
                    className="flex flex-wrap gap-2 drop-zone p-2 border-round min-w-full"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, fIdx, lIdx, "agent")}
                  >
                    {lane.agents
                      .filter((s) => {
                        const q = (s.name + s.stt)
                          .toLowerCase()
                          .includes(search.toLowerCase());
                        const teamMatch =
                          !selectedTeamId ||
                          (appState.colors[s.id] || autoColor(s.name)) ===
                            selectedTeamId;
                        return q && teamMatch;
                      })
                      .map((seat, sIdx) => {
                        const colorId =
                          appState.colors[seat.id] || autoColor(seat.name);
                        return (
                          <div
                            key={seat.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, fIdx, lIdx, "agent", sIdx)
                            }
                            className={`p-2 border-round shadow-1 border-1 surface-border cursor-move transition-transform hover:shadow-4 ${colorId}`}
                            style={{ width: "150px" }}
                          >
                            <div className="flex justify-content-between align-items-start mb-1">
                              <div className="flex gap-1">
                                <Button
                                  icon="pi pi-check-circle"
                                  size="small"
                                  rounded
                                  text
                                  severity="success"
                                  className="p-0 w-1.2rem h-1.2rem text-xs"
                                  title="Đủ bộ"
                                  onClick={() => markFull(seat.id, false)}
                                />
                                <Button
                                  icon="pi pi-refresh"
                                  size="small"
                                  rounded
                                  text
                                  severity="secondary"
                                  className="p-0 w-1.2rem h-1.2rem text-xs"
                                  title="Reset"
                                  onClick={() => markReset(seat.id)}
                                />
                              </div>
                              <Button
                                icon="pi pi-times"
                                size="small"
                                rounded
                                text
                                severity="danger"
                                className="p-0 w-1.2rem h-1.2rem text-xs"
                                title="Xoá"
                                onClick={() =>
                                  removeSeat(fIdx, lIdx, "agent", sIdx)
                                }
                              />
                            </div>
                            <TeamTag
                              colorId={colorId}
                              isSelected={selectedTeamId === colorId}
                              onFilter={() =>
                                setSelectedTeamId((prev) =>
                                  prev === colorId ? null : colorId,
                                )
                              }
                              onOpen={(e) => {
                                setActiveSeat(seat.id);
                                colorPanel.current?.show(e);
                              }}
                            />
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
                              className="text-xs text-primary mt-1 inline-block min-w-min"
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
                              placeholder="Tên..."
                              className="text-sm w-full"
                            />
                            <div className="surface-0 p-2 border-round shadow-1 mt-2">
                              {["man20", "thung", "chuot", "phim", "tai"].map(
                                (k) => (
                                  <div
                                    key={k}
                                    className="flex align-items-center mb-1 gap-2"
                                  >
                                    <Checkbox
                                      inputId={`${seat.id}_${k}`}
                                      checked={
                                        !!(appState.inventory[seat.id] || {})[k]
                                      }
                                      onChange={(e) =>
                                        updateInventory(seat.id, k, e.checked)
                                      }
                                    />
                                    <label
                                      htmlFor={`${seat.id}_${k}`}
                                      className="text-xs flex-1 cursor-pointer font-medium text-color-secondary"
                                    >
                                      {k === "thung"
                                        ? "Thùng"
                                        : k === "man20"
                                          ? 'Màn 20"'
                                          : k === "chuot"
                                            ? "Chuột"
                                            : k === "phim"
                                              ? "Phím"
                                              : "Tai nghe"}
                                    </label>
                                  </div>
                                ),
                              )}
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
    </div>
  );
}
