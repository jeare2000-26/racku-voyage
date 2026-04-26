import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Always read form state from URL params
  const destination = searchParams.get("destination") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = searchParams.get("adults") || "2";

  // Local form state (mirrors URL, allows editing before submit)
  const [form, setForm] = useState({ destination, checkin, checkout, adults });

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedCity, setResolvedCity] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [starFilter, setStarFilter] = useState([]);

  const doSearch = useCallback(async (dest, cin, cout, adts) => {
    if (!dest || !cin || !cout) return;

    setLoading(true);
    setError("");
    setHotels([]);
    setResolvedCity("");

    try {
      // 1. Places lookup
      const pRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(dest)}&type=locality`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const pJson = await pRes.json();
      const places = pJson.data || [];

      if (places.length === 0) {
        setError(`No location found for "${dest}". Try "Manila, Philippines" or "Paris, France".`);
        setLoading(false);
        return;
      }

      // Pick best match — prefer non-US small towns when country is hinted
      const destLower = dest.toLowerCase();
      let best = places[0];
      for (const p of places) {
        const addr = (p.formattedAddress || "").toLowerCase();
        const hint = destLower.includes(",") ? destLower.split(",").pop().trim() : "";
        if (hint && addr.includes(hint)) { best = p; break; }
      }

      setResolvedCity(best.formattedAddress || best.displayName);

      // 2. Hotels by placeId
      const hRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?placeId=${encodeURIComponent(best.placeId)}&limit=20&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const hJson = await hRes.json();
      const hotelList = hJson.data || [];

      if (hotelList.length === 0) {
        setError(`No hotels found in ${best.formattedAddress}. Try a nearby city.`);
        setLoading(false);
        return;
      }

      const hotelIds = hotelList.slice(0, 15).map(h => h.id);

      // 3. Rates with 15% margin
      const rRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelIds,
          checkin: cin,
          checkout: cout,
          occupancies: [{ adults: parseInt(adts) }],
          currency: "USD",
          guestNationality: "US",
          margin: DEFAULT_MARGIN,
        }),
      });
      const rJson = await rRes.json();
      const ratesMap = {};
      for (const r of rJson.data || []) ratesMap[r.hotelId] = r;

      // 4. Merge
      const merged = hotelList.slice(0, 15).map(hotel => {
        const rateInfo = ratesMap[hotel.id];
        const room = rateInfo?.roomTypes?.[0];
        const rate = room?.rates?.[0];
        const price = rate?.retailRate?.total?.[0]?.amount || 0;
        return { ...hotel, rate, price, hasRates: price > 0, roomName: room?.name || "" };
      });

      // Hotels with rates first
      merged.sort((a, b) => (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0));
      setHotels(merged);

    } catch (err) {
      setError(`Search error: ${err.message}`);
      console.error(err);
    }
    setLoading(false);
  }, []);

  // Trigger search whenever URL params change
  useEffect(() => {
    if (destination && checkin && checkout) {
      setForm({ destination, checkin, checkout, adults });
      doSearch(destination, checkin, checkout, adults);
    }
  }, [destination, checkin, checkout, adults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.destination) { setError("Please enter a destination."); return; }
    if (!form.checkin) { setError("Please select a check-in date."); return; }
    if (!form.checkout) { setError("Please select a check-out date."); return; }
    // Update URL — this triggers useEffect above
    setSearchParams({ destination: form.destination, checkin: form.checkin, checkout: form.checkout, adults: form.adults });
  };

  const nights = checkin && checkout
    ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000))
    : 1;

  const sorted = [...hotels].sort((a, b) => {
    if (sortBy === "price_low") return (a.price || 9999) - (b.price || 9999);
    if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.stars || 0) - (a.stars || 0);
    return 0;
  });

  const displayed = starFilter.length > 0
    ? sorted.filter(h => starFilter.includes(h.stars || 0))
    : sorted;

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 36px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
        flexWrap: "wrap", gap: "10px",
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px", color: "#c9a84c", letterSpacing: "3px" }}>RACKU</span>
          <span style={{ fontSize: "10px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", padding: "10px 18px",
          border: "1px solid rgba(201,168,76,0.2)",
        }}>
          <input
            type="text"
            placeholder="City, Country..."
            value={form.destination}
            onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "5px 0", outline: "none", width: "190px" }}
          />
          <input type="date" value={form.checkin} min={today}
            onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "5px 0", outline: "none", colorScheme: "dark" }}
          />
          <input type="date" value={form.checkout} min={form.checkin || tomorrow}
            onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "5px 0", outline: "none", colorScheme: "dark" }}
          />
          <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}
            style={{ background: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "5px 0", outline: "none" }}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#1a1a1a" }}>{n} Guest{n>1?"s":""}</option>)}
          </select>
          <button type="submit" style={{
            background: "#c9a84c", color: "#0a0a0a", border: "none",
            padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontWeight: "700",
          }}>SEARCH</button>
        </form>
      </nav>

      <div style={{ display: "flex" }}>

        {/* SIDEBAR */}
        <div style={{
          width: "210px", minWidth: "210px", padding: "24px 18px",
          borderRight: "1px solid rgba(201,168,76,0.1)", background: "rgba(255,255,255,0.01)",
          position: "sticky", top: "57px", height: "calc(100vh - 57px)", overflowY: "auto",
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "20px" }}>REFINE</div>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#d4c5a0", marginBottom: "10px" }}>SORT BY</div>
            {[
              { key: "recommended", label: "Recommended" },
              { key: "price_low", label: "Price: Low → High" },
              { key: "price_high", label: "Price: High → Low" },
              { key: "rating", label: "Star Rating" },
            ].map(opt => (
              <div key={opt.key} onClick={() => setSortBy(opt.key)}
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px", cursor: "pointer" }}>
                <div style={{ width: "11px", height: "11px", border: "1px solid #c9a84c", borderRadius: "50%", background: sortBy === opt.key ? "#c9a84c" : "transparent", flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: sortBy === opt.key ? "#c9a84c" : "#7a6e5a" }}>{opt.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#d4c5a0", marginBottom: "10px" }}>STARS</div>
            {[5,4,3,2].map(star => (
              <div key={star} onClick={() => setStarFilter(p => p.includes(star) ? p.filter(s => s!==star) : [...p,star])}
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px", cursor: "pointer" }}>
                <div style={{ width: "11px", height: "11px", border: "1px solid rgba(201,168,76,0.4)", background: starFilter.includes(star) ? "#c9a84c" : "transparent" }} />
                <span style={{ fontSize: "11px", color: starFilter.includes(star) ? "#c9a84c" : "#7a6e5a" }}>{"★".repeat(star)}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px", background: "rgba(74,144,96,0.06)", border: "1px solid rgba(74,144,96,0.2)" }}>
            <div style={{ fontSize: "10px", color: "#4a9060", letterSpacing: "2px", marginBottom: "4px" }}>MARGIN</div>
            <div style={{ fontSize: "24px", color: "#4a9060", fontWeight: "300" }}>{DEFAULT_MARGIN}%</div>
            <div style={{ fontSize: "9px", color: "#3a6040", letterSpacing: "1px" }}>PER BOOKING</div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ flex: 1, padding: "28px 36px" }}>

          {/* Header */}
          {!loading && resolvedCity && (
            <div style={{ marginBottom: "22px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: "300", margin: "0 0 4px" }}>
                Hotels in <span style={{ color: "#c9a84c", fontStyle: "italic" }}>{resolvedCity}</span>
              </h1>
              <div style={{ fontSize: "11px", color: "#7a6e5a", letterSpacing: "2px" }}>
                {displayed.length} PROPERTIES · {nights} NIGHT{nights !== 1 ? "S" : ""} · {adults} GUEST{parseInt(adults) > 1 ? "S" : ""}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!destination && !loading && (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <div style={{ fontSize: "44px", color: "#c9a84c", marginBottom: "14px" }}>✦</div>
              <div style={{ fontSize: "18px", fontWeight: "300", color: "#c9a84c", marginBottom: "10px" }}>Where Would You Like to Go?</div>
              <div style={{ fontSize: "12px", color: "#5a5040" }}>Enter a city above — e.g. "Manila, Philippines" or "Tokyo, Japan"</div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <div style={{ fontSize: "32px", color: "#c9a84c", marginBottom: "16px" }}>✦</div>
              <div style={{ fontSize: "13px", color: "#7a6e5a", letterSpacing: "4px" }}>SEARCHING {destination.toUpperCase()}...</div>
              <div style={{ fontSize: "10px", color: "#5a5040", marginTop: "8px", letterSpacing: "2px" }}>Applying {DEFAULT_MARGIN}% margin to all rates</div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding: "16px 20px", border: "1px solid rgba(255,120,120,0.3)", background: "rgba(255,100,100,0.05)", color: "#ff9090", fontSize: "13px", marginBottom: "16px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Hotel cards */}
          {!loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {displayed.map((hotel, idx) => {
                const price = hotel.price || 0;
                const commission = Math.round(price * DEFAULT_MARGIN / 100);
                const stars = Math.min(Math.round(hotel.stars || hotel.starRating || 3), 5);
                return (
                  <div key={hotel.id || idx}
                    onClick={() => navigate(`/hotel/${hotel.id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}`)}
                    style={{
                      display: "flex", border: "1px solid rgba(201,168,76,0.12)",
                      cursor: "pointer", overflow: "hidden",
                      background: "rgba(255,255,255,0.015)", transition: "all 0.2s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.background = "rgba(201,168,76,0.04)"; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                  >
                    <img
                      src={hotel.thumbnail || hotel.main_photo || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70"}
                      alt={hotel.name}
                      onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70"; }}
                      style={{ width: "210px", minWidth: "210px", height: "160px", objectFit: "cover" }}
                    />
                    <div style={{ flex: 1, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, paddingRight: "12px" }}>
                        <div style={{ fontSize: "11px", color: "#c9a84c", marginBottom: "4px" }}>{"★".repeat(stars)}</div>
                        <h3 style={{ fontSize: "16px", fontWeight: "300", margin: "0 0 5px" }}>{hotel.name}</h3>
                        <div style={{ fontSize: "11px", color: "#7a6e5a", marginBottom: "8px", letterSpacing: "1px" }}>
                          {[hotel.city, hotel.country?.toUpperCase()].filter(Boolean).join(", ")}
                        </div>
                        {hotel.rating > 0 && (
                          <span style={{ fontSize: "10px", color: "#4a9060", border: "1px solid rgba(74,144,96,0.3)", padding: "2px 7px" }}>
                            {hotel.rating}/10 · {hotel.reviewCount?.toLocaleString()} reviews
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: "right", minWidth: "140px" }}>
                        {hotel.hasRates ? (
                          <>
                            <div style={{ fontSize: "10px", color: "#7a6e5a", letterSpacing: "2px" }}>FROM</div>
                            <div style={{ fontSize: "28px", color: "#c9a84c", fontWeight: "300", lineHeight: 1.1 }}>${Math.round(price)}</div>
                            <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px" }}>/NIGHT · USD</div>
                            <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "4px" }}>+${commission} commission</div>
                          </>
                        ) : (
                          <div style={{ fontSize: "11px", color: "#5a5040", lineHeight: 1.6 }}>CHECK<br />AVAILABILITY</div>
                        )}
                        <button style={{
                          marginTop: "10px", background: "#c9a84c", color: "#0a0a0a",
                          border: "none", padding: "7px 14px", fontSize: "10px",
                          letterSpacing: "2px", cursor: "pointer", fontWeight: "700", width: "100%",
                        }}>VIEW HOTEL</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && hotels.length === 0 && destination && !error && (
            <div style={{ textAlign: "center", padding: "60px", border: "1px solid rgba(201,168,76,0.08)" }}>
              <div style={{ fontSize: "12px", color: "#5a5040", letterSpacing: "2px" }}>NO RESULTS FOUND</div>
              <div style={{ fontSize: "11px", color: "#3a3028", marginTop: "8px" }}>Try different dates or another city</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
