import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

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

    // Default dates if missing
    const ciDate = cin || today;
    const coDate = cout || tomorrow;

    setLoading(true);
    setError("");
    setHotels([]);
    setResolvedCity("");

    try {
      // Step 1: Places lookup
      const pRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(dest)}&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const pJson = await pRes.json();
      const places = pJson.data || [];

      if (places.length === 0) {
        setError(`No location found for "${dest}". Try "Manila, Philippines" or "Paris, France".`);
        setLoading(false);
        return;
      }

      // Pick best match — prefer one that matches hinted country if given
      const destLower = dest.toLowerCase();
      let best = places[0];
      if (destLower.includes(",")) {
        const hint = destLower.split(",").pop().trim();
        const match = places.find(p => (p.formattedAddress || "").toLowerCase().includes(hint));
        if (match) best = match;
      }

      const resolvedName = best.formattedAddress || best.displayName || dest;
      setResolvedCity(resolvedName);

      // Step 2: Hotels by placeId
      const hRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?placeId=${encodeURIComponent(best.placeId)}&limit=20&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const hJson = await hRes.json();
      let hotelList = hJson.data || [];

      // Fallback: try countryCode + cityName if placeId returned nothing
      if (hotelList.length === 0 && (best.countryCode || best.country_code)) {
        const cc = best.countryCode || best.country_code;
        const cityName = best.displayName || dest.split(",")[0].trim();
        const fbRes = await fetch(
          `https://api.liteapi.travel/v3.0/data/hotels?countryCode=${cc}&cityName=${encodeURIComponent(cityName)}&limit=20&language=en`,
          { headers: { "X-API-Key": LITEAPI_KEY } }
        );
        const fbJson = await fbRes.json();
        hotelList = fbJson.data || [];
      }

      if (hotelList.length === 0) {
        setError(`No hotels found in ${resolvedName}. Try a nearby major city.`);
        setLoading(false);
        return;
      }

      const hotelIds = hotelList.slice(0, 20).map(h => h.id).filter(Boolean);

      // Step 3: Rates
      const rRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelIds,
          checkin: ciDate,
          checkout: coDate,
          occupancies: [{ adults: parseInt(adts) || 2 }],
          currency: "USD",
          guestNationality: "US",
          margin: DEFAULT_MARGIN,
        }),
      });
      const rJson = await rRes.json();
      const ratesMap = {};
      for (const r of rJson.data || []) ratesMap[r.hotelId] = r;

      // Step 4: Merge
      const merged = hotelList.slice(0, 20).map(hotel => {
        const rateInfo = ratesMap[hotel.id];
        const room = rateInfo?.roomTypes?.[0];
        const rate = room?.rates?.[0];
        const price = rate?.retailRate?.total?.[0]?.amount || 0;
        const commission = price > 0 ? Math.round(price * DEFAULT_MARGIN / 100) : 0;
        return { ...hotel, rate, price, commission, hasRates: price > 0, roomName: room?.name || "" };
      });

      merged.sort((a, b) => (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0));
      setHotels(merged);

      if (merged.filter(h => h.hasRates).length === 0) {
        setError("Hotels found but no availability for these dates. Try different dates.");
      }

    } catch (err) {
      setError(`Search error: ${err.message}`);
      console.error(err);
    }
    setLoading(false);
  }, []);

  // Trigger search whenever URL params change
  useEffect(() => {
    if (destination) {
      setForm({ destination, checkin, checkout, adults });
      doSearch(destination, checkin, checkout, adults);
    }
  }, [destination, checkin, checkout, adults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.destination.trim()) { setError("Please enter a destination."); return; }
    setSearchParams({
      destination: form.destination,
      checkin: form.checkin || today,
      checkout: form.checkout || tomorrow,
      adults: form.adults,
    });
  };

  const nights = checkin && checkout
    ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000))
    : 1;

  const sorted = [...hotels].sort((a, b) => {
    if (sortBy === "price_low") return (a.price || 99999) - (b.price || 99999);
    if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.stars || 0) - (a.stars || 0);
    return (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0);
  });

  const displayed = starFilter.length > 0
    ? sorted.filter(h => starFilter.includes(Math.round(h.stars || 0)))
    : sorted;

  const toggleStar = (s) => setStarFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV / SEARCH BAR */}
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
          display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", padding: "10px 18px",
          border: "1px solid rgba(201,168,76,0.2)",
        }}>
          <input
            type="text"
            placeholder="City, Country..."
            value={form.destination}
            onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "5px 0", outline: "none", width: "180px", fontFamily: "Georgia, serif" }}
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
            style={{ background: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "5px 0", outline: "none", cursor: "pointer" }}>
            {[1,2,3,4,5,6].map(n => <option key={n} value={n} style={{ background: "#1a1a1a" }}>{n} Guest{n>1?"s":""}</option>)}
          </select>
          <button type="submit" style={{
            background: "#c9a84c", color: "#0a0a0a", border: "none",
            padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontWeight: "700",
          }}>SEARCH</button>
        </form>

        <button onClick={() => navigate("/dashboard")} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.25)", color: "#c9a84c", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer" }}>DASHBOARD</button>
      </nav>

      <div style={{ display: "flex" }}>

        {/* SIDEBAR */}
        <div style={{
          width: "200px", minWidth: "200px", padding: "24px 18px",
          borderRight: "1px solid rgba(201,168,76,0.1)",
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
            {[5,4,3,2].map(s => (
              <div key={s} onClick={() => toggleStar(s)}
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px", cursor: "pointer" }}>
                <div style={{ width: "11px", height: "11px", border: "1px solid #c9a84c", background: starFilter.includes(s) ? "#c9a84c" : "transparent", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: starFilter.includes(s) ? "#c9a84c" : "#7a6e5a" }}>{"★".repeat(s)}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px", border: "1px solid rgba(74,144,96,0.3)", background: "rgba(74,144,96,0.04)", marginTop: "24px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4a9060", marginBottom: "4px" }}>MARGIN</div>
            <div style={{ fontSize: "28px", color: "#4a9060", fontWeight: 300 }}>{DEFAULT_MARGIN}%</div>
            <div style={{ fontSize: "9px", color: "#3a6040", letterSpacing: "1px" }}>PER BOOKING</div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ flex: 1, padding: "28px 36px" }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "32px", color: "#c9a84c", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>✦</div>
              <div style={{ fontSize: "12px", color: "#7a6e5a", letterSpacing: "4px" }}>SEARCHING HOTELS...</div>
              {destination && <div style={{ fontSize: "11px", color: "#5a5040", marginTop: "8px" }}>{destination}</div>}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: "13px", color: "#ff9090", marginBottom: "20px", letterSpacing: "1px" }}>⚠ {error}</div>
              <button onClick={() => navigate("/")} style={{ background: "#c9a84c", color: "#0a0a0a", border: "none", padding: "10px 24px", cursor: "pointer", fontSize: "11px", letterSpacing: "2px", fontWeight: "700" }}>← NEW SEARCH</button>
            </div>
          )}

          {/* No destination yet */}
          {!loading && !error && !destination && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#5a5040" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>✦</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER A DESTINATION TO BEGIN</div>
            </div>
          )}

          {/* Results */}
          {!loading && displayed.length > 0 && (
            <>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 300, margin: "0 0 4px" }}>
                  Hotels in <span style={{ color: "#c9a84c" }}>{resolvedCity || destination}</span>
                </h2>
                <div style={{ fontSize: "11px", color: "#7a6e5a", letterSpacing: "2px" }}>
                  {displayed.filter(h => h.hasRates).length} AVAILABLE · {nights} NIGHT{nights > 1 ? "S" : ""} · {adults} GUEST{parseInt(adults) > 1 ? "S" : ""}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {displayed.map(hotel => {
                  const commission = hotel.price > 0 ? Math.round(hotel.price * DEFAULT_MARGIN / 100) : 0;
                  return (
                    <div key={hotel.id} style={{
                      display: "flex", border: "1px solid rgba(201,168,76,0.12)",
                      overflow: "hidden", transition: "border-color 0.2s",
                      opacity: hotel.hasRates ? 1 : 0.5,
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)"}
                    >
                      {/* PHOTO */}
                      <div style={{ width: "200px", minWidth: "200px", overflow: "hidden" }}>
                        <img
                          src={hotel.thumbnail || hotel.main_photo || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"}
                          alt={hotel.name}
                          onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80"; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "160px" }}
                        />
                      </div>

                      {/* INFO */}
                      <div style={{ flex: 1, padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          {hotel.stars > 0 && <div style={{ fontSize: "12px", color: "#c9a84c", marginBottom: "5px" }}>{"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}</div>}
                          <h3 style={{ fontSize: "16px", fontWeight: 400, margin: "0 0 5px" }}>{hotel.name}</h3>
                          <div style={{ fontSize: "11px", color: "#7a6e5a", marginBottom: "10px", letterSpacing: "1px" }}>
                            {[hotel.city, hotel.country].filter(Boolean).join(", ")}
                          </div>
                          {hotel.rating > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ background: "#4a9060", color: "#fff", padding: "2px 8px", fontSize: "11px" }}>{hotel.rating}/10</span>
                              {hotel.reviewCount > 0 && <span style={{ fontSize: "10px", color: "#5a5040" }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
                            </div>
                          )}
                          {hotel.roomName && <div style={{ fontSize: "11px", color: "#5a5040", marginTop: "8px" }}>{hotel.roomName}</div>}
                        </div>

                        <div style={{ textAlign: "right", minWidth: "150px" }}>
                          {hotel.hasRates ? (
                            <>
                              <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px", marginBottom: "3px" }}>FROM</div>
                              <div style={{ fontSize: "30px", color: "#c9a84c", fontWeight: 300, lineHeight: 1 }}>${Math.round(hotel.price)}</div>
                              <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px", marginBottom: "4px" }}>/NIGHT · USD</div>
                              <div style={{ fontSize: "11px", color: "#4a9060", marginBottom: "14px" }}>+${commission} commission</div>
                              <button
                                onClick={() => navigate(`/hotel/${hotel.id}?checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}`)}
                                style={{ background: "#c9a84c", color: "#0a0a0a", border: "none", padding: "10px 20px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontWeight: 700 }}>
                                VIEW HOTEL
                              </button>
                            </>
                          ) : (
                            <div style={{ fontSize: "11px", color: "#5a5040", letterSpacing: "1px", marginTop: "20px" }}>NO AVAILABILITY</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
