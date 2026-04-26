import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

// Pick the best place match — prefer the one with most population/relevance
// When user types "Manila, Philippines" or "Manila" we want Metro Manila PH not Manila AR
function pickBestPlace(places, query) {
  if (!places || places.length === 0) return null;
  const q = query.toLowerCase();
  // If query includes a country hint, try to match formattedAddress
  const scored = places.map(p => {
    let score = 0;
    const addr = (p.formattedAddress || "").toLowerCase();
    const name = (p.displayName || "").toLowerCase();
    // Exact city name match
    if (name === q.split(",")[0].trim()) score += 10;
    // Country match if specified in query
    const parts = q.split(",").map(s => s.trim());
    if (parts.length > 1) {
      const countryHint = parts[parts.length - 1];
      if (addr.includes(countryHint)) score += 20;
    }
    // Prefer non-US results if user typed country name
    if (addr.includes("usa") || addr.includes(", al") || addr.includes(", ar") || addr.includes(", wv") || addr.includes(", ut")) score -= 5;
    return { ...p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedPlace, setResolvedPlace] = useState(null);
  const [searchForm, setSearchForm] = useState({
    destination: searchParams.get("destination") || "",
    checkin: searchParams.get("checkin") || "",
    checkout: searchParams.get("checkout") || "",
    adults: searchParams.get("adults") || 2,
  });
  const [sortBy, setSortBy] = useState("recommended");
  const [starFilter, setStarFilter] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const searchHotels = async (form = searchForm) => {
    if (!form.destination || !form.checkin || !form.checkout) {
      setError("Please fill in destination and dates.");
      return;
    }
    setLoading(true);
    setError(null);
    setHotels([]);
    setResolvedPlace(null);

    try {
      // Step 1: Resolve destination → placeId
      const placesRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(form.destination)}&type=locality`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );

      if (!placesRes.ok) {
        setError(`Places API error: ${placesRes.status}. Check API key.`);
        setLoading(false);
        return;
      }

      const placesData = await placesRes.json();
      const place = pickBestPlace(placesData.data, form.destination);

      if (!place) {
        setError(`Could not find "${form.destination}". Try adding the country, e.g. "Manila, Philippines".`);
        setLoading(false);
        return;
      }

      setResolvedPlace(place);

      // Step 2: Hotels by placeId
      const hotelsRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?placeId=${encodeURIComponent(place.placeId)}&limit=20&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );

      if (!hotelsRes.ok) {
        setError(`Hotels API error: ${hotelsRes.status}`);
        setLoading(false);
        return;
      }

      const hotelsData = await hotelsRes.json();

      if (!hotelsData.data || hotelsData.data.length === 0) {
        setError(`No hotels found in "${place.formattedAddress}". Try a nearby city.`);
        setLoading(false);
        return;
      }

      const hotelList = hotelsData.data.slice(0, 15);
      const hotelIds = hotelList.map(h => h.id);

      // Step 3: Live rates with 15% margin
      const ratesRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
        method: "POST",
        headers: {
          "X-API-Key": LITEAPI_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelIds,
          checkin: form.checkin,
          checkout: form.checkout,
          occupancies: [{ adults: parseInt(form.adults) }],
          currency: "USD",
          guestNationality: "US",
          margin: DEFAULT_MARGIN,
        }),
      });

      const ratesData = await ratesRes.json();

      // Step 4: Merge + sort
      let merged = hotelList.map(hotel => {
        const rateInfo = ratesData.data?.find(r => r.hotelId === hotel.id);
        const lowestRoom = rateInfo?.roomTypes?.[0];
        const lowestRate = lowestRoom?.rates?.[0];
        const price = lowestRate?.retailRate?.total?.[0]?.amount || 0;
        return {
          ...hotel,
          roomName: lowestRoom?.name || "",
          rate: lowestRate || null,
          price,
          hasRates: !!lowestRate && price > 0,
        };
      });

      // Put hotels with rates first
      merged.sort((a, b) => (b.hasRates ? 1 : 0) - (a.hasRates ? 1 : 0));

      setHotels(merged);
    } catch (err) {
      console.error("Search error:", err);
      setError(`Search failed: ${err.message}. Please try again.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchForm.destination && searchForm.checkin && searchForm.checkout) {
      searchHotels();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    searchHotels();
  };

  const nights = searchForm.checkin && searchForm.checkout
    ? Math.ceil((new Date(searchForm.checkout) - new Date(searchForm.checkin)) / 86400000)
    : 1;

  const sortedHotels = [...hotels].sort((a, b) => {
    if (sortBy === "price_low") return (a.price || 9999) - (b.price || 9999);
    if (sortBy === "price_high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating") return (b.stars || b.starRating || 0) - (a.stars || a.starRating || 0);
    return 0;
  });

  const displayedHotels = starFilter.length > 0
    ? sortedHotels.filter(h => starFilter.includes(h.stars || h.starRating || 0))
    : sortedHotels;

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 40px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
        flexWrap: "wrap", gap: "12px",
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px", fontWeight: "300" }}>RACKU</span>
          <span style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>

        <form onSubmit={handleSearch} style={{
          display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", padding: "10px 20px",
          border: "1px solid rgba(201,168,76,0.2)",
        }}>
          <input
            type="text"
            placeholder="City, Country (e.g. Manila, Philippines)"
            value={searchForm.destination}
            onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })}
            style={{
              background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)",
              color: "#f0ead6", fontSize: "13px", padding: "6px 0", outline: "none", width: "220px",
            }}
          />
          <input type="date" value={searchForm.checkin} min={today}
            onChange={e => setSearchForm({ ...searchForm, checkin: e.target.value })}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "6px 0", outline: "none", colorScheme: "dark" }}
          />
          <input type="date" value={searchForm.checkout} min={tomorrow}
            onChange={e => setSearchForm({ ...searchForm, checkout: e.target.value })}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "6px 0", outline: "none", colorScheme: "dark" }}
          />
          <select value={searchForm.adults} onChange={e => setSearchForm({ ...searchForm, adults: e.target.value })}
            style={{ background: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6", fontSize: "13px", padding: "6px 0", outline: "none" }}
          >
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?"s":""}</option>)}
          </select>
          <button type="submit" style={{
            background: "#c9a84c", color: "#0a0a0a", border: "none",
            padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontWeight: "600",
          }}>SEARCH</button>
        </form>
      </nav>

      <div style={{ display: "flex" }}>

        {/* SIDEBAR */}
        <div style={{
          width: "220px", minWidth: "220px", padding: "28px 20px",
          borderRight: "1px solid rgba(201,168,76,0.1)",
          background: "rgba(255,255,255,0.01)",
          position: "sticky", top: "65px", height: "calc(100vh - 65px)", overflowY: "auto",
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "24px" }}>REFINE</div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#d4c5a0", marginBottom: "12px" }}>SORT BY</div>
            {[
              { key: "recommended", label: "Recommended" },
              { key: "price_low", label: "Price: Low → High" },
              { key: "price_high", label: "Price: High → Low" },
              { key: "rating", label: "Star Rating" },
            ].map(opt => (
              <div key={opt.key} onClick={() => setSortBy(opt.key)} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <div style={{ width: "12px", height: "12px", border: "1px solid #c9a84c", borderRadius: "50%", background: sortBy === opt.key ? "#c9a84c" : "transparent", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: sortBy === opt.key ? "#c9a84c" : "#7a6e5a" }}>{opt.label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#d4c5a0", marginBottom: "12px" }}>STARS</div>
            {[5, 4, 3, 2].map(star => (
              <div key={star} onClick={() => setStarFilter(prev => prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star])}
                style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <div style={{ width: "12px", height: "12px", border: "1px solid rgba(201,168,76,0.4)", background: starFilter.includes(star) ? "#c9a84c" : "transparent" }} />
                <span style={{ fontSize: "12px", color: starFilter.includes(star) ? "#c9a84c" : "#7a6e5a" }}>{"★".repeat(star)}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px", background: "rgba(74,144,96,0.06)", border: "1px solid rgba(74,144,96,0.2)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a9060", marginBottom: "4px" }}>YOUR MARGIN</div>
            <div style={{ fontSize: "26px", color: "#4a9060", fontWeight: "300" }}>{DEFAULT_MARGIN}%</div>
            <div style={{ fontSize: "10px", color: "#3a6040", letterSpacing: "1px" }}>PER BOOKING</div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ flex: 1, padding: "32px 40px" }}>

          {/* Resolved place indicator */}
          {resolvedPlace && !loading && (
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "300", margin: "0 0 4px" }}>
                Hotels in <span style={{ color: "#c9a84c", fontStyle: "italic" }}>{resolvedPlace.formattedAddress}</span>
              </h1>
              <div style={{ fontSize: "11px", color: "#7a6e5a", letterSpacing: "2px" }}>
                {displayedHotels.length} PROPERTIES
                {nights > 0 ? ` · ${nights} NIGHT${nights > 1 ? "S" : ""}` : ""}
                {searchForm.adults ? ` · ${searchForm.adults} GUEST${searchForm.adults > 1 ? "S" : ""}` : ""}
              </div>
            </div>
          )}

          {!searchForm.destination && !loading && (
            <div style={{ textAlign: "center", padding: "120px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#c9a84c" }}>✦</div>
              <div style={{ fontSize: "20px", fontWeight: "300", color: "#c9a84c", marginBottom: "12px" }}>Where Would You Like to Go?</div>
              <div style={{ fontSize: "13px", color: "#5a5040" }}>Enter any city in the world — tip: include country for best results</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <div style={{ fontSize: "36px", color: "#c9a84c", marginBottom: "20px" }}>✦</div>
              <div style={{ fontSize: "14px", color: "#7a6e5a", letterSpacing: "4px" }}>
                SEARCHING {searchForm.destination.toUpperCase()}...
              </div>
              <div style={{ fontSize: "11px", color: "#5a5040", marginTop: "10px", letterSpacing: "2px" }}>
                Fetching live rates with {DEFAULT_MARGIN}% margin
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "20px 24px", border: "1px solid rgba(255,120,120,0.3)", background: "rgba(255,100,100,0.05)", color: "#ff8080", fontSize: "13px", marginBottom: "20px", lineHeight: 1.7 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedHotels.map((hotel, idx) => {
              const price = hotel.price || 0;
              const commission = Math.round(price * DEFAULT_MARGIN / 100);
              const stars = hotel.stars || hotel.starRating || 3;
              return (
                <div
                  key={hotel.id || idx}
                  onClick={() => navigate(`/hotel/${hotel.id}?checkin=${searchForm.checkin}&checkout=${searchForm.checkout}&adults=${searchForm.adults}&hotelName=${encodeURIComponent(hotel.name)}`)}
                  style={{
                    display: "flex", border: "1px solid rgba(201,168,76,0.12)",
                    cursor: "pointer", transition: "all 0.25s",
                    background: "rgba(255,255,255,0.015)", overflow: "hidden",
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.background = "rgba(201,168,76,0.03)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                >
                  <img
                    src={hotel.thumbnail || hotel.main_photo || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70"}
                    alt={hotel.name}
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70"; }}
                    style={{ width: "220px", minWidth: "220px", height: "170px", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, paddingRight: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#c9a84c", marginBottom: "5px" }}>
                        {"★".repeat(Math.min(Math.round(stars), 5))}
                      </div>
                      <h3 style={{ fontSize: "17px", fontWeight: "300", margin: "0 0 5px" }}>{hotel.name}</h3>
                      <div style={{ fontSize: "11px", color: "#7a6e5a", marginBottom: "10px", letterSpacing: "1px" }}>
                        {[hotel.city, hotel.country?.toUpperCase()].filter(Boolean).join(", ") ||
                         [hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ") ||
                         resolvedPlace?.formattedAddress}
                      </div>
                      {hotel.rating && (
                        <span style={{ fontSize: "11px", color: "#4a9060", border: "1px solid rgba(74,144,96,0.3)", padding: "3px 8px", marginRight: "8px" }}>
                          {hotel.rating}/10 · {hotel.reviewCount?.toLocaleString()} reviews
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: "right", minWidth: "150px" }}>
                      {hotel.hasRates && price > 0 ? (
                        <>
                          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#7a6e5a", marginBottom: "2px" }}>FROM</div>
                          <div style={{ fontSize: "28px", color: "#c9a84c", fontWeight: "300", lineHeight: 1 }}>
                            ${Math.round(price)}
                          </div>
                          <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px", marginTop: "3px" }}>/ NIGHT · USD</div>
                          <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "5px" }}>
                            +${commission} your commission
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#5a5040", letterSpacing: "1px" }}>
                          SELECT DATES<br />FOR RATES
                        </div>
                      )}
                      <button style={{
                        marginTop: "12px", background: "#c9a84c", color: "#0a0a0a",
                        border: "none", padding: "8px 16px", fontSize: "10px",
                        letterSpacing: "2px", cursor: "pointer", fontWeight: "600", width: "100%",
                      }}>VIEW HOTEL</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && hotels.length === 0 && searchForm.destination && !error && (
            <div style={{ textAlign: "center", padding: "80px", border: "1px solid rgba(201,168,76,0.08)" }}>
              <div style={{ fontSize: "13px", color: "#5a5040", letterSpacing: "2px" }}>NO RESULTS FOUND</div>
              <div style={{ fontSize: "12px", color: "#3a3028", marginTop: "8px" }}>Try adjusting your dates or destination</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
