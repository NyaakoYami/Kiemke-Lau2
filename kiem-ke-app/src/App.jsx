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
const SUPABASE_URL = "https://josvegctuwnxfpjynlxn.supabase.co";
const SUPABASE_KEY = "sb_publishable_76ErkOKmFh5t1ykxRKBfIA_DDn9srEc";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const genId = () => "s_" + Math.random().toString(36).substr(2, 9);

const teamColors = [
  { id: "fill-lead", name: "Lead", dotColor: "#2563eb" },
  { id: "fill-pink", name: "User", dotColor: "#ec4899" },
  { id: "fill-orange", name: "Social", dotColor: "#f97316" },
  { id: "fill-cyan", name: "Merchant", dotColor: "#06b6d4" },
  { id: "fill-yellow", name: "Night/Senior", dotColor: "#eab308" },
  { id: "fill-purple", name: "SPT/PT", dotColor: "#8b5cf6" },
  { id: "fill-grey", name: "Trống", dotColor: "#6b7280" },
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

export default function App() {
  const toast = useRef(null);
  const colorPanel = useRef(null);
  const bulkColorPanel = useRef(null);
  const teamColorPickerPanel = useRef(null);
  const fileInputRef = useRef(null);

  const [appState, setAppState] = useState({
    floors: JSON.parse(JSON.stringify(defaultData)),
    inventory: {},
    colors: {},
  });

  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [activeSeat, setActiveSeat] = useState(null);
  const [activeLane, setActiveLane] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Tất cả"); // Lọc Sàn Lầu
  const [selectedTeamId, setSelectedTeamId] = useState(null); // Lọc Team
  const [activeTeamForColorChange, setActiveTeamForColorChange] = useState(null);

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

      if (error && error.code !== "PGRST116") throw error;

      setConnectionStatus("connected");
      if (data && data.data && data.data.floors) {
        setAppState(data.data);
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
      const { error } = await supabase.from("inventory_sync").upsert({
        id: 1,
        data: appState,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

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
          setAppState(parsed);
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

  // Thay đổi màu sắc áp dụng cho toàn bộ Team
  const changeTeamColorGlobally = (targetTeamId, newColorId) => {
    updateState((st) => {
      st.floors.forEach((f) =>
        f.lanes.forEach((l) => {
          l.leads.forEach((ld) => {
            const current = st.colors[ld.id] || "fill-lead";
            if (current === targetTeamId) st.colors[ld.id] = newColorId;
          });
          l.agents.forEach((ag) => {
            const current = st.colors[ag.id] || autoColor(ag.name);
            if (current === targetTeamId) st.colors[ag.id] = newColorId;
          });
        }),
      );
    });
    toast.current?.show({
      severity: "info",
      summary: "Đổi màu Team",
      detail: `Đã đổi màu toàn bộ Team sang màu mới`,
      life: 2500,
    });
  };

  // Thống kê số lượng theo từng Team
  const getTeamCounts = () => {
    const counts = { total: 0 };
    teamColors.forEach((c) => (counts[c.id] = 0));
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

  // BẢNG CHỌN TEAM DẠNG GRID (Bảng Team màu sắc trực quan)
  const TeamGridMenu = ({ onClick, activeColorId }) => (
    <div className="p-2">
      <div className="text-xs font-extrabold text-700 uppercase tracking-wider mb-2 border-bottom-1 surface-border pb-2 flex align-items-center justify-content-between">
        <span>🎨 BẢNG CHỌN TEAM</span>
        <span className="text-500 font-normal text-xs">
          {teamColors.length} Team
        </span>
      </div>
      <div className="team-grid-container">
        {teamColors.map((c) => {
          const isSelected = activeColorId === c.id;
          return (
            <div
              key={c.id}
              className={`team-grid-card ${isSelected ? "selected" : ""}`}
              onClick={() => onClick(c.id)}
            >
              <span className={`color-dot ${c.id}`} />
              <span className="team-name">{c.name}</span>
              {isSelected && (
                <i className="pi pi-check text-primary font-extrabold text-xs ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Nhãn Team nhỏ trên đầu mỗi cabin:
  const TeamTag = ({ colorId, onOpen, onFilter, isSelected }) => (
    <div
      className={`team-tag flex align-items-center gap-1 cursor-pointer ${
        isSelected ? "team-tag-selected" : ""
      }`}
      onClick={onFilter}
      onMouseEnter={onOpen}
      title="Click để lọc team này / Rê chuột để mở Bảng Team chọn màu"
    >
      <span className={`team-tag-dot ${colorId}`} />
      <span className="team-tag-label">{teamNameOf(colorId)}</span>
      <i className="pi pi-chevron-down text-xs opacity-60" />
    </div>
  );

  return (
    <div className="p-3 md:p-4 surface-ground min-h-screen">
      <Toast ref={toast} />

      {/* Bảng chọn màu Team dạng Grid cho Cabin */}
      <Popover ref={colorPanel}>
        <TeamGridMenu
          activeColorId={appState.colors[activeSeat]}
          onClick={(cId) => {
            setSeatColor(activeSeat, cId);
            colorPanel.current?.hide();
          }}
        />
      </Popover>

      {/* Bảng chọn màu cho toàn dãy */}
      <Popover ref={bulkColorPanel}>
        <TeamGridMenu
          onClick={(cId) => {
            applyBulkColor(cId);
            bulkColorPanel.current?.hide();
          }}
        />
      </Popover>

      {/* Popover chọn màu mới áp dụng cho toàn bộ Team */}
      <Popover ref={teamColorPickerPanel}>
        <div className="p-1">
          <div className="text-xs font-extrabold text-700 uppercase tracking-wider mb-2 border-bottom-1 surface-border pb-2 px-2">
            🎨 Thay đổi màu cho toàn Team {teamNameOf(activeTeamForColorChange)}
          </div>
          <TeamGridMenu
            activeColorId={activeTeamForColorChange}
            onClick={(newColorId) => {
              if (activeTeamForColorChange) {
                changeTeamColorGlobally(activeTeamForColorChange, newColorId);
                setSelectedTeamId(newColorId);
              }
              teamColorPickerPanel.current?.hide();
            }}
          />
        </div>
      </Popover>

      {/* HEADER */}
      <div className="surface-900 text-white p-4 border-round-2xl shadow-4 mb-4 flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="m-0 text-2xl md:text-3xl font-extrabold flex align-items-center gap-2">
            <span>📋</span> Kiểm Kê Tài Sản - Sàn Lầu 2 & Lầu 3
          </h1>
          <p className="mt-2 mb-0 text-300 text-sm">
            Tự động đổi màu Team • Inline Edit chữ nhỏ gọn • Bảng màu Team • Đồng
            bộ Supabase & JSON
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
            <Card className="shadow-2 border-1 surface-border h-full text-center p-1">
              <div className="text-500 text-xs font-bold uppercase mb-1">
                {s.icon} {s.label}
              </div>
              <div className="text-2xl font-extrabold text-900">{s.val}</div>
            </Card>
          </div>
        ))}
      </div>

      {/* THANH NÚT CHỌN TEAM BÊN DƯỚI TIÊU ĐỀ CHÍNH */}
      <div className="surface-card p-3 border-round-2xl shadow-2 mb-4 border-1 surface-border">
        <div className="flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
          <div className="text-xs font-extrabold text-700 uppercase tracking-wider flex align-items-center gap-2">
            <span>👥</span> DANH SÁCH TEAM & ĐỔI MÀU TOÀN TEAM
            <span className="text-500 font-normal">
              (Click team để lọc & mở bảng màu áp dụng cho cả team)
            </span>
          </div>
          {selectedTeamId && (
            <Button
              label="Hiển thị tất cả Team"
              icon="pi pi-filter-slash"
              size="small"
              text
              severity="secondary"
              className="py-0 px-2 text-xs font-bold"
              onClick={() => setSelectedTeamId(null)}
            />
          )}
        </div>
        <div className="flex align-items-center gap-2 flex-wrap">
          {/* Nút Tất cả */}
          <div
            className={`team-bar-item ${selectedTeamId === null ? "active" : ""}`}
            onClick={() => setSelectedTeamId(null)}
          >
            <span>Tất cả</span>
            <span className="team-count">{teamCounts.total}</span>
          </div>

          {/* Các nút từng Team */}
          {teamColors.map((team) => {
            const isSelected = selectedTeamId === team.id;
            const count = teamCounts[team.id] || 0;
            return (
              <div
                key={team.id}
                className={`team-bar-item ${isSelected ? "active" : ""}`}
                onClick={(e) => {
                  setSelectedTeamId(team.id);
                  setActiveTeamForColorChange(team.id);
                  teamColorPickerPanel.current?.toggle(e);
                }}
                title={`Click để lọc Team ${team.name} và đổi màu toàn team`}
              >
                <span className={`team-tag-dot ${team.id}`} />
                <span>{team.name}</span>
                <span className="team-count">{count}</span>
                <i className="pi pi-palette text-xs opacity-70 ml-1" />
              </div>
            );
          })}
        </div>
      </div>

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
            <div className="flex align-items-center gap-1 p-1 border-round-lg surface-200">
              {["Tất cả", "Sàn Lầu 2", "Sàn Lầu 3"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`px-3 py-1.5 border-round-md text-xs font-extrabold border-none cursor-pointer transition-colors ${
                    selectedFloor === option
                      ? "surface-900 text-white shadow-1"
                      : "surface-0 text-700 hover:surface-100"
                  }`}
                  onClick={() => setSelectedFloor(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* HIỂN THỊ THẺ ĐANG LỌC TEAM */}
            {selectedTeamId && (
              <div className="flex align-items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 border-round-pill text-xs font-bold shadow-1">
                <span className={`team-tag-dot ${selectedTeamId}`} />
                <span>Đang lọc: {teamNameOf(selectedTeamId)}</span>
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
                        const inv = appState.inventory[seat.id] || {};

                        return (
                          <div
                            key={seat.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, fIdx, lIdx, "lead", sIdx)
                            }
                            className={`seat-card p-2 border-round-xl shadow-2 border-1 cursor-move w-full ${colorId}`}
                          >
                            <div className="flex justify-content-between align-items-center mb-2">
                              <div className="flex gap-1">
                                {/* NÚT NHANH ✔️ ĐỦ BỘ */}
                                <Button
                                  icon="pi pi-check"
                                  size="small"
                                  rounded
                                  severity="success"
                                  className="w-1.5rem h-1.5rem p-0 text-xs font-bold"
                                  title="Check đủ bộ"
                                  onClick={() => markFull(seat.id, true)}
                                />
                                {/* NÚT NHANH 🔄 RESET */}
                                <Button
                                  icon="pi pi-refresh"
                                  size="small"
                                  rounded
                                  severity="secondary"
                                  outlined
                                  className="w-1.5rem h-1.5rem p-0 text-xs"
                                  title="Reset checklist"
                                  onClick={() => markReset(seat.id)}
                                />
                              </div>

                              <Button
                                icon="pi pi-times"
                                size="small"
                                rounded
                                text
                                severity="danger"
                                className="w-1.5rem h-1.5rem p-0 text-xs"
                                title="Xoá cabin"
                                onClick={() =>
                                  removeSeat(fIdx, lIdx, "lead", sIdx)
                                }
                              />
                            </div>

                            {/* NHÃN TEAM TRÊN ĐẦU CABIN */}
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
                            <div className="surface-0 p-2 border-round-lg shadow-1 mt-2 flex flex-column gap-1">
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
                        setActiveLane({ fIdx, lIdx });
                        bulkColorPanel.current?.toggle(e);
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
                        const inv = appState.inventory[seat.id] || {};

                        return (
                          <div
                            key={seat.id}
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, fIdx, lIdx, "agent", sIdx)
                            }
                            className={`seat-card p-2 border-round-xl shadow-1 border-1 cursor-move ${colorId}`}
                            style={{ width: "152px" }}
                          >
                            <div className="flex justify-content-between align-items-center mb-1">
                              <div className="flex gap-1">
                                {/* NÚT NHANH ✔️ ĐỦ BỘ */}
                                <Button
                                  icon="pi pi-check"
                                  size="small"
                                  rounded
                                  severity="success"
                                  className="w-1.3rem h-1.3rem p-0 text-xs font-bold"
                                  title="Check đủ bộ"
                                  onClick={() => markFull(seat.id, false)}
                                />
                                {/* NÚT NHANH 🔄 RESET */}
                                <Button
                                  icon="pi pi-refresh"
                                  size="small"
                                  rounded
                                  severity="secondary"
                                  outlined
                                  className="w-1.3rem h-1.3rem p-0 text-xs"
                                  title="Reset checklist"
                                  onClick={() => markReset(seat.id)}
                                />
                              </div>

                              <Button
                                icon="pi pi-times"
                                size="small"
                                rounded
                                text
                                severity="danger"
                                className="w-1.3rem h-1.3rem p-0 text-xs"
                                title="Xoá cabin"
                                onClick={() =>
                                  removeSeat(fIdx, lIdx, "agent", sIdx)
                                }
                              />
                            </div>

                            {/* NHÃN TEAM TRÊN ĐẦU CABIN */}
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
                            <div className="surface-0 p-1.5 border-round-lg shadow-1 mt-2 flex flex-column gap-1 mt-auto">
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
    </div>
  );
}
