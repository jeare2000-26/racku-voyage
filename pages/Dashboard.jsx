import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking } from "@/api/entities";

const T = {
  bg: "#111109",
  bgCard: "#191912",
  cream: "#F2EDE4",
  creamMuted: "#BDB9B0",
  creamFaint: "#6B6860",
  gold: "#C8A96E",
  goldMuted: "#8A7248",
  goldFaint: "#3D3220",
  border: "#2A2820",
  borderLight: "#3A3830",
};

const statusColors = {
  confirmed: { bg: "rgba(30,80,30,0.25)", border: "#2A6A2A", text: "#7EC87E" },
  pending:   { bg: "rgba(200,169,110,0.12)", border: "#8A7248", text: "#C8A96E" },
  completed: { bg: "rgba(242,237,228,0.06)", border: "#3A3830", text: "#BDB9B0" },
  cancelled: { bg: "rgba(229,115,115,0.1)", border: "#6A2A2A", text: "#E57373" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Booking.list().then(data => { setBookings(data || []); setLoading(false); });
  }, []);

  const totalRevenue = bookings.reduce((s, b) => s + (b.total_price || 0), 0);
  const totalCommission = bookings.reduce((s, b) => s + (b.commission_earned || 0), 0);
  const pendingPayout = bookings.filter(b => b.payout_status === "pending").reduce((s, b) => s + (b.commission_earned || 0), 0);
  const avgCommission = bookings.length > 0 ? totalCommission / bookings.length : 0;
  const paidOut = totalCommission - pendingPayout;
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter || b.payout_status === filter);

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        .row:hover { background: ${T.bgCard} !important; }
        .tab:hover { color: ${T.creamMuted} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 52px", borderBottom: `1px solid ${T.border}`, background: T.bgCard, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "5px", color: T.cream, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku <em style={{ color: T.gold, fontStyle: "italic" }}>Voyage</em>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase", border: `1px solid ${T.goldMuted}`, padding: "5px 14px" }}>Commission Dashboard</div>
          <button onClick={() => navigate("/")} style={{ background: T.gold, color: T.bg, border: "none", padding: "9px 24px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontWeight: 500, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#D4B87A"}
            onMouseLeave={e => e.currentTarget.style.background = T.gold}>
            + New Search
          </button>
        </div>
      </nav>

      <div style={{ padding: "56px 52px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
            <div style={{ width: "48px", height: "1px", background: T.gold }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Racku Voyage</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "52px", fontWeight: 400, margin: 0, color: T.cream, lineHeight: 1.05 }}>
            Earnings Overview
          </h1>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "2px", marginBottom: "52px" }}>
          {[
            { label: "Total Bookings", value: bookings.length, sub: "All time", accent: false },
            { label: "Total Revenue", value: `$${Math.round(totalRevenue).toLocaleString()}`, sub: "USD Generated", accent: false },
            { label: "Total Commission", value: `$${Math.round(totalCommission).toLocaleString()}`, sub: "15% Margin", accent: true },
            { label: "Pending Payout", value: `$${Math.round(pendingPayout).toLocaleString()}`, sub: "Awaiting Payment", accent: false },
            { label: "Paid Out", value: `$${Math.round(paidOut).toLocaleString()}`, sub: "Received", accent: false },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "32px 26px", background: stat.accent ? "rgba(200,169,110,0.08)" : T.bgCard, border: `1px solid ${stat.accent ? T.goldMuted : T.border}` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: stat.accent ? T.gold : T.creamFaint, textTransform: "uppercase", marginBottom: "14px" }}>{stat.label}</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "34px", fontWeight: 300, color: stat.accent ? T.gold : T.cream, lineHeight: 1, marginBottom: "6px" }}>{stat.value}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, fontWeight: 300 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* SECONDARY METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", marginBottom: "44px" }}>
          {[
            { label: "Avg Commission / Booking", value: `$${Math.round(avgCommission)}` },
            { label: "Commission Rate", value: "15%" },
            { label: "Confirmed Bookings", value: bookings.filter(b => b.status === "confirmed").length },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "20px 26px", background: T.bgCard, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase" }}>{stat.label}</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: 300, fontStyle: "italic", color: T.gold }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: "0" }}>
          {[["all","All Bookings"],["confirmed","Confirmed"],["pending","Pending"],["completed","Completed"],["cancelled","Cancelled"]].map(([val, label]) => (
            <button key={val} className="tab" onClick={() => setFilter(val)} style={{
              background: "transparent", color: filter === val ? T.gold : T.creamFaint,
              border: "none", borderBottom: `2px solid ${filter === val ? T.gold : "transparent"}`,
              padding: "12px 24px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px",
              cursor: "pointer", textTransform: "uppercase", marginBottom: "-1px", transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "32px", height: "32px", border: `1.5px solid ${T.border}`, borderTop: `1.5px solid ${T.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, letterSpacing: "4px", textTransform: "uppercase" }}>Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", border: `1px solid ${T.border}`, background: T.bgCard, borderTop: "none" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 300, fontStyle: "italic", color: T.cream, marginBottom: "12px" }}>No bookings yet</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: T.creamFaint, marginBottom: "28px", fontWeight: 300 }}>Start searching for hotels to earn commissions.</div>
            <button onClick={() => navigate("/")} style={{ background: T.gold, color: T.bg, border: "none", padding: "14px 34px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 500 }}>
              Search Hotels
            </button>
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.border}`, borderTop: "none" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.5fr 0.9fr 0.9fr 0.7fr", padding: "14px 26px", background: T.bgCard, borderBottom: `1px solid ${T.border}` }}>
              {["Hotel", "Guest", "Dates", "Nights", "Total", "Commission", "Status"].map(h => (
                <div key={h} style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: T.creamFaint, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {filtered.map((b, i) => (
              <div key={b.id} className="row" style={{
                display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.5fr 0.9fr 0.9fr 0.7fr",
                padding: "18px 26px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                alignItems: "center", background: T.bg, transition: "background 0.15s",
              }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "14px", color: T.cream, marginBottom: "2px" }}>{b.hotel_name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, fontWeight: 300 }}>{b.room_name}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: T.creamMuted, fontWeight: 300 }}>{b.guest_first_name} {b.guest_last_name}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, fontWeight: 300 }}>{b.guest_email}</div>
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamMuted, lineHeight: 1.7, fontWeight: 300 }}>{b.checkin}<br />{b.checkout}</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", color: T.cream, fontWeight: 300 }}>{b.nights}</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", color: T.cream, fontWeight: 300 }}>${b.total_price}</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", color: T.gold, fontWeight: 300 }}>+${b.commission_earned}</div>
                <div>
                  {(() => {
                    const sc = statusColors[b.status] || statusColors.pending;
                    return <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "1.5px", color: sc.text, background: sc.bg, border: `1px solid ${sc.border}`, padding: "4px 10px", textTransform: "uppercase" }}>{b.status || "pending"}</span>;
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "52px", paddingTop: "28px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 300, fontStyle: "italic", color: T.creamFaint, letterSpacing: "2px" }}>
            Racku <em style={{ color: T.goldMuted }}>Voyage</em>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, letterSpacing: "1px", fontWeight: 300 }}>
            {bookings.length} total bookings · 15% commission rate
          </div>
        </div>
      </div>
    </div>
  );
}
