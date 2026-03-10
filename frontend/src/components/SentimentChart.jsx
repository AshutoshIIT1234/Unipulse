import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function SentimentChart({ data }) {
  if (!data || !data.timeline) {
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
        No trend data available
      </div>
    );
  }

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
        marginBottom: 14,
        fontFamily: "monospace",
      }}>
        SENTIMENT TREND
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data.timeline}>
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis dataKey="week" stroke="#484f58" fontSize={11} />
          <YAxis stroke="#484f58" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "#0d1117",
              border: "1px solid #21262d",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="pos"
            name="Positive"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#posGrad)"
          />
          <Area
            type="monotone"
            dataKey="neg"
            name="Negative"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#negGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}