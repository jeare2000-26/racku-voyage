import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

const featuredDestinations = [
  { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80" },
  { city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80" },
  { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80" },
  { city: "Maldives", country: "Maldives", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80" },
  { city: "Santorini", country: "Greece", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80" },
];

export default function Home() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    destination: "",
    checkin: today,
    checkout: tomorrow,
    adults: "2",
  });
  const [formError, setFormError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.destination.trim()) { setFormError("Please enter a destination."); return; }
    if (!form.checkin) { setFormError("Please select a check-in date."); return; }
    if (!form.checkout) { setFormError("Please select a check-out date."); return; }
    if (form.checkout <= form.checkin) { setFormError("Check-out must be after check-in."); return; }
    navigate(`/search?destination=${encodeURIComponent(form.destination)}&checkin=${form.checkin}&checkout=${form.checkout}&adults=${form.adults}`);
  };

  const handleDestinationClick = (city, country) => {
    const dest = `${city}, ${country}`;
    navigate(`/search?destination=${encodeURIComponent(dest)}&checkin=${today}&checkout=${tomorrow}&adults=2`);
  };

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
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "transparent", border: "1px solid #c9a84c", color: "#c9a84c",
            padding: "10px 24px", fontSize: "12px", letterSpacing: "2px", cursor: "pointer",
          }}
        >
          DASHBOARD
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

        <div style={{ position: "relative", textAlign: "center", padding: "0 20px", maxWidth: "920px", width: "100%" }}>
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
            padding: "32px 40px", backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: "180px" }}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                  DESTINATION
                </label>
                <input
                  type="text"
                  placeholder="City or country..."
                  value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(201,168,76,0.4)", color: "#f0ead6",
                    fontSize: "15px", padding: "8px 0", outline: "none",
                    fontFamily: "Georgia, serif", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "130px" }}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                  CHECK IN
                </label>
                <input
                  type="date"
                  value={form.checkin}
                  min={today}
                  onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(201,168,76,0.4)", color: "#f0ead6",
                    fontSize: "14px", padding: "8px 0", outline: "none",
                    colorScheme: "dark", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "130px" }}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                  CHECK OUT
                </label>
                <input
                  type="date"
                  value={form.checkout}
                  min={form.checkin || tomorrow}
                  onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(201,168,76,0.4)", color: "#f0ead6",
                    fontSize: "14px", padding: "8px 0", outline: "none",
                    colorScheme: "dark", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ minWidth: "100px" }}>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                  GUESTS
                </label>
                <select
                  value={form.adults}
                  onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                  style={{
                    width: "100%", background: "#0a0a0a", border: "none",
                    borderBottom: "1px solid rgba(201,168,76,0.4)", color: "#f0ead6",
                    fontSize: "14px", padding: "8px 0", outline: "none", cursor: "pointer",
                  }}
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#1a1a1a" }}>{n} Adult{n>1?"s":""}</option>)}
                </select>
              </div>

              <button type="submit" style={{
                background: "#c9a84c", color: "#0a0a0a", border: "none",
                padding: "14px 36px", fontSize: "12px", letterSpacing: "3px",
                cursor: "pointer", fontWeight: "700", whiteSpace: "nowrap",
                alignSelf: "flex-end",
              }}>
                SEARCH
              </button>
            </div>

            {formError && (
              <div style={{ marginTop: "14px", fontSize: "12px", color: "#ff9090", letterSpacing: "1px" }}>
                ⚠ {formError}
              </div>
            )}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {featuredDestinations.map(dest => (
            <div
              key={dest.city}
              onClick={() => handleDestinationClick(dest.city, dest.country)}
              style={{ position: "relative", height: "240px", overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.querySelector("img").style.transform = "scale(1.07)"}
              onMouseLeave={e => e.currentTarget.querySelector("img").style.transform = "scale(1)"}
            >
              <img src={dest.image} alt={dest.city} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
                <div style={{ fontSize: "18px", fontWeight: "300", letterSpacing: "1px" }}>{dest.city}</div>
                <div style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "2px" }}>{dest.country}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", padding: "32px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "18px", color: "#c9a84c", letterSpacing: "3px" }}>RACKU</span>
          <span style={{ fontSize: "10px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>
        <div style={{ fontSize: "11px", color: "#3a3428" }}>© 2026 Racku Voyage. All rights reserved.</div>
      </div>
    </div>
  );
}
