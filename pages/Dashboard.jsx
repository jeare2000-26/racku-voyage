import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking } from "@/api/entities";

const T = {
  bg: "#0E0B08",
  sand: "#F5EDD6",
  sandMuted: "#C8B89A",
  sandFaint: "#7A6B55",
  terracotta: "#C4622D",
  terracottaLight: "#D97B4A",
  terracottaDark: "#8C3F18",
  teal: "#1B4B4B",
  card: "#17120D",
  cardHover: "#1F1812",
  border: "#2E2318",
  borderLight: "#3D3022",
};

const statusColors = {
  confirmed: { bg: "rgba(27,75,75,0.3)", border: "#1B4B4B", text: "#6BBFBF" },
  pending:   { bg: "rgba(196,98,45,0.15)", border: T.terracottaDark, text: T.terracottaLight },
  completed: { bg: "rgba(245,237,214,0.08)", border: "#4A3A28", text: T.sandMuted },
  cancelled: { bg: "rgba(229,115,115,0.12)", border: "#5C2020", text: "#E57373" },
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
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.sand }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        .table-row:hover { background: ${T.cardHover} !important; }
        .tab-btn:hover { color: ${T.sand} !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 48px", borderBottom: `1px solid ${T.border}`, background: T.card, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, letterSpacing: "5px", color: T.sand, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase", border: `1px solid ${T.terracottaDark}`, padding: "5px 14px" }}>Commission Dashboard</div>
          <button onClick={() => navigate("/")} style={{ background: T.terracotta, color: T.sand, border: "none", padding: "8px 22px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = T.terracottaLight}
            onMouseLeave={e => e.currentTarget.style.background = T.terracotta}>
            + New Search
          </button>
        </div>
      </nav>

      <div style={{ padding: "48px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
            <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
            <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>Racku Voyage</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "48px", fontWeight: 300, margin: 0, color: T.sand }}>
            Earnings Overview
          </h1>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "2px", marginBottom: "48px" }}>
          {[
            { label: "Total Bookings", value: bookings.length, sub: "All time", accent: false },
            { label: "Total Revenue", value: `$${Math.round(totalRevenue).toLocaleString()}`, sub: "USD Generated", accent: false },
            { label: "Total Commission", value: `$${Math.round(totalCommission).toLocaleString()}`, sub: "15% Margin", accent: true },
            { label: "Pending Payout", value: `$${Math.round(pendingPayout).toLocaleString()}`, sub: "Awaiting Payment", accent: false },
            { label: "Paid Out", value: `$${Math.round(paidOut).toLocaleString()}`, sub: "Received", accent: false },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "28px 24px", background: stat.accent ? `linear-gradient(135deg, ${T.terracottaDark}, #3A1206)` : T.card, border: `1px solid ${stat.accent ? T.terracottaDark : T.border}`, position: "relative", overflow: "hidden" }}>
              {stat.accent && <div style={{ position: "absolute", top: 0, right: 0, width: "60px", height: "60px", background: "rgba(255,255,255,0.03)", borderRadius: "0 0 0 60px" }} />}
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: stat.accent ? T.sandMuted : T.sandFaint, textTransform: "uppercase", marginBottom: "12px" }}>{stat.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 300, color: stat.accent ? T.sand : T.sand, lineHeight: 1, marginBottom: "6px" }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: stat.accent ? T.sandMuted : T.sandFaint }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* MINI METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", marginBottom: "40px" }}>
          {[
            { label: "Avg Commission / Booking", value: `$${Math.round(avgCommission)}` },
            { label: "Commission Rate", value: "15%" },
            { label: "Confirmed Bookings", value: bookings.filter(b => b.status === "confirmed").length },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "18px 24px", background: T.card, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>{stat.label}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 300, color: T.terracottaLight }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: "0", marginBottom: "0", borderBottom: `1px solid ${T.border}` }}>
          {[["all","All Bookings"],["confirmed","Confirmed"],["pending","Pending"],["completed","Completed"],["cancelled","Cancelled"]].map(([val, label]) => (
            <button key={val} className="tab-btn" onClick={() => setFilter(val)} style={{
              background: "transparent", color: filter === val ? T.terracottaLight : T.sandFaint,
              border: "none", borderBottom: `2px solid ${filter === val ? T.terracotta : "transparent"}`,
              padding: "12px 22px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer",
              textTransform: "uppercase", fontFamily: "inherit", marginBottom: "-1px", transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "36px", height: "36px", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.terracotta}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: "10px", color: T.sandFaint, letterSpacing: "4px", textTransform: "uppercase" }}>Loading...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", border: `1px solid ${T.border}`, background: T.card, marginTop: "0" }}>
            <div style={{ fontSize: "9px", letterSpacing: "5px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "16px" }}>No Bookings Yet</div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 300, color: T.sand, marginBottom: "28px" }}>Start exploring hotels</div>
            <button onClick={() => navigate("/")} style={{ background: T.terracotta, color: T.sand, border: "none", padding: "14px 32px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600 }}>
              Search Hotels
            </button>
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.border}`, borderTop: "none" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.5fr 0.9fr 0.9fr 0.7fr", padding: "14px 24px", background: T.card, borderBottom: `1px solid ${T.border}` }}>
              {["Hotel", "Guest", "Dates", "Nights", "Total", "Commission", "Status"].map(h => (
                <div key={h} style={{ fontSize: "8px", letterSpacing: "3px", color: T.sandFaint, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {filtered.map((b, i) => (
              <div key={b.id} className="table-row" style={{
                display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.5fr 0.9fr 0.9fr 0.7fr",
                padding: "16px 24px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                alignItems: "center", background: T.bg, transition: "background 0.15s",
              }}>
                <div>
                  <div style={{ fontSize: "13px", color: T.sand, marginBottom: "2px" }}>{b.hotel_name}</div>
                  <div style={{ fontSize: "10px", color: T.sandFaint }}>{b.room_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: T.sandMuted }}>{b.guest_first_name} {b.guest_last_name}</div>
                  <div style={{ fontSize: "10px", color: T.sandFaint }}>{b.guest_email}</div>
                </div>
                <div style={{ fontSize: "11px", color: T.sandMuted, lineHeight: 1.6 }}>{b.checkin}<br />{b.checkout}</div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: "16px", color: T.sand, fontWeight: 300 }}>{b.nights}</div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: "16px", color: T.sand, fontWeight: 300 }}>${b.total_price}</div>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: "16px", color: T.terracottaLight, fontWeight: 300 }}>+${b.commission_earned}</div>
                <div>
                  {(() => {
                    const sc = statusColors[b.status] || statusColors.pending;
                    return (
                      <span style={{ fontSize: "8px", letterSpacing: "1.5px", color: sc.text, background: sc.bg, border: `1px solid ${sc.border}`, padding: "4px 10px", textTransform: "uppercase" }}>
                        {b.status || "pending"}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 300, letterSpacing: "4px", color: T.sandFaint }}>
            Racku<span style={{ color: T.terracottaDark }}>·</span>Voyage
          </div>
          <div style={{ fontSize: "10px", color: T.sandFaint, letterSpacing: "1px" }}>
            {bookings.length} total bookings · 15% commission rate
          </div>
        </div>
      </div>
    </div>
  );
}
