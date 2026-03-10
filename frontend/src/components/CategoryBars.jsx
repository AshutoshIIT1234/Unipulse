export default function CategoryBars({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 10,
        padding: 20,
        color: "#484f58",
        textAlign: "center",
        margin: "16px 0",
      }}>
        No category data available
      </div>
    );
  }

  const getColor = (score) => {
    if (score >= 70) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: 10,
      padding: 20,
      margin: "16px 0",
    }}>
      <div style={{
        fontSize: 11,
        color: "#484f58",
        letterSpacing: "2px",
        marginBottom: 16,
        fontFamily: "monospace",
      }}>
        CATEGORY BREAKDOWN
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {categories.map((cat) => (
          <div key={cat.name}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontSize: 12,
              fontFamily: "monospace",
            }}>
              <span style={{ color: "#c9d1d9" }}>{cat.name}</span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ color: "#484f58", fontSize: 10 }}>
                  {cat.posts} posts
                </span>
                <span style={{
                  fontWeight: 800,
                  color: getColor(cat.score),
                }}>
                  {cat.score}%
                </span>
              </div>
            </div>
            <div style={{
              height: 6,
              borderRadius: 3,
              background: "#21262d",
            }}>
              <div style={{
                height: "100%",
                width: `${cat.score}%`,
                borderRadius: 3,
                background: getColor(cat.score),
                transition: "width 0.7s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}