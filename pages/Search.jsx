import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;
const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

const T = {
  bg: "#0B0F1A", bgCard: "#111827", bgCardHover: "#161D2E", sidebar: "#0D1120",
  border: "#1E2A3D", borderLight: "#253045", gold: "#C9A84C", goldLight: "#E0C06A",
  goldMuted: "#8A6E32", text: "#F0EAD6", textMuted: "#8A99B8", textFaint: "#4A5568",
  white: "#FFFFFF", success: "#2E7D32",
};

function HotelCard({ hotel, checkin, checkout, adults, navigate }) {
  const [hovered, setHovered] = useState(false);
  const url = `/hotel?hotelId=${hotel.id}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}`;

  return (
    <div style={{
      display: "flex", background: hovered ? T.bgCardHover : T.bgCard,
      opacity: hotel.hasRates ? 1 : 0.4, transition: "background 0.2s",
      borderBottom: `1px solid ${T.border}`,
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ width: "200px", minWidth: "200px", height: "160px", overflow: "hidden", flexShrink: 0 }}>
        <img
          src={hotel.thumbnail || hotel.main_photo || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"}
          alt={hotel.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.5s", filter: "brightness(0.85)" }}
        />
      </div>
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {hotel.stars > 0 && (
            <div style={{ fontSize: "11px", color: T.gold, marginBottom: "5px", letterSpacing: "2px" }}>
              {"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}
            </div>
          )}
          <h3 style={{ fontSize: "16px", fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.2px", color: T.text }}>{hotel.name}</h3>
          <div style={{ fontSize: "11px", color: T.textMuted, marginBottom: "10px" }}>
            {[hotel.city, hotel.country].filter(Boolean).join(", ")}
          </div>
          {hotel.rating > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: T.gold, color: T.bg, padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>{hotel.rating}/10</span>
              {hotel.reviewCount > 0 && <span style={{ fontSize: "10px", color: T.textFaint }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
            </div>
          )}
          {hotel.roomName && <div style={{ fontSize: "10px", color: T.textFaint, marginTop: "8px" }}>{hotel.roomName}</div>}
        </div>
        <div style={{ textAlign: "right", minWidth: "140px" }}>
          {hotel.hasRates ? (
            <>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase", marginBottom: "3px" }}>From</div>
              <div style={{ fontSize: "28px", color: T.text, fontWeight: 300, lineHeight: 1 }}>${Math.round(hotel.price)}</div>
              <div style={{ fontSize: "9px", color: T.textFaint, letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" }}>/Night · USD</div>
              <div style={{ fontSize: "10px", color: T.gold, marginBottom: "14px" }}>+${hotel.commission} commission</div>
              <button type="button" onClick={(e) => { e.stopPropagation(); navigate(url); }}
                style={{
                  background: T.gold, color: T.bg, border: "none",
                  padding: "9px 18px", fontSize: "10px", letterSpacing: "2px",
                  cursor: "pointer", textTransform: "uppercase", fontWeight: 600, transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = T.goldLight}
                onMouseLeave={e => e.currentTarget.style.background = T.gold}>
                View Hotel
              </button>
            </>
          ) : (
            <div style={{ fontSize: "10px", color: T.textFaint, letterSpacing: "1px", marginTop: "20px", textTransform: "uppercase" }}>No Availability</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const destination = searchParams.get("destination") || "";
  const checkin = searchParams.get("checkin") || today;
  const checkout = searchParams.get("checkout") || tomorrow;
  const adults = searchParams.get("adults") || "2";

  const [form, setForm] = useState({ destination, checkin, checkout, adults });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedCity, setResolvedCity] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [starFilter, setStarFilter] = useState([]);

  const doSearch = useCallback(async (dest, cin, cout, adts) => {
    if (!dest) return;
    setLoading(true); setError(""); setHotels([]); setResolvedCity("");
    try {
      const pRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(dest)}&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const places = (await pRes.json()).data || [];
      if (!places.length) { setError(`No location found for "${dest}".`); setLoading(false); return; }

      const destLower = dest.toLowerCase();
      let best = places[0];
      if (destLower.includes(",")) {
        const hint = destLower.split(",").pop().trim();
        const match = places.find(p => (p.formattedAddress || "").toLowerCase().includes(hint));
        if (match) best = match;
      }
      setResolvedCity(best.formattedAddress || best.displayName || dest);

      const hRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?placeId=${encodeURIComponent(best.placeId)}&limit=20&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      let hotelList = (await hRes.json()).data || [];

      if (!hotelList.length && (best.countryCode || best.country_code)) {
        const cc = best.countryCode || best.country_code;
        const city = best.displayName || dest.split(",")[0].trim();
        const fb = await fetch(
          `https://api.liteapi.travel/v3.0/data/hotels?countryCode=${cc}&cityName=${encodeURIComponent(city)}&limit=20&language=en`,
          { headers: { "X-API-Key": LITEAPI_KEY } }
        );
        hotelList = (await fb.json()).data || [];
      }

      if (!hotelList.length) { setError(`No hotels in ${best.formattedAddress || dest}.`); setLoading(false); return; }

      const hotelIds = hotelList.slice(0, 20).map(h => h.id).filter(Boolean);
      const rRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelIds, checkin: cin, checkout: cout,
          occupancies: [{ adults: parseInt(adts) || 2 }],
          currency: "USD", guestNationality: "US", margin: DEFAULT_MARGIN,
        }),
      });
      const ratesMap = {};
      for (const r of (await rRes.json()).data || []) ratesMap[r.hotelId] = r;

      const merged = hotelList.slice(0, 20).map(h => {
        const room = ratesMap[h.id]?.roomTypes?.[0];
        const rate = room?.rates?.[0];
        const price = rate?.retailRate?.total?.[0]?.amount || 0;
        return { ...h, rate, price, commission: price > 0 ? Math.round(price * DEFAULT_MARGIN / 100) : 0, hasRates: price > 0, roomName: room?.name || "" };
      });
      merged.sort((a, b) => (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0));
      setHotels(merged);
      if (!merged.some(h => h.hasRates)) setError("Hotels found but no availability for these dates.");
    } catch (err) { setError(`Search error: ${err.message}`); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (destination) { setForm({ destination, checkin, checkout, adults }); doSearch(destination, checkin, checkout, adults); }
  }, [destination, checkin, checkout, adults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.destination.trim()) { setError("Please enter a destination."); return; }
    setSearchParams({ destination: form.destination, checkin: form.checkin || today, checkout: form.checkout || tomorrow, adults: form.adults });
  };

  const nights = checkin && checkout ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)) : 1;

  const displayed = [...hotels]
    .filter(h => !starFilter.length || starFilter.includes(Math.round(h.stars || 0)))
    .sort((a, b) => {
      if (sortBy === "price_low") return (a.price || 99999) - (b.price || 99999);
      if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "rating") return (b.stars || 0) - (a.stars || 0);
      return (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0);
    });

  const toggleStar = s => setStarFilter(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const inputStyle = {
    background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`,
    color: T.text, fontSize: "13px", padding: "5px 0", outline: "none",
    width: "100%", boxSizing: "border-box", colorScheme: "dark",
  };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", backgroundColor: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>

      {/* LEFT SIDEBAR */}
      <aside style={{
        width: "180px", minWidth: "180px", padding: "28px 20px",
        borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: T.sidebar, overflowY: "auto",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }}
            onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: T.textMuted, marginBottom: "10px", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.gold}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: T.textFaint, marginBottom: "9px" }}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "transparent", border: `1px solid ${T.goldMuted}`, color: T.gold,
          padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%",
        }}>Dashboard</button>
      </aside>

      {/* RIGHT CONTENT */}
      <div style={{ marginLeft: "180px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* SEARCH BAR */}
        <form onSubmit={handleSubmit} style={{
          display: "flex", alignItems: "flex-end", gap: "20px",
          padding: "18px 32px", borderBottom: `1px solid ${T.border}`,
          background: T.bgCard, flexWrap: "wrap",
        }}>
          {[
            { label: "Destination", type: "text", key: "destination", placeholder: "City, country..." },
            { label: "Check In", type: "date", key: "checkin" },
            { label: "Check Out", type: "date", key: "checkout" },
          ].map(({ label, type, key, placeholder }) => (
            <div key={key} style={{ flex: key === "destination" ? 2 : 1, minWidth: "120px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
              <input type={type} value={form[key]} min={key === "checkin" ? today : key === "checkout" ? form.checkin : undefined}
                placeholder={placeholder}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
          <div style={{ minWidth: "100px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "6px" }}>Guests</div>
            <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
              style={{ ...inputStyle, cursor: "pointer" }}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: T.bgCard }}>{n} Adult{n>1?"s":""}</option>)}
            </select>
          </div>
          <button type="submit" style={{
            background: T.gold, color: T.bg, border: "none", padding: "10px 28px",
            fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 600,
          }}>Search</button>
        </form>

        <div style={{ display: "flex", flex: 1 }}>

          {/* FILTER PANEL */}
          <div style={{ width: "200px", minWidth: "200px", padding: "24px 20px", borderRight: `1px solid ${T.border}`, background: T.sidebar }}>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.textFaint, textTransform: "uppercase", marginBottom: "20px" }}>Refine</div>

            <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "12px" }}>Sort By</div>
            {[["recommended","Recommended"],["price_low","Price: Low → High"],["price_high","Price: High → Low"],["rating","Star Rating"]].map(([val, label]) => (
              <label key={val} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", cursor: "pointer" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", border: `2px solid ${sortBy === val ? T.gold : T.border}`, background: sortBy === val ? T.gold : "transparent", flexShrink: 0, transition: "all 0.2s" }} onClick={() => setSortBy(val)} />
                <span style={{ fontSize: "11px", color: sortBy === val ? T.gold : T.textMuted }}>{label}</span>
              </label>
            ))}

            <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />

            <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "12px" }}>Stars</div>
            {[5,4,3,2].map(s => (
              <label key={s} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", cursor: "pointer" }}>
                <input type="checkbox" checked={starFilter.includes(s)} onChange={() => toggleStar(s)}
                  style={{ accentColor: T.gold }} />
                <span style={{ fontSize: "11px", color: T.gold }}>{"★".repeat(s)}</span>
              </label>
            ))}

            <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.textFaint, textTransform: "uppercase", marginBottom: "6px" }}>Margin</div>
              <div style={{ fontSize: "28px", color: T.gold, fontWeight: 300 }}>15%</div>
              <div style={{ fontSize: "9px", color: T.textFaint, letterSpacing: "1px" }}>Per Booking</div>
            </div>
          </div>

          {/* RESULTS */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Header */}
            <div style={{ padding: "20px 32px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              {loading ? (
                <div style={{ fontSize: "13px", color: T.textMuted }}>Searching hotels...</div>
              ) : resolvedCity ? (
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 300, color: T.text, marginBottom: "4px" }}>
                    {resolvedCity.split(",")[0]}
                  </div>
                  <div style={{ fontSize: "12px", color: T.textMuted }}>
                    {displayed.length} available · {nights} night{nights > 1 ? "s" : ""} · {adults} guest{parseInt(adults) > 1 ? "s" : ""}
                  </div>
                </div>
              ) : error ? (
                <div style={{ fontSize: "13px", color: "#E57373" }}>{error}</div>
              ) : null}
            </div>

            {loading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px", flexDirection: "column", gap: "16px" }}>
                <div style={{ width: "32px", height: "32px", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <div style={{ fontSize: "11px", color: T.textFaint, letterSpacing: "3px", textTransform: "uppercase" }}>Finding hotels...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {!loading && displayed.map((hotel, i) => (
              <HotelCard key={hotel.id || i} hotel={hotel} checkin={checkin} checkout={checkout} adults={adults} navigate={navigate} />
            ))}

            {!loading && !displayed.length && !error && resolvedCity && (
              <div style={{ textAlign: "center", padding: "80px", color: T.textFaint, fontSize: "13px" }}>No hotels match your filters.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
