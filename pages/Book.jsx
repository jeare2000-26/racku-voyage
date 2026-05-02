import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Booking } from "@/api/entities";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

const T = {
  bg: "#0E0B08",
  sand: "#F5EDD6",
  sandMuted: "#C8B89A",
  sandFaint: "#7A6B55",
  terracotta: "#C4622D",
  terracottaLight: "#D97B4A",
  terracottaDark: "#8C3F18",
  card: "#17120D",
  cardHover: "#1F1812",
  border: "#2E2318",
  borderLight: "#3D3022",
};

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

  const inputStyle = {
    width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`,
    color: T.sand, fontSize: "15px", padding: "10px 0", outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
  };
  const labelStyle = { fontSize: "9px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "6px", display: "block" };

  // CONFIRMATION
  if (confirmed) return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.sand, display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap'); * { box-sizing: border-box; }`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: `1px solid ${T.border}`, background: T.card }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, letterSpacing: "5px", color: T.sand, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
          {/* Ornamental circle */}
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", border: `2px solid ${T.terracottaDark}`, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", position: "relative" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: `1px solid ${T.terracotta}`, position: "absolute" }} />
            <span style={{ fontSize: "24px", color: T.terracottaLight }}>✓</span>
          </div>
          <div style={{ fontSize: "9px", letterSpacing: "7px", color: T.terracotta, textTransform: "uppercase", marginBottom: "16px" }}>Booking Confirmed</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "38px", fontWeight: 300, margin: "0 0 6px", color: T.sand }}>{hotelName}</h2>
          <div style={{ fontSize: "12px", color: T.sandFaint, marginBottom: "40px" }}>Confirmation # {confirmed.bookingId}</div>

          <div style={{ border: `1px solid ${T.border}`, background: T.card, marginBottom: "32px", textAlign: "left" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg, ${T.terracottaDark}, #3A1206)` }}>
              <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.sandMuted, textTransform: "uppercase" }}>Reservation Summary</div>
            </div>
            <div style={{ padding: "0 24px" }}>
              {[
                ["Guest", `${form.firstName} ${form.lastName}`],
                ["Email", form.email],
                ["Check In", checkin],
                ["Check Out", checkout],
                ["Room", roomName],
                ["Duration", `${nights} night${nights > 1 ? "s" : ""}`],
                ["Total", `$${price} USD`],
                ["Your Commission", `+$${commission}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontSize: "12px", color: k === "Your Commission" ? T.terracottaLight : T.sandMuted }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => navigate("/")} style={{ background: T.terracotta, color: T.sand, border: "none", padding: "14px 32px", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.terracottaLight}
              onMouseLeave={e => e.currentTarget.style.background = T.terracotta}>
              New Search
            </button>
            <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sandMuted, padding: "14px 26px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.terracotta; e.currentTarget.style.color = T.terracotta; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sandMuted; }}>
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // BOOKING FORM
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.sand }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-bottom-color: ${T.terracotta} !important; }
        textarea:focus { border-color: ${T.terracotta} !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: `1px solid ${T.border}`, background: T.card, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, letterSpacing: "5px", color: T.sand, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sandMuted, padding: "7px 20px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.terracotta; e.currentTarget.style.color = T.terracotta; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sandMuted; }}>
          ← Back
        </button>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 62px)" }}>

        {/* LEFT: Hero panel */}
        <div style={{ width: "380px", minWidth: "380px", position: "relative", overflow: "hidden" }}>
          <img src="https://images.unsplash.com/photo-1580746738099-1c4c8bfdf2e9?w=800&q=85" alt="Riad"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45)", position: "absolute", inset: 0 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(14,11,8,0.3), rgba(14,11,8,0.85))" }} />
          <div style={{ position: "relative", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ fontSize: "9px", letterSpacing: "5px", color: T.terracotta, textTransform: "uppercase", marginBottom: "12px" }}>Complete Your Reservation</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "30px", fontWeight: 300, color: T.sand, margin: "0 0 6px", lineHeight: 1.2 }}>{hotelName}</h2>
            <div style={{ fontSize: "12px", color: T.sandMuted, marginBottom: "28px" }}>{roomName}</div>

            <div style={{ border: `1px solid ${T.border}`, background: "rgba(23,18,13,0.85)", padding: "20px" }}>
              {[["Check In", checkin], ["Check Out", checkout], ["Duration", `${nights} night${nights > 1 ? "s" : ""}`], ["Guests", `${adults} adult${parseInt(adults) > 1 ? "s" : ""}`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontSize: "11px", color: T.sandMuted }}>{v}</span>
                </div>
              ))}
              <div style={{ paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>Total</span>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 300, color: T.sand }}>${price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>Commission</span>
                <span style={{ fontSize: "14px", color: T.terracottaLight }}>+${commission}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div style={{ flex: 1, padding: "56px 64px", overflowY: "auto" }}>
          <div style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
              <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
              <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>Guest Information</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "38px", fontWeight: 300, margin: "0 0 40px", color: T.sand }}>Complete Your Stay</h1>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginBottom: "28px" }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Ahmed" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="El Fassi" style={inputStyle} required />
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" style={inputStyle} required />
              </div>

              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" style={inputStyle} />
              </div>

              <div style={{ marginBottom: "40px" }}>
                <label style={labelStyle}>Special Requests</label>
                <textarea value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Late check-in, dietary preferences, room preferences..." rows={4}
                  style={{ width: "100%", background: "transparent", border: `1px solid ${T.border}`, color: T.sand, fontSize: "14px", padding: "14px", fontFamily: "inherit", resize: "vertical", colorScheme: "dark", transition: "border-color 0.2s" }} />
              </div>

              {error && (
                <div style={{ background: "rgba(229,115,115,0.1)", border: "1px solid rgba(229,115,115,0.3)", color: "#E57373", padding: "12px 16px", fontSize: "12px", marginBottom: "20px" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? T.sandFaint : T.terracotta, color: T.sand, border: "none", padding: "18px", fontSize: "11px", letterSpacing: "4px", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600, transition: "background 0.2s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.terracottaLight; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.terracotta; }}>
                {loading ? "Processing Reservation..." : "Confirm Reservation"}
              </button>

              <div style={{ fontSize: "10px", color: T.sandFaint, textAlign: "center", marginTop: "16px", lineHeight: 1.8 }}>
                By confirming, you agree to our Terms of Service.<br />
                No payment is charged at this stage.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
