import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  teal: "#1B4B4B",
  card: "#17120D",
  cardHover: "#1F1812",
  border: "#2E2318",
  borderLight: "#3D3022",
};

function HotelCard({ hotel, checkin, checkout, adults, navigate }) {
  const [hovered, setHovered] = useState(false);
  const url = `/hotel?hotelId=${hotel.id}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}`;
  const canClick = hotel.hasRates;

  return (
    <div onClick={() => canClick && navigate(url)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", background: hovered && canClick ? T.cardHover : T.card,
        opacity: canClick ? 1 : 0.45, transition: "all 0.3s",
        borderBottom: `1px solid ${T.border}`,
        borderLeft: `3px solid ${hovered && canClick ? T.terracotta : "transparent"}`,
        cursor: canClick ? "pointer" : "default",
      }}>
      {/* Photo */}
      <div style={{ width: "240px", minWidth: "240px", height: "180px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
        <img src={hotel.thumbnail || "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80"}
          alt={hotel.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered && canClick ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s", filter: hovered && canClick ? "brightness(0.9)" : "brightness(0.75)" }}
        />
        {hovered && canClick && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(14,11,8,0.4)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: T.sand, textTransform: "uppercase", background: "rgba(196,98,45,0.85)", padding: "8px 18px" }}>View Details →</div>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ flex: 1, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {hotel.stars > 0 && (
            <div style={{ fontSize: "11px", color: T.terracotta, marginBottom: "6px", letterSpacing: "2px" }}>{"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}</div>
          )}
          <h3 style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: "18px", fontWeight: 400, margin: "0 0 4px", color: T.sand }}>{hotel.name}</h3>
          <div style={{ fontSize: "11px", color: T.sandMuted, marginBottom: "12px" }}>
            {[hotel.city, hotel.country].filter(Boolean).join(", ")}
          </div>
          {hotel.rating > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: T.terracotta, color: T.sand, padding: "2px 10px", fontSize: "11px", fontWeight: 600 }}>{hotel.rating}/10</span>
              {hotel.reviewCount > 0 && <span style={{ fontSize: "10px", color: T.sandFaint }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
            </div>
          )}
          {hotel.roomName && <div style={{ fontSize: "10px", color: T.sandFaint, marginTop: "8px" }}>{hotel.roomName}</div>}
        </div>
        <div style={{ textAlign: "right", minWidth: "160px" }}>
          {hotel.hasRates ? (
            <>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "4px" }}>From</div>
              <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: "32px", color: T.sand, fontWeight: 300, lineHeight: 1 }}>${Math.round(hotel.price)}</div>
              <div style={{ fontSize: "9px", color: T.sandFaint, letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>/Night · USD</div>
              <div style={{ fontSize: "11px", color: T.terracottaLight }}>+${hotel.commission} commission</div>
            </>
          ) : (
            <div style={{ fontSize: "10px", color: T.sandFaint, letterSpacing: "1px", marginTop: "24px", textTransform: "uppercase" }}>No Availability</div>
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

  const doSearch = useCallback(async (dest, cin, cout, adts) => {
    if (!dest) return;
    setLoading(true); setError(""); setHotels([]); setResolvedCity("");
    try {
      const pRes = await fetch(`https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(dest)}&language=en`, { headers: { "X-API-Key": LITEAPI_KEY } });
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

      const hRes = await fetch(`https://api.liteapi.travel/v3.0/data/hotels?placeId=${encodeURIComponent(best.placeId)}&limit=20&language=en`, { headers: { "X-API-Key": LITEAPI_KEY } });
      let hotelList = (await hRes.json()).data || [];
      if (!hotelList.length && (best.countryCode || best.country_code)) {
        const cc = best.countryCode || best.country_code;
        const city = best.displayName || dest.split(",")[0].trim();
        const fb = await fetch(`https://api.liteapi.travel/v3.0/data/hotels?countryCode=${cc}&cityName=${encodeURIComponent(city)}&limit=20&language=en`, { headers: { "X-API-Key": LITEAPI_KEY } });
        hotelList = (await fb.json()).data || [];
      }
      if (!hotelList.length) { setError(`No hotels found in ${best.formattedAddress || dest}.`); setLoading(false); return; }

      const hotelIds = hotelList.slice(0, 20).map(h => h.id).filter(Boolean);
      const rRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ hotelIds, checkin: cin, checkout: cout, occupancies: [{ adults: parseInt(adts) || 2 }], currency: "USD", guestNationality: "US", margin: DEFAULT_MARGIN }),
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
  const displayed = [...hotels].sort((a, b) => {
    if (sortBy === "price_low") return (a.price || 99999) - (b.price || 99999);
    if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.stars || 0) - (a.stars || 0);
    return (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0);
  });

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.sand, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        .sort-btn:hover { color: ${T.sand} !important; }
      `}</style>

      {/* TOP NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: `1px solid ${T.border}`, background: T.card, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, letterSpacing: "5px", color: T.sand, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sandMuted, padding: "7px 20px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.terracotta; e.currentTarget.style.color = T.terracotta; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sandMuted; }}>
          ← New Search
        </button>
      </nav>

      {/* SEARCH BAR */}
      <div style={{ background: T.card, padding: "28px 40px", borderBottom: `1px solid ${T.border}` }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.7fr auto", gap: "0", border: `1px solid ${T.borderLight}`, background: T.bg, maxWidth: "1100px" }}>
            <div style={{ padding: "16px 22px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "5px" }}>Destination</div>
              <input type="text" placeholder="City, country..." value={form.destination}
                onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                style={{ width: "100%", background: "transparent", border: "none", color: T.sand, fontSize: "14px", outline: "none", fontFamily: "inherit", padding: 0 }}
              />
            </div>
            <div style={{ padding: "16px 18px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "5px" }}>Check In</div>
              <input type="date" value={form.checkin} min={today}
                onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                style={{ width: "100%", background: "transparent", border: "none", color: T.sand, fontSize: "13px", outline: "none", fontFamily: "inherit", padding: 0, colorScheme: "dark" }}
              />
            </div>
            <div style={{ padding: "16px 18px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "5px" }}>Check Out</div>
              <input type="date" value={form.checkout} min={form.checkin || tomorrow}
                onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                style={{ width: "100%", background: "transparent", border: "none", color: T.sand, fontSize: "13px", outline: "none", fontFamily: "inherit", padding: 0, colorScheme: "dark" }}
              />
            </div>
            <div style={{ padding: "16px 14px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.terracotta, textTransform: "uppercase", marginBottom: "5px" }}>Guests</div>
              <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                style={{ background: "transparent", border: "none", color: T.sand, fontSize: "13px", outline: "none", fontFamily: "inherit", padding: 0, cursor: "pointer" }}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: T.card }}>{n} {n > 1 ? "Adults" : "Adult"}</option>)}
              </select>
            </div>
            <button type="submit" style={{ padding: "0 32px", background: T.terracotta, border: "none", color: T.sand, fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.terracottaLight}
              onMouseLeave={e => e.currentTarget.style.background = T.terracotta}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* RESULTS AREA */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 200px)" }}>

        {/* SIDEBAR FILTER */}
        <aside style={{ width: "240px", minWidth: "240px", borderRight: `1px solid ${T.border}`, padding: "32px 24px", background: T.card }}>
          <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase", marginBottom: "20px" }}>Sort & Filter</div>

          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "12px" }}>Sort By</div>
            {[["recommended","Recommended"],["price_low","Price: Low → High"],["price_high","Price: High → Low"],["rating","Star Rating"]].map(([val, label]) => (
              <div key={val} onClick={() => setSortBy(val)} style={{ padding: "8px 0", fontSize: "12px", color: sortBy === val ? T.terracottaLight : T.sandMuted, borderLeft: `2px solid ${sortBy === val ? T.terracotta : "transparent"}`, paddingLeft: "12px", cursor: "pointer", transition: "all 0.2s", marginBottom: "2px" }}>
                {label}
              </div>
            ))}
          </div>

          {resolvedCity && (
            <div style={{ padding: "14px", border: `1px solid ${T.border}`, background: T.bg }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "5px" }}>Showing Results For</div>
              <div style={{ fontSize: "12px", color: T.sand }}>{resolvedCity}</div>
            </div>
          )}

          {hotels.length > 0 && (
            <div style={{ marginTop: "24px", padding: "14px", border: `1px solid ${T.border}`, background: T.bg }}>
              <div style={{ fontSize: "8px", letterSpacing: "3px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "10px" }}>Availability</div>
              <div style={{ fontSize: "22px", fontFamily: "'Georgia',serif", color: T.terracottaLight, fontWeight: 300 }}>{hotels.filter(h => h.hasRates).length}</div>
              <div style={{ fontSize: "10px", color: T.sandFaint }}>of {hotels.length} hotels available</div>
            </div>
          )}

          <div style={{ marginTop: "24px" }}>
            <button onClick={() => navigate("/dashboard")} style={{ width: "100%", background: "transparent", border: `1px solid ${T.border}`, color: T.sandMuted, padding: "10px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.terracotta; e.currentTarget.style.color = T.terracotta; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sandMuted; }}>
              Dashboard
            </button>
          </div>
        </aside>

        {/* HOTEL LIST */}
        <div style={{ flex: 1, padding: "0" }}>
          {/* Header bar */}
          {(hotels.length > 0 || loading) && (
            <div style={{ padding: "18px 32px", borderBottom: `1px solid ${T.border}`, background: T.bg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "12px", color: T.sandMuted }}>
                {loading ? "Searching..." : `${displayed.filter(h => h.hasRates).length} properties available · ${nights} night${nights > 1 ? "s" : ""}`}
              </div>
              {destination && <div style={{ fontSize: "11px", color: T.sandFaint }}>{destination}</div>}
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: "20px" }}>
              <div style={{ width: "40px", height: "40px", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.terracotta}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: "10px", letterSpacing: "5px", color: T.sandFaint, textTransform: "uppercase" }}>Searching Hotels...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "60px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "#E57373", marginBottom: "20px" }}>{error}</div>
              <button onClick={() => navigate("/")} style={{ background: T.terracotta, color: T.sand, border: "none", padding: "10px 28px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "inherit" }}>New Search</button>
            </div>
          )}

          {!loading && !error && hotels.length === 0 && destination && (
            <div style={{ padding: "80px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "16px" }}>No Results</div>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: "28px", fontWeight: 300, color: T.sand, marginBottom: "12px" }}>No hotels found</div>
              <div style={{ fontSize: "13px", color: T.sandMuted }}>Try a different destination or adjust your dates.</div>
            </div>
          )}

          {!loading && displayed.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} checkin={checkin} checkout={checkout} adults={adults} navigate={navigate} />
          ))}
        </div>
      </div>
    </div>
  );
}
