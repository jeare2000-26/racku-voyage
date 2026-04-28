import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

// Isolated card component to prevent event bubbling issues
function HotelCard({ hotel, checkin, checkout, adults, navigate }) {
  const [hovered, setHovered] = useState(false);
  const url = `/hotel/${hotel.id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}`;

  return (
    <div
      style={{
        display: "flex",
        background: hovered ? "#FAFAF8" : "#F0EDE8",
        opacity: hotel.hasRates ? 1 : 0.45,
        transition: "background 0.2s",
        borderBottom: "1px solid #EDEAE6",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* PHOTO */}
      <div style={{ width: "200px", minWidth: "200px", height: "160px", overflow: "hidden", flexShrink: 0 }}>
        <img
          src={hotel.thumbnail || hotel.main_photo || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"}
          alt={hotel.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"; }}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hovered ? "scale(1.03)" : "scale(1)", transition: "transform 0.5s",
          }}
        />
      </div>

      {/* INFO */}
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {hotel.stars > 0 && (
            <div style={{ fontSize: "10px", color: "#867878", marginBottom: "5px", letterSpacing: "2px" }}>
              {"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}
            </div>
          )}
          <h3 style={{ fontSize: "16px", fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.2px" }}>{hotel.name}</h3>
          <div style={{ fontSize: "11px", color: "#867878", marginBottom: "10px" }}>
            {[hotel.city, hotel.country].filter(Boolean).join(", ")}
          </div>
          {hotel.rating > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "#1E1612", color: "#F0EDE8", padding: "2px 8px", fontSize: "11px" }}>{hotel.rating}/10</span>
              {hotel.reviewCount > 0 && <span style={{ fontSize: "10px", color: "#CBCBCB" }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
            </div>
          )}
          {hotel.roomName && <div style={{ fontSize: "10px", color: "#CBCBCB", marginTop: "8px" }}>{hotel.roomName}</div>}
        </div>

        <div style={{ textAlign: "right", minWidth: "140px" }}>
          {hotel.hasRates ? (
            <>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "3px" }}>From</div>
              <div style={{ fontSize: "28px", color: "#1E1612", fontWeight: 300, lineHeight: 1 }}>${Math.round(hotel.price)}</div>
              <div style={{ fontSize: "9px", color: "#CBCBCB", letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" }}>/Night · USD</div>
              <div style={{ fontSize: "10px", color: "#4D2D1B", marginBottom: "14px" }}>+${hotel.commission} commission</div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(url); }}
                style={{
                  background: "#1E1612", color: "#F0EDE8", border: "none",
                  padding: "9px 18px", fontSize: "10px", letterSpacing: "2px",
                  cursor: "pointer", textTransform: "uppercase",
                  position: "relative", zIndex: 10,
                }}
              >
                View Hotel
              </button>
            </>
          ) : (
            <div style={{ fontSize: "10px", color: "#CBCBCB", letterSpacing: "1px", marginTop: "20px", textTransform: "uppercase" }}>No Availability</div>
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
      const pJson = await pRes.json();
      const places = pJson.data || [];
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
      const hJson = await hRes.json();
      let hotelList = hJson.data || [];

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

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", backgroundColor: "#F0EDE8", color: "#1E1612", minHeight: "100vh", display: "flex" }}>

      {/* LEFT SIDEBAR */}
      <aside style={{
        width: "180px", minWidth: "180px", padding: "28px 20px",
        borderRight: "1px solid #D8D3CC", display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: "#F0EDE8", overflowY: "auto",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#1E1612", textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }}
            onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: "#46424A", marginBottom: "10px", cursor: "pointer", letterSpacing: "0.5px" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1E1612"}
              onMouseLeave={e => e.currentTarget.style.color = "#46424A"}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: "#D8D3CC", margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: "#867878", marginBottom: "9px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = "#4D2D1B"}
              onMouseLeave={e => e.currentTarget.style.color = "#867878"}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "transparent", border: "1px solid #CBCBCB", color: "#46424A",
          padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%",
        }}>Dashboard</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* SEARCH BAR */}
        <div style={{ borderBottom: "1px solid #D8D3CC", padding: "16px 36px", background: "#F0EDE8", position: "sticky", top: 0, zIndex: 40 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "5px" }}>Destination</div>
              <input type="text" value={form.destination} placeholder="City, country..."
                onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                style={{ background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", fontSize: "13px", padding: "4px 0", outline: "none", width: "180px", fontFamily: "Georgia, serif" }} />
            </div>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "5px" }}>Check In</div>
              <input type="date" value={form.checkin} min={today}
                onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
                style={{ background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", fontSize: "13px", padding: "4px 0", outline: "none" }} />
            </div>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "5px" }}>Check Out</div>
              <input type="date" value={form.checkout} min={form.checkin || tomorrow}
                onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
                style={{ background: "transparent", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", fontSize: "13px", padding: "4px 0", outline: "none" }} />
            </div>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "5px" }}>Guests</div>
              <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
                style={{ background: "#F0EDE8", border: "none", borderBottom: "1px solid #D8D3CC", color: "#1E1612", fontSize: "13px", padding: "4px 0", outline: "none", cursor: "pointer" }}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#F0EDE8" }}>{n} Adult{n>1?"s":""}</option>)}
              </select>
            </div>
            <button type="submit" style={{
              background: "#1E1612", color: "#F0EDE8", border: "none",
              padding: "9px 22px", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase",
            }}>Search</button>
          </form>
        </div>

        <div style={{ display: "flex", flex: 1 }}>

          {/* FILTER SIDEBAR */}
          <div style={{ width: "180px", minWidth: "180px", padding: "28px 20px", borderRight: "1px solid #D8D3CC" }}>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "20px" }}>Refine</div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#867878", textTransform: "uppercase", marginBottom: "12px" }}>Sort By</div>
              {[["recommended","Recommended"],["price_low","Price: Low → High"],["price_high","Price: High → Low"],["rating","Star Rating"]].map(([key, label]) => (
                <div key={key} onClick={() => setSortBy(key)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px", cursor: "pointer" }}>
                  <div style={{ width: "10px", height: "10px", border: `1px solid ${sortBy === key ? "#1E1612" : "#CBCBCB"}`, borderRadius: "50%", background: sortBy === key ? "#1E1612" : "transparent", flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: sortBy === key ? "#1E1612" : "#867878" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#867878", textTransform: "uppercase", marginBottom: "12px" }}>Stars</div>
              {[5,4,3,2].map(s => (
                <div key={s} onClick={() => toggleStar(s)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px", cursor: "pointer" }}>
                  <div style={{ width: "10px", height: "10px", border: `1px solid ${starFilter.includes(s) ? "#1E1612" : "#CBCBCB"}`, background: starFilter.includes(s) ? "#1E1612" : "transparent", flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: starFilter.includes(s) ? "#1E1612" : "#867878" }}>{"★".repeat(s)}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px", border: "1px solid #D8D3CC", background: "#FAFAF8" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#867878", textTransform: "uppercase", marginBottom: "4px" }}>Margin</div>
              <div style={{ fontSize: "26px", color: "#4D2D1B", fontWeight: 300 }}>{DEFAULT_MARGIN}%</div>
              <div style={{ fontSize: "9px", color: "#CBCBCB", letterSpacing: "1px" }}>Per Booking</div>
            </div>
          </div>

          {/* RESULTS */}
          <div style={{ flex: 1, padding: "28px 36px" }}>

            {loading && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "11px", color: "#CBCBCB", letterSpacing: "5px", textTransform: "uppercase" }}>Searching hotels...</div>
                {destination && <div style={{ fontSize: "12px", color: "#867878", marginTop: "8px" }}>{destination}</div>}
              </div>
            )}

            {!loading && error && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: "13px", color: "#4D2D1B", marginBottom: "20px" }}>{error}</div>
                <button onClick={() => navigate("/")} style={{ background: "#1E1612", color: "#F0EDE8", border: "none", padding: "10px 24px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>← New Search</button>
              </div>
            )}

            {!loading && !destination && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase" }}>Enter a destination to begin</div>
              </div>
            )}

            {!loading && displayed.length > 0 && (
              <>
                <div style={{ marginBottom: "28px", borderBottom: "1px solid #D8D3CC", paddingBottom: "16px" }}>
                  <h2 style={{ fontSize: "28px", fontWeight: 300, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
                    {resolvedCity || destination}
                  </h2>
                  <div style={{ fontSize: "11px", color: "#867878", letterSpacing: "2px" }}>
                    {displayed.filter(h => h.hasRates).length} available · {nights} night{nights > 1 ? "s" : ""} · {adults} guest{parseInt(adults) > 1 ? "s" : ""}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {displayed.map(hotel => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      checkin={checkin}
                      checkout={checkout}
                      adults={adults}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
