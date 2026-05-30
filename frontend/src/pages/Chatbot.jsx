import { useState } from "react";
import { askChatbot, indexChatbotData } from "../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const IIT_OPTIONS = ["", "IITB", "IITM", "IITP", "IITD", "IITKgp", "IITBHU", "IITG"];

const IIT_COLORS = {
  "IITB":   "#f97316",
  "IITM":   "#0ea5e9",
  "IITP":   "#a855f7",
  "IITD":   "#10b981",
  "IITKgp": "#f43f5e",
  "IITBHU": "#eab308",
  "IITG":   "#06b6d4",
};

export default function Chatbot() {
  const [question, setQuestion] = useState("");
  const [iitKey, setIitKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);

  const handleIndex = async () => {
    setIndexing(true);
    try {
      const result = await indexChatbotData(iitKey || null);
      setMessages(prev => [...prev, {
        role: "system",
        content: `Indexed ${result.indexed_posts} posts successfully. The vector database is primed and ready to answer your questions!`
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "system",
        content: "Error indexing data. Make sure backend is running."
      }]);
    }
    setIndexing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const result = await askChatbot(question, iitKey || null);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: result.answer,
        sources: result.sources
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error getting response. Make sure backend is running."
      }]);
    }
    setLoading(false);
  };

  const S = {
    page: {
      minHeight: "calc(100vh - 73px)",
      background: "#0d1117",
      color: "#c9d1d9",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    container: {
      width: "100%",
      maxWidth: "960px",
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    headerCard: {
      background: "linear-gradient(135deg, #161b22, rgba(249, 115, 22, 0.08))",
      border: "1px solid rgba(249, 115, 22, 0.25)",
      borderRadius: "12px",
      padding: "20px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "16px"
    },
    controls: {
      display: "flex",
      gap: "12px",
      alignItems: "center"
    },
    select: {
      padding: "10px 16px",
      background: "#0d1117",
      color: "#c9d1d9",
      border: "1px solid #21262d",
      borderRadius: "8px",
      fontSize: "12px",
      fontFamily: "inherit",
      cursor: "pointer",
      outline: "none",
      transition: "border-color 0.2s"
    },
    btnIndex: (disabled) => ({
      padding: "10px 20px",
      background: disabled ? "#21262d" : "linear-gradient(135deg, #f97316, #fb923c)",
      color: disabled ? "#8b949e" : "#000",
      border: "none",
      borderRadius: "8px",
      fontSize: "11px",
      fontWeight: 700,
      fontFamily: "inherit",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 0 15px rgba(249, 115, 22, 0.3)",
      transition: "all 0.2s"
    }),
    chatWindow: {
      background: "#161b22",
      border: "1px solid #21262d",
      borderRadius: "12px",
      height: "500px",
      overflowY: "auto",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)"
    },
    inputForm: {
      display: "flex",
      gap: "12px"
    },
    input: {
      flex: 1,
      padding: "14px 18px",
      background: "#0d1117",
      color: "#c9d1d9",
      border: "1px solid #21262d",
      borderRadius: "8px",
      fontSize: "13px",
      fontFamily: "inherit",
      outline: "none",
      transition: "border-color 0.25s, box-shadow 0.25s"
    },
    btnSend: (disabled) => ({
      padding: "14px 28px",
      background: disabled ? "#21262d" : "#f97316",
      color: disabled ? "#8b949e" : "#000",
      border: "none",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 700,
      fontFamily: "inherit",
      textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s"
    })
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* ── HEADER CARD ── */}
        <div style={S.headerCard}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#f97316", letterSpacing: "-1px" }}>⚡ Sentiment Q&A Chatbot</span>
              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: "rgba(249,115,22,0.15)", color: "#f97316", fontWeight: 700, letterSpacing: "1px" }}>RAG AGENT</span>
            </div>
            <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "6px", lineHeight: "1.5" }}>
              Ask deep questions about placements, fests, felines, mess, and academics. Sentiment context is fetched in real-time from Reddit.
            </div>
          </div>
          
          <div style={S.controls}>
            <select
              value={iitKey}
              onChange={(e) => setIitKey(e.target.value)}
              style={S.select}
              className="custom-select"
            >
              <option value="">All IITs Context</option>
              {IIT_OPTIONS.slice(1).map(iit => (
                <option key={iit} value={iit}>{iit}</option>
              ))}
            </select>
            <button
              onClick={handleIndex}
              disabled={indexing}
              style={S.btnIndex(indexing)}
            >
              {indexing ? "INDEXING..." : "INDEX DATA"}
            </button>
          </div>
        </div>

        {/* ── CHAT WINDOW ── */}
        <div style={S.chatWindow} className="chat-window">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", margin: "auto", maxWidth: "480px" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🤖</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#f97316", marginBottom: "8px" }}>PRIMED AND READY</div>
              <div style={{ fontSize: "11px", color: "#8b949e", lineHeight: "1.6" }}>
                Select an IIT key or use "All IITs Context" and click **INDEX DATA** first to load raw posts. Then, type your query below to analyze real-time student sentiment!
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isSystem = msg.role === "system";

            if (isSystem) {
              return (
                <div key={i} style={{
                  background: "#161b22",
                  border: "1px dashed #21262d",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "11px",
                  color: "#8b949e",
                  textAlign: "center"
                }}>
                  ⚙️ {msg.content}
                </div>
              );
            }

            return (
              <div key={i} style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: isUser ? "rgba(249, 115, 22, 0.05)" : "#0d1117",
                border: isUser ? "1px solid rgba(249, 115, 22, 0.2)" : "1px solid #21262d",
                alignSelf: isUser ? "flex-end" : "flex-start",
                maxWidth: "85%",
                boxShadow: isUser ? "none" : "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                <div style={{
                  fontSize: "10px",
                  color: isUser ? "#f97316" : "#8b949e",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  {isUser ? "👤 USER PROFILE" : "🤖 RAG SYNTHESIZER"}
                </div>
                
                {isUser ? (
                  <span style={{ fontSize: "13px", lineHeight: "1.6", color: "#f0f6fc", whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </span>
                ) : (
                  <div className="bot-response">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({ node, ...props }) => (
                          <h3 style={{
                            color: "#f0f6fc",
                            fontSize: "15px",
                            borderBottom: "1px solid #21262d",
                            paddingBottom: "6px",
                            marginTop: "14px",
                            marginBottom: "10px",
                            fontWeight: 700,
                            fontFamily: "'IBM Plex Mono', monospace"
                          }} {...props} />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 style={{
                            color: "#f97316",
                            fontSize: "12px",
                            fontWeight: 700,
                            marginTop: "14px",
                            marginBottom: "8px",
                            fontFamily: "'IBM Plex Mono', monospace"
                          }} {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p style={{
                            lineHeight: "1.6",
                            color: "#c9d1d9",
                            marginBottom: "10px",
                            fontSize: "12px"
                          }} {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong style={{
                            color: "#f0f6fc",
                            fontWeight: "700"
                          }} {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul style={{
                            paddingLeft: "0",
                            marginBottom: "10px",
                            listStyleType: "none"
                          }} {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={{
                            position: "relative",
                            marginBottom: "6px",
                            paddingLeft: "16px",
                            lineHeight: "1.5",
                            fontSize: "12px"
                          }} {...props}>
                            <span style={{
                              position: "absolute",
                              left: 0,
                              top: "2px",
                              color: "#f97316",
                              fontSize: "10px"
                            }}>⚡</span>
                            {props.children}
                          </li>
                        ),
                        code: ({ node, inline, ...props }) => (
                          <code style={{
                            background: "#21262d",
                            color: "#ff7b72",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "11px",
                            border: "1px solid #30363d"
                          }} {...props} />
                        ),
                        table: ({ node, ...props }) => (
                          <div style={{
                            overflowX: "auto",
                            marginBottom: "12px",
                            border: "1px solid #21262d",
                            borderRadius: "8px",
                            background: "#0d1117"
                          }}>
                            <table style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: "11px",
                              textAlign: "left"
                            }} {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead style={{
                            background: "#161b22",
                            borderBottom: "2px solid #21262d"
                          }} {...props} />
                        ),
                        th: ({ node, ...props }) => (
                          <th style={{
                            padding: "8px 12px",
                            fontWeight: "700",
                            color: "#8b949e",
                            fontFamily: "'IBM Plex Mono', monospace"
                          }} {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td style={{
                            padding: "8px 12px",
                            color: "#c9d1d9",
                            borderBottom: "1px solid #21262d"
                          }} {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <details style={{ marginTop: "12px", borderTop: "1px solid #21262d", paddingTop: "8px" }}>
                    <summary style={{ cursor: "pointer", color: "#8b949e", fontSize: "11px", userSelect: "none" }}>
                      🔗 View {msg.sources.length} matching sources
                    </summary>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                      {msg.sources.map((s, j) => {
                        const iitCol = IIT_COLORS[s.iit] || "#f97316";
                        return (
                          <div key={j} style={{
                            padding: "10px 12px",
                            background: "#161b22",
                            border: `1px solid #21262d`,
                            borderLeft: `3px solid ${iitCol}`,
                            borderRadius: "6px",
                            fontSize: "11px",
                            lineHeight: "1.4"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: 700, color: iitCol }}>{s.iit} • {s.category}</span>
                              <span style={{ color: s.score >= 0.2 ? "#10b981" : s.score <= -0.2 ? "#ef4444" : "#8b949e", fontWeight: 700 }}>
                                Sentiment: {s.score >= 0 ? "+" : ""}{s.score.toFixed(2)}
                              </span>
                            </div>
                            <span style={{ color: "#8b949e" }}>"{s.text?.substring(0, 180)}..."</span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
          {loading && (
            <div style={{
              alignSelf: "flex-start",
              padding: "16px 20px",
              borderRadius: "12px",
              background: "#0d1117",
              border: "1px solid #21262d",
              fontSize: "12px",
              color: "#8b949e",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span className="spinner">⚡</span> RAG agent is analyzing live Reddit sentiment...
            </div>
          )}
        </div>

        {/* ── PROMPT FORM ── */}
        <form onSubmit={handleSubmit} style={S.inputForm}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., for placement which iit is best"
            style={S.input}
            disabled={loading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={S.btnSend(loading || !question.trim())}
            className="chat-send-btn"
          >
            {loading ? "PENDING" : "ASK AGENT"}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');
        
        .chat-window::-webkit-scrollbar {
          width: 4px;
        }
        .chat-window::-webkit-scrollbar-track {
          background: #161b22;
        }
        .chat-window::-webkit-scrollbar-thumb {
          background: #21262d;
          border-radius: 2px;
        }

        .chat-input:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.15) !important;
        }
        
        .custom-select:focus {
          border-color: #f97316 !important;
        }

        .chat-send-btn:hover:not(:disabled) {
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);
          transform: translateY(-1px);
        }

        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        .spinner {
          animation: pulse 1.2s infinite;
          color: #f97316;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}