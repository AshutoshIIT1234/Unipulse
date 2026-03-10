import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      background: "#161b22",
      borderBottom: "1px solid #21262d",
      padding: "14px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 800,
        color: "#f0f6fc",
        fontFamily: "monospace",
      }}>
        ⚡ UniPulse <span style={{ color: "#f97316" }}>AI</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <Link to="/"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: 13 }}>
          Dashboard
        </Link>
        <Link to="/compare"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: 13 }}>
          Compare
        </Link>
      </div>
    </nav>
  );
}