import { useState } from "react";
import { useNavigate } from "react-router-dom";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

// Moroccan-inspired color palette
const T = {
  bg: "#0E0B08",
  sand: "#F5EDD6",
  sandMuted: "#C8B89A",
  sandFaint: "#7A6B55",
  terracotta: "#C4622D",
  terracottaLight: "#D97B4A",
  terracottaDark: "#8C3F18",
  teal: "#1B4B4B",
  tealLight: "#2A6E6E",
  tealFaint: "#0F2E2E",
  card: "#17120D",
  cardHover: "#1F1812",
  border: "#2E2318",
  borderLight: "#3D3022",
  white: "#FFFFFF",
};

const FEATURED = [
  { label: "Marrakech", sub: "Morocco", img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80" },
  { label: "Fes", sub: "Morocco", img: "https://images.unsplash.com/photo-1559308580-2d8d0099a1e0?w=800&q=80" },
  { label: "Chefchaouen", sub: "Morocco", img: "https://images.unsplash.com/photo-1548018560-c7196548b85b?w=800&q=80" },
  { label: "Essaouira", sub: "Morocco", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { label: "Paris", sub: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { label: "Dubai", sub: "UAE", img: "https://images.unsplash.com/photo-1583418007992-5a0ea64e5d2a?w=800&q=80" },
];

const AMENITIES = [
  { icon: "✦", label: "Rooftop Terrace", desc: "Panoramic views of the medina skyline" },
  { icon: "✦", label: "Hammam & Spa", desc: "Traditional Moroccan wellness rituals" },
  { icon: "✦", label: "Courtyard Pool", desc: "Mosaic-tiled pool in a private riad" },
  { icon: "✦", label: "Moroccan Cuisine", desc: "Farm-to-table tagines and mezze" },
];

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destination: "", checkin: today, checkout: tomorrow, adults: "2" });
  const [formError, setFormError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.destination.trim()) { setFormError("Please enter a destination."); return; }
    if (form.checkout <= form.checkin) { setFormError("Check-out must be after check-in."); return; }
    navigate(`/search?destination=${encodeURIComponent(form.destination)}&checkin=${form.checkin}&checkout=${form.checkout}&adults=${form.adults}`);
  };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.sand, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        .dest-card:hover .dest-overlay { opacity: 1 !important; }
        .dest-card:hover img { transform: scale(1.08) !important; }
        .amenity-card:hover { background: ${T.cardHover} !important; border-color: ${T.terracotta} !important; }
        .search-btn:hover { background: ${T.terracottaLight} !important; }
        .nav-link:hover { color: ${T.terracotta} !important; }
        .footer-link:hover { color: ${T.terracotta} !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", background: "linear-gradient(to bottom, rgba(14,11,8,0.95) 0%, transparent 100%)", backdropFilter: "blur(2px)" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 300, letterSpacing: "6px", color: T.sand, cursor: "pointer", textTransform: "uppercase" }} onClick={() => navigate("/")}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {["Suites", "Dining", "Spa", "Gallery", "Contact"].map(item => (
            <span key={item} className="nav-link" style={{ fontSize: "11px", letterSpacing: "2px", color: T.sandMuted, cursor: "pointer", textTransform: "uppercase", transition: "color 0.2s" }}>{item}</span>
          ))}
          <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: `1px solid ${T.terracottaDark}`, color: T.terracotta, padding: "7px 18px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.terracotta; e.currentTarget.style.color = T.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.terracotta; }}>
            Dashboard
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1800&q=90"
          alt="Marrakech Riad"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55)", transform: "scale(1.03)" }}
        />
        {/* Gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,11,8,0.85) 0%, transparent 50%, rgba(14,11,8,0.3) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "250px", background: `linear-gradient(to bottom, transparent, ${T.bg})` }} />

        {/* Decorative arch shape */}
        <div style={{ position: "absolute", top: "50%", right: "8%", transform: "translateY(-50%)", width: "280px", height: "360px", border: `1px solid rgba(196,98,45,0.25)`, borderRadius: "140px 140px 0 0", pointerEvents: "none" }} />

        {/* Hero text */}
        <div style={{ position: "absolute", top: "50%", left: "48px", transform: "translateY(-55%)", maxWidth: "700px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "40px", height: "1px", background: T.terracotta }} />
            <span style={{ fontSize: "10px", letterSpacing: "5px", color: T.terracotta, textTransform: "uppercase" }}>Luxury Riad Experience</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(52px, 7vw, 88px)", fontWeight: 300, lineHeight: 1.05, margin: "0 0 16px", color: T.sand, letterSpacing: "-1px" }}>
            Where the Heart<br />
            <em style={{ color: T.terracottaLight, fontStyle: "italic" }}>of Morocco</em><br />
            Awaits You
          </h1>
          <p style={{ fontSize: "15px", color: T.sandMuted, lineHeight: 1.9, maxWidth: "460px", marginBottom: "0", letterSpacing: "0.2px" }}>
            Discover handpicked riads, desert camps, and luxury hotels across Morocco's most enchanting cities and beyond.
          </p>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: "60px", right: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.sandFaint, textTransform: "uppercase", writingMode: "vertical-rl" }}>Scroll to Discover</div>
          <div style={{ width: "1px", height: "50px", background: `linear-gradient(to bottom, ${T.terracotta}, transparent)` }} />
        </div>

        {/* Stats bar */}
        <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", display: "flex", borderTop: `1px solid ${T.border}`, background: "rgba(14,11,8,0.92)", backdropFilter: "blur(8px)" }}>
          {[["500+", "Curated Hotels"], ["12+", "Destinations"], ["15%", "Commission Rate"], ["24/7", "Concierge"]].map(([num, label], i) => (
            <div key={label} style={{ flex: 1, padding: "20px 32px", borderRight: i < 3 ? `1px solid ${T.border}` : "none", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 300, color: T.terracotta, lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: "60px 48px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "5px", color: T.terracotta, textTransform: "uppercase", marginBottom: "14px" }}>Find Your Stay</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "40px", fontWeight: 300, margin: 0, color: T.sand }}>
              Search Hotels & Riads
            </h2>
          </div>
          <form onSubmit={handleSearch}>
            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 0.8fr auto", gap: "0", border: `1px solid ${T.borderLight}`, background: T.bg }}>
              {/* Destination */}
              <div style={{ padding: "22px 28px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "8px" }}>Destination</div>
                <input type="text" placeholder="City, country, or property..." value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                  style={{ width: "100%", background: "transparent", border: "none", color: T.sand, fontSize: "15px", outline: "none", fontFamily: "inherit", padding: 0 }}
                />
              </div>
              {/* Check-in */}
              <div style={{ padding: "22px 20px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "8px" }}>Check In</div>
                <input type="date" value={form.checkin} min={today}
                  onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                  style={{ width: "100%", background: "transparent", border: "none", color: T.sand, fontSize: "14px", outline: "none", fontFamily: "inherit", padding: 0, colorScheme: "dark" }}
                />
              </div>
              {/* Check-out */}
              <div style={{ padding: "22px 20px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "8px" }}>Check Out</div>
                <input type="date" value={form.checkout} min={form.checkin || tomorrow}
                  onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                  style={{ width: "100%", background: "transparent", border: "none", color: T.sand, fontSize: "14px", outline: "none", fontFamily: "inherit", padding: 0, colorScheme: "dark" }}
                />
              </div>
              {/* Guests */}
              <div style={{ padding: "22px 20px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "8px" }}>Guests</div>
                <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                  style={{ width: "100%", background: T.bg, border: "none", color: T.sand, fontSize: "14px", outline: "none", fontFamily: "inherit", padding: 0, cursor: "pointer" }}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: T.card }}>{n} {n > 1 ? "Adults" : "Adult"}</option>)}
                </select>
              </div>
              {/* Submit */}
              <button type="submit" className="search-btn" style={{ padding: "0 40px", background: T.terracotta, border: "none", color: T.sand, fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600, transition: "background 0.2s" }}>
                Search
              </button>
            </div>
            {formError && <div style={{ color: "#E57373", fontSize: "12px", marginTop: "12px", textAlign: "center" }}>{formError}</div>}
          </form>
        </div>
      </div>

      {/* FEATURED DESTINATIONS */}
      <div style={{ padding: "80px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "5px", color: T.terracotta, textTransform: "uppercase", marginBottom: "12px" }}>Explore</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "42px", fontWeight: 300, margin: 0, color: T.sand }}>
              Featured Destinations
            </h2>
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase", cursor: "pointer", borderBottom: `1px solid ${T.border}`, paddingBottom: "2px" }}>View All →</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
          {FEATURED.map((d, i) => (
            <div key={d.label} className="dest-card" onClick={() => setForm(f => ({ ...f, destination: `${d.label}, ${d.sub}` }))}
              style={{ position: "relative", height: i < 2 ? "380px" : "240px", overflow: "hidden", cursor: "pointer", gridColumn: i < 2 ? "span 2" : "span 2" }}>
              <img src={d.img} alt={d.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s", filter: "brightness(0.7)" }} />
              <div className="dest-overlay" style={{ position: "absolute", inset: 0, background: "rgba(196,98,45,0.35)", transition: "opacity 0.4s", opacity: 0 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 18px", background: "linear-gradient(to top, rgba(14,11,8,0.9) 0%, transparent 100%)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "19px", fontWeight: 300, color: T.sand }}>{d.label}</div>
                <div style={{ fontSize: "10px", letterSpacing: "2px", color: T.sandMuted, textTransform: "uppercase" }}>{d.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY US */}
      <div style={{ padding: "80px 48px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: T.card }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "5px", color: T.terracotta, textTransform: "uppercase", marginBottom: "12px" }}>The Riad Promise</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "42px", fontWeight: 300, margin: 0, color: T.sand }}>
            An Immersive Moroccan Experience
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", maxWidth: "1100px", margin: "0 auto" }}>
          {AMENITIES.map(a => (
            <div key={a.label} className="amenity-card" style={{ padding: "36px 28px", border: `1px solid ${T.border}`, background: T.bg, transition: "all 0.25s", cursor: "default" }}>
              <div style={{ fontSize: "20px", color: T.terracotta, marginBottom: "16px" }}>{a.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 400, color: T.sand, marginBottom: "10px" }}>{a.label}</div>
              <div style={{ fontSize: "12px", color: T.sandFaint, lineHeight: 1.8, letterSpacing: "0.2px" }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL BLEED STORY SECTION */}
      <div style={{ position: "relative", height: "500px", overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1580746738099-1c4c8bfdf2e9?w=1800&q=85" alt="Moroccan courtyard"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "0 48px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "6px", color: T.terracotta, textTransform: "uppercase", marginBottom: "20px" }}>Our Story</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 300, color: T.sand, margin: "0 0 20px", maxWidth: "800px", lineHeight: 1.2 }}>
            "Every riad tells a story.<br />
            <em style={{ color: T.terracottaLight }}>We help you live yours.</em>"
          </h2>
          <div style={{ width: "60px", height: "1px", background: T.terracotta, margin: "0 auto 24px" }} />
          <p style={{ fontSize: "14px", color: T.sandMuted, maxWidth: "540px", lineHeight: 1.9 }}>
            Racku Voyage curates the finest riads, boutique hotels, and desert retreats across Morocco and the world's most storied destinations.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: "48px", borderTop: `1px solid ${T.border}`, background: T.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, letterSpacing: "4px", color: T.sand }}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          {["Privacy", "Terms", "Careers", "Press"].map(item => (
            <span key={item} className="footer-link" style={{ fontSize: "10px", letterSpacing: "2px", color: T.sandFaint, cursor: "pointer", textTransform: "uppercase", transition: "color 0.2s" }}>{item}</span>
          ))}
        </div>
        <div style={{ fontSize: "10px", color: T.sandFaint, letterSpacing: "1px" }}>© 2026 Racku Voyage · All Rights Reserved</div>
      </footer>
    </div>
  );
}
