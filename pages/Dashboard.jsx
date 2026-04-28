import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking } from "@/api/entities";

const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

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

  const statusColor = { confirmed: "#4D2D1B", pending: "#867878", completed: "#46424A", cancelled: "#CBCBCB" };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: "#F0EDE8", minHeight: "100vh", color: "#1E1612", display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: "180px", minWidth: "180px", padding: "28px 20px",
        borderRight: "1px solid #D8D3CC", display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: "#F0EDE8", overflowY: "auto",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#1E1612", textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }}
            onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: "#46424A", marginBottom: "10px", cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#1E1612"}
              onMouseLeave={e => e.target.style.color = "#46424A"}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: "#D8D3CC", margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: "#867878", marginBottom: "9px" }}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate("/")} style={{
          background: "#1E1612", color: "#F0EDE8", border: "none",
          padding: "9px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%",
        }}>+ New Search</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1, padding: "48px" }}>

        <div style={{ marginBottom: "40px", borderBottom: "1px solid #D8D3CC", paddingBottom: "20px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "10px" }}>Commission Dashboard</div>
          <h1 style={{ fontSize: "36px", fontWeight: 300, margin: 0, letterSpacing: "-0.5px" }}>Earnings Overview</h1>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "#D8D3CC", marginBottom: "48px" }}>
          {[
            { label: "Total Bookings", value: bookings.length, sub: "All time" },
            { label: "Total Revenue", value: `$${Math.round(totalRevenue).toLocaleString()}`, sub: "USD" },
            { label: "Total Commission", value: `$${Math.round(totalCommission).toLocaleString()}`, sub: "15% margin", highlight: true },
            { label: "Pending Payout", value: `$${Math.round(pendingPayout).toLocaleString()}`, sub: "Awaiting" },
          ].map(stat => (
            <div key={stat.label} style={{ padding: "28px 24px", background: "#F0EDE8" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "10px" }}>{stat.label}</div>
              <div style={{ fontSize: "30px", fontWeight: 300, color: stat.highlight ? "#4D2D1B" : "#1E1612", lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: "#CBCBCB", marginTop: "4px" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1px solid #D8D3CC" }}>
          {[["all","All"],["confirmed","Confirmed"],["pending","Pending"],["completed","Completed"],["cancelled","Cancelled"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              background: "transparent", color: filter === val ? "#1E1612" : "#867878",
              border: "none", borderBottom: filter === val ? "2px solid #1E1612" : "2px solid transparent",
              padding: "10px 18px", fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              textTransform: "uppercase", marginBottom: "-1px",
            }}>{label}</button>
          ))}
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", fontSize: "11px", color: "#CBCBCB", letterSpacing: "4px", textTransform: "uppercase" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", border: "1px solid #D8D3CC" }}>
            <div style={{ fontSize: "12px", color: "#CBCBCB", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>No Bookings Yet</div>
            <button onClick={() => navigate("/")} style={{ background: "#1E1612", color: "#F0EDE8", border: "none", padding: "10px 24px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>Start Searching</button>
          </div>
        ) : (
          <div style={{ border: "1px solid #D8D3CC" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.6fr 0.8fr 0.8fr 0.7fr", padding: "12px 20px", background: "#FAFAF8", borderBottom: "1px solid #D8D3CC" }}>
              {["Hotel","Guest","Dates","Nights","Total","Commission","Status"].map(h => (
                <div key={h} style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {filtered.map((b, i) => (
              <div key={b.id} style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.6fr 0.8fr 0.8fr 0.7fr",
                padding: "15px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #EDEAE6" : "none",
                alignItems: "center", transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#FAFAF8"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <div style={{ fontSize: "13px", marginBottom: "2px" }}>{b.hotel_name}</div>
                  <div style={{ fontSize: "10px", color: "#CBCBCB" }}>{b.room_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px" }}>{b.guest_first_name} {b.guest_last_name}</div>
                  <div style={{ fontSize: "10px", color: "#CBCBCB" }}>{b.guest_email}</div>
                </div>
                <div style={{ fontSize: "11px", color: "#867878" }}>{b.checkin}<br />{b.checkout}</div>
                <div style={{ fontSize: "13px" }}>{b.nights}</div>
                <div style={{ fontSize: "14px" }}>${b.total_price}</div>
                <div style={{ fontSize: "14px", color: "#4D2D1B" }}>+${b.commission_earned}</div>
                <div>
                  <span style={{ fontSize: "9px", letterSpacing: "1px", color: statusColor[b.status] || "#867878", border: `1px solid ${statusColor[b.status] || "#D8D3CC"}`, padding: "3px 8px", textTransform: "uppercase" }}>
                    {b.status || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECONDARY STATS */}
        {bookings.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "#D8D3CC", marginTop: "24px" }}>
            {[
              { label: "Avg Commission / Booking", value: `$${Math.round(avgCommission)}` },
              { label: "Margin Rate", value: "15%" },
              { label: "Paid Out", value: `$${Math.round(totalCommission - pendingPayout).toLocaleString()}` },
            ].map(stat => (
              <div key={stat.label} style={{ padding: "20px 24px", background: "#F0EDE8" }}>
                <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "6px" }}>{stat.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 300, color: "#1E1612" }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
