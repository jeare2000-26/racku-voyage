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
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      backgroundColor: "#F0EDE8",
      color: "#1E1612",
      minHeight: "100vh",
      display: "flex",
    }}>

      {/* LEFT SIDEBAR NAV — Neringa style */}
      <aside style={{
        width: "180px",
        minWidth: "180px",
        padding: "28px 20px",
        borderRight: "1px solid #D8D3CC",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        background: "#F0EDE8",
        overflowY: "auto",
      }}>
        <div>
          {/* Brand */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#1E1612", fontWeight: 400, textTransform: "uppercase", cursor: "pointer" }}
              onClick={() => navigate("/")}>
              RACKU VOYAGE
            </div>
          </div>

          {/* Primary nav */}
          {NAV_ITEMS.map(item => (
            <div key={item} style={{
              fontSize: "12px", color: "#46424A", marginBottom: "10px",
              cursor: "pointer", letterSpacing: "0.5px", lineHeight: 1.4,
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#1E1612"}
              onMouseLeave={e => e.target.style.color = "#46424A"}
              onClick={() => navigate("/")}
            >{item}</div>
          ))}

          {/* Divider */}
          <div style={{ height: "1px", background: "#D8D3CC", margin: "18px 0" }} />

          {/* Restaurant sub-nav */}
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{
              fontSize: "11px", color: "#867878", marginBottom: "9px",
              cursor: "pointer", letterSpacing: "0.5px",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#4D2D1B"}
              onMouseLeave={e => e.target.style.color = "#867878"}
            >{item}</div>
          ))}
        </div>

        <div>
          <button onClick={() => navigate("/dashboard")} style={{
            background: "transparent", border: "1px solid #CBCBCB", color: "#46424A",
            padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer",
            textTransform: "uppercase", width: "100%",
          }}>Dashboard</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: "180px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <div style={{
          display: "flex", justifyContent: "flex-end", alignItems: "center",
          padding: "20px 48px", borderBottom: "1px solid #D8D3CC",
        }}>
          <span style={{ fontSize: "11px", letterSpacing: "2px", color: "#867878", marginRight: "24px" }}>EN</span>
          <div style={{ cursor: "pointer" }} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={{ width: "22px", height: "1px", background: "#1E1612", marginBottom: "5px" }} />
            <div style={{ width: "22px", height: "1px", background: "#1E1612", marginBottom: "5px" }} />
            <div style={{ width: "14px", height: "1px", background: "#1E1612" }} />
          </div>
        </div>

        {/* HERO SECTION */}
        <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 61px)" }}>

          {/* Left: text + search */}
          <div style={{ flex: 1, padding: "60px 48px 60px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "11px", letterSpacing: "5px", color: "#867878", textTransform: "uppercase", marginBottom: "20px" }}>
              Hotel Rooms
            </div>

            <h1 style={{
              fontSize: "clamp(52px, 7vw, 96px)",
              fontWeight: 300,
              lineHeight: 1.05,
              margin: "0 0 12px",
              color: "#1E1612",
              letterSpacing: "-1px",
            }}>
              Find Your<br />
              <span style={{ fontStyle: "italic", color: "#4D2D1B" }}>Perfect Stay</span>
            </h1>

            <p style={{
              fontSize: "14px", color: "#867878", lineHeight: 1.9,
              maxWidth: "400px", marginBottom: "48px", letterSpacing: "0.3px",
            }}>
              Discover handpicked luxury hotels across the world's most breathtaking destinations. Every stay, curated.
            </p>

            {/* SEARCH FORM — Neringa minimal style */}
            <form onSubmit={handleSearch} style={{
              background: "#FAFAF8",
              border: "1px solid #D8D3CC",
              padding: "28px 32px",
              maxWidth: "580px",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "8px" }}>Destination</div>
                  <input
                    type="text"
                    placeholder="City, country..."
                    value={form.destination}
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      borderBottom: "1px solid #D8D3CC", color: "#1E1612",
                      fontSize: "14px", padding: "6px 0", outline: "none",
                      fontFamily: "Georgia, serif", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "8px" }}>Check In</div>
                  <input type="date" value={form.checkin} min={today}
                    onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      borderBottom: "1px solid #D8D3CC", color: "#1E1612",
                      fontSize: "13px", padding: "6px 0", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "8px" }}>Check Out</div>
                  <input type="date" value={form.checkout} min={form.checkin || tomorrow}
                    onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      borderBottom: "1px solid #D8D3CC", color: "#1E1612",
                      fontSize: "13px", padding: "6px 0", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase" }}>Guests</div>
                  <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                    style={{
                      background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC",
                      color: "#1E1612", fontSize: "13px", padding: "4px 0", outline: "none", cursor: "pointer",
                    }}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#FAFAF8" }}>{n} Adult{n>1?"s":""}</option>)}
                  </select>
                </div>

                <button type="submit" style={{
                  background: "#1E1612", color: "#F0EDE8", border: "none",
                  padding: "12px 28px", fontSize: "10px", letterSpacing: "3px",
                  cursor: "pointer", textTransform: "uppercase",
                }}>
                  Search
                </button>
              </div>

              {formError && (
                <div style={{ marginTop: "12px", fontSize: "11px", color: "#4D2D1B", letterSpacing: "1px" }}>
                  {formError}
                </div>
              )}
            </form>
          </div>

          {/* Right: hero image */}
          <div style={{ width: "420px", minWidth: "360px", position: "relative", overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=85"
              alt="Luxury hotel"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(240,237,232,0.3) 0%, transparent 40%)",
            }} />
          </div>
        </div>

        {/* DESTINATIONS STRIP */}
        <div style={{ padding: "60px 48px", borderTop: "1px solid #D8D3CC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "8px" }}>Explore</div>
              <h2 style={{ fontSize: "32px", fontWeight: 300, margin: 0, color: "#1E1612", letterSpacing: "-0.5px" }}>
                Popular Destinations
              </h2>
            </div>
            <div style={{ fontSize: "11px", color: "#867878", letterSpacing: "2px", cursor: "pointer" }}>
              View all →
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
            {DESTINATIONS.map(d => (
              <div
                key={d.city}
                onClick={() => navigate(`/search?destination=${encodeURIComponent(d.city + ", " + d.country)}&checkin=${today}&checkout=${tomorrow}&adults=2`)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ position: "relative", paddingBottom: "130%", overflow: "hidden", marginBottom: "10px" }}>
                  <img src={d.img} alt={d.city}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                  />
                </div>
                <div style={{ fontSize: "13px", color: "#1E1612", marginBottom: "2px" }}>{d.city}</div>
                <div style={{ fontSize: "10px", color: "#867878", letterSpacing: "1px" }}>{d.country}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #D8D3CC", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "11px", color: "#CBCBCB", letterSpacing: "2px" }}>RACKU VOYAGE</div>
          <div style={{ fontSize: "11px", color: "#CBCBCB" }}>© 2026 All rights reserved.</div>
        </div>
      </main>
    </div>
  );
}
