import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Booking } from "@/api/entities";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

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
        body: JSON.stringify({ prebookId, guestInfo: { guestFirstName: form.firstName, guestLastName: form.lastName, guestEmail: form.email }, payment: { method: "CREDIT_LIMIT" } }),
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

  // CONFIRMATION
  if (confirmed) return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.cream, display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: `1px solid ${T.border}`, background: T.bgCard }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "5px", color: T.cream, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku <em style={{ color: T.gold, fontStyle: "italic" }}>Voyage</em>
        </div>
      </nav>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px" }}>
        <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
          {/* Confirmation icon */}
          <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 32px" }}>
            <div style={{ position: "absolute", inset: 0, border: `1px solid ${T.goldMuted}`, borderRadius: "50%" }} />
            <div style={{ position: "absolute", inset: "6px", border: `1px solid rgba(200,169,110,0.3)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: T.gold, fontStyle: "italic" }}>✓</span>
            </div>
          </div>

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "7px", color: T.gold, textTransform: "uppercase", marginBottom: "16px" }}>Booking Confirmed</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "38px", fontWeight: 400, margin: "0 0 6px", color: T.cream }}>{hotelName}</h2>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: T.creamFaint, marginBottom: "40px", fontWeight: 300 }}>Confirmation # {confirmed.bookingId}</div>

          <div style={{ border: `1px solid ${T.border}`, background: T.bgCard, marginBottom: "32px", textAlign: "left" }}>
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, background: "rgba(200,169,110,0.06)" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase" }}>Reservation Summary</div>
            </div>
            <div style={{ padding: "0 24px" }}>
              {[["Guest", `${form.firstName} ${form.lastName}`], ["Email", form.email], ["Check In", checkin], ["Check Out", checkout], ["Room", roomName], ["Duration", `${nights} night${nights > 1 ? "s" : ""}`], ["Total", `$${price} USD`], ["Your Commission", `+$${commission}`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontFamily: k === "Total" || k === "Your Commission" ? "'Playfair Display', Georgia, serif" : "'Inter', sans-serif", fontSize: k === "Total" ? "16px" : "12px", color: k === "Your Commission" ? T.gold : T.creamMuted, fontWeight: 300 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => navigate("/")} style={{ background: T.gold, color: T.bg, border: "none", padding: "14px 34px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 500, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#D4B87A"}
              onMouseLeave={e => e.currentTarget.style.background = T.gold}>
              New Search
            </button>
            <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.creamMuted, padding: "14px 28px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.creamMuted; }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // BOOKING FORM
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, minHeight: "100vh", color: T.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        input:focus { border-bottom-color: ${T.gold} !important; }
        textarea:focus { border-color: ${T.gold} !important; outline: none; }
        input::placeholder { color: ${T.creamFaint}; font-family: 'Inter', sans-serif; font-weight: 300; }
        textarea::placeholder { color: ${T.creamFaint}; font-family: 'Inter', sans-serif; font-weight: 300; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: `1px solid ${T.border}`, background: T.bgCard, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "5px", color: T.cream, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku <em style={{ color: T.gold, fontStyle: "italic" }}>Voyage</em>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.creamMuted, padding: "7px 22px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.creamMuted; }}>
          ← Back
        </button>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 62px)" }}>

        {/* LEFT: Summary panel */}
        <div style={{ width: "400px", minWidth: "400px", position: "relative", overflow: "hidden" }}>
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=85" alt="Hotel"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)", position: "absolute", inset: 0 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(17,17,9,0.2), rgba(17,17,9,0.85))" }} />
          <div style={{ position: "relative", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
              <div style={{ width: "32px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Your Reservation</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 400, color: T.cream, margin: "0 0 4px", lineHeight: 1.2 }}>{hotelName}</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: T.creamMuted, marginBottom: "32px", fontStyle: "italic", fontWeight: 300 }}>{roomName}</div>

            <div style={{ border: `1px solid rgba(42,40,32,0.8)`, background: "rgba(25,25,18,0.88)", padding: "22px" }}>
              {[["Check In", checkin], ["Check Out", checkout], ["Duration", `${nights} night${nights > 1 ? "s" : ""}`], ["Guests", `${adults} adult${parseInt(adults) > 1 ? "s" : ""}`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamMuted, fontWeight: 300 }}>{v}</span>
                </div>
              ))}
              <div style={{ paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase" }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 300, color: T.cream }}>${price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase" }}>Commission</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: T.gold }}>+${commission}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div style={{ flex: 1, padding: "60px 72px", overflowY: "auto", background: T.bg }}>
          <div style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
              <div style={{ width: "40px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Guest Details</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "40px", fontWeight: 400, margin: "0 0 48px", color: T.cream, lineHeight: 1.1 }}>
              Complete Your Stay
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
                {[["First Name", "firstName", "Ahmed"], ["Last Name", "lastName", "El Fassi"]].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "8px" }}>{label} *</div>
                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} required
                      style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 0", outline: "none", fontWeight: 300, transition: "border-color 0.2s" }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "32px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "8px" }}>Email Address *</div>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 0", outline: "none", fontWeight: 300, transition: "border-color 0.2s" }}
                />
              </div>

              <div style={{ marginBottom: "32px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "8px" }}>Phone Number</div>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000"
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "15px", padding: "10px 0", outline: "none", fontWeight: 300, transition: "border-color 0.2s" }}
                />
              </div>

              <div style={{ marginBottom: "44px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "8px" }}>Special Requests</div>
                <textarea value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} placeholder="Late check-in, dietary preferences, room preferences..." rows={4}
                  style={{ width: "100%", background: "transparent", border: `1px solid ${T.border}`, color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "14px", padding: "14px", resize: "vertical", colorScheme: "dark", transition: "border-color 0.2s", fontWeight: 300 }}
                />
              </div>

              {error && (
                <div style={{ background: "rgba(229,115,115,0.08)", border: "1px solid rgba(229,115,115,0.25)", color: "#E57373", padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: "12px", marginBottom: "24px" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: "100%", background: loading ? T.creamFaint : T.gold, color: T.bg, border: "none", padding: "18px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "4px", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", fontWeight: 500, transition: "background 0.2s" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#D4B87A"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.gold; }}>
                {loading ? "Processing..." : "Confirm Reservation"}
              </button>

              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, textAlign: "center", marginTop: "16px", lineHeight: 1.8, fontWeight: 300 }}>
                No payment charged now · Review on next step
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
