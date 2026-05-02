import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

const T = {
  bg: "#111109",
  bgCard: "#191912",
  olive: "#2A2A1E",
  cream: "#F2EDE4",
  creamMuted: "#BDB9B0",
  creamFaint: "#6B6860",
  creamGhost: "#2E2C28",
  gold: "#C8A96E",
  goldMuted: "#8A7248",
  goldFaint: "#3D3220",
  border: "#2A2820",
  borderLight: "#3A3830",
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
        display: "flex", background: hovered && canClick ? T.bgCard : T.bg,
        opacity: canClick ? 1 : 0.4, transition: "all 0.3s",
        borderBottom: `1px solid ${T.border}`,
        borderLeft: `3px solid ${hovered && canClick ? T.gold : "transparent"}`,
        cursor: canClick ? "pointer" : "default",
      }}>
      {/* Photo */}
      <div style={{ width: "240px", minWidth: "240px", height: "180px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
        <img src={hotel.thumbnail || "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80"}
          alt={hotel.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&q=80"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered && canClick ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s", filter: "brightness(0.75)" }}
        />
        {hovered && canClick && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(17,17,9,0.4)" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "3px", color: T.cream, textTransform: "uppercase", background: "rgba(200,169,110,0.9)", padding: "7px 16px" }}>Explore →</div>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ flex: 1, padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {hotel.stars > 0 && (
            <div style={{ fontSize: "11px", color: T.gold, marginBottom: "6px", letterSpacing: "2px" }}>{"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}</div>
          )}
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 400, margin: "0 0 5px", color: T.cream }}>{hotel.name}</h3>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamMuted, marginBottom: "14px" }}>
            {[hotel.city, hotel.country].filter(Boolean).join(", ")}
          </div>
          {hotel.rating > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: T.gold, color: T.bg, padding: "2px 10px", fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 500 }}>{hotel.rating}/10</span>
              {hotel.reviewCount > 0 && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
            </div>
          )}
          {hotel.roomName && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, marginTop: "8px" }}>{hotel.roomName}</div>}
        </div>
        <div style={{ textAlign: "right", minWidth: "160px" }}>
          {hotel.hasRates ? (
            <>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase", marginBottom: "4px" }}>From</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "34px", color: T.cream, fontWeight: 400, lineHeight: 1 }}>${Math.round(hotel.price)}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: T.creamFaint, letterSpacing: "1px", marginBottom: "8px", textTransform: "uppercase" }}>/Night · USD</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.gold }}>+${hotel.commission} commission</div>
            </>
          ) : (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, letterSpacing: "1px", marginTop: "24px", textTransform: "uppercase" }}>No Availability</div>
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
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.cream, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        input::placeholder { color: ${T.creamFaint}; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* TOP NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: `1px solid ${T.border}`, background: T.bgCard, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "5px", color: T.cream, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku <em style={{ color: T.gold, fontStyle: "italic" }}>Voyage</em>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.creamMuted, padding: "7px 20px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.creamMuted; }}>
            Dashboard
          </button>
          <button onClick={() => navigate("/")} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.creamMuted, padding: "7px 20px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.creamMuted; }}>
            ← Home
          </button>
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div style={{ background: T.bgCard, borderBottom: `1px solid ${T.border}` }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.7fr auto", borderLeft: `1px solid ${T.border}` }}>
            {[
              { label: "Destination", type: "text", key: "destination", placeholder: "City or country..." },
              { label: "Arrival", type: "date", key: "checkin" },
              { label: "Departure", type: "date", key: "checkout" },
            ].map(({ label, type, key, placeholder }) => (
              <div key={key} style={{ padding: "18px 24px", borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "5px" }}>{label}</div>
                <input type={type} value={form[key]} placeholder={placeholder}
                  min={key === "checkin" ? today : key === "checkout" ? form.checkin : undefined}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", background: "transparent", border: "none", color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none", padding: 0, colorScheme: "dark" }}
                />
              </div>
            ))}
            <div style={{ padding: "18px 18px", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "5px" }}>Guests</div>
              <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                style={{ background: "transparent", border: "none", color: T.cream, fontFamily: "'Inter', sans-serif", fontSize: "14px", outline: "none", padding: 0, cursor: "pointer" }}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: T.bgCard }}>{n} {n > 1 ? "Adults" : "Adult"}</option>)}
              </select>
            </div>
            <button type="submit" style={{ padding: "0 32px", background: T.gold, border: "none", color: T.bg, fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 500, transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#D4B87A"}
              onMouseLeave={e => e.currentTarget.style.background = T.gold}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* RESULTS LAYOUT */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 140px)" }}>

        {/* FILTER SIDEBAR */}
        <aside style={{ width: "240px", minWidth: "240px", borderRight: `1px solid ${T.border}`, padding: "36px 28px", background: T.bgCard }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase", marginBottom: "28px" }}>Refine Results</div>

          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase", marginBottom: "14px" }}>Sort By</div>
            {[["recommended","Recommended"],["price_low","Price: Low → High"],["price_high","Price: High → Low"],["rating","Star Rating"]].map(([val, label]) => (
              <div key={val} onClick={() => setSortBy(val)}
                style={{ padding: "9px 0 9px 14px", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: sortBy === val ? T.gold : T.creamMuted, borderLeft: `2px solid ${sortBy === val ? T.gold : "transparent"}`, cursor: "pointer", transition: "all 0.2s", marginBottom: "2px" }}>
                {label}
              </div>
            ))}
          </div>

          {resolvedCity && (
            <div style={{ padding: "16px", border: `1px solid ${T.border}`, background: T.bg, marginBottom: "20px" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: T.creamFaint, textTransform: "uppercase", marginBottom: "5px" }}>Showing</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "14px", color: T.cream, fontStyle: "italic" }}>{resolvedCity}</div>
            </div>
          )}

          {hotels.length > 0 && (
            <div style={{ padding: "16px", border: `1px solid ${T.border}`, background: T.bg }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: T.creamFaint, textTransform: "uppercase", marginBottom: "8px" }}>Available</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 300, color: T.gold }}>{hotels.filter(h => h.hasRates).length}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint }}>of {hotels.length} properties</div>
            </div>
          )}
        </aside>

        {/* HOTEL LIST */}
        <div style={{ flex: 1 }}>
          {/* Result header */}
          {(hotels.length > 0 || loading) && (
            <div style={{ padding: "20px 32px", borderBottom: `1px solid ${T.border}`, background: T.bg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: T.creamMuted, fontWeight: 300 }}>
                {loading ? "Searching..." : `${displayed.filter(h => h.hasRates).length} properties · ${nights} night${nights > 1 ? "s" : ""} · Click any property to explore`}
              </div>
              {destination && <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "13px", fontStyle: "italic", color: T.creamFaint }}>{destination}</div>}
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: "20px" }}>
              <div style={{ width: "36px", height: "36px", border: `1.5px solid ${T.border}`, borderTop: `1.5px solid ${T.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "5px", color: T.creamFaint, textTransform: "uppercase" }}>Searching...</div>
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "60px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#E57373", marginBottom: "20px" }}>{error}</div>
              <button onClick={() => navigate("/")} style={{ background: T.gold, color: T.bg, border: "none", padding: "10px 28px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 500 }}>New Search</button>
            </div>
          )}

          {!loading && !error && hotels.length === 0 && destination && (
            <div style={{ padding: "80px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 300, fontStyle: "italic", color: T.cream, marginBottom: "12px" }}>No hotels found</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: T.creamFaint }}>Try a different destination or adjust your dates.</div>
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
