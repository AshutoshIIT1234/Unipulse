import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Compare", path: "/compare" },
    { label: "Chatbot", path: "/chatbot" }
  ];

  return (
    <nav style={{
      background: "rgba(22, 27, 34, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(48, 54, 61, 0.5)",
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
    }}>
      <div style={{
        fontSize: "16px",
        fontWeight: 800,
        color: "#f0f6fc",
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: "0.5px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        <span style={{
          color: "#f97316",
          animation: "pulseGlow 2s infinite"
        }}>⚡</span>
        UniPulse
        <span style={{
          color: "#f97316",
          background: "rgba(249, 115, 22, 0.15)",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "10px",
          marginLeft: "4px",
          fontWeight: 700
        }}>AI</span>
      </div>
      
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: active ? "#f97316" : "#8b949e",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                padding: "6px 14px",
                borderRadius: "6px",
                background: active ? "rgba(249, 115, 22, 0.08)" : "transparent",
                border: `1px solid ${active ? "rgba(249, 115, 22, 0.25)" : "transparent"}`,
                boxShadow: active ? "0 0 10px rgba(249, 115, 22, 0.1)" : "none",
                transition: "all 0.25s",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
              className="nav-link"
            >
              {active && (
                <span style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#f97316",
                  boxShadow: "0 0 6px #f97316"
                }} />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}