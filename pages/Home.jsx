import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

export default function Home() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    destination: "",
    checkin: "",
    checkout: "",
    adults: 2,
    rooms: 1,
  });
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      ...searchForm,
      margin: DEFAULT_MARGIN,
    });
    navigate(`/search?${params.toString()}`);
  };

  const featuredDestinations = [
    { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", hotels: "2,400+" },
    { city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", hotels: "1,800+" },
    { city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", hotels: "3,100+" },
    { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", hotels: "2,700+" },
    { city: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80", hotels: "320+" },
    { city: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", hotels: "580+" },
  ];

  const whyUs = [
    { icon: "✦", title: "Best Rate Guarantee", desc: "We match or beat any price. If you find it cheaper, we'll refund the difference." },
    { icon: "✦", title: "Curated Luxury Properties", desc: "Every property is handpicked and verified for quality, comfort, and exceptional service." },
    { icon: "✦", title: "24/7 Concierge Support", desc: "A dedicated team available around the clock, wherever you are in the world." },
    { icon: "✦", title: "Flexible Cancellation", desc: "Plans change. Most of our properties offer free cancellation up to 48 hours before check-in." },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
        backdropFilter: "blur(4px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px", color: "#c9a84c", letterSpacing: "3px", fontWeight: "300" }}>RACKU</span>
          <span style={{ fontSize: "12px", color: "#c9a84c", letterSpacing: "6px", marginTop: "4px" }}>VOYAGE</span>
        </div>
        <div style={{ display: "flex", gap: "36px", fontSize: "13px", letterSpacing: "2px", color: "#d4c5a0" }}>
          {["Destinations", "Hotels", "Experiences", "About"].map(link => (
            <span key={link} style={{ cursor: "pointer", transition: "color 0.3s" }}
              onMouseOver={e => e.target.style.color = "#c9a84c"}
              onMouseOut={e => e.target.style.color = "#d4c5a0"}>{link}</span>
          ))}
        </div>
        <button
          onClick={() => navigate("/search")}
          style={{
            background: "transparent", border: "1px solid #c9a84c", color: "#c9a84c",
            padding: "10px 24px", fontSize: "12px", letterSpacing: "2px", cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseOver={e => { e.target.style.background = "#c9a84c"; e.target.style.color = "#0a0a0a"; }}
          onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = "#c9a84c"; }}
        >
          BOOK NOW
        </button>
      </nav>

      {/* HERO */}
      <div style={{
        position: "relative", height: "100vh", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90"
          alt="Luxury Hotel"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(10,10,10,1) 100%)"
        }} />

        <div style={{ position: "relative", textAlign: "center", padding: "0 20px", maxWidth: "900px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "6px", color: "#c9a84c", marginBottom: "20px" }}>
            ✦ PREMIUM HOTEL COLLECTION ✦
          </div>
          <h1 style={{
            fontSize: "clamp(42px, 7vw, 88px)", fontWeight: "300", lineHeight: 1.1,
            margin: "0 0 24px", letterSpacing: "2px",
          }}>
            Where Luxury<br />
            <span style={{ color: "#c9a84c", fontStyle: "italic" }}>Meets Serenity</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#b0a080", letterSpacing: "1px", marginBottom: "48px", lineHeight: 1.8 }}>
            Discover handpicked luxury hotels across the world's most breathtaking destinations
          </p>

          {/* SEARCH BOX */}
          <form onSubmit={handleSearch} style={{
            background: "rgba(10,10,10,0.92)", border: "1px solid rgba(201,168,76,0.3)",
            padding: "32px 40px", display: "flex", gap: "20px", alignItems: "flex-end",
            flexWrap: "wrap", backdropFilter: "blur(12px)",
          }}>
            {[
              { label: "DESTINATION", key: "destination", type: "text", placeholder: "Where are you going?" },
              { label: "CHECK IN", key: "checkin", type: "date", min: today },
              { label: "CHECK OUT", key: "checkout", type: "date", min: tomorrow },
            ].map(field => (
              <div key={field.key} style={{ flex: 1, minWidth: "160px" }}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  min={field.min}
                  value={searchForm[field.key]}
                  onChange={e => setSearchForm({ ...searchForm, [field.key]: e.target.value })}
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(201,168,76,0.4)", color: "#f0ead6",
                    fontSize: "14px", padding: "8px 0", outline: "none",
                    colorScheme: "dark",
                  }}
                />
              </div>
            ))}
            <div style={{ minWidth: "80px" }}>
              <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>GUESTS</label>
              <select
                value={searchForm.adults}
                onChange={e => setSearchForm({ ...searchForm, adults: e.target.value })}
                style={{
                  background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.4)",
                  color: "#f0ead6", fontSize: "14px", padding: "8px 0", outline: "none", width: "100%",
                }}
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#1a1a1a" }}>{n} Adult{n>1?"s":""}</option>)}
              </select>
            </div>
            <button type="submit" style={{
              background: "#c9a84c", color: "#0a0a0a", border: "none",
              padding: "14px 36px", fontSize: "12px", letterSpacing: "3px",
              cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap",
              transition: "all 0.3s",
            }}
              onMouseOver={e => e.target.style.background = "#e4bf5a"}
              onMouseOut={e => e.target.style.background = "#c9a84c"}
            >
              SEARCH
            </button>
          </form>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{
        display: "flex", justifyContent: "center", gap: "80px",
        padding: "48px 60px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        flexWrap: "wrap",
      }}>
        {[
          { num: "500K+", label: "PROPERTIES" },
          { num: "190+", label: "COUNTRIES" },
          { num: "2M+", label: "HAPPY GUESTS" },
          { num: "4.9★", label: "AVERAGE RATING" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "36px", color: "#c9a84c", fontWeight: "300", letterSpacing: "2px" }}>{stat.num}</div>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#7a6e5a", marginTop: "6px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURED DESTINATIONS */}
      <div style={{ padding: "80px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "5px", color: "#c9a84c", marginBottom: "16px" }}>EXPLORE THE WORLD</div>
          <h2 style={{ fontSize: "42px", fontWeight: "300", margin: 0, letterSpacing: "1px" }}>
            Featured <span style={{ fontStyle: "italic", color: "#c9a84c" }}>Destinations</span>
          </h2>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px"
        }}>
          {featuredDestinations.map(dest => (
            <div
              key={dest.city}
              onClick={() => navigate(`/search?destination=${dest.city}&checkin=${today}&checkout=${tomorrow}&adults=2&margin=${DEFAULT_MARGIN}`)}
              style={{
                position: "relative", height: "320px", overflow: "hidden", cursor: "pointer",
                border: "1px solid rgba(201,168,76,0.1)",
              }}
              onMouseOver={e => e.currentTarget.querySelector("img").style.transform = "scale(1.08)"}
              onMouseOut={e => e.currentTarget.querySelector("img").style.transform = "scale(1)"}
            >
              <img src={dest.image} alt={dest.city} style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.6s ease",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)",
              }} />
              <div style={{ position: "absolute", bottom: "28px", left: "28px" }}>
                <div style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "1px" }}>{dest.city}</div>
                <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#c9a84c", marginTop: "4px" }}>{dest.country} · {dest.hotels} HOTELS</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY RACKU VOYAGE */}
      <div style={{
        padding: "80px 60px", background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "5px", color: "#c9a84c", marginBottom: "16px" }}>THE RACKU DIFFERENCE</div>
          <h2 style={{ fontSize: "42px", fontWeight: "300", margin: 0 }}>
            Why Choose <span style={{ fontStyle: "italic", color: "#c9a84c" }}>Us</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "48px", maxWidth: "1000px", margin: "0 auto" }}>
          {whyUs.map(item => (
            <div key={item.title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", color: "#c9a84c", marginBottom: "16px" }}>{item.icon}</div>
              <div style={{ fontSize: "14px", letterSpacing: "2px", marginBottom: "12px", fontWeight: "500" }}>{item.title}</div>
              <div style={{ fontSize: "14px", color: "#7a6e5a", lineHeight: 1.8 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL-WIDTH CTA */}
      <div style={{
        position: "relative", height: "480px", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80"
          alt="Luxury Pool"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: "11px", letterSpacing: "5px", color: "#c9a84c", marginBottom: "16px" }}>EXCLUSIVE RATES AWAIT</div>
          <h2 style={{ fontSize: "48px", fontWeight: "300", margin: "0 0 32px", letterSpacing: "1px" }}>
            Your Next Escape<br />
            <span style={{ fontStyle: "italic", color: "#c9a84c" }}>Starts Here</span>
          </h2>
          <button
            onClick={() => navigate("/search")}
            style={{
              background: "#c9a84c", color: "#0a0a0a", border: "none",
              padding: "16px 48px", fontSize: "13px", letterSpacing: "3px",
              cursor: "pointer", fontWeight: "600", transition: "all 0.3s",
            }}
            onMouseOver={e => e.target.style.background = "#e4bf5a"}
            onMouseOut={e => e.target.style.background = "#c9a84c"}
          >
            EXPLORE HOTELS
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: "60px", borderTop: "1px solid rgba(201,168,76,0.15)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "32px" }}>
        <div>
          <div style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px", marginBottom: "8px" }}>RACKU VOYAGE</div>
          <div style={{ fontSize: "12px", color: "#5a5040", letterSpacing: "1px", maxWidth: "260px", lineHeight: 1.8 }}>
            Curating the world's finest hotel experiences since 2024.
          </div>
        </div>
        {[
          { title: "EXPLORE", links: ["Destinations", "Luxury Hotels", "Beach Resorts", "City Hotels"] },
          { title: "COMPANY", links: ["About Us", "Careers", "Press", "Contact"] },
          { title: "SUPPORT", links: ["Help Center", "Cancellation Policy", "Privacy Policy", "Terms"] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "16px" }}>{col.title}</div>
            {col.links.map(link => (
              <div key={link} style={{ fontSize: "13px", color: "#5a5040", marginBottom: "10px", cursor: "pointer",
                transition: "color 0.3s" }}
                onMouseOver={e => e.target.style.color = "#c9a84c"}
                onMouseOut={e => e.target.style.color = "#5a5040"}
              >{link}</div>
            ))}
          </div>
        ))}
      </footer>
      <div style={{ textAlign: "center", padding: "20px", fontSize: "11px", color: "#3a3028", letterSpacing: "2px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        © 2024 RACKU VOYAGE · ALL RIGHTS RESERVED · POWERED BY LITEAPI
      </div>
    </div>
  );
}
