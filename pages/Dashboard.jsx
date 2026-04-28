import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking } from "@/api/entities";

const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

const T = {
  bg: "#0B0F1A", bgCard: "#111827", bgCardHover: "#161D2E", sidebar: "#0D1120",
  border: "#1E2A3D", gold: "#C9A84C", goldLight: "#E0C06A", goldMuted: "#8A6E32",
  text: "#F0EAD6", textMuted: "#8A99B8", textFaint: "#4A5568", white: "#FFFFFF",
};

const statusColors = {
  confirmed: { bg: "#0F2D1A", border: "#1A5C2A", text: "#4CAF50" },
  pending:   { bg: "#1A1A0D", border: "#5C4A00", text: "#C9A84C" },
  completed: { bg: "#0D1A2D", border: "#1A3A5C", text: "#4A9ECC" },
  cancelled: { bg: "#1A0D0D", border: "#5C1A1A", text: "#E57373" },
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

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter || b.payout_status === filter);

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.text, display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: "180px", minWidth: "180px", padding: "28px 20px",
        borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: T.sidebar, overflowY: "auto",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }}
            onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: T.textMuted, marginBottom: "10px", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.gold}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: T.textFaint, marginBottom: "9px" }}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate("/")} style={{
          background: T.gold, color: T.bg, border: "none",
          padding: "9px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%", fontWeight: 600,
        }}>+ New Search</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1, padding: "48px" }}>

        <div style={{ marginBottom: "40px", borderBottom: `1px solid ${T.border}`, paddingBottom: "20px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: T.goldMuted, textTransform: "uppercase", marginBottom: "10px" }}>Commission Dashboard</div>
          <h1 style={{ fontSize: "36px", fontWeight: 300, margin: 0, letterSpacing: "-0.5px", color: T.text }}>Earnings Overview</h1>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", marginBottom: "48px" }}>
          {[
            { label: "Total Bookings", value: bookings.length, sub: "All time", highlight: false },
            { label: "Total Revenue", value: `$${Math.round(totalRevenue).toLocaleString()}`, sub: "USD", highlight: false },
            { label: "Total Commission", value: `$${Math.round(totalCommission).toLocaleString()}`, sub: "15% margin", highlight: true },
            { label: "Pending Payout", value: `$${Math.round(pendingPayout).toLocaleString()}`, sub: "Awaiting", highlight: false },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "28px 24px", background: T.bgCard, border: `1px solid ${stat.highlight ? T.goldMuted : T.border}` }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "10px" }}>{stat.label}</div>
              <div style={{ fontSize: "30px", fontWeight: 300, color: stat.highlight ? T.gold : T.text, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: T.textFaint, marginTop: "4px" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: `1px solid ${T.border}` }}>
          {[["all","All"],["confirmed","Confirmed"],["pending","Pending"],["completed","Completed"],["cancelled","Cancelled"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              background: "transparent", color: filter === val ? T.gold : T.textFaint,
              border: "none", borderBottom: filter === val ? `2px solid ${T.gold}` : "2px solid transparent",
              padding: "10px 18px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              textTransform: "uppercase", marginBottom: "-1px", transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", fontSize: "11px", color: T.textFaint, letterSpacing: "4px", textTransform: "uppercase" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", border: `1px solid ${T.border}`, background: T.bgCard }}>
            <div style={{ fontSize: "12px", color: T.textFaint, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>No Bookings Yet</div>
            <button onClick={() => navigate("/")} style={{ background: T.gold, color: T.bg, border: "none", padding: "10px 24px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600 }}>Start Searching</button>
          </div>
        ) : (
          <div style={{ border: `1px solid ${T.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.6fr 0.8fr 0.8fr 0.7fr", padding: "12px 20px", background: T.bgCard, borderBottom: `1px solid ${T.border}` }}>
              {["Hotel","Guest","Dates","Nights","Total","Commission","Status"].map(h => (
                <div key={h} style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {filtered.map((b, i) => (
              <div key={b.id} style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.6fr 0.8fr 0.8fr 0.7fr",
                padding: "15px 20px", borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                alignItems: "center", transition: "background 0.15s", background: T.bg,
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.bgCard}
                onMouseLeave={e => e.currentTarget.style.background = T.bg}
              >
                <div>
                  <div style={{ fontSize: "13px", marginBottom: "2px", color: T.text }}>{b.hotel_name}</div>
                  <div style={{ fontSize: "10px", color: T.textFaint }}>{b.room_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: T.text }}>{b.guest_first_name} {b.guest_last_name}</div>
                  <div style={{ fontSize: "10px", color: T.textFaint }}>{b.guest_email}</div>
                </div>
                <div style={{ fontSize: "11px", color: T.textMuted }}>{b.checkin}<br />{b.checkout}</div>
                <div style={{ fontSize: "13px", color: T.text }}>{b.nights}</div>
                <div style={{ fontSize: "14px", color: T.text }}>${b.total_price}</div>
                <div style={{ fontSize: "14px", color: T.gold }}>+${b.commission_earned}</div>
                <div>
                  {(() => {
                    const sc = statusColors[b.status] || statusColors.pending;
                    return (
                      <span style={{ fontSize: "9px", letterSpacing: "1px", color: sc.text, background: sc.bg, border: `1px solid ${sc.border}`, padding: "3px 8px", textTransform: "uppercase" }}>
                        {b.status || "pending"}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECONDARY STATS */}
        {bookings.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px", marginTop: "24px" }}>
            {[
              { label: "Avg Commission / Booking", value: `$${Math.round(avgCommission)}` },
              { label: "Margin Rate", value: "15%" },
              { label: "Paid Out", value: `$${Math.round(totalCommission - pendingPayout).toLocaleString()}` },
            ].map(stat => (
              <div key={stat.label} style={{ padding: "20px 24px", background: T.bgCard, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase", marginBottom: "6px" }}>{stat.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 300, color: T.text }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
