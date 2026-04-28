import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Booking } from "@/api/entities";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;
const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", specialRequests: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

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

  if (confirmed) return (
    <div style={{ fontFamily: "Georgia, serif", background: "#F0EDE8", minHeight: "100vh", display: "flex" }}>
      <aside style={{ width: "180px", minWidth: "180px", padding: "28px 20px", borderRight: "1px solid #D8D3CC", position: "fixed", top: 0, left: 0, bottom: 0, background: "#F0EDE8" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#1E1612", textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }} onClick={() => navigate("/")}>RACKU VOYAGE</div>
        {NAV_ITEMS.map(item => <div key={item} style={{ fontSize: "12px", color: "#46424A", marginBottom: "10px" }}>{item}</div>)}
      </aside>
      <main style={{ marginLeft: "180px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "0 24px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "20px" }}>Booking Confirmed</div>
          <h2 style={{ fontSize: "36px", fontWeight: 300, margin: "0 0 6px", letterSpacing: "-0.5px" }}>{hotelName}</h2>
          <div style={{ fontSize: "12px", color: "#867878", marginBottom: "36px" }}>Confirmation #{confirmed.bookingId}</div>
          <div style={{ border: "1px solid #D8D3CC", padding: "24px", marginBottom: "32px", textAlign: "left" }}>
            {[["Guest", `${form.firstName} ${form.lastName}`],["Email",form.email],["Check In",checkin],["Check Out",checkout],["Room",roomName],["Total",`$${price} USD`],["Commission",`+$${commission}`]].map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #EDEAE6" }}>
                <span style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase" }}>{k}</span>
                <span style={{ fontSize: "11px", color: "#46424A" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => navigate("/")} style={{ background: "#1E1612", color: "#F0EDE8", border: "none", padding: "12px 28px", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase" }}>New Search</button>
            <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "1px solid #D8D3CC", color: "#46424A", padding: "12px 22px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase" }}>Dashboard</button>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#F0EDE8", minHeight: "100vh", color: "#1E1612", display: "flex" }}>
      {/* SIDEBAR */}
      <aside style={{ width: "180px", minWidth: "180px", padding: "28px 20px", borderRight: "1px solid #D8D3CC", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: "#F0EDE8", overflowY: "auto" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#1E1612", textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }} onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: "#46424A", marginBottom: "10px", cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#1E1612"} onMouseLeave={e => e.target.style.color = "#46424A"}>{item}</div>
          ))}
          <div style={{ height: "1px", background: "#D8D3CC", margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => <div key={item} style={{ fontSize: "11px", color: "#867878", marginBottom: "9px" }}>{item}</div>)}
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: "1px solid #CBCBCB", color: "#46424A", padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%" }}>← Back</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1, padding: "60px 80px" }}>
        <div style={{ maxWidth: "680px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "12px" }}>Complete Booking</div>
          <h1 style={{ fontSize: "36px", fontWeight: 300, margin: "0 0 4px", letterSpacing: "-0.5px" }}>{hotelName}</h1>
          <div style={{ fontSize: "12px", color: "#867878", marginBottom: "40px" }}>
            {roomName} · {checkin} → {checkout} · {nights} night{nights > 1 ? "s" : ""} · {adults} guest{parseInt(adults) > 1 ? "s" : ""}
          </div>

          {/* SUMMARY */}
          <div style={{ border: "1px solid #D8D3CC", padding: "20px 24px", marginBottom: "40px", background: "#FAFAF8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "5px" }}>Total Charge</div>
              <div style={{ fontSize: "32px", color: "#1E1612", fontWeight: 300 }}>${price}</div>
              <div style={{ fontSize: "10px", color: "#CBCBCB", textTransform: "uppercase", letterSpacing: "1px" }}>USD · {nights} night{nights > 1 ? "s" : ""}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4D2D1B", textTransform: "uppercase", marginBottom: "5px" }}>Your Commission</div>
              <div style={{ fontSize: "28px", color: "#4D2D1B", fontWeight: 300 }}>+${commission}</div>
              <div style={{ fontSize: "10px", color: "#867878" }}>{DEFAULT_MARGIN}% margin</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "20px" }}>Guest Information</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              {[["firstName","First Name *"],["lastName","Last Name *"]].map(([field, label]) => (
                <div key={field}>
                  <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "7px" }}>{label}</div>
                  <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} required
                    style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", padding: "7px 0", fontSize: "14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "7px" }}>Email Address *</div>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", padding: "7px 0", fontSize: "14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "7px" }}>Phone (Optional)</div>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", padding: "7px 0", fontSize: "14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: "36px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "7px" }}>Special Requests (Optional)</div>
              <textarea value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} rows={3}
                style={{ width: "100%", background: "#FAFAF8", border: "1px solid #D8D3CC", color: "#1E1612", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            {error && <div style={{ color: "#4D2D1B", fontSize: "12px", marginBottom: "16px", padding: "10px 14px", border: "1px solid #D8D3CC", background: "#FBF8F5" }}>{error}</div>}

            <button type="submit" disabled={loading} style={{
              width: "100%", background: loading ? "#CBCBCB" : "#1E1612", color: "#F0EDE8",
              border: "none", padding: "16px", fontSize: "10px", letterSpacing: "4px", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase",
            }}>
              {loading ? "Processing..." : `Confirm Booking · $${price}`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
