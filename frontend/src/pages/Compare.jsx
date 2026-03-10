import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

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

// ── Subcomponents ─────────────────────────────────────────────────────────────
function RankCard({ rank, iitKey, isSelected, onClick }) {
  const d = IIT_DATA[iitKey];
  const medals = ["🥇","🥈","🥉"];
  return (
    <div onClick={() => onClick(iitKey)} style={{
      background: isSelected ? `${d.color}15` : "#161b22",
      border: `1px solid ${isSelected ? d.color+"60" : "#21262d"}`,
      borderLeft: `4px solid ${isSelected ? d.color : "#21262d"}`,
      borderRadius: 10, padding:"14px 16px", cursor:"pointer",
      transition:"all 0.2s", marginBottom: 8,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18, width:28 }}>{medals[rank] || `#${rank+1}`}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:700, color: isSelected ? d.color : "#c9d1d9", fontFamily:"monospace" }}>
              {d.full}
            </span>
            <span style={{ fontSize:16, fontWeight:900, color: getScoreColor(d.overall) }}>{d.overall}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <div style={{ height:4, flex:1, background:"#21262d", borderRadius:2, marginRight:10, marginTop:2 }}>
              <div style={{ height:"100%", width:`${d.overall}%`, background: d.color, borderRadius:2, transition:"width 0.6s" }} />
            </div>
            <span style={{ fontSize:10, color: getTrendColor(d.trend), fontFamily:"monospace" }}>
              {getTrendIcon(d.trend)} {d.trend}
            </span>
          </div>
          <div style={{ fontSize:9, color:"#484f58", marginTop:4, fontFamily:"monospace" }}>
            {d.location} • {d.posts.toLocaleString()} posts
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background:"#161b22", border:"1px solid #21262d",
      borderTop:`3px solid ${color}`, borderRadius:8, padding:"12px 14px", flex:1,
    }}>
      <div style={{ fontSize:18, fontWeight:900, color, fontFamily:"monospace" }}>{value}</div>
      <div style={{ fontSize:9, color:"#484f58", marginTop:3, letterSpacing:"1px", textTransform:"uppercase" }}>{label}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Compare() {
  const [selectedIITs, setSelectedIITs] = useState(["IITB","IITM","IITD"]);
  const [focusIIT,     setFocusIIT]     = useState(null);
  const [activeTab,    setActiveTab]    = useState("leaderboard");

  const toggleSelect = (key) => {
    setSelectedIITs(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(k => k !== key) : prev
        : prev.length < 4 ? [...prev, key] : prev
    );
  };

  // Bar chart — overall scores all 7
  const overallBarData = RANKED.map(k => ({
    name:  IIT_DATA[k].full.replace("IIT ",""),
    score: IIT_DATA[k].overall,
    color: IIT_DATA[k].color,
  }));

  // Radar — selected IITs
  const radarData = CATEGORIES.map(cat => {
    const entry = { subject: cat };
    selectedIITs.forEach(k => {
      const found = IIT_DATA[k].categories.find(c => c.name === cat);
      entry[k] = found ? found.score : 0;
    });
    return entry;
  });

  // Category bar data — selected IITs side by side
  const catBarData = CATEGORIES.map(cat => {
    const entry = { category: cat.slice(0,6) };
    selectedIITs.forEach(k => {
      const found = IIT_DATA[k].categories.find(c => c.name === cat);
      entry[k] = found ? found.score : 0;
    });
    return entry;
  });

  // Focus detail
  const focus = focusIIT ? IIT_DATA[focusIIT] : null;

  return (
    <div style={{
      minHeight:"100vh", background:"#0d1117", color:"#c9d1d9",
      fontFamily:"'IBM Plex Mono', monospace", padding:"24px",
    }}>

      {/* PAGE HEADER */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:22, fontWeight:900, color:"#f0f6fc", letterSpacing:"-1px" }}>
          IIT Sentiment <span style={{ color:"#f97316" }}>Comparison</span>
        </div>
        <div style={{ fontSize:11, color:"#484f58", marginTop:4, letterSpacing:"1px" }}>
          REDDIT-SOURCED INTELLIGENCE • ALL 7 IITs • LAST 30 DAYS
        </div>
      </div>

      {/* TABS */}
      <div style={{
        display:"flex", gap:2, marginBottom:24,
        background:"#161b22", borderRadius:8, padding:4,
        width:"fit-content", border:"1px solid #21262d",
      }}>
        {["leaderboard","radar","category","details"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding:"7px 18px", borderRadius:6, border:"none",
            background: activeTab===t ? "#f97316" : "transparent",
            color: activeTab===t ? "#000" : "#484f58",
            fontWeight: activeTab===t ? 700 : 400,
            fontSize:11, cursor:"pointer", textTransform:"uppercase",
            letterSpacing:"0.5px", transition:"all 0.2s", fontFamily:"inherit",
          }}>{t}</button>
        ))}
      </div>

      {/* ── TAB: LEADERBOARD ── */}
      {activeTab === "leaderboard" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:20 }}>

          {/* Left — rank cards */}
          <div>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:12 }}>
              RANKED BY SENTIMENT SCORE
            </div>
            {RANKED.map((k, i) => (
              <RankCard key={k} rank={i} iitKey={k}
                isSelected={focusIIT===k}
                onClick={(key) => setFocusIIT(focusIIT===key ? null : key)} />
            ))}
          </div>

          {/* Right — bar chart + focus card */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Overall scores bar */}
            <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:10, padding:18 }}>
              <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:14 }}>
                OVERALL SENTIMENT SCORES
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={overallBarData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="name" stroke="#484f58" fontSize={11} />
                  <YAxis stroke="#484f58" fontSize={11} domain={[0,100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" name="Score" radius={[4,4,0,0]}>
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
                background:`${IIT_DATA[focusIIT].color}12`,
                border:`1px solid ${IIT_DATA[focusIIT].color}40`,
                borderRadius:10, padding:18,
                animation:"fadeIn 0.3s ease",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color: IIT_DATA[focusIIT].color }}>{focus.full}</div>
                    <div style={{ fontSize:10, color:"#484f58", marginTop:3 }}>
                      📍 {focus.location} &nbsp;|&nbsp; Est. {focus.founded} &nbsp;|&nbsp; ~{focus.students.toLocaleString()} students
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:32, fontWeight:900, color: getScoreColor(focus.overall), lineHeight:1 }}>
                      {focus.overall}
                    </div>
                    <div style={{ fontSize:8, color:"#484f58" }}>SCORE</div>
                  </div>
                </div>

                {/* mini stats */}
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  <StatBadge label="Posts"    value={focus.posts.toLocaleString()} color={IIT_DATA[focusIIT].color} />
                  <StatBadge label="Trend"    value={getTrendIcon(focus.trend)+" "+focus.trend} color={getTrendColor(focus.trend)} />
                  <StatBadge label="Top Cat"  value={[...focus.categories].sort((a,b)=>b.score-a.score)[0].name.slice(0,6)} color="#f59e0b" />
                </div>

                {/* strengths & concerns */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div style={{ background:"#10b98112", border:"1px solid #10b98130", borderRadius:8, padding:12 }}>
                    <div style={{ fontSize:9, color:"#10b981", letterSpacing:"2px", marginBottom:8 }}>✅ STRENGTHS</div>
                    {focus.strengths.map((s,i) => (
                      <div key={i} style={{ fontSize:11, color:"#c9d1d9", marginBottom:4 }}>• {s}</div>
                    ))}
                  </div>
                  <div style={{ background:"#ef444412", border:"1px solid #ef444430", borderRadius:8, padding:12 }}>
                    <div style={{ fontSize:9, color:"#ef4444", letterSpacing:"2px", marginBottom:8 }}>⚠️ CONCERNS</div>
                    {focus.concerns.map((c,i) => (
                      <div key={i} style={{ fontSize:11, color:"#c9d1d9", marginBottom:4 }}>• {c}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!focusIIT && (
              <div style={{
                background:"#161b22", border:"1px dashed #21262d",
                borderRadius:10, padding:24, textAlign:"center", color:"#484f58", fontSize:12,
              }}>
                👆 Click any IIT card to see detailed insights
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: RADAR ── */}
      {activeTab === "radar" && (
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:20 }}>

          {/* Selector */}
          <div>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:12 }}>
              SELECT UP TO 4 IITs
            </div>
            {IIT_KEYS.map(k => {
              const d = IIT_DATA[k];
              const active = selectedIITs.includes(k);
              return (
                <div key={k} onClick={() => toggleSelect(k)} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"10px 14px", borderRadius:8, marginBottom:6, cursor:"pointer",
                  background: active ? `${d.color}15` : "#161b22",
                  border:`1px solid ${active ? d.color+"50" : "#21262d"}`,
                  transition:"all 0.15s",
                }}>
                  <div style={{
                    width:12, height:12, borderRadius:3,
                    background: active ? d.color : "#21262d",
                    border:`2px solid ${d.color}`,
                    transition:"background 0.2s",
                  }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight: active ? 700:400, color: active ? d.color:"#8b949e" }}>{d.full}</div>
                    <div style={{ fontSize:9, color:"#484f58" }}>{d.overall}/100</div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize:9, color:"#484f58", marginTop:8, letterSpacing:"1px" }}>
              {selectedIITs.length}/4 selected
            </div>
          </div>

          {/* Radar chart */}
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:10, padding:20 }}>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:14 }}>
              MULTI-DIMENSIONAL COMPARISON
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#21262d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:"#484f58", fontSize:11 }} />
                {selectedIITs.map(k => (
                  <Radar key={k} name={IIT_DATA[k].full} dataKey={k}
                    stroke={IIT_DATA[k].color} fill={IIT_DATA[k].color}
                    fillOpacity={0.15} strokeWidth={2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:8 }}>
              {selectedIITs.map(k => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#8b949e" }}>
                  <div style={{ width:12, height:3, background: IIT_DATA[k].color, borderRadius:2 }} />
                  {IIT_DATA[k].full}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: CATEGORY ── */}
      {activeTab === "category" && (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* IIT selector row */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", alignSelf:"center", marginRight:4 }}>
              COMPARE:
            </div>
            {IIT_KEYS.map(k => {
              const d = IIT_DATA[k];
              const active = selectedIITs.includes(k);
              return (
                <button key={k} onClick={() => toggleSelect(k)} style={{
                  padding:"6px 14px", borderRadius:6, border:"none", cursor:"pointer",
                  background: active ? d.color : "#161b22",
                  color: active ? "#000" : "#484f58",
                  fontWeight: active ? 700:400, fontSize:12,
                  border:`1px solid ${active ? d.color : "#21262d"}`,
                  transition:"all 0.15s", fontFamily:"inherit",
                }}>{k}</button>
              );
            })}
          </div>

          {/* Grouped bar chart */}
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:10, padding:20 }}>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:16 }}>
              CATEGORY-WISE SCORES — SIDE BY SIDE
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={catBarData} barGap={2} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="category" stroke="#484f58" fontSize={10} />
                <YAxis stroke="#484f58" fontSize={10} domain={[0,100]} />
                <Tooltip content={<CustomTooltip />} />
                {selectedIITs.map(k => (
                  <Bar key={k} dataKey={k} name={IIT_DATA[k].full}
                    fill={IIT_DATA[k].color} radius={[3,3,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category heatmap table */}
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:10, padding:20 }}>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:16 }}>
              SCORE HEATMAP TABLE
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"monospace" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign:"left", padding:"8px 12px", color:"#484f58", fontSize:10, borderBottom:"1px solid #21262d" }}>
                      CATEGORY
                    </th>
                    {IIT_KEYS.map(k => (
                      <th key={k} style={{
                        padding:"8px 12px", color: IIT_DATA[k].color,
                        fontSize:11, borderBottom:"1px solid #21262d", textAlign:"center",
                      }}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((cat, ri) => (
                    <tr key={cat} style={{ background: ri%2===0 ? "#0d1117" : "transparent" }}>
                      <td style={{ padding:"10px 12px", color:"#8b949e", fontSize:11 }}>{cat}</td>
                      {IIT_KEYS.map(k => {
                        const found = IIT_DATA[k].categories.find(c => c.name === cat);
                        const score = found ? found.score : 0;
                        const sc    = getScoreColor(score);
                        return (
                          <td key={k} style={{ padding:"10px 12px", textAlign:"center" }}>
                            <div style={{
                              display:"inline-block", padding:"3px 10px", borderRadius:5,
                              background:`${sc}18`, color:sc, fontWeight:700, fontSize:12,
                            }}>{score}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ borderTop:"2px solid #21262d" }}>
                    <td style={{ padding:"10px 12px", color:"#f0f6fc", fontWeight:700, fontSize:11 }}>OVERALL</td>
                    {IIT_KEYS.map(k => {
                      const sc = getScoreColor(IIT_DATA[k].overall);
                      return (
                        <td key={k} style={{ padding:"10px 12px", textAlign:"center" }}>
                          <div style={{
                            display:"inline-block", padding:"4px 12px", borderRadius:5,
                            background: IIT_DATA[k].color+"25",
                            color: IIT_DATA[k].color, fontWeight:900, fontSize:14,
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
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:16 }}>
          {RANKED.map((k, rank) => {
            const d   = IIT_DATA[k];
            const top = [...d.categories].sort((a,b) => b.score - a.score)[0];
            const bot = [...d.categories].sort((a,b) => a.score - b.score)[0];
            return (
              <div key={k} style={{
                background:"#161b22", border:`1px solid ${d.color}40`,
                borderTop:`3px solid ${d.color}`, borderRadius:10, padding:18,
              }}>
                {/* Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color: d.color }}>{d.full}</div>
                    <div style={{ fontSize:9, color:"#484f58", marginTop:3 }}>
                      📍 {d.location} &nbsp;•&nbsp; Est. {d.founded}
                    </div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:26, fontWeight:900, color: getScoreColor(d.overall), lineHeight:1 }}>{d.overall}</div>
                    <div style={{ fontSize:8, color:"#484f58" }}>SCORE</div>
                    <div style={{ fontSize:10, color: getTrendColor(d.trend) }}>
                      {getTrendIcon(d.trend)} {d.trend}
                    </div>
                  </div>
                </div>

                {/* Mini bars */}
                <div style={{ marginBottom:14 }}>
                  {d.categories.map(cat => (
                    <div key={cat.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:9, color:"#484f58", width:72, flexShrink:0 }}>{cat.name.slice(0,9)}</span>
                      <div style={{ flex:1, height:4, background:"#21262d", borderRadius:2 }}>
                        <div style={{
                          height:"100%", width:`${cat.score}%`,
                          background: getScoreColor(cat.score), borderRadius:2, transition:"width 0.6s",
                        }} />
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, color: getScoreColor(cat.score), width:28, textAlign:"right" }}>
                        {cat.score}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                  <div style={{ flex:1, background:"#0d1117", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:800, color: d.color }}>{d.posts.toLocaleString()}</div>
                    <div style={{ fontSize:8, color:"#484f58" }}>POSTS</div>
                  </div>
                  <div style={{ flex:1, background:"#0d1117", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#f59e0b" }}>#{rank+1}</div>
                    <div style={{ fontSize:8, color:"#484f58" }}>RANK</div>
                  </div>
                  <div style={{ flex:1, background:"#0d1117", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#10b981" }}>{top.name.slice(0,5)}</div>
                    <div style={{ fontSize:8, color:"#484f58" }}>BEST</div>
                  </div>
                  <div style={{ flex:1, background:"#0d1117", borderRadius:6, padding:"8px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:11, fontWeight:800, color:"#ef4444" }}>{bot.name.slice(0,5)}</div>
                    <div style={{ fontSize:8, color:"#484f58" }}>WORST</div>
                  </div>
                </div>

                {/* Strengths & Concerns */}
                <div style={{ background:"#10b98110", border:"1px solid #10b98120", borderRadius:6, padding:"8px 10px", marginBottom:6 }}>
                  <span style={{ fontSize:9, color:"#10b981", letterSpacing:"1px" }}>✅ STRENGTHS: </span>
                  <span style={{ fontSize:10, color:"#8b949e" }}>{d.strengths.join(" • ")}</span>
                </div>
                <div style={{ background:"#ef444410", border:"1px solid #ef444420", borderRadius:6, padding:"8px 10px" }}>
                  <span style={{ fontSize:9, color:"#ef4444", letterSpacing:"1px" }}>⚠️ CONCERNS: </span>
                  <span style={{ fontSize:10, color:"#8b949e" }}>{d.concerns.join(" • ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:#0d1117; }
        ::-webkit-scrollbar-thumb { background:#21262d; border-radius:2px; }
      `}</style>
    </div>
  );
}