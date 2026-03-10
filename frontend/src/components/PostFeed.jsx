export default function PostFeed({ posts }) {
  if (!posts || posts.length === 0) {
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
        No posts available
      </div>
    );
  }

  const getBorderColor = (label) => {
    if (label === "positive") return "#10b981";
    if (label === "negative") return "#ef4444";
    return "#4b5563";
  };

  const getIcon = (label) => {
    if (label === "positive") return "✅";
    if (label === "negative") return "⚠️";
    return "➡️";
  };

  return (
    <div style={{ margin: "16px 0" }}>
      <div style={{
        fontSize: 11,
        color: "#484f58",
        letterSpacing: "2px",
        marginBottom: 14,
        fontFamily: "monospace",
      }}>
        REDDIT SIGNAL FEED
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((post, i) => {
          const borderColor = getBorderColor(post.label);
          return (
            <div key={i} style={{
              background: "#161b22",
              border: `1px solid ${borderColor}30`,
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13,
                  color: "#c9d1d9",
                  lineHeight: 1.6,
                  marginBottom: 8,
                  fontFamily: "monospace",
                }}>
                  {post.title}
                </div>
                <div style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 10,
                  color: "#484f58",
                  fontFamily: "monospace",
                }}>
                  <span>📌 r/{post.subreddit}</span>
                  <span>👍 {post.score} upvotes</span>
                  <span>💬 {post.comments} comments</span>
                </div>
              </div>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  background: `${borderColor}18`,
                  border: `1px solid ${borderColor}40`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div style={{ fontSize: 16 }}>{getIcon(post.label)}</div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: borderColor,
                    marginTop: 2,
                  }}>
                    {Math.abs(post.compound).toFixed(2)}
                  </div>
                </div>
                <div style={{
                  fontSize: 8,
                  color: "#484f58",
                  marginTop: 4,
                  letterSpacing: "0.5px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                }}>
                  {post.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
