import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking } from "@/api/entities";

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("-created_date");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await Booking.list();
        setBookings(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = bookings.filter(b => filter === "all" ? true : b.status === filter);

  const totalRevenue = bookings.reduce((s, b) => s + (b.total_price || 0), 0);
  const totalCommission = bookings.reduce((s, b) => s + (b.commission_earned || 0), 0);
  const pendingPayout = bookings.filter(b => b.payout_status === "pending").reduce((s, b) => s + (b.commission_earned || 0), 0);
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const avgCommission = bookings.length > 0 ? Math.round(totalCommission / bookings.length) : 0;

  const stats = [
    { label: "TOTAL BOOKINGS", value: bookings.length, sub: `${confirmedCount} confirmed`, color: "#c9a84c" },
    { label: "TOTAL REVENUE", value: `$${totalRevenue.toLocaleString()}`, sub: "all bookings", color: "#c9a84c" },
    { label: "TOTAL COMMISSION", value: `$${totalCommission.toLocaleString()}`, sub: "@ 15% margin", color: "#4a9060" },
    { label: "PENDING PAYOUT", value: `$${pendingPayout.toLocaleString()}`, sub: "awaiting weekly payout", color: "#e4a84c" },
  ];

  const statusColor = { confirmed: "#4a9060", pending: "#e4a84c", cancelled: "#c0504a", completed: "#4a7090" };
  const payoutColor = { pending: "#e4a84c", paid: "#4a9060" };

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px" }}>RACKU</span>
          <span style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#c9a84c" }}>COMMISSION DASHBOARD</div>
        <button onClick={() => navigate("/")} style={{
          background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c",
          padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer",
        }}>← BACK TO SITE</button>
      </nav>

      <div style={{ padding: "48px 60px" }}>

        {/* STATS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "48px" }}>
          {stats.map(stat => (
            <div key={stat.label} style={{
              padding: "28px", border: "1px solid rgba(201,168,76,0.15)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#5a5040", marginBottom: "12px" }}>{stat.label}</div>
              <div style={{ fontSize: "34px", color: stat.color, fontWeight: "300", letterSpacing: "1px" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#5a5040", marginTop: "8px", letterSpacing: "1px" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* COMMISSION BREAKDOWN */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "48px" }}>
          <div style={{ padding: "28px", border: "1px solid rgba(201,168,76,0.15)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "20px" }}>COMMISSION BREAKDOWN</div>
            {[
              { label: "Avg. Commission per Booking", value: `$${avgCommission}` },
              { label: "Margin Rate Applied", value: "15%" },
              { label: "Paid Out", value: `$${(totalCommission - pendingPayout).toLocaleString()}` },
              { label: "Pending Payout", value: `$${pendingPayout.toLocaleString()}` },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "12px", color: "#7a6e5a" }}>{item.label}</span>
                <span style={{ fontSize: "14px", color: "#c9a84c" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "28px", border: "1px solid rgba(201,168,76,0.15)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "20px" }}>BOOKING STATUS SUMMARY</div>
            {["confirmed", "pending", "completed", "cancelled"].map(status => {
              const count = bookings.filter(b => b.status === status).length;
              const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
              return (
                <div key={status} style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", letterSpacing: "2px", color: statusColor[status], textTransform: "uppercase" }}>{status}</span>
                    <span style={{ fontSize: "12px", color: "#7a6e5a" }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: statusColor[status], borderRadius: "2px", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c" }}>ALL BOOKINGS</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "confirmed", "pending", "completed", "cancelled"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  background: filter === f ? "#c9a84c" : "transparent",
                  color: filter === f ? "#0a0a0a" : "#7a6e5a",
                  border: "1px solid rgba(201,168,76,0.3)",
                  padding: "6px 14px", fontSize: "10px", letterSpacing: "2px",
                  cursor: "pointer", textTransform: "uppercase",
                }}>{f}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px", color: "#7a6e5a", letterSpacing: "3px", fontSize: "13px" }}>
              LOADING BOOKINGS...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", border: "1px solid rgba(201,168,76,0.1)" }}>
              <div style={{ fontSize: "36px", color: "#c9a84c", marginBottom: "16px" }}>✦</div>
              <div style={{ fontSize: "14px", color: "#5a5040", letterSpacing: "2px" }}>NO BOOKINGS YET</div>
              <div style={{ fontSize: "12px", color: "#3a3028", marginTop: "8px" }}>Bookings will appear here once guests start reserving</div>
              <button onClick={() => navigate("/")} style={{
                marginTop: "24px", background: "#c9a84c", color: "#0a0a0a", border: "none",
                padding: "12px 28px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer",
              }}>GO TO SITE</button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(201,168,76,0.2)" }}>
                    {["BOOKING ID", "GUEST", "HOTEL", "DATES", "NIGHTS", "TOTAL", "COMMISSION", "STATUS", "PAYOUT"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "9px", letterSpacing: "2px", color: "#5a5040", fontWeight: "400", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <tr key={b.id} style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      transition: "background 0.2s",
                    }}
                      onMouseOver={e => e.currentTarget.style.background = "rgba(201,168,76,0.04)"}
                      onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                    >
                      <td style={{ padding: "14px 16px", fontSize: "11px", color: "#c9a84c", fontFamily: "monospace" }}>{b.booking_id || "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#d4c5a0" }}>{b.guest_first_name} {b.guest_last_name}</td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#b0a080", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.hotel_name || b.hotel_id}</td>
                      <td style={{ padding: "14px 16px", fontSize: "11px", color: "#7a6e5a", whiteSpace: "nowrap" }}>{b.checkin} → {b.checkout}</td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#7a6e5a", textAlign: "center" }}>{b.nights}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#d4c5a0" }}>${(b.total_price || 0).toLocaleString()}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#4a9060", fontWeight: "500" }}>${(b.commission_earned || 0).toLocaleString()}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "9px", letterSpacing: "2px", padding: "4px 10px",
                          border: `1px solid ${statusColor[b.status] || "#7a6e5a"}`,
                          color: statusColor[b.status] || "#7a6e5a", textTransform: "uppercase",
                        }}>{b.status}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "9px", letterSpacing: "2px", padding: "4px 10px",
                          border: `1px solid ${payoutColor[b.payout_status] || "#7a6e5a"}`,
                          color: payoutColor[b.payout_status] || "#7a6e5a", textTransform: "uppercase",
                        }}>{b.payout_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px", fontSize: "11px", color: "#3a3028", letterSpacing: "2px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        © 2024 RACKU VOYAGE · COMMISSION DASHBOARD · POWERED BY LITEAPI
      </div>
    </div>
  );
}
