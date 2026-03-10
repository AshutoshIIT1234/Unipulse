import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const IIT_DATA = {
  "IIT Bombay": {
    short: "IITB", location: "Mumbai, Maharashtra", color: "#f97316",
    accent: "#fb923c", sub: "r/iitbombay", founded: 1958,
    overall: 68, trend: "up", posts: 2341, students: 10000,
    categories: [
      { name: "Academics",      score: 74, posts: 523, icon: "📚" },
      { name: "Placements",     score: 87, posts: 412, icon: "💼" },
      { name: "Hostel Life",    score: 61, posts: 334, icon: "🏠" },
      { name: "Fests & Culture",score: 82, posts: 289, icon: "🎉" },
      { name: "Mental Health",  score: 38, posts: 198, icon: "🧠" },
      { name: "Administration", score: 34, posts: 243, icon: "🏛️" },
      { name: "Infrastructure", score: 71, posts: 342, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 60, neg: 24, neu: 16 },
      { week: "W2", pos: 63, neg: 22, neu: 15 },
      { week: "W3", pos: 65, neg: 20, neu: 15 },
      { week: "W4", pos: 68, neg: 18, neu: 14 },
      { week: "W5", pos: 67, neg: 19, neu: 14 },
      { week: "W6", pos: 70, neg: 16, neu: 14 },
    ],
    topPosts: [
      { text: "Placement season 2024 — highest ever packages, 120+ LPA in CS", label: "positive", compound: 0.94, subreddit: "iitbombay", score: 1423, comments: 234 },
      { text: "Mood Indigo 2024 lineups dropped — absolute banger this year",   label: "positive", compound: 0.88, subreddit: "iitbombay", score: 987,  comments: 156 },
      { text: "Hostel H10 water supply issue unresolved for 3 weeks now",       label: "negative", compound: -0.79, subreddit: "iitbombay", score: 654, comments: 198 },
      { text: "Academic calendar keeps shifting — affecting internship preps",  label: "negative", compound: -0.71, subreddit: "india",     score: 432, comments: 87  },
      { text: "New AI research center inauguration — IIT B to lead national initiative", label: "positive", compound: 0.91, subreddit: "iitbombay", score: 1102, comments: 178 },
    ],
  },
  "IIT Madras": {
    short: "IITM", location: "Chennai, Tamil Nadu", color: "#0ea5e9",
    accent: "#38bdf8", sub: "r/iitmadras", founded: 1959,
    overall: 72, trend: "up", posts: 1987, students: 9500,
    categories: [
      { name: "Academics",      score: 80, posts: 467, icon: "📚" },
      { name: "Placements",     score: 89, posts: 378, icon: "💼" },
      { name: "Hostel Life",    score: 65, posts: 289, icon: "🏠" },
      { name: "Fests & Culture",score: 76, posts: 234, icon: "🎉" },
      { name: "Mental Health",  score: 41, posts: 167, icon: "🧠" },
      { name: "Administration", score: 52, posts: 198, icon: "🏛️" },
      { name: "Infrastructure", score: 79, posts: 354, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 65, neg: 20, neu: 15 },
      { week: "W2", pos: 68, neg: 18, neu: 14 },
      { week: "W3", pos: 70, neg: 17, neu: 13 },
      { week: "W4", pos: 72, neg: 15, neu: 13 },
      { week: "W5", pos: 74, neg: 13, neu: 13 },
      { week: "W6", pos: 73, neg: 14, neu: 13 },
    ],
    topPosts: [
      { text: "IITM BS Data Science program — lakhs enrolled, changing education", label: "positive", compound: 0.96, subreddit: "iitmadras", score: 2341, comments: 412 },
      { text: "Shaastra 2024 workshop registrations open — 50+ technical events",  label: "positive", compound: 0.85, subreddit: "iitmadras", score: 876,  comments: 143 },
      { text: "Deer on campus getting aggressive near Gajendra Circle again",       label: "neutral",  compound: 0.05, subreddit: "iitmadras", score: 1243, comments: 287 },
      { text: "Core branch placements still weak vs CS — dept needs to address",   label: "negative", compound: -0.68, subreddit: "iitmadras", score: 543, comments: 167 },
    ],
  },
  "IIT Patna": {
    short: "IITP", location: "Patna, Bihar", color: "#a855f7",
    accent: "#c084fc", sub: "r/iitpatna", founded: 2008,
    overall: 51, trend: "neutral", posts: 743, students: 3200,
    categories: [
      { name: "Academics",      score: 62, posts: 178, icon: "📚" },
      { name: "Placements",     score: 58, posts: 134, icon: "💼" },
      { name: "Hostel Life",    score: 44, posts: 112, icon: "🏠" },
      { name: "Fests & Culture",score: 55, posts:  89, icon: "🎉" },
      { name: "Mental Health",  score: 36, posts:  67, icon: "🧠" },
      { name: "Administration", score: 40, posts:  78, icon: "🏛️" },
      { name: "Infrastructure", score: 42, posts:  85, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 48, neg: 33, neu: 19 },
      { week: "W2", pos: 50, neg: 31, neu: 19 },
      { week: "W3", pos: 49, neg: 32, neu: 19 },
      { week: "W4", pos: 52, neg: 30, neu: 18 },
      { week: "W5", pos: 51, neg: 31, neu: 18 },
      { week: "W6", pos: 53, neg: 29, neu: 18 },
    ],
    topPosts: [
      { text: "New permanent campus construction finally moving fast — ETA 2026",  label: "positive", compound: 0.72, subreddit: "iitpatna", score: 432,  comments: 67  },
      { text: "Library resources extremely outdated — no new subscriptions 2 yrs", label: "negative", compound: -0.77, subreddit: "iitpatna", score: 287, comments: 98  },
      { text: "Placement numbers improving YoY — 80% placed this batch",           label: "positive", compound: 0.78, subreddit: "iitpatna", score: 543,  comments: 87  },
      { text: "Connectivity and transport to city is a real problem for students",  label: "negative", compound: -0.72, subreddit: "iitpatna", score: 321, comments: 112 },
    ],
  },
  "IIT Delhi": {
    short: "IITD", location: "New Delhi", color: "#10b981",
    accent: "#34d399", sub: "r/iitdelhi", founded: 1961,
    overall: 70, trend: "up", posts: 2108, students: 8500,
    categories: [
      { name: "Academics",      score: 78, posts: 489, icon: "📚" },
      { name: "Placements",     score: 86, posts: 398, icon: "💼" },
      { name: "Hostel Life",    score: 62, posts: 312, icon: "🏠" },
      { name: "Fests & Culture",score: 73, posts: 267, icon: "🎉" },
      { name: "Mental Health",  score: 40, posts: 178, icon: "🧠" },
      { name: "Administration", score: 45, posts: 223, icon: "🏛️" },
      { name: "Infrastructure", score: 75, posts: 241, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 63, neg: 22, neu: 15 },
      { week: "W2", pos: 65, neg: 21, neu: 14 },
      { week: "W3", pos: 68, neg: 19, neu: 13 },
      { week: "W4", pos: 70, neg: 17, neu: 13 },
      { week: "W5", pos: 72, neg: 15, neu: 13 },
      { week: "W6", pos: 71, neg: 16, neu: 13 },
    ],
    topPosts: [
      { text: "Rendezvous 2024 — best cultural fest edition in a decade",          label: "positive", compound: 0.89, subreddit: "iitdelhi", score: 1876, comments: 312 },
      { text: "IIT Delhi startup ecosystem — 200+ funded startups from alumni",    label: "positive", compound: 0.92, subreddit: "iitdelhi", score: 2134, comments: 287 },
      { text: "Hostel room allocation system highly unfair for newer students",     label: "negative", compound: -0.74, subreddit: "iitdelhi", score: 765, comments: 198 },
      { text: "Metro connectivity from Hauz Khas makes life genuinely convenient", label: "positive", compound: 0.81, subreddit: "delhi",    score: 987,  comments: 143 },
    ],
  },
  "IIT Kharagpur": {
    short: "IITKgp", location: "Kharagpur, West Bengal", color: "#f43f5e",
    accent: "#fb7185", sub: "r/iitkgp", founded: 1951,
    overall: 65, trend: "neutral", posts: 2567, students: 12000,
    categories: [
      { name: "Academics",      score: 72, posts: 567, icon: "📚" },
      { name: "Placements",     score: 80, posts: 445, icon: "💼" },
      { name: "Hostel Life",    score: 58, posts: 389, icon: "🏠" },
      { name: "Fests & Culture",score: 85, posts: 312, icon: "🎉" },
      { name: "Mental Health",  score: 36, posts: 234, icon: "🧠" },
      { name: "Administration", score: 39, posts: 289, icon: "🏛️" },
      { name: "Infrastructure", score: 55, posts: 331, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 58, neg: 27, neu: 15 },
      { week: "W2", pos: 60, neg: 26, neu: 14 },
      { week: "W3", pos: 62, neg: 24, neu: 14 },
      { week: "W4", pos: 65, neg: 21, neu: 14 },
      { week: "W5", pos: 64, neg: 22, neu: 14 },
      { week: "W6", pos: 66, neg: 20, neu: 14 },
    ],
    topPosts: [
      { text: "Spring Fest 2024 — massive turnout, one of India's biggest fests", label: "positive", compound: 0.93, subreddit: "iitkgp", score: 2987, comments: 543 },
      { text: "Oldest IIT — campus is historic but infrastructure aging rapidly",  label: "negative", compound: -0.65, subreddit: "iitkgp", score: 876,  comments: 234 },
      { text: "Gymkhana elections — highest voter turnout in years",               label: "positive", compound: 0.82, subreddit: "iitkgp", score: 1243, comments: 198 },
      { text: "Remote location makes internship prep and industry connects harder",label: "negative", compound: -0.69, subreddit: "india",  score: 654,  comments: 167 },
    ],
  },
  "IIT BHU": {
    short: "IITBHU", location: "Varanasi, Uttar Pradesh", color: "#eab308",
    accent: "#facc15", sub: "r/iitbhu", founded: 1919,
    overall: 57, trend: "up", posts: 1124, students: 6500,
    categories: [
      { name: "Academics",      score: 66, posts: 278, icon: "📚" },
      { name: "Placements",     score: 64, posts: 213, icon: "💼" },
      { name: "Hostel Life",    score: 52, posts: 189, icon: "🏠" },
      { name: "Fests & Culture",score: 70, posts: 167, icon: "🎉" },
      { name: "Mental Health",  score: 38, posts: 112, icon: "🧠" },
      { name: "Administration", score: 37, posts: 134, icon: "🏛️" },
      { name: "Infrastructure", score: 48, posts: 131, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 52, neg: 30, neu: 18 },
      { week: "W2", pos: 54, neg: 28, neu: 18 },
      { week: "W3", pos: 55, neg: 27, neu: 18 },
      { week: "W4", pos: 58, neg: 25, neu: 17 },
      { week: "W5", pos: 57, neg: 26, neu: 17 },
      { week: "W6", pos: 59, neg: 24, neu: 17 },
    ],
    topPosts: [
      { text: "Kashi — the city itself is an experience, unmatched cultural richness", label: "positive", compound: 0.86, subreddit: "iitbhu", score: 1543, comments: 234 },
      { text: "Technex 2024 was phenomenal — IIT BHU tech fest growing every year",   label: "positive", compound: 0.84, subreddit: "iitbhu", score: 987,  comments: 178 },
      { text: "Lab equipment outdated in several departments — needs urgent upgrade",  label: "negative", compound: -0.73, subreddit: "iitbhu", score: 654, comments: 143 },
      { text: "Faculty shortage in core engineering branches a problem for years",     label: "negative", compound: -0.78, subreddit: "india",  score: 432, comments: 98  },
    ],
  },
  "IIT Guwahati": {
    short: "IITG", location: "Guwahati, Assam", color: "#06b6d4",
    accent: "#22d3ee", sub: "r/iitguwahati", founded: 1994,
    overall: 63, trend: "up", posts: 1034, students: 5800,
    categories: [
      { name: "Academics",      score: 70, posts: 245, icon: "📚" },
      { name: "Placements",     score: 71, posts: 198, icon: "💼" },
      { name: "Hostel Life",    score: 67, posts: 178, icon: "🏠" },
      { name: "Fests & Culture",score: 74, posts: 145, icon: "🎉" },
      { name: "Mental Health",  score: 44, posts:  98, icon: "🧠" },
      { name: "Administration", score: 48, posts: 112, icon: "🏛️" },
      { name: "Infrastructure", score: 61, posts: 158, icon: "🔧" },
    ],
    timeline: [
      { week: "W1", pos: 58, neg: 26, neu: 16 },
      { week: "W2", pos: 60, neg: 24, neu: 16 },
      { week: "W3", pos: 62, neg: 23, neu: 15 },
      { week: "W4", pos: 63, neg: 22, neu: 15 },
      { week: "W5", pos: 65, neg: 20, neu: 15 },
      { week: "W6", pos: 64, neg: 21, neu: 15 },
    ],
    topPosts: [
      { text: "IIT Guwahati campus on Brahmaputra banks — most scenic IIT",          label: "positive", compound: 0.91, subreddit: "iitguwahati", score: 1876, comments: 312 },
      { text: "Techniche fest had international participation for the first time",    label: "positive", compound: 0.87, subreddit: "iitguwahati", score: 876,  comments: 143 },
      { text: "Northeast India connectivity issues make travel home very expensive",  label: "negative", compound: -0.71, subreddit: "iitguwahati", score: 543, comments: 112 },
      { text: "Research output improving — good faculty recruitment this year",       label: "positive", compound: 0.80, subreddit: "india",       score: 765,  comments: 98  },
    ],
  },
};

const IIT_LIST  = Object.keys(IIT_DATA);
const RANK_ORDER = [...IIT_LIST].sort((a, b) => IIT_DATA[b].overall - IIT_DATA[a].overall);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getColor = (s) => s >= 70 ? "#10b981" : s >= 55 ? "#f59e0b" : "#ef4444";
const getLabel = (s) => s >= 70 ? "Positive"  : s >= 55 ? "Mixed"   : "Needs Attention";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#0d1117", border:"1px solid #21262d", borderRadius:8, padding:"10px 14px", fontSize:12, fontFamily:"monospace" }}>
      <div style={{ color:"#8b949e", marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [active, setActive] = useState("IIT Bombay");
  const [tab,    setTab]    = useState("overview");
  const [fade,   setFade]   = useState(true);

  const d = IIT_DATA[active];

  const switchIIT = (name) => {
    if (name === active) return;
    setFade(false);
    setTimeout(() => { setActive(name); setTab("overview"); setFade(true); }, 180);
  };

  const pieData = [
    { name: "Positive", value: d.timeline[5].pos, color: "#10b981" },
    { name: "Neutral",  value: d.timeline[5].neu, color: "#4b5563" },
    { name: "Negative", value: d.timeline[5].neg, color: "#ef4444" },
  ];

  const radarData = d.categories.map(c => ({ subject: c.name, A: c.score, fullMark: 100 }));

  // ── styles ──
  const S = {
    page: {
      display:"flex", flexDirection:"column",
      minHeight:"100vh", background:"#0d1117", color:"#c9d1d9",
      fontFamily:"'IBM Plex Mono','Courier New',monospace",
    },
    header: {
      background:"linear-gradient(90deg,#161b22 0%,#0d1117 100%)",
      borderBottom:"1px solid #21262d",
      padding:"14px 28px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100,
    },
    logo: { display:"flex", alignItems:"center", gap:14 },
    logoIcon: (color, accent) => ({
      width:44, height:44, borderRadius:8,
      background:`linear-gradient(135deg,${color},${accent})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:20, boxShadow:`0 0 20px ${color}44`, transition:"background 0.4s",
    }),
    body: { display:"flex", flex:1, overflow:"hidden" },
    sidebar: {
      width:220, background:"#161b22", borderRight:"1px solid #21262d",
      display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0,
    },
    main: {
      flex:1, overflowY:"auto", padding:"20px 24px",
      opacity: fade ? 1 : 0, transition:"opacity 0.18s",
    },
    card: {
      background:"#161b22", border:"1px solid #21262d",
      borderRadius:10, padding:16,
    },
    sectionLabel: {
      fontSize:10, color:"#484f58", letterSpacing:"2px",
      marginBottom:14, fontFamily:"monospace",
    },
    tabBar: {
      display:"flex", gap:2, marginBottom:20,
      background:"#161b22", borderRadius:8, padding:4,
      width:"fit-content", border:"1px solid #21262d",
    },
  };

  return (
    <div style={S.page}>
      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon(d.color, d.accent)}>⚡</div>
          <div>
            <span style={{ fontSize:18, fontWeight:700, color:"#f0f6fc" }}>UniPulse</span>
            <span style={{ fontSize:18, fontWeight:300, color:d.color, marginLeft:6, transition:"color 0.4s" }}> AI</span>
            <div style={{ fontSize:10, color:"#484f58", letterSpacing:"3px", marginTop:1 }}>IIT INTELLIGENCE PLATFORM</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:20, alignItems:"center" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10, color:"#484f58" }}>LIVE SOURCE</div>
            <div style={{ fontSize:11, color:"#58a6ff" }}>Reddit API • PRAW</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 6px #10b981" }} />
            <span style={{ fontSize:11, color:"#484f58" }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={S.body}>
        {/* ── SIDEBAR ── */}
        <div style={S.sidebar}>
          <div style={{ padding:"14px 16px 8px", fontSize:9, color:"#484f58", letterSpacing:"2px" }}>SELECT IIT</div>

          {IIT_LIST.map((name) => {
            const inst = IIT_DATA[name];
            const isActive = name === active;
            const sc = getColor(inst.overall);
            return (
              <div key={name} onClick={() => switchIIT(name)} style={{
                padding:"12px 16px", cursor:"pointer",
                borderLeft: isActive ? `3px solid ${inst.color}` : "3px solid transparent",
                background: isActive ? `${inst.color}12` : "transparent",
                transition:"all 0.15s", borderBottom:"1px solid #21262d",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, fontWeight: isActive ? 700 : 400, color: isActive ? inst.color : "#8b949e", transition:"color 0.2s" }}>
                    {inst.short}
                  </span>
                  <span style={{ fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:4, background:`${sc}20`, color:sc }}>
                    {inst.overall}
                  </span>
                </div>
                <div style={{ fontSize:9, color:"#484f58", marginTop:3 }}>{inst.location}</div>
                <div style={{ marginTop:6, height:2, borderRadius:1, background:"#21262d" }}>
                  <div style={{ height:"100%", width:`${inst.overall}%`, background:inst.color, borderRadius:1, transition:"width 0.5s" }} />
                </div>
              </div>
            );
          })}

          {/* Rankings */}
          <div style={{ padding:"16px", marginTop:"auto", borderTop:"1px solid #21262d" }}>
            <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px", marginBottom:10 }}>OVERALL RANKING</div>
            {RANK_ORDER.map((name, i) => {
              const inst = IIT_DATA[name];
              return (
                <div key={name} onClick={() => switchIIT(name)}
                  style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, cursor:"pointer" }}>
                  <span style={{ fontSize:9, color:"#484f58", width:12 }}>#{i+1}</span>
                  <span style={{ fontSize:11, color: name === active ? inst.color : "#6e7681", width:52 }}>{inst.short}</span>
                  <div style={{ flex:1, height:2, background:"#21262d", borderRadius:1 }}>
                    <div style={{ height:"100%", width:`${inst.overall}%`, background:inst.color, borderRadius:1 }} />
                  </div>
                  <span style={{ fontSize:10, color:getColor(inst.overall), fontWeight:700, width:24, textAlign:"right" }}>{inst.overall}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={S.main}>

          {/* Institute banner */}
          <div style={{
            background:`linear-gradient(135deg,#161b22,${d.color}18)`,
            border:`1px solid ${d.color}40`, borderRadius:12,
            padding:"18px 22px", marginBottom:20,
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:22, fontWeight:800, color:d.color, letterSpacing:"-1px" }}>{active}</span>
                <span style={{ fontSize:10, padding:"3px 8px", borderRadius:4, background:`${getColor(d.overall)}20`, color:getColor(d.overall), fontWeight:700, letterSpacing:"1px" }}>
                  {getLabel(d.overall)}
                </span>
                <span style={{ fontSize:12, color: d.trend==="up" ? "#10b981" : d.trend==="down" ? "#ef4444" : "#f59e0b" }}>
                  {d.trend==="up" ? "▲ trending up" : d.trend==="down" ? "▼ declining" : "→ stable"}
                </span>
              </div>
              <div style={{ fontSize:11, color:"#484f58", marginTop:4 }}>
                📍 {d.location} &nbsp;|&nbsp; Founded {d.founded} &nbsp;|&nbsp; {d.sub} &nbsp;|&nbsp; ~{d.students.toLocaleString()} students
              </div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:40, fontWeight:900, color:d.color, letterSpacing:"-2px", lineHeight:1 }}>{d.overall}</div>
              <div style={{ fontSize:9, color:"#484f58", letterSpacing:"2px" }}>SENTIMENT SCORE</div>
              <div style={{ fontSize:10, color:"#484f58", marginTop:3 }}>{d.posts.toLocaleString()} posts • 30 days</div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={S.tabBar}>
            {["overview","trends","categories","feed"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:"7px 16px", borderRadius:6, border:"none",
                background: tab===t ? d.color : "transparent",
                color: tab===t ? "#000" : "#484f58",
                fontWeight: tab===t ? 700 : 400,
                fontSize:11, cursor:"pointer", letterSpacing:"0.5px",
                textTransform:"uppercase", transition:"all 0.2s",
                fontFamily:"inherit",
              }}>{t}</button>
            ))}
          </div>

          {/* ══ OVERVIEW ══ */}
          {tab === "overview" && (
            <>
              {/* KPI row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
                {[
                  { label:"Posts Analyzed",    val: d.posts.toLocaleString(),                                                    icon:"📊", sub:"last 30 days",                                                      col: d.color },
                  { label:"Positive Sentiment",val:`${d.timeline[5].pos}%`,                                                      icon:"✅", sub:"current week",                                                     col:"#10b981" },
                  { label:"Negative Sentiment",val:`${d.timeline[5].neg}%`,                                                      icon:"⚠️", sub:"current week",                                                     col:"#ef4444" },
                  { label:"Top Category",      val:[...d.categories].sort((a,b)=>b.score-a.score)[0].name, icon:"🏆",
                    sub:`Score: ${[...d.categories].sort((a,b)=>b.score-a.score)[0].score}%`,              col:"#f59e0b" },
                ].map((k,i) => (
                  <div key={i} style={{ ...S.card, borderTop:`3px solid ${k.col}` }}>
                    <div style={{ fontSize:18, marginBottom:8 }}>{k.icon}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:k.col, letterSpacing:"-1px" }}>{k.val}</div>
                    <div style={{ fontSize:10, color:"#484f58", marginTop:3 }}>{k.label}</div>
                    <div style={{ fontSize:9,  color:"#484f58", marginTop:2,  letterSpacing:"0.5px" }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Area + Donut */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
                <div style={S.card}>
                  <div style={S.sectionLabel}>6-WEEK SENTIMENT TREND</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={d.timeline}>
                      <defs>
                        <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                      <XAxis dataKey="week" stroke="#484f58" fontSize={10} />
                      <YAxis stroke="#484f58" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="pos" name="Positive" stroke="#10b981" strokeWidth={2} fill="url(#gPos)" />
                      <Area type="monotone" dataKey="neg" name="Negative" stroke="#ef4444" strokeWidth={2} fill="url(#gNeg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={S.card}>
                  <div style={S.sectionLabel}>CURRENT MIX</div>
                  <div style={{ display:"flex", justifyContent:"center", position:"relative" }}>
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
                          {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
                      <div style={{ fontSize:24, fontWeight:900, color:d.color }}>{d.overall}</div>
                      <div style={{ fontSize:8,  color:"#484f58" }}>SCORE</div>
                    </div>
                  </div>
                  <div style={{ marginTop:12 }}>
                    {pieData.map(p => (
                      <div key={p.name} style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:11 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, color:"#8b949e" }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:p.color }} />
                          {p.name}
                        </div>
                        <span style={{ color:p.color, fontWeight:700 }}>{p.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category snapshot */}
              <div style={S.card}>
                <div style={S.sectionLabel}>CATEGORY SNAPSHOT</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"8px 24px" }}>
                  {d.categories.map(cat => (
                    <div key={cat.name}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:11 }}>
                        <span style={{ color:"#8b949e" }}>{cat.icon} {cat.name}</span>
                        <span style={{ color:getColor(cat.score), fontWeight:700 }}>{cat.score}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:2, background:"#21262d" }}>
                        <div style={{ height:"100%", width:`${cat.score}%`, borderRadius:2, background:getColor(cat.score), transition:"width 0.7s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══ TRENDS ══ */}
          {tab === "trends" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={S.card}>
                <div style={S.sectionLabel}>WEEKLY SENTIMENT BREAKDOWN</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={d.timeline} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="week" stroke="#484f58" fontSize={11} />
                    <YAxis stroke="#484f58" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pos" name="Positive" fill="#10b981" radius={[3,3,0,0]} />
                    <Bar dataKey="neu" name="Neutral"  fill="#4b5563" radius={[3,3,0,0]} />
                    <Bar dataKey="neg" name="Negative" fill="#ef4444" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={S.card}>
                <div style={S.sectionLabel}>ALL IITs COMPARISON</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {RANK_ORDER.map((name, i) => {
                    const inst = IIT_DATA[name];
                    return (
                      <div key={name} onClick={() => switchIIT(name)} style={{
                        cursor:"pointer", padding:"10px 14px", borderRadius:8,
                        background: name===active ? `${inst.color}12` : "#0d1117",
                        border:`1px solid ${name===active ? inst.color+"50" : "#21262d"}`,
                        transition:"all 0.15s",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ fontSize:11, color:"#484f58", width:20 }}>#{i+1}</span>
                          <span style={{ fontSize:13, fontWeight:700, color:inst.color, width:70 }}>{inst.short}</span>
                          <div style={{ flex:1, height:6, background:"#21262d", borderRadius:3 }}>
                            <div style={{ height:"100%", width:`${inst.overall}%`, background:inst.color, borderRadius:3, transition:"width 0.8s" }} />
                          </div>
                          <span style={{ fontSize:13, fontWeight:800, color:getColor(inst.overall), width:36, textAlign:"right" }}>{inst.overall}</span>
                          <span style={{ fontSize:9, color:"#484f58", width:70, textAlign:"right" }}>{inst.posts.toLocaleString()} posts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ CATEGORIES ══ */}
          {tab === "categories" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={S.card}>
                <div style={S.sectionLabel}>RADAR ANALYSIS</div>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#21262d" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill:"#484f58", fontSize:10 }} />
                    <Radar name={d.short} dataKey="A" stroke={d.color} fill={d.color} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={S.card}>
                <div style={S.sectionLabel}>DETAILED BREAKDOWN</div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {[...d.categories].sort((a,b) => b.score-a.score).map(cat => (
                    <div key={cat.name}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span>{cat.icon}</span>
                          <span style={{ fontSize:12, color:"#c9d1d9" }}>{cat.name}</span>
                        </div>
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <span style={{ fontSize:9, color:"#484f58" }}>{cat.posts} posts</span>
                          <span style={{ fontSize:13, fontWeight:800, color:getColor(cat.score) }}>{cat.score}%</span>
                        </div>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:"#21262d" }}>
                        <div style={{
                          height:"100%", width:`${cat.score}%`, borderRadius:3,
                          background:`linear-gradient(90deg,${getColor(cat.score)},${getColor(cat.score)}bb)`,
                          transition:"width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ FEED ══ */}
          {tab === "feed" && (
            <div>
              <div style={S.sectionLabel}>REDDIT SIGNAL FEED — {d.sub.toUpperCase()}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {d.topPosts.map((post, i) => {
                  const isPos = post.label === "positive";
                  const isNeg = post.label === "negative";
                  const bc    = isPos ? "#10b981" : isNeg ? "#ef4444" : "#4b5563";
                  return (
                    <div key={i} style={{
                      background:"#161b22",
                      border:`1px solid ${bc}30`,
                      borderLeft:`4px solid ${bc}`,
                      borderRadius:10, padding:"16px 18px",
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:"#c9d1d9", lineHeight:1.6, marginBottom:8 }}>{post.text}</div>
                          <div style={{ display:"flex", gap:12, fontSize:10, color:"#484f58" }}>
                            <span>📌 r/{post.subreddit}</span>
                            <span>👍 {post.score} upvotes</span>
                            <span>💬 {post.comments} comments</span>
                          </div>
                        </div>
                        <div style={{ textAlign:"center", flexShrink:0 }}>
                          <div style={{
                            width:52, height:52, borderRadius:8,
                            background:`${bc}18`, border:`1px solid ${bc}40`,
                            display:"flex", flexDirection:"column",
                            alignItems:"center", justifyContent:"center",
                          }}>
                            <div style={{ fontSize:16 }}>{isPos ? "✅" : isNeg ? "⚠️" : "➡️"}</div>
                            <div style={{ fontSize:10, fontWeight:800, color:bc, marginTop:2 }}>
                              {Math.abs(post.compound).toFixed(2)}
                            </div>
                          </div>
                          <div style={{ fontSize:8, color:"#484f58", marginTop:4, letterSpacing:"0.5px", textTransform:"uppercase" }}>
                            {post.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Code snippet */}
              <div style={{ marginTop:20, background:"#0d1117", border:"1px solid #21262d", borderRadius:10, padding:16 }}>
                <div style={{ fontSize:10, color:"#484f58", letterSpacing:"2px", marginBottom:10 }}>LIVE PRAW CODE SNIPPET</div>
                <pre style={{ fontSize:11, color:"#8b949e", lineHeight:1.7, margin:0, overflowX:"auto" }}>
{`import praw
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

reddit   = praw.Reddit(client_id="YOUR_ID",
                       client_secret="YOUR_SECRET",
                       user_agent="UniPulse/1.0")
analyzer = SentimentIntensityAnalyzer()

for post in reddit.subreddit("${d.sub.replace("r/","")}"
                              ).hot(limit=50):
    score = analyzer.polarity_scores(post.title)
    print(f"{post.title[:55]}... → {score['compound']:.2f}")`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d1117; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #21262d; border-radius: 2px; }
      `}</style>
    </div>
  );
}