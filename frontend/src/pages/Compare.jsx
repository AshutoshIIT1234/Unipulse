import { useState, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { fetchAllIITs, getWeeklySummary } from "../api";

// ── Static mock data (replace with fetchAllIITs() API call later) ──
const IIT_DATA = {
  "IITB": {
    full: "IIT Bombay", location: "Mumbai, MH", founded: 1958,
    color: "#f97316", overall: 68, trend: "up", posts: 2341, students: 10000,
    categories: [
      { name: "Academics",     score: 74 },
      { name: "Placements",    score: 87 },
      { name: "Hostel Life",   score: 61 },
      { name: "Fests",         score: 82 },
      { name: "Mental Health", score: 38 },
      { name: "Admin",         score: 34 },
      { name: "Infrastructure",score: 71 },
    ],
    strengths: ["Top placements", "Research output", "Cultural fests"],
    concerns:  ["Mental health support", "Admin responsiveness"],
  },
  "IITM": {
    full: "IIT Madras", location: "Chennai, TN", founded: 1959,
    color: "#0ea5e9", overall: 72, trend: "up", posts: 1987, students: 9500,
    categories: [
      { name: "Academics",     score: 80 },
      { name: "Placements",    score: 89 },
      { name: "Hostel Life",   score: 65 },
      { name: "Fests",         score: 76 },
      { name: "Mental Health", score: 41 },
      { name: "Admin",         score: 52 },
      { name: "Infrastructure",score: 79 },
    ],
    strengths: ["Online BS program", "Infrastructure", "Placements"],
    concerns:  ["Core branch sentiment", "Mental health resources"],
  },
  "IITP": {
    full: "IIT Patna", location: "Patna, BR", founded: 2008,
    color: "#a855f7", overall: 51, trend: "neutral", posts: 743, students: 3200,
    categories: [
      { name: "Academics",     score: 62 },
      { name: "Placements",    score: 58 },
      { name: "Hostel Life",   score: 44 },
      { name: "Fests",         score: 55 },
      { name: "Mental Health", score: 36 },
      { name: "Admin",         score: 40 },
      { name: "Infrastructure",score: 42 },
    ],
    strengths: ["Campus construction progress", "Growing placements"],
    concerns:  ["Infrastructure gaps", "Connectivity", "Library resources"],
  },
  "IITD": {
    full: "IIT Delhi", location: "New Delhi", founded: 1961,
    color: "#10b981", overall: 70, trend: "up", posts: 2108, students: 8500,
    categories: [
      { name: "Academics",     score: 78 },
      { name: "Placements",    score: 86 },
      { name: "Hostel Life",   score: 62 },
      { name: "Fests",         score: 73 },
      { name: "Mental Health", score: 40 },
      { name: "Admin",         score: 45 },
      { name: "Infrastructure",score: 75 },
    ],
    strengths: ["Metro connectivity", "Startup ecosystem", "Placements"],
    concerns:  ["Hostel allocation", "Mental health wait times"],
  },
  "IITKgp": {
    full: "IIT Kharagpur", location: "Kharagpur, WB", founded: 1951,
    color: "#f43f5e", overall: 65, trend: "neutral", posts: 2567, students: 12000,
    categories: [
      { name: "Academics",     score: 72 },
      { name: "Placements",    score: 80 },
      { name: "Hostel Life",   score: 58 },
      { name: "Fests",         score: 85 },
      { name: "Mental Health", score: 36 },
      { name: "Admin",         score: 39 },
      { name: "Infrastructure",score: 55 },
    ],
    strengths: ["Spring Fest", "Largest campus", "Legacy & alumni"],
    concerns:  ["Aging infrastructure", "Remote location", "Admin"],
  },
  "IITBHU": {
    full: "IIT BHU", location: "Varanasi, UP", founded: 1919,
    color: "#eab308", overall: 57, trend: "up", posts: 1124, students: 6500,
    categories: [
      { name: "Academics",     score: 66 },
      { name: "Placements",    score: 64 },
      { name: "Hostel Life",   score: 52 },
      { name: "Fests",         score: 70 },
      { name: "Mental Health", score: 38 },
      { name: "Admin",         score: 37 },
      { name: "Infrastructure",score: 48 },
    ],
    strengths: ["Kashi city culture", "Technex fest", "Oldest IIT"],
    concerns:  ["Lab equipment", "Faculty shortage", "Infrastructure"],
  },
  "IITG": {
    full: "IIT Guwahati", location: "Guwahati, AS", founded: 1994,
    color: "#06b6d4", overall: 63, trend: "up", posts: 1034, students: 5800,
    categories: [
      { name: "Academics",     score: 70 },
      { name: "Placements",    score: 71 },
      { name: "Hostel Life",   score: 67 },
      { name: "Fests",         score: 74 },
      { name: "Mental Health", score: 44 },
      { name: "Admin",         score: 48 },
      { name: "Infrastructure",score: 61 },
    ],
    strengths: ["Scenic campus", "Techniche fest", "Hostel satisfaction"],
    concerns:  ["Travel costs", "Northeast connectivity"],
  },
};

const IIT_KEYS   = Object.keys(IIT_DATA);
const CATEGORIES = ["Academics","Placements","Hostel Life","Fests","Mental Health","Admin","Infrastructure"];

const RANKED = [...IIT_KEYS].sort((a, b) => IIT_DATA[b].overall - IIT_DATA[a].overall);

// ── Helpers ──────────────────────────────────────────────────────────────────
const getScoreColor = (s) => s >= 70 ? "#10b981" : s >= 55 ? "#f59e0b" : "#ef4444";
const getTrendIcon  = (t) => t === "up" ? "▲" : t === "down" ? "▼" : "→";
const getTrendColor = (t) => t === "up" ? "#10b981" : t === "down" ? "#ef4444" : "#f59e0b";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0d1117", border:"1px solid #30363d", borderRadius:8, padding:"10px 14px", fontSize:11, fontFamily:"monospace" }}>
      <div style={{ color:"#8b949e", marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill || p.color, marginBottom:2 }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
};

function RankCard({ rank, iitKey, isSelected, onClick, data }) {
  const d = data || IIT_DATA[iitKey];
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div
      onClick={() => onClick(iitKey)}
      style={{
        background: isSelected ? `linear-gradient(135deg, rgba(22, 27, 34, 0.9), ${d.color}08)` : "rgba(22, 27, 34, 0.75)",
        border: `1px solid ${isSelected ? d.color + "50" : "#21262d"}`,
        borderLeft: `4px solid ${isSelected ? d.color : "#21262d"}`,
        borderRadius: "12px",
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        marginBottom: "8px",
        boxShadow: isSelected ? `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px ${d.color}08` : "0 4px 12px rgba(0,0,0,0.15)"
      }}
      className="rank-card"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "16px", width: "24px", textAlign: "center", fontFamily: "'IBM Plex Mono', monospace" }}>
          {medals[rank] || `#${rank + 1}`}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? d.color : "#c9d1d9", transition: "color 0.2s" }}>
              {d.full}
            </span>
            <span style={{
              fontSize: "14px",
              fontWeight: 800,
              color: getScoreColor(d.overall),
              fontFamily: "'IBM Plex Mono', monospace"
            }}>{d.overall}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", alignItems: "center" }}>
            <div style={{ height: "3px", flex: 1, background: "#21262d", borderRadius: "1.5px", marginRight: "10px" }}>
              <div style={{ height: "100%", width: `${d.overall}%`, background: d.color, borderRadius: "1.5px", transition: "width 0.6s" }} />
            </div>
            <span style={{ fontSize: "9px", color: getTrendColor(d.trend), fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>
              {getTrendIcon(d.trend)} {d.trend.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: "9px", color: "#8b949e", marginTop: "4px" }}>
            {d.location} &nbsp;•&nbsp; <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{d.posts.toLocaleString()}</span> posts
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(22, 27, 34, 0.75)",
      border: "1px solid #21262d",
      borderTop: `3px solid ${color}`,
      borderRadius: "8px",
      padding: "12px 14px",
      flex: 1,
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
    }}>
      <div style={{ fontSize: "16px", fontWeight: 900, color, fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      <div style={{
        fontSize: "8px",
        color: "#8b949e",
        marginTop: "3px",
        letterSpacing: "1px",
        textTransform: "uppercase",
        fontWeight: 700,
        fontFamily: "'IBM Plex Mono', monospace"
      }}>{label}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Compare() {
  const [selectedIITs, setSelectedIITs] = useState(["IITB","IITM","IITD"]);
  const [focusIIT,     setFocusIIT]     = useState(null);
  const [activeTab,    setActiveTab]    = useState("leaderboard");
  const [liveRankings, setLiveRankings] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLiveData = async () => {
      setLoading(true);
      try {
        const data = await fetchAllIITs();
        if (Array.isArray(data)) {
          const rankingMap = {};
          data.forEach((item, idx) => {
            rankingMap[item.iit] = { rank: idx + 1, score: item.score, posts: item.posts };
          });
          setLiveRankings(rankingMap);
        }
      } catch (err) {
        console.warn("Using static data - API not available:", err.message);
      }
      setLoading(false);
    };
    loadLiveData();
  }, []);

  const toggleSelect = (key) => {
    setSelectedIITs(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : prev.length < 4 ? [...prev, key] : prev
    );
  };

  const displayIITData = {};
  Object.keys(IIT_DATA).forEach(k => {
    const base = IIT_DATA[k];
    const live = liveRankings[k];
    displayIITData[k] = {
      ...base,
      overall: live ? live.score : base.overall,
      posts: live ? live.posts : base.posts
    };
  });

  const overallBarData = RANKED.map(k => ({
    name:  displayIITData[k].full.replace("IIT ",""),
    score: displayIITData[k].overall,
    color: displayIITData[k].color,
  }));

  const radarData = CATEGORIES.map(cat => {
    const entry = { subject: cat };
    selectedIITs.forEach(k => {
      const found = displayIITData[k].categories.find(c => c.name === cat);
      entry[k] = found ? found.score : 0;
    });
    return entry;
  });

  const catBarData = CATEGORIES.map(cat => {
    const entry = { category: cat.slice(0,6) };
    selectedIITs.forEach(k => {
      const found = displayIITData[k].categories.find(c => c.name === cat);
      entry[k] = found ? found.score : 0;
    });
    return entry;
  });

  const focus = focusIIT ? displayIITData[focusIIT] : null;

  return (
    <div style={{
      minHeight: "calc(100vh - 73px)",
      background: "#0d1117",
      color: "#c9d1d9",
      fontFamily: "'Inter', sans-serif",
      padding: "24px",
    }}>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, color: "#f97316", letterSpacing: "-0.5px" }}>
          ⚡ IIT Sentiment <span style={{ color: "#f0f6fc" }}>Telemetry</span>
        </div>
        <div style={{
          fontSize: "10px",
          color: "#8b949e",
          marginTop: "4px",
          letterSpacing: "1.5px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "'IBM Plex Mono', monospace"
        }}>
          <span>REDDIT TELEMETRY BOARD • ALL 7 IITs ANALYZED</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: liveRankings.length > 0 ? "#10b981" : "#f59e0b",
              boxShadow: `0 0 6px ${liveRankings.length > 0 ? "#10b981" : "#f59e0b"}`
            }} />
            <span style={{ color: liveRankings.length > 0 ? "#10b981" : "#f59e0b" }}>
              {liveRankings.length > 0 ? "LIVE API ACTIVE" : "STATIC SIMULATOR"}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display: "flex",
        gap: "4px",
        marginBottom: "24px",
        background: "rgba(22, 27, 34, 0.5)",
        borderRadius: "8px",
        padding: "4px",
        width: "fit-content",
        border: "1px solid #21262d",
      }}>
        {["leaderboard", "radar", "category", "details"].map(t => {
          const isActive = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                padding: "7px 18px",
                borderRadius: "6px",
                border: "none",
                background: isActive ? "#f97316" : "transparent",
                color: isActive ? "#000" : "#8b949e",
                fontWeight: 700,
                fontSize: "10px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                transition: "all 0.2s",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
              className={`compare-tab-btn ${isActive ? 'active' : ''}`}
            >{t}</button>
          );
        })}
      </div>

      {/* ── TAB: LEADERBOARD ── */}
      {activeTab === "leaderboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
          {/* Left — rank cards */}
          <div>
            <div style={{
              fontSize: "9px",
              color: "#8b949e",
              letterSpacing: "1.5px",
              marginBottom: "12px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700
            }}>RANKED SENTIMENT PROFILE</div>
            {RANKED.map((k, i) => (
              <RankCard
                key={k}
                rank={i}
                iitKey={k}
                isSelected={focusIIT === k}
                data={displayIITData[k]}
                onClick={(key) => setFocusIIT(focusIIT === key ? null : key)}
              />
            ))}
          </div>

          {/* Right — bar chart + focus card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Overall scores bar */}
            <div style={{
              background: "rgba(22, 27, 34, 0.75)",
              border: "1px solid #21262d",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
            }}>
              <div style={{
                fontSize: "9px",
                color: "#8b949e",
                letterSpacing: "1.5px",
                marginBottom: "14px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700
              }}>OVERALL SENTIMENT SCORES</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overallBarData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#8b949e" fontSize={10} fontFamily="'IBM Plex Mono', monospace" />
                  <YAxis stroke="#8b949e" fontSize={10} domain={[0, 100]} fontFamily="'IBM Plex Mono', monospace" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                    {overallBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Focus card */}
            {focus && focusIIT && (
              <div style={{
                background: `linear-gradient(135deg, rgba(22, 27, 34, 0.9), ${IIT_DATA[focusIIT].color}08)`,
                border: `1px solid ${IIT_DATA[focusIIT].color}40`,
                borderRadius: "12px",
                padding: "18px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: IIT_DATA[focusIIT].color }}>{focus.full}</div>
                    <div style={{ fontSize: "10px", color: "#8b949e", marginTop: "3px" }}>
                      📍 {focus.location} &nbsp;|&nbsp; Est. {focus.founded} &nbsp;|&nbsp; ~{focus.students.toLocaleString()} students
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: "30px",
                      fontWeight: 900,
                      color: getScoreColor(focus.overall),
                      lineHeight: 1,
                      fontFamily: "'IBM Plex Mono', monospace"
                    }}>{focus.overall}</div>
                    <div style={{ fontSize: "8px", color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, marginTop: "2px" }}>SCORE</div>
                  </div>
                </div>

                {/* mini stats */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <StatBadge label="Posts" value={focus.posts.toLocaleString()} color={IIT_DATA[focusIIT].color} />
                  <StatBadge label="Trend" value={getTrendIcon(focus.trend) + " " + focus.trend.toUpperCase()} color={getTrendColor(focus.trend)} />
                  <StatBadge label="Top Cat" value={[...focus.categories].sort((a, b) => b.score - a.score)[0].name.slice(0, 6)} color="#f59e0b" />
                </div>

                {/* strengths & concerns */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ fontSize: "9px", color: "#10b981", letterSpacing: "1.5px", marginBottom: "8px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>✅ STRENGTHS</div>
                    {focus.strengths.map((s, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "#c9d1d9", marginBottom: "4px" }}>• {s}</div>
                    ))}
                  </div>
                  <div style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ fontSize: "9px", color: "#ef4444", letterSpacing: "1.5px", marginBottom: "8px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>⚠️ CONCERNS</div>
                    {focus.concerns.map((c, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "#c9d1d9", marginBottom: "4px" }}>• {c}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!focusIIT && (
              <div style={{
                background: "rgba(22, 27, 34, 0.4)",
                border: "1px dashed #21262d",
                borderRadius: "12px",
                padding: "28px",
                textAlign: "center",
                color: "#8b949e",
                fontSize: "12px",
              }}>
                📊 Click any Rank Card to inspect detailed telemetry profile
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: RADAR ── */}
      {activeTab === "radar" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>
          {/* Selector */}
          <div>
            <div style={{
              fontSize: "9px",
              color: "#8b949e",
              letterSpacing: "1.5px",
              marginBottom: "12px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700
            }}>SELECT UP TO 4 IITs</div>
            {IIT_KEYS.map(k => {
              const d = IIT_DATA[k];
              const active = selectedIITs.includes(k);
              return (
                <div
                  key={k}
                  onClick={() => toggleSelect(k)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "6px",
                    cursor: "pointer",
                    background: active ? `${d.color}08` : "rgba(22, 27, 34, 0.4)",
                    border: `1px solid ${active ? d.color + "50" : "#21262d"}`,
                    transition: "all 0.15s",
                  }}
                  className="selector-item"
                >
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: active ? d.color : "#21262d",
                    border: `2px solid ${d.color}`,
                    transition: "background 0.2s",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: active ? 700 : 500, color: active ? d.color : "#c9d1d9" }}>{d.full}</div>
                    <div style={{ fontSize: "9px", color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace" }}>{d.overall}/100 score</div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: "9px", color: "#8b949e", marginTop: "10px", fontFamily: "'IBM Plex Mono', monospace" }}>
              📊 {selectedIITs.length}/4 selected
            </div>
          </div>

          {/* Radar chart */}
          <div style={{
            background: "rgba(22, 27, 34, 0.75)",
            border: "1px solid #21262d",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{
              fontSize: "9px",
              color: "#8b949e",
              letterSpacing: "1.5px",
              marginBottom: "14px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700
            }}>MULTI-DIMENSIONAL RADAR PROFILE</div>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#21262d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#8b949e", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }} />
                {selectedIITs.map(k => (
                  <Radar
                    key={k}
                    name={IIT_DATA[k].full}
                    dataKey={k}
                    stroke={IIT_DATA[k].color}
                    fill={IIT_DATA[k].color}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "12px" }}>
              {selectedIITs.map(k => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#c9d1d9" }}>
                  <div style={{ width: "12px", height: "3px", background: IIT_DATA[k].color, borderRadius: "2px" }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", fontWeight: 700 }}>{k}</span> {IIT_DATA[k].full}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CATEGORY ── */}
      {activeTab === "category" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* selector row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{
              fontSize: "9px",
              color: "#8b949e",
              letterSpacing: "1.5px",
              marginRight: "4px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700
            }}>COMPARING:</div>
            {IIT_KEYS.map(k => {
              const d = IIT_DATA[k];
              const active = selectedIITs.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleSelect(k)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: active ? d.color : "rgba(22, 27, 34, 0.5)",
                    color: active ? "#000" : "#8b949e",
                    fontWeight: 700,
                    fontSize: "11px",
                    border: `1px solid ${active ? d.color : "#21262d"}`,
                    transition: "all 0.15s",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                  className={`comparison-btn ${active ? 'active' : ''}`}
                >{k}</button>
              );
            })}
          </div>

          {/* Grouped bar chart */}
          <div style={{
            background: "rgba(22, 27, 34, 0.75)",
            border: "1px solid #21262d",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{
              fontSize: "9px",
              color: "#8b949e",
              letterSpacing: "1.5px",
              marginBottom: "16px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700
            }}>CATEGORY COMPARISONS — ACCENT GROUPS</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={catBarData} barGap={2} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" opacity={0.4} />
                <XAxis dataKey="category" stroke="#8b949e" fontSize={10} fontFamily="'IBM Plex Mono', monospace" />
                <YAxis stroke="#8b949e" fontSize={10} domain={[0, 100]} fontFamily="'IBM Plex Mono', monospace" />
                <Tooltip content={<CustomTooltip />} />
                {selectedIITs.map(k => (
                  <Bar
                    key={k}
                    dataKey={k}
                    name={IIT_DATA[k].full}
                    fill={IIT_DATA[k].color}
                    radius={[3, 3, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div style={{
            background: "rgba(22, 27, 34, 0.75)",
            border: "1px solid #21262d",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{
              fontSize: "9px",
              color: "#8b949e",
              letterSpacing: "1.5px",
              marginBottom: "16px",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700
            }}>TELEMETRY MATRIX SCORECARD</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #21262d" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "#8b949e", fontSize: "10px", fontWeight: 700 }}>CATEGORY</th>
                    {IIT_KEYS.map(k => (
                      <th key={k} style={{
                        padding: "10px 14px",
                        color: IIT_DATA[k].color,
                        fontSize: "11px",
                        fontWeight: 700,
                        textAlign: "center"
                      }}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((cat, ri) => (
                    <tr key={cat} style={{
                      background: ri % 2 === 0 ? "rgba(22, 27, 34, 0.3)" : "transparent",
                      borderBottom: "1px solid #21262d"
                    }} className="heatmap-row">
                      <td style={{ padding: "12px 14px", color: "#8b949e", fontSize: "11px", fontWeight: 600 }}>{cat}</td>
                      {IIT_KEYS.map(k => {
                        const found = IIT_DATA[k].categories.find(c => c.name === cat);
                        const score = found ? found.score : 0;
                        const sc = getScoreColor(score);
                        return (
                          <td key={k} style={{ padding: "12px 14px", textAlign: "center" }}>
                            <div style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "4px",
                              background: `${sc}12`,
                              color: sc,
                              fontWeight: 700,
                              fontSize: "11px"
                            }}>{score}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ borderTop: "2px solid #21262d" }}>
                    <td style={{ padding: "14px", color: "#f0f6fc", fontWeight: 700, fontSize: "11px" }}>OVERALL</td>
                    {IIT_KEYS.map(k => {
                      return (
                        <td key={k} style={{ padding: "14px", textAlign: "center" }}>
                          <div style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            background: IIT_DATA[k].color + "18",
                            color: IIT_DATA[k].color,
                            fontWeight: 900,
                            fontSize: "13px"
                          }}>{IIT_DATA[k].overall}</div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: DETAILS ── */}
      {activeTab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {RANKED.map((k, rank) => {
            const d = displayIITData[k];
            const top = [...d.categories].sort((a, b) => b.score - a.score)[0];
            const bot = [...d.categories].sort((a, b) => a.score - b.score)[0];
            return (
              <div
                key={k}
                style={{
                  background: "rgba(22, 27, 34, 0.75)",
                  border: `1px solid ${d.color}40`,
                  borderTop: `3px solid ${d.color}`,
                  borderRadius: "12px",
                  padding: "18px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: d.color }}>{d.full}</div>
                    <div style={{ fontSize: "9px", color: "#8b949e", marginTop: "3px" }}>
                      📍 {d.location} &nbsp;•&nbsp; Est. {d.founded}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: getScoreColor(d.overall),
                      lineHeight: 1,
                      fontFamily: "'IBM Plex Mono', monospace"
                    }}>{d.overall}</div>
                    <div style={{ fontSize: "8px", color: "#8b949e", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, marginTop: "2px" }}>SCORE</div>
                    <div style={{ fontSize: "9px", color: getTrendColor(d.trend), fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, marginTop: "2px" }}>
                      {getTrendIcon(d.trend)} {d.trend.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* mini bars */}
                <div style={{ marginBottom: "14px" }}>
                  {d.categories.map(cat => (
                    <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                      <span style={{ fontSize: "9px", color: "#8b949e", width: "72px", flexShrink: 0 }}>{cat.name.slice(0, 9)}</span>
                      <div style={{ flex: 1, height: "4px", background: "#21262d", borderRadius: "2px" }}>
                        <div style={{
                          height: "100%",
                          width: `${cat.score}%`,
                          background: getScoreColor(cat.score),
                          borderRadius: "2px"
                        }} />
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: getScoreColor(cat.score), width: "24px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>
                        {cat.score}
                      </span>
                    </div>
                  ))}
                </div>

                {/* stats row */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                  <div style={{ flex: 1, background: "#0d1117", borderRadius: "6px", padding: "8px 6px", textAlign: "center", border: "1px solid #21262d" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: d.color, fontFamily: "'IBM Plex Mono', monospace" }}>{d.posts.toLocaleString()}</div>
                    <div style={{ fontSize: "7px", color: "#8b949e", fontWeight: 700 }}>POSTS</div>
                  </div>
                  <div style={{ flex: 1, background: "#0d1117", borderRadius: "6px", padding: "8px 6px", textAlign: "center", border: "1px solid #21262d" }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#f59e0b", fontFamily: "'IBM Plex Mono', monospace" }}>#{rank + 1}</div>
                    <div style={{ fontSize: "7px", color: "#8b949e", fontWeight: 700 }}>RANK</div>
                  </div>
                  <div style={{ flex: 1, background: "#0d1117", borderRadius: "6px", padding: "8px 6px", textAlign: "center", border: "1px solid #21262d" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#10b981", fontFamily: "'IBM Plex Mono', monospace" }}>{top.name.slice(0, 5)}</div>
                    <div style={{ fontSize: "7px", color: "#8b949e", fontWeight: 700 }}>BEST</div>
                  </div>
                  <div style={{ flex: 1, background: "#0d1117", borderRadius: "6px", padding: "8px 6px", textAlign: "center", border: "1px solid #21262d" }}>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#ef4444", fontFamily: "'IBM Plex Mono', monospace" }}>{bot.name.slice(0, 5)}</div>
                    <div style={{ fontSize: "7px", color: "#8b949e", fontWeight: 700 }}>WORST</div>
                  </div>
                </div>

                {/* strengths & concerns */}
                <div style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "6px", padding: "8px 10px", marginBottom: "6px", fontSize: "10px", lineHeight: "1.4" }}>
                  <span style={{ fontSize: "9px", color: "#10b981", letterSpacing: "0.5px", fontWeight: 700 }}>✅ STRENGTHS: </span>
                  <span style={{ color: "#8b949e" }}>{d.strengths.join(" • ")}</span>
                </div>
                <div style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "6px", padding: "8px 10px", fontSize: "10px", lineHeight: "1.4" }}>
                  <span style={{ fontSize: "9px", color: "#ef4444", letterSpacing: "0.5px", fontWeight: 700 }}>⚠️ CONCERNS: </span>
                  <span style={{ color: "#8b949e" }}>{d.concerns.join(" • ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .rank-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.02) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
        }

        .compare-tab-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.03) !important;
          color: #c9d1d9 !important;
        }

        .comparison-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.03) !important;
          color: #c9d1d9 !important;
        }

        .selector-item:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }

        .heatmap-row:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}