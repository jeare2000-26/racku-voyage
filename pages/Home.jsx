import { useState } from "react";
import { useNavigate } from "react-router-dom";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

const DESTINATIONS = [
  { city: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { city: "Dubai", country: "UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { city: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { city: "Manila", country: "Philippines", img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80" },
  { city: "Maldives", country: "Maldives", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80" },
  { city: "London", country: "UK", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80" },
];

const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

// Theme tokens
const T = {
  bg: "#0B0F1A",
  bgCard: "#111827",
  bgCardHover: "#161D2E",
  sidebar: "#0D1120",
  border: "#1E2A3D",
  borderLight: "#253045",
  gold: "#C9A84C",
  goldLight: "#E0C06A",
  goldMuted: "#8A6E32",
  text: "#F0EAD6",
  textMuted: "#8A99B8",
  textFaint: "#4A5568",
  accent: "#1A2744",
  white: "#FFFFFF",
};

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: "", checkin: today, checkout: tomorrow, adults: "2" });
  const [formError, setFormError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.destination.trim()) { setFormError("Please enter a destination."); return; }
    if (form.checkout <= form.checkin) { setFormError("Check-out must be after check-in."); return; }
    navigate(`/search?destination=${encodeURIComponent(form.destination)}&checkin=${form.checkin}&checkout=${form.checkout}&adults=${form.adults}`);
  };

  const inputStyle = {
    width: "100%", background: "transparent", border: "none",
    borderBottom: `1px solid ${T.border}`, color: T.text,
    fontSize: "14px", padding: "6px 0", outline: "none",
    fontFamily: "Georgia, serif", boxSizing: "border-box",
    colorScheme: "dark",
  };
  const labelStyle = { fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "8px" };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", backgroundColor: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>

      {/* LEFT SIDEBAR */}
      <aside style={{
        width: "180px", minWidth: "180px", padding: "28px 20px",
        borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: T.sidebar, overflowY: "auto",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.gold, fontWeight: 400, textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }}
            onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: T.textMuted, marginBottom: "10px", cursor: "pointer", letterSpacing: "0.5px", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.gold}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: T.textFaint, marginBottom: "9px", cursor: "pointer", letterSpacing: "0.5px", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.textMuted}
              onMouseLeave={e => e.currentTarget.style.color = T.textFaint}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "transparent", border: `1px solid ${T.goldMuted}`, color: T.gold,
          padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer",
          textTransform: "uppercase", width: "100%", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.bg; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.gold; }}>
          Dashboard
        </button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "20px 48px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: "11px", letterSpacing: "2px", color: T.textFaint, marginRight: "24px" }}>EN</span>
          <div style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ width: "22px", height: "1px", background: T.gold }} />
            <div style={{ width: "22px", height: "1px", background: T.gold }} />
            <div style={{ width: "14px", height: "1px", background: T.gold }} />
          </div>
        </div>

        {/* HERO */}
        <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 61px)" }}>

          {/* Left: text + form */}
          <div style={{ flex: 1, padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "11px", letterSpacing: "5px", color: T.goldMuted, textTransform: "uppercase", marginBottom: "20px" }}>
              Hotel Rooms
            </div>
            <h1 style={{ fontSize: "clamp(52px, 7vw, 96px)", fontWeight: 300, lineHeight: 1.05, margin: "0 0 12px", color: T.text, letterSpacing: "-1px" }}>
              Find Your<br />
              <span style={{ fontStyle: "italic", color: T.gold }}>Perfect Stay</span>
            </h1>
            <p style={{ fontSize: "14px", color: T.textMuted, lineHeight: 1.9, maxWidth: "400px", marginBottom: "48px", letterSpacing: "0.3px" }}>
              Discover handpicked luxury hotels across the world's most breathtaking destinations. Every stay, curated.
            </p>

            {/* SEARCH FORM */}
            <form onSubmit={handleSearch} style={{
              background: T.bgCard, border: `1px solid ${T.border}`, padding: "28px 32px", maxWidth: "600px",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <div style={labelStyle}>Destination</div>
                  <input type="text" placeholder="City, country..." value={form.destination}
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    style={{ ...inputStyle }}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Check In</div>
                  <input type="date" value={form.checkin} min={today}
                    onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                    style={{ ...inputStyle }}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Check Out</div>
                  <input type="date" value={form.checkout} min={form.checkin || tomorrow}
                    onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                    style={{ ...inputStyle }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={labelStyle}>Guests</div>
                  <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                    style={{ background: T.bgCard, border: "none", borderBottom: `1px solid ${T.border}`, color: T.text, fontSize: "13px", padding: "4px 0", outline: "none", cursor: "pointer" }}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: T.bgCard }}>{n} Adult{n>1?"s":""}</option>)}
                  </select>
                </div>
                <button type="submit" style={{
                  background: T.gold, color: T.bg, border: "none", padding: "12px 36px",
                  fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase",
                  fontWeight: 600, transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.goldLight}
                  onMouseLeave={e => e.currentTarget.style.background = T.gold}>
                  Search
                </button>
              </div>
              {formError && <div style={{ color: "#E57373", fontSize: "11px", marginTop: "12px" }}>{formError}</div>}
            </form>
          </div>

          {/* Right: destination grid */}
          <div style={{ width: "420px", minWidth: "420px", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "repeat(3, 1fr)", gap: "2px", height: "calc(100vh - 61px)", overflow: "hidden" }}>
            {DESTINATIONS.map(d => (
              <div key={d.city} onClick={() => setForm(f => ({ ...f, destination: `${d.city}, ${d.country}` }))}
                style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
              >
                <img src={d.img} alt={d.city}
                  onError={e => { e.target.style.background = T.bgCard; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s", filter: "brightness(0.65)" }}
                  onMouseEnter={e => { e.target.style.transform = "scale(1.06)"; e.target.style.filter = "brightness(0.85)"; }}
                  onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "brightness(0.65)"; }}
                />
                <div style={{ position: "absolute", bottom: "12px", left: "14px" }}>
                  <div style={{ fontSize: "13px", color: T.white, letterSpacing: "0.5px" }}>{d.city}</div>
                  <div style={{ fontSize: "10px", color: T.gold, letterSpacing: "1px" }}>{d.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
