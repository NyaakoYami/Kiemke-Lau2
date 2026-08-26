import React, { useState, useEffect } from "react";
import "./App.css";

// --- DỮ LIỆU MẪU & LOGIC ---
const initialFloors = [
  {
    floorName: "Sàn Lầu 2",
    lanes: [
      { laneLetter: "A", leads: [{ id: "l1", name: "Oanh - TL", stt: 1 }], agents: [{ id: "a1", name: "Nguyễn Văn A", stt: 2 }] }
    ]
  },
  {
    floorName: "Sàn Lầu 3",
    lanes: [
      { laneLetter: "B", leads: [{ id: "l2", name: "Vy - DA", stt: 1 }], agents: [{ id: "a2", name: "Trần B", stt: 2 }] }
    ]
  }
];

export default function AssetManagementApp() {
  // --- STATE QUẢN LÝ ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [floors, setFloors] = useState(initialFloors);
  const [inventory, setInventory] = useState({
    "l1": { laptop_type: "premium", man24: true },
    "l2": { laptop_type: "basic" },
  });

  // --- LOGIC AUTHENTICATION ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (authEmail.trim().toLowerCase().endsWith("@vietmyssu.com")) {
      setIsAdmin(true);
      setAuthEmail("");
    } else {
      alert("Vui lòng sử dụng email nội bộ @vietmyssu.com");
    }
  };

  const handleLogout = () => setIsAdmin(false);

  // --- LOGIC THỐNG KÊ (FLOOR BREAKDOWN) ---
  const floorBreakdown = floors.map(floor => {
    const totalAssets = floor.lanes.reduce((acc, lane) => acc + lane.leads.length + lane.agents.length, 0);
    return { name: floor.floorName, count: totalAssets };
  });

  // --- LOGIC CẬP NHẬT TÀI SẢN ---
  const updateInventory = (id, field, value) => {
    if (!isAdmin) return;
    setInventory(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR TƯƠNG TỰ ẢNH THAM CHIẾU */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">C</div>
          <span className="brand-name">Codename.com</span>
        </div>
        <nav aria-label="Main Navigation">
          <ul>
            <li>
              <a href="#dashboard" className="nav-item active">
                {/* Heroicon: Chart Pie */}
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Dashboard
              </a>
            </li>
            <li>
              <a href="#reports" className="nav-item">
                <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                New Report
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HEADER & AUTH */}
        <header className="top-header">
          <div className="search-bar">
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Tìm kiếm tài sản..." aria-label="Search" />
          </div>
          
          <div className="auth-zone">
            {!isAdmin ? (
              <form onSubmit={handleLogin} className="login-form">
                <label htmlFor="login-email" className="sr-only">Email Admin</label>
                <input 
                  id="login-email"
                  type="email" 
                  placeholder="Email @vietmyssu.com" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required 
                />
                <button type="submit" className="btn btn-primary">Chế độ Edit</button>
              </form>
            ) : (
              <div className="admin-profile">
                <span className="admin-badge">Admin Mode</span>
                <button onClick={handleLogout} className="btn btn-outline">Thoát</button>
              </div>
            )}
          </div>
        </header>

        {/* TÍNH NĂNG 1: FLOOR BREAKDOWN (THỐNG KÊ THEO LẦU) */}
        <section className="dashboard-summary" aria-labelledby="summary-heading">
          <h1 id="summary-heading" className="page-title">Quản lý kiểm kê tài sản</h1>
          
          <div className="floor-breakdown-cards">
            {floorBreakdown.map((floor, idx) => (
              <article key={idx} className="stat-card">
                <p className="stat-title">{floor.name}</p>
                <p className="stat-value">{floor.count} <span>thiết bị</span></p>
                <div className="stat-chart-mock"></div>
              </article>
            ))}
          </div>
        </section>

        {/* DANH SÁCH TÀI SẢN */}
        <section className="asset-list">
          {floors.map((floor, fIdx) => (
            <div key={fIdx} className="floor-section">
              <h2 className="floor-title">{floor.floorName}</h2>
              
              {floor.lanes.map((lane, lIdx) => (
                <div key={lIdx} className="lane-group">
                  <h3 className="lane-title">Dãy {lane.laneLetter}</h3>
                  
                  <div className="seat-grid">
                    {/* LEADS (VỚI TÍNH NĂNG 2: PHÂN LOẠI LAPTOP) */}
                    {lane.leads.map(lead => (
                      <article key={lead.id} className="seat-card lead-card">
                        <header className="seat-header">
                          <span className="tag tag-lead">LEAD</span>
                          <h4>{lead.name}</h4>
                        </header>
                        <div className="seat-body">
                          {/* Dropdown chọn Option Laptop cho Lead */}
                          <div className="form-group">
                            <label htmlFor={`laptop-select-${lead.id}`}>Cấp phát Laptop:</label>
                            <select 
                              id={`laptop-select-${lead.id}`}
                              value={inventory[lead.id]?.laptop_type || "none"}
                              onChange={(e) => updateInventory(lead.id, "laptop_type", e.target.value)}
                              disabled={!isAdmin}
                            >
                              <option value="none">Không cấp Laptop</option>
                              <option value="basic">1. Laptop + Sạc + Chuột</option>
                              <option value="premium">2. Laptop + Sạc + Chuột + Túi chống sốc</option>
                            </select>
                          </div>
                          <div className="checkbox-group">
                            <label>
                              <input 
                                type="checkbox" 
                                checked={inventory[lead.id]?.man24 || false}
                                onChange={(e) => updateInventory(lead.id, "man24", e.target.checked)}
                                disabled={!isAdmin} 
                              />
                              Màn hình 24"
                            </label>
                          </div>
                        </div>
                      </article>
                    ))}

                    {/* AGENTS */}
                    {lane.agents.map(agent => (
                      <article key={agent.id} className="seat-card agent-card">
                        <header className="seat-header">
                          <span className="tag tag-agent">AGENT</span>
                          <h4>{agent.name}</h4>
                        </header>
                        <div className="seat-body">
                           <div className="checkbox-group">
                            <label>
                              <input 
                                type="checkbox" 
                                checked={inventory[agent.id]?.man20 || false}
                                onChange={(e) => updateInventory(agent.id, "man20", e.target.checked)}
                                disabled={!isAdmin} 
                              />
                              Màn hình 20"
                            </label>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
