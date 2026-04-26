import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchForm, setSearchForm] = useState({
    destination: searchParams.get("destination") || "",
    checkin: searchParams.get("checkin") || "",
    checkout: searchParams.get("checkout") || "",
    adults: searchParams.get("adults") || 2,
  });
  const [sortBy, setSortBy] = useState("recommended");
  const [starFilter, setStarFilter] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const searchHotels = async (form = searchForm) => {
    if (!form.destination || !form.checkin || !form.checkout) return;
    setLoading(true);
    setError(null);
    setHotels([]);

    try {
      // Step 1: Resolve destination to a placeId using /data/places
      const placesRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(form.destination)}&type=locality`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const placesData = await placesRes.json();
      const place = placesData.data?.[0];

      if (!place) {
        setError(`Could not find "${form.destination}". Try a different city name.`);
        setLoading(false);
        return;
      }

      const placeId = place.id;

      // Step 2: Get hotels by placeId
      const hotelsRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?placeId=${encodeURIComponent(placeId)}&limit=20&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const hotelsData = await hotelsRes.json();

      if (!hotelsData.data || hotelsData.data.length === 0) {
        setError(`No hotels found in "${form.destination}". Try another destination.`);
        setLoading(false);
        return;
      }

      const hotelIds = hotelsData.data.slice(0, 15).map(h => h.id);
      setResultCount(hotelsData.data.length);

      // Step 3: Get live rates with 15% margin
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

      // Step 4: Merge hotel info with rates
      const merged = hotelsData.data.slice(0, 15).map(hotel => {
        const rateInfo = ratesData.data?.find(r => r.hotelId === hotel.id);
        const lowestRoom = rateInfo?.roomTypes?.[0];
        const lowestRate = lowestRoom?.rates?.[0];
        return {
          ...hotel,
          roomName: lowestRoom?.name,
          rate: lowestRate,
          hasRates: !!lowestRate,
        };
      });

      // Sort
      let sorted = [...merged];
      if (sortBy === "price_low") sorted.sort((a, b) => (a.rate?.retailRate?.total?.[0]?.amount || 9999) - (b.rate?.retailRate?.total?.[0]?.amount || 9999));
      if (sortBy === "price_high") sorted.sort((a, b) => (b.rate?.retailRate?.total?.[0]?.amount || 0) - (a.rate?.retailRate?.total?.[0]?.amount || 0));
      if (sortBy === "rating") sorted.sort((a, b) => (b.starRating || 0) - (a.starRating || 0));

      setHotels(sorted);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
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

  const displayedHotels = starFilter.length > 0
    ? hotels.filter(h => starFilter.includes(h.starRating || 0))
    : hotels;

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
        flexWrap: "wrap", gap: "12px",
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px", fontWeight: "300" }}>RACKU</span>
          <span style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>

        <form onSubmit={handleSearch} style={{
          display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", padding: "12px 24px",
          border: "1px solid rgba(201,168,76,0.2)",
        }}>
          <input
            type="text" placeholder="City, Country..."
            value={searchForm.destination}
            onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })}
            style={{
              background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)",
              color: "#f0ead6", fontSize: "13px", padding: "6px 0", outline: "none", width: "160px",
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
          width: "240px", minWidth: "240px", padding: "32px 24px",
          borderRight: "1px solid rgba(201,168,76,0.1)",
          background: "rgba(255,255,255,0.01)",
          position: "sticky", top: "73px", height: "calc(100vh - 73px)", overflowY: "auto",
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "28px" }}>FILTER & SORT</div>

          {/* Sort */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#d4c5a0", marginBottom: "14px" }}>SORT BY</div>
            {[
              { key: "recommended", label: "Recommended" },
              { key: "price_low", label: "Price: Low → High" },
              { key: "price_high", label: "Price: High → Low" },
              { key: "rating", label: "Star Rating" },
            ].map(opt => (
              <div key={opt.key} onClick={() => { setSortBy(opt.key); searchHotels(); }} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <div style={{ width: "12px", height: "12px", border: "1px solid #c9a84c", borderRadius: "50%", background: sortBy === opt.key ? "#c9a84c" : "transparent", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: sortBy === opt.key ? "#c9a84c" : "#7a6e5a" }}>{opt.label}</span>
              </div>
            ))}
          </div>

          {/* Star filter */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#d4c5a0", marginBottom: "14px" }}>STAR RATING</div>
            {[5, 4, 3, 2].map(star => (
              <div key={star} onClick={() => setStarFilter(prev => prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star])}
                style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <div style={{ width: "12px", height: "12px", border: "1px solid rgba(201,168,76,0.4)", background: starFilter.includes(star) ? "#c9a84c" : "transparent" }} />
                <span style={{ fontSize: "12px", color: starFilter.includes(star) ? "#c9a84c" : "#7a6e5a" }}>{"★".repeat(star)} & up</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px", background: "rgba(74,144,96,0.06)", border: "1px solid rgba(74,144,96,0.2)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a9060", marginBottom: "6px" }}>YOUR MARGIN</div>
            <div style={{ fontSize: "28px", color: "#4a9060", fontWeight: "300" }}>{DEFAULT_MARGIN}%</div>
            <div style={{ fontSize: "10px", color: "#3a6040", letterSpacing: "1px" }}>ON EVERY BOOKING</div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ flex: 1, padding: "36px 48px" }}>
          {searchForm.destination && !loading && hotels.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "300", margin: "0 0 6px" }}>
                Hotels in <span style={{ color: "#c9a84c", fontStyle: "italic" }}>{searchForm.destination}</span>
              </h1>
              <div style={{ fontSize: "11px", color: "#7a6e5a", letterSpacing: "2px" }}>
                {displayedHotels.length} PROPERTIES SHOWN
                {nights > 0 ? ` · ${nights} NIGHT${nights > 1 ? "S" : ""}` : ""}
                {searchForm.adults ? ` · ${searchForm.adults} GUEST${searchForm.adults > 1 ? "S" : ""}` : ""}
              </div>
            </div>
          )}

          {!searchForm.destination && !loading && (
            <div style={{ textAlign: "center", padding: "120px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px", color: "#c9a84c" }}>✦</div>
              <div style={{ fontSize: "20px", fontWeight: "300", color: "#c9a84c", marginBottom: "12px" }}>Where Would You Like to Go?</div>
              <div style={{ fontSize: "13px", color: "#5a5040" }}>Enter any city in the world to discover hotels</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "120px 20px" }}>
              <div style={{ fontSize: "40px", color: "#c9a84c", marginBottom: "20px" }}>✦</div>
              <div style={{ fontSize: "14px", color: "#7a6e5a", letterSpacing: "4px" }}>SEARCHING {searchForm.destination.toUpperCase()}...</div>
              <div style={{ fontSize: "11px", color: "#5a5040", marginTop: "12px", letterSpacing: "2px" }}>Finding the best rates with {DEFAULT_MARGIN}% margin applied</div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
          )}

          {error && (
            <div style={{ padding: "24px", border: "1px solid rgba(255,100,100,0.3)", background: "rgba(255,100,100,0.05)", color: "#ff8080", fontSize: "14px", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {displayedHotels.map((hotel, idx) => {
              const price = hotel.rate?.retailRate?.total?.[0]?.amount || hotel.rate?.offerRetailRate?.amount || 0;
              const commission = Math.round(price * DEFAULT_MARGIN / 100);
              return (
                <div
                  key={hotel.id || idx}
                  onClick={() => navigate(`/hotel/${hotel.id}?checkin=${searchForm.checkin}&checkout=${searchForm.checkout}&adults=${searchForm.adults}&hotelName=${encodeURIComponent(hotel.name)}`)}
                  style={{
                    display: "flex", border: "1px solid rgba(201,168,76,0.12)",
                    cursor: "pointer", transition: "border-color 0.3s, background 0.3s",
                    background: "rgba(255,255,255,0.015)", overflow: "hidden",
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.45)"; e.currentTarget.style.background = "rgba(201,168,76,0.03)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                >
                  <img
                    src={hotel.thumbnail || hotel.main_photo || `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70`}
                    alt={hotel.name}
                    onError={e => e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70"}
                    style={{ width: "240px", minWidth: "240px", height: "180px", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", color: "#c9a84c", marginBottom: "6px", letterSpacing: "1px" }}>
                        {"★".repeat(Math.min(hotel.starRating || 3, 5))}
                      </div>
                      <h3 style={{ fontSize: "18px", fontWeight: "300", margin: "0 0 6px", letterSpacing: "0.3px" }}>{hotel.name}</h3>
                      <div style={{ fontSize: "12px", color: "#7a6e5a", marginBottom: "12px", letterSpacing: "1px" }}>
                        {[hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ") || searchForm.destination}
                      </div>
                      {hotel.facilities?.slice(0, 4).map(f => (
                        <span key={f} style={{
                          fontSize: "10px", color: "#5a5040", border: "1px solid rgba(255,255,255,0.07)",
                          padding: "3px 8px", marginRight: "6px", display: "inline-block", marginBottom: "4px",
                        }}>{f}</span>
                      ))}
                    </div>
                    <div style={{ textAlign: "right", minWidth: "160px", paddingLeft: "20px" }}>
                      {hotel.hasRates && price > 0 ? (
                        <>
                          <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#7a6e5a", marginBottom: "4px" }}>FROM</div>
                          <div style={{ fontSize: "30px", color: "#c9a84c", fontWeight: "300", lineHeight: 1 }}>${Math.round(price)}</div>
                          <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px", marginTop: "4px" }}>PER NIGHT · USD</div>
                          <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "6px", letterSpacing: "1px" }}>
                            ✓ +${commission} commission
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: "12px", color: "#5a5040" }}>CHECK AVAILABILITY</div>
                      )}
                      <button style={{
                        marginTop: "14px", background: "#c9a84c", color: "#0a0a0a",
                        border: "none", padding: "9px 18px", fontSize: "10px",
                        letterSpacing: "2px", cursor: "pointer", fontWeight: "600", width: "100%",
                      }}>VIEW HOTEL</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && hotels.length === 0 && searchForm.destination && !error && (
            <div style={{ textAlign: "center", padding: "80px", border: "1px solid rgba(201,168,76,0.1)" }}>
              <div style={{ fontSize: "13px", color: "#5a5040", letterSpacing: "2px" }}>NO RESULTS FOUND</div>
              <div style={{ fontSize: "12px", color: "#3a3028", marginTop: "8px" }}>Try adjusting your dates or destination</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
