import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
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

const DEFAULT_TEAMS = [
  { id: "fill-lead", name: "Lead", dotColor: "#2563eb" },
  { id: "fill-pink", name: "User", dotColor: "#ec4899" },
  { id: "fill-orange", name: "Social", dotColor: "#f97316" },
  { id: "fill-cyan", name: "Merchant", dotColor: "#06b6d4" },
  { id: "fill-yellow", name: "Night/Senior", dotColor: "#eab308" },
  { id: "fill-purple", name: "SPT/PT", dotColor: "#8b5cf6" },
  { id: "fill-grey", name: "Trống", dotColor: "#6b7280" },
];

const genId = () => "s_" + Math.random().toString(36).substr(2, 9);

const getTeam = (teams, colorId) => {
  const safeTeams = Array.isArray(teams) && teams.length ? teams : DEFAULT_TEAMS;
  return (
    safeTeams.find((t) => t?.id === colorId) || {
      id: colorId || "fill-grey",
      name: "Khác",
      dotColor: "#9ca3af",
    }
  );
};

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

function InlineEdit({ value, onChange, placeholder, className, isStt = false, isName = false, readOnly = false }) {
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
        className={`p-1 text-xs font-bold w-full ${isName ? "compact-cabin-name-input" : ""} ${isStt ? "w-4rem text-center" : ""}`}
        aria-label={placeholder || "Chỉnh sửa tên"}
      />
    );
  }

  return (
    <div
      className={`${className || ""} inline-edit-display ${isStt ? "stt-display" : ""} ${isName ? "inline-edit-name" : "text-overflow-ellipsis white-space-nowrap overflow-hidden"} cursor-pointer`}
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

const TeamGridMenu = ({ teams, activeColorId, onClick, readOnly = false }) => {
  const safeTeams = Array.isArray(teams) ? teams.filter((team) => team?.id) : DEFAULT_TEAMS;
  return (
    <div className="team-grid-container" role="menu" aria-label="Chọn Team">
      <div className="team-grid-title font-bold text-xs mb-2">Chọn Team</div>
      <div className="team-grid flex flex-column gap-1">
        {safeTeams.map((team) => {
          const active = team.id === activeColorId;
          return (
            <button
              key={team.id}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              className={`team-grid-item flex align-items-center gap-2 p-2 border-round surface-hover cursor-pointer w-full text-left border-none ${active ? "is-active font-bold" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!readOnly && onClick) {
                  onClick(team.id);
                }
              }}
              disabled={readOnly}
            >
              <span className="team-grid-dot inline-block border-circle" style={{ width: "12px", height: "12px", backgroundColor: team.dotColor || "#9ca3af" }} aria-hidden="true" />
              <span className="team-grid-name flex-1 text-xs">{team.name || "Khác"}</span>
              {active && <i className="pi pi-check text-xs text-primary" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TeamTag = ({ team, onOpen, readOnly = false }) => {
  const safeTeam = team || getTeam(DEFAULT_TEAMS, "fill-grey");
  return (
    <button
      type="button"
      className="compact-cabin-team team-tag flex align-items-center gap-1 border-none bg-transparent cursor-pointer p-1 border-round hover:surface-200"
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly && onOpen) {
          onOpen(e);
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={`Đổi Team cho cabin. Team hiện tại: ${safeTeam.name}`}
      title={readOnly ? "Chế độ xem" : "Click để đổi Team cho cabin"}
      disabled={readOnly}
    >
      <span className="team-tag-dot border-circle" style={{ width: "8px", height: "8px", backgroundColor: safeTeam.dotColor }} aria-hidden="true" />
      <span className="team-tag-label text-xs">{safeTeam.name}</span>
      <i className="pi pi-chevron-down text-xs opacity-60" aria-hidden="true" />
    </button>
  );
};

const defaultData = [
  {
    floorName: "Sàn Lầu 3",
    lanes: [
      {
        laneLetter: "A",
        startStt: 18,
        leads: [{ id: genId(), name: "Thu Hiền - TL" }],
        agents: ["Trần Chi", "Nguyễn Trâm", "Trần Trinh", "Nguyễn Thiên", "Đoàn Giao", "NB Content", "NB Content", "Lê Trinh", "Nguyễn Tỷ", "Cao Nhung", "Huỳnh Ngà", "Huỳnh Châu", "Lê Châu", "Trống", "Trống"].map((n, i) => ({ id: genId(), name: n, stt: 18 + i })),
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
        agents: ["Trống", "Thiên Kim Senior", "Kim Ái Senior", "Huy Hoàng", "Diệu Trinh"].map((n, i) => ({ id: genId(), name: n, stt: 1 + i })),
      },
    ],
  },
];

export default function App() {
  const toast = useRef(null);
  const [data, setData] = useState(defaultData);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [colors, setColors] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [readOnly, setReadOnly] = useState(false);

  const closeMenu = useCallback(() => setOpenMenu(null), []);

  useEffect(() => {
    if (!openMenu) return undefined;
    const handlePointerDown = (event) => {
      if (!event.target.closest(".dropdown-portal") && !event.target.closest(".compact-cabin-team")) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openMenu, closeMenu]);

  const handleColorChange = (agentId, colorId) => {
    setColors((prev) => ({
      ...prev,
      [agentId]: colorId,
    }));
    closeMenu();
  };

  const toggleTeamMenu = (e, agentId) => {
    e.stopPropagation();
    if (openMenu?.agentId === agentId) {
      closeMenu();
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setOpenMenu({
        agentId,
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  const renderAgentCell = (agent, laneIndex, agentIndex, floorIndex) => {
    if (!agent) return null;

    const colorId = colors[agent.id] || "fill-grey";
    const currentTeam = getTeam(teams, colorId);

    return (
      <div key={agent.id || agentIndex} className="compact-cabin-card flex flex-column p-2 border-1 surface-border border-round mb-2 bg-white">
        <div className="flex align-items-center justify-content-between mb-1">
          <span className="font-bold text-xs">{agent.stt ? `#${agent.stt}` : ""}</span>
          <TeamTag
            team={currentTeam}
            readOnly={readOnly}
            onOpen={(e) => toggleTeamMenu(e, agent.id)}
          />
        </div>
        <InlineEdit
          value={agent.name}
          isName={true}
          readOnly={readOnly}
          onChange={(newVal) => {
            const newData = [...data];
            newData[floorIndex].lanes[laneIndex].agents[agentIndex].name = newVal;
            setData(newData);
          }}
        />
      </div>
    );
  };

  return (
    <div className="layout-wrapper p-4">
      <Toast ref={toast} />
      <h2 className="text-xl font-bold mb-4">Quản Lý Sơ Đồ Chỗ Ngồi</h2>

      {data.map((floor, floorIdx) => (
        <div key={floorIdx} className="floor-block mb-4">
          <h3 className="text-lg font-bold mb-2">{floor.floorName}</h3>
          <div className="lanes-wrapper flex gap-4 overflow-auto">
            {floor.lanes.map((lane, laneIdx) => (
              <div key={laneIdx} className="lane-column surface-100 p-3 border-round" style={{ minWidth: "220px" }}>
                <h4 className="font-bold mb-2">Dãy {lane.laneLetter}</h4>
                <div className="agents-list">
                  {lane.agents.map((agent, agentIdx) =>
                    renderAgentCell(agent, laneIdx, agentIdx, floorIdx)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {openMenu &&
        createPortal(
          <div
            className="dropdown-portal fixed bg-white shadow-4 border-round p-2 z-5"
            style={{
              top: `${openMenu.top}px`,
              left: `${openMenu.left}px`,
              minWidth: "160px",
            }}
          >
            <TeamGridMenu
              teams={teams}
              activeColorId={colors[openMenu.agentId] || "fill-grey"}
              readOnly={readOnly}
              onClick={(teamId) => handleColorChange(openMenu.agentId, teamId)}
            />
          </div>,
          document.body
        )}
  </div>
  );
}
