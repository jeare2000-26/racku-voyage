import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Booking } from "@/api/entities";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;
const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

const T = {
  bg: "#0B0F1A", bgCard: "#111827", bgCardHover: "#161D2E", sidebar: "#0D1120",
  border: "#1E2A3D", gold: "#C9A84C", goldLight: "#E0C06A", goldMuted: "#8A6E32",
  text: "#F0EAD6", textMuted: "#8A99B8", textFaint: "#4A5568", white: "#FFFFFF",
};

const inputStyle = (T) => ({
  width: "100%", background: "transparent", border: "none",
  borderBottom: `1px solid ${T.border}`, color: T.text,
  fontSize: "14px", padding: "8px 0", outline: "none",
  fontFamily: "Georgia, serif", boxSizing: "border-box",
});

export default function Book() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", specialRequests: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const id = searchParams.get("hotelId") || "";
  const rateId = searchParams.get("rateId") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = searchParams.get("adults") || "2";
  const hotelName = searchParams.get("hotelName") || "Hotel";
  const roomName = searchParams.get("roomName") || "Room";
  const price = parseFloat(searchParams.get("price") || 0);
  const commission = parseFloat(searchParams.get("commission") || 0);
  const nights = checkin && checkout ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)) : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      const prebookRes = await fetch("https://api.liteapi.travel/v3.0/hotels/prebook", {
        method: "POST", headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ rateId }),
      });
      const prebookJson = await prebookRes.json();
      const prebookId = prebookJson.data?.prebookId;
      if (!prebookId) throw new Error(prebookJson.message || "Prebook failed");

      const bookRes = await fetch("https://api.liteapi.travel/v3.0/hotels/book", {
        method: "POST", headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          prebookId,
          guestInfo: { guestFirstName: form.firstName, guestLastName: form.lastName, guestEmail: form.email },
          payment: { method: "CREDIT_LIMIT" },
        }),
      });
      const bookJson = await bookRes.json();
      if (!bookJson.data) throw new Error(bookJson.message || "Booking failed");

      const saved = await Booking.create({
        booking_id: bookJson.data.bookingId || bookJson.data.id || `RV-${Date.now()}`,
        hotel_id: id, hotel_name: hotelName, guest_first_name: form.firstName,
        guest_last_name: form.lastName, guest_email: form.email, checkin, checkout,
        nights, adults: parseInt(adults), room_name: roomName, total_price: price,
        margin_percent: DEFAULT_MARGIN, commission_earned: commission, currency: "USD",
        status: "confirmed", payout_status: "pending", destination: hotelName,
      });
      setConfirmed({ bookingId: saved.booking_id });
    } catch (err) { setError(err.message || "Booking failed. Please try again."); }
    setLoading(false);
  };

  // CONFIRMATION SCREEN
  if (confirmed) return (
    <div style={{ fontFamily: "Georgia, serif", background: T.bg, minHeight: "100vh", display: "flex", color: T.text }}>
      <aside style={{ width: "180px", minWidth: "180px", padding: "28px 20px", borderRight: `1px solid ${T.border}`, position: "fixed", top: 0, left: 0, bottom: 0, background: T.sidebar }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }} onClick={() => navigate("/")}>RACKU VOYAGE</div>
        {NAV_ITEMS.map(item => <div key={item} style={{ fontSize: "12px", color: T.textMuted, marginBottom: "10px" }}>{item}</div>)}
      </aside>
      <main style={{ marginLeft: "180px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "0 24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: T.bgCard, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "22px" }}>✓</div>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: T.goldMuted, textTransform: "uppercase", marginBottom: "20px" }}>Booking Confirmed</div>
          <h2 style={{ fontSize: "32px", fontWeight: 300, margin: "0 0 6px", letterSpacing: "-0.5px", color: T.text }}>{hotelName}</h2>
          <div style={{ fontSize: "12px", color: T.textMuted, marginBottom: "36px" }}>Confirmation #{confirmed.bookingId}</div>
          <div style={{ border: `1px solid ${T.border}`, padding: "24px", marginBottom: "32px", textAlign: "left", background: T.bgCard }}>
            {[
              ["Guest", `${form.firstName} ${form.lastName}`],
              ["Email", form.email],
              ["Check In", checkin],
              ["Check Out", checkout],
              ["Room", roomName],
              ["Total", `$${price} USD`],
              ["Commission", `+$${commission}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase" }}>{k}</span>
                <span style={{ fontSize: "11px", color: k === "Commission" ? T.gold : T.textMuted }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => navigate("/")} style={{ background: T.gold, color: T.bg, border: "none", padding: "12px 28px", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 600 }}>New Search</button>
            <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: `1px solid ${T.goldMuted}`, color: T.gold, padding: "12px 22px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase" }}>Dashboard</button>
          </div>
        </div>
      </main>
    </div>
  );

  // BOOKING FORM
  return (
    <div style={{ fontFamily: "Georgia, serif", background: T.bg, minHeight: "100vh", color: T.text, display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{ width: "180px", minWidth: "180px", padding: "28px 20px", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: T.sidebar, overflowY: "auto" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }} onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: T.textMuted, marginBottom: "10px", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.gold}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>{item}</div>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => <div key={item} style={{ fontSize: "11px", color: T.textFaint, marginBottom: "9px" }}>{item}</div>)}
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1px solid ${T.goldMuted}`, color: T.gold, padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%" }}>← Back</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1, padding: "60px 80px" }}>
        <div style={{ maxWidth: "680px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: T.goldMuted, textTransform: "uppercase", marginBottom: "12px" }}>Complete Booking</div>
          <h1 style={{ fontSize: "36px", fontWeight: 300, margin: "0 0 4px", letterSpacing: "-0.5px", color: T.text }}>{hotelName}</h1>
          <div style={{ fontSize: "12px", color: T.textMuted, marginBottom: "40px" }}>
            {roomName} · {checkin} → {checkout} · {nights} night{nights > 1 ? "s" : ""} · {adults} guest{parseInt(adults) > 1 ? "s" : ""}
          </div>

          {/* PRICE SUMMARY */}
          <div style={{ border: `1px solid ${T.border}`, padding: "20px 24px", marginBottom: "40px", background: T.bgCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "5px" }}>Total Charge</div>
              <div style={{ fontSize: "32px", color: T.text, fontWeight: 300 }}>${price}</div>
              <div style={{ fontSize: "10px", color: T.textFaint, textTransform: "uppercase", letterSpacing: "1px" }}>USD · {nights} night{nights > 1 ? "s" : ""}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.goldMuted, textTransform: "uppercase", marginBottom: "5px" }}>Your Commission</div>
              <div style={{ fontSize: "28px", color: T.gold, fontWeight: 300 }}>+${commission}</div>
              <div style={{ fontSize: "10px", color: T.textMuted }}>{DEFAULT_MARGIN}% margin</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.textFaint, textTransform: "uppercase", marginBottom: "20px" }}>Guest Information</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              {[["firstName","First Name *"],["lastName","Last Name *"]].map(([field, label]) => (
                <div key={field}>
                  <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase", marginBottom: "7px" }}>{label}</div>
                  <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required style={inputStyle(T)} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase", marginBottom: "7px" }}>Email Address *</div>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required style={inputStyle(T)} />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase", marginBottom: "7px" }}>Phone Number</div>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                style={inputStyle(T)} />
            </div>

            <div style={{ marginBottom: "36px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase", marginBottom: "7px" }}>Special Requests</div>
              <textarea value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                rows={3} style={{ ...inputStyle(T), borderBottom: "none", border: `1px solid ${T.border}`, padding: "10px", resize: "vertical", background: T.bgCard }} />
            </div>

            {error && <div style={{ color: "#E57373", fontSize: "12px", marginBottom: "20px", padding: "12px", background: "rgba(229,115,115,0.1)", border: "1px solid rgba(229,115,115,0.3)" }}>{error}</div>}

            <button type="submit" disabled={loading} style={{
              background: loading ? T.border : T.gold, color: loading ? T.textFaint : T.bg,
              border: "none", padding: "16px 48px", fontSize: "11px", letterSpacing: "3px",
              cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase",
              fontWeight: 600, width: "100%", transition: "all 0.2s",
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.goldLight; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.gold; }}>
              {loading ? "Confirming..." : `Confirm Booking · $${price}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
