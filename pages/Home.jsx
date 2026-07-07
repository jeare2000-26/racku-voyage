import { useState } from "react";
import { useNavigate } from "react-router-dom";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

// Kris Anfalova palette — dark olive/charcoal, cream, warm stone
const T = {
  bg: "#111109",
  bgCard: "#191912",
  bgPanel: "rgba(17,17,9,0.88)",
  olive: "#2A2A1E",
  oliveLight: "#3A3A2A",
  cream: "#F2EDE4",
  creamMuted: "#BDB9B0",
  creamFaint: "#6B6860",
  creamGhost: "#2E2C28",
  gold: "#C8A96E",
  goldMuted: "#8A7248",
  goldFaint: "#3D3220",
  border: "#2A2820",
  borderLight: "#3A3830",
  white: "#FFFFFF",
};

const ROOMS = [
  {
    name: "Deluxe Room",
    tagline: "Authentic Comfort",
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85",
    size: "35 m²",
    guests: "2",
  },
  {
    name: "Superior Suite",
    tagline: "Elevated Serenity",
    img: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&q=85",
    size: "55 m²",
    guests: "2",
  },
  {
    name: "Riad Suite",
    tagline: "Moroccan Heritage",
    img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&q=85",
    size: "75 m²",
    guests: "3",
  },
  {
    name: "Panoramic Penthouse",
    tagline: "Above the Medina",
    img: "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=900&q=85",
    size: "110 m²",
    guests: "4",
  },
];

const EXPERIENCES = [
  { icon: "◈", label: "Hammam & Spa", sub: "Traditional Moroccan wellness" },
  { icon: "◈", label: "Rooftop Dining", sub: "Panoramic medina views" },
  { icon: "◈", label: "Courtyard Pool", sub: "Zellige mosaic tiles" },
  { icon: "◈", label: "Cultural Tours", sub: "Guided medina walks" },
  { icon: "◈", label: "Moroccan Cuisine", sub: "Farm-to-table tagines" },
  { icon: "◈", label: "Desert Excursions", sub: "Sahara overnight camps" },
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: "", checkin: today, checkout: tomorrow, adults: "2" });
  const [formError, setFormError] = useState("");
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.destination.trim()) { setFormError("Please enter a destination."); return; }
    if (form.checkout <= form.checkin) { setFormError("Check-out must be after check-in."); return; }
    navigate(`/search?destination=${encodeURIComponent(form.destination)}&checkin=${form.checkin}&checkout=${form.checkout}&adults=${form.adults}`);
  };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.cream, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; opacity: 0.5; }
        input::placeholder { color: ${T.creamFaint}; }
        ::-webkit-scrollbar { width: 3px; } 
        ::-webkit-scrollbar-track { background: ${T.bg}; } 
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        .nav-link { transition: color 0.2s; }
        .nav-link:hover { color: ${T.gold} !important; }
        .room-card-inner { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
        .room-card:hover .room-card-inner { transform: scale(1.04) !important; }
        .room-card:hover .room-overlay { opacity: 1 !important; }
        .exp-item:hover { background: ${T.bgCard} !important; border-color: ${T.goldMuted} !important; }
        .search-submit:hover { background: ${T.gold} !important; color: ${T.bg} !important; }
        .dest-btn:hover { background: ${T.bgCard} !important; color: ${T.cream} !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 56px",
        background: "linear-gradient(to bottom, rgba(17,17,9,0.96) 0%, rgba(17,17,9,0.0) 100%)",
      }}>
        {/* Logo */}
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "6px", color: T.cream, cursor: "pointer", textTransform: "uppercase" }}
          onClick={() => navigate("/")}>
          Racku <span style={{ color: T.gold, fontStyle: "italic" }}>Voyage</span>
        </div>

        {/* Center Nav */}
        <div style={{ display: "flex", gap: "36px", alignItems: "center" }}>
          {["Suites", "Dining", "Spa & Wellness", "Gallery", "Experiences"].map(item => (
            <span key={item} className="nav-link" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "1.5px", color: T.creamMuted, cursor: "pointer", textTransform: "uppercase" }}>
              {item}
            </span>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span className="nav-link" style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "1.5px", color: T.creamMuted, cursor: "pointer", textTransform: "uppercase" }}>Contact</span>
          <div style={{ width: "1px", height: "14px", background: T.border }} />
          <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: `1px solid ${T.goldMuted}`, color: T.gold, padding: "8px 20px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.25s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.gold; }}>
            Dashboard
          </button>
        </div>
      </nav>

      {/* ═══ HERO — Full bleed ═══ */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {/* Hero image */}
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=2000&q=90"
          alt="Luxury Riad"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", filter: "brightness(0.55)" }}
        />

        {/* Dark vignette overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(17,17,9,0.75) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: `linear-gradient(to top, ${T.bg} 0%, transparent 100%)` }} />

        {/* Decorative thin arch — right side */}
        <div style={{ position: "absolute", top: "50%", right: "6%", transform: "translateY(-50%)", width: "220px", height: "300px", border: `1px solid rgba(200,169,110,0.18)`, borderRadius: "110px 110px 0 0", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", right: "calc(6% + 12px)", transform: "translateY(-50%)", width: "196px", height: "276px", border: `1px solid rgba(200,169,110,0.08)`, borderRadius: "98px 98px 0 0", pointerEvents: "none" }} />

        {/* Hero text */}
        <div style={{ position: "absolute", top: "50%", left: "56px", transform: "translateY(-52%)", animation: "fadeUp 1s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            <div style={{ width: "48px", height: "1px", background: T.gold }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Luxury Riad · Marrakech</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(56px, 6.5vw, 92px)", fontWeight: 400, lineHeight: 1.05, color: T.cream, letterSpacing: "-0.5px", maxWidth: "680px" }}>
            Where Ancient<br />
            <em style={{ fontStyle: "italic", color: T.gold }}>Craft Meets</em><br />
            Modern Luxury
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: T.creamMuted, lineHeight: 1.85, maxWidth: "400px", marginTop: "24px", letterSpacing: "0.2px", fontWeight: 300 }}>
            Discover handpicked riads, desert camps, and luxury hotels across Morocco's most enchanting cities — and beyond.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
            <button onClick={() => navigate("/search?destination=Marrakech, Morocco&checkin=" + today + "&checkout=" + tomorrow + "&adults=2")}
              style={{ background: T.gold, color: T.bg, border: "none", padding: "15px 36px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 500, transition: "all 0.25s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#D4B87A"}
              onMouseLeave={e => e.currentTarget.style.background = T.gold}>
              Explore Stays
            </button>
            <button style={{ background: "transparent", border: `1px solid rgba(242,237,228,0.25)`, color: T.cream, padding: "15px 32px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 300, transition: "all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(242,237,228,0.25)"; e.currentTarget.style.color = T.cream; }}>
              View Gallery
            </button>
          </div>
        </div>

        {/* Hero stats — bottom right */}
        <div style={{ position: "absolute", bottom: "80px", right: "56px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-end" }}>
          {[["500+", "Curated Properties"], ["40+", "Destinations"], ["15%", "Commission Rate"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 300, color: T.cream, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase", marginTop: "3px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "36px", left: "56px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "1px", height: "48px", background: `linear-gradient(to bottom, ${T.gold}, transparent)` }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.creamFaint, textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Scroll</span>
        </div>
      </div>

      {/* ═══ BOOKING FORM BAR ═══ */}
      <div style={{ background: T.bgCard, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 0.8fr 160px", borderLeft: `1px solid ${T.border}` }}>
            {[
              { label: "Destination", type: "text", key: "destination", placeholder: "City, country, or property..." },
              { label: "Arrival", type: "date", key: "checkin" },
              { label: "Departure", type: "date", key: "checkout" },
            ].map(({ label, type, key, placeholder }) => (
              <div key={key} style={{ padding: "22px 28px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "7px" }}>{label}</div>
                <input type={type} value={form[key]} placeholder={placeholder}
                  min={key === "checkin" ? today : key === "checkout" ? form.checkin : undefined}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", background: "transparent", border: "none", color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none", padding: 0, colorScheme: "dark" }}
                />
              </div>
            ))}
            {/* Guests */}
            <div style={{ padding: "22px 20px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "7px" }}>Guests</div>
              <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                style={{ background: "transparent", border: "none", color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none", padding: 0, cursor: "pointer" }}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: T.bgCard }}>{n} {n > 1 ? "Adults" : "Adult"}</option>)}
              </select>
            </div>
            {/* Search button */}
            <button type="submit" className="search-submit" style={{ background: T.bgCard, border: "none", borderLeft: `1px solid ${T.border}`, color: T.gold, fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.25s", fontWeight: 500 }}>
              Search →
            </button>
          </div>
          {formError && <div style={{ padding: "10px 28px", fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#E57373", borderTop: `1px solid ${T.border}` }}>{formError}</div>}
        </form>
      </div>

      {/* ═══ QUICK DESTINATIONS ═══ */}
      <div style={{ padding: "28px 56px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "12px", overflowX: "auto" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.creamFaint, textTransform: "uppercase", flexShrink: 0 }}>Popular:</span>
        {["Marrakech", "Fes", "Paris", "Dubai", "Tokyo", "London", "Maldives"].map(dest => (
          <button key={dest} className="dest-btn" onClick={() => setForm(f => ({ ...f, destination: dest }))}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.creamFaint, fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "1.5px", padding: "5px 16px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s", flexShrink: 0 }}>
            {dest}
          </button>
        ))}
      </div>

      {/* ═══ ROOMS SECTION ═══ */}
      <div style={{ padding: "100px 56px" }}>
        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "56px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Accommodations</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(38px, 4vw, 56px)", fontWeight: 400, color: T.cream, lineHeight: 1.1 }}>
              Suites & Rooms
            </h2>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase", cursor: "pointer", paddingBottom: "2px", borderBottom: `1px solid ${T.border}` }}>
            View All Rooms →
          </div>
        </div>

        {/* Room cards — horizontal scroll row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px" }}>
          {ROOMS.map((room, i) => (
            <div key={room.name}
              className="room-card"
              onMouseEnter={() => setHoveredRoom(i)}
              onMouseLeave={() => setHoveredRoom(null)}
              style={{ position: "relative", height: "460px", overflow: "hidden", cursor: "pointer" }}>
              <img className="room-card-inner" src={room.img} alt={room.name}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.65)" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(17,17,9,0.92) 100%)" }} />
              <div className="room-overlay" style={{ position: "absolute", inset: 0, background: "rgba(200,169,110,0.08)", opacity: 0, transition: "opacity 0.3s" }} />

              {/* Room number */}
              <div style={{ position: "absolute", top: "20px", left: "20px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "13px", fontStyle: "italic", color: "rgba(200,169,110,0.6)" }}>0{i + 1}</div>

              {/* Size tag */}
              <div style={{ position: "absolute", top: "20px", right: "20px", fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, background: "rgba(17,17,9,0.7)", padding: "4px 10px", textTransform: "uppercase" }}>{room.size}</div>

              {/* Room info */}
              <div style={{ position: "absolute", bottom: "24px", left: "22px", right: "22px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "6px" }}>{room.tagline}</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 400, color: T.cream, marginBottom: "10px" }}>{room.name}</div>
                <div style={{ height: "1px", background: "rgba(200,169,110,0.25)", marginBottom: "12px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint }}>Up to {room.guests} guests</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: hoveredRoom === i ? T.gold : T.creamFaint, textTransform: "uppercase", transition: "color 0.2s" }}>
                    {hoveredRoom === i ? "View Room →" : "Details"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FULL-BLEED DIVIDER SECTION ═══ */}
      <div style={{ position: "relative", height: "420px", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1800&q=85" alt="Marrakech"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "brightness(0.38)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(17,17,9,0.85) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 56px" }}>
          <div style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "48px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Our Philosophy</span>
            </div>
            <blockquote style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 300, fontStyle: "italic", color: T.cream, lineHeight: 1.3, margin: 0 }}>
              "Every riad is a world unto itself — a courtyard where time slows and beauty speaks quietly."
            </blockquote>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamFaint, letterSpacing: "2px", marginTop: "24px", textTransform: "uppercase" }}>— Racku Voyage, Est. 2024</div>
          </div>
        </div>
      </div>

      {/* ═══ EXPERIENCES ═══ */}
      <div style={{ padding: "100px 56px", background: T.bgCard, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "56px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "5px", color: T.gold, textTransform: "uppercase" }}>Curated For You</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 400, color: T.cream, lineHeight: 1.1 }}>
              Signature Experiences
            </h2>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: T.creamMuted, maxWidth: "320px", lineHeight: 1.8, textAlign: "right", fontWeight: 300 }}>
            From ancient Hammam rituals to rooftop dining under the stars — every detail is considered.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {EXPERIENCES.map((exp) => (
            <div key={exp.label} className="exp-item"
              style={{ padding: "36px 32px", border: `1px solid ${T.border}`, background: T.bg, transition: "all 0.25s", cursor: "default" }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", color: T.gold, marginBottom: "18px", fontStyle: "italic" }}>{exp.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 400, color: T.cream, marginBottom: "8px" }}>{exp.label}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: T.creamFaint, lineHeight: 1.7, fontWeight: 300 }}>{exp.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "48px 56px", borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", background: T.bgCard }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "4px", color: T.cream }}>
          Racku <em style={{ color: T.gold, fontStyle: "italic" }}>Voyage</em>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          {["Privacy", "Terms", "Careers", "Press"].map(item => (
            <span key={item} style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "1.5px", color: T.creamFaint, cursor: "pointer", textTransform: "uppercase", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.gold}
              onMouseLeave={e => e.currentTarget.style.color = T.creamFaint}>{item}</span>
          ))}
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, letterSpacing: "1px", textAlign: "right" }}>
          © 2026 Racku Voyage · All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
