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
  const [cityData, setCityData] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("recommended");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // City to country code mapping
  const cityMap = {
    paris: { countryCode: "FR", cityName: "Paris" },
    dubai: { countryCode: "AE", cityName: "Dubai" },
    "new york": { countryCode: "US", cityName: "New York" },
    tokyo: { countryCode: "JP", cityName: "Tokyo" },
    maldives: { countryCode: "MV", cityName: "Malé" },
    santorini: { countryCode: "GR", cityName: "Santorini" },
    london: { countryCode: "GB", cityName: "London" },
    barcelona: { countryCode: "ES", cityName: "Barcelona" },
    rome: { countryCode: "IT", cityName: "Rome" },
    bali: { countryCode: "ID", cityName: "Bali" },
  };

  const searchHotels = async (form = searchForm) => {
    if (!form.destination || !form.checkin || !form.checkout) return;
    setLoading(true);
    setError(null);
    setHotels([]);

    try {
      const destLower = form.destination.toLowerCase();
      const cityInfo = cityMap[destLower] || { countryCode: "US", cityName: form.destination };

      // Step 1: Get hotels by city/country
      const hotelsRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?countryCode=${cityInfo.countryCode}&limit=20&language=en`,
        { headers: { "X-API-Key": LITEAPI_KEY } }
      );
      const hotelsData = await hotelsRes.json();

      if (!hotelsData.data || hotelsData.data.length === 0) {
        setError("No hotels found for this destination. Try another city.");
        setLoading(false);
        return;
      }

      const hotelIds = hotelsData.data.slice(0, 10).map(h => h.id);

      // Step 2: Get rates for those hotels
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

      // Merge hotel info with rates
      const merged = hotelsData.data.slice(0, 10).map(hotel => {
        const rateInfo = ratesData.data?.find(r => r.hotelId === hotel.id);
        const lowestRate = rateInfo?.roomTypes?.[0]?.rates?.[0];
        return {
          ...hotel,
          rate: lowestRate,
          hasRates: !!lowestRate,
        };
      }).filter(h => h.hasRates);

      setHotels(merged.length > 0 ? merged : hotelsData.data.slice(0, 10).map(h => ({ ...h, hasRates: false })));
    } catch (err) {
      setError("Something went wrong fetching hotels. Please try again.");
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

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px", fontWeight: "300" }}>RACKU</span>
          <span style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>

        <form onSubmit={handleSearch} style={{
          display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", padding: "12px 24px",
          border: "1px solid rgba(201,168,76,0.2)",
        }}>
          <input
            type="text" placeholder="Destination"
            value={searchForm.destination}
            onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })}
            style={{
              background: "transparent", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)",
              color: "#f0ead6", fontSize: "13px", padding: "6px 0", outline: "none", width: "140px",
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

      <div style={{ display: "flex", gap: "0" }}>

        {/* SIDEBAR FILTERS */}
        <div style={{
          width: "260px", minWidth: "260px", padding: "40px 28px",
          borderRight: "1px solid rgba(201,168,76,0.1)", background: "rgba(255,255,255,0.01)",
          position: "sticky", top: "73px", height: "calc(100vh - 73px)", overflowY: "auto",
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "32px" }}>FILTER & SORT</div>

          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#d4c5a0", marginBottom: "16px" }}>SORT BY</div>
            {["recommended", "price_low", "price_high", "rating"].map(opt => (
              <div key={opt} onClick={() => setSortBy(opt)} style={{
                display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer",
              }}>
                <div style={{
                  width: "14px", height: "14px", border: "1px solid #c9a84c",
                  borderRadius: "50%", background: sortBy === opt ? "#c9a84c" : "transparent",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: "12px", color: sortBy === opt ? "#c9a84c" : "#7a6e5a", letterSpacing: "1px" }}>
                  {opt === "recommended" ? "Recommended" : opt === "price_low" ? "Price: Low to High" : opt === "price_high" ? "Price: High to Low" : "Star Rating"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#d4c5a0", marginBottom: "16px" }}>STAR RATING</div>
            {[5, 4, 3].map(star => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}>
                <div style={{ width: "14px", height: "14px", border: "1px solid rgba(201,168,76,0.4)" }} />
                <span style={{ fontSize: "12px", color: "#7a6e5a" }}>{"★".repeat(star)} & above</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>COMMISSION RATE</div>
            <div style={{ fontSize: "28px", color: "#c9a84c", fontWeight: "300" }}>{DEFAULT_MARGIN}%</div>
            <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px" }}>MARGIN ON ALL BOOKINGS</div>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ flex: 1, padding: "40px 48px" }}>
          {searchForm.destination && (
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "32px", fontWeight: "300", margin: "0 0 8px" }}>
                Hotels in <span style={{ color: "#c9a84c", fontStyle: "italic" }}>{searchForm.destination}</span>
              </h1>
              <div style={{ fontSize: "12px", color: "#7a6e5a", letterSpacing: "2px" }}>
                {hotels.length > 0 ? `${hotels.length} PROPERTIES FOUND` : ""}
                {nights > 0 ? ` · ${nights} NIGHT${nights > 1 ? "S" : ""}` : ""}
                {searchForm.adults ? ` · ${searchForm.adults} GUEST${searchForm.adults > 1 ? "S" : ""}` : ""}
              </div>
            </div>
          )}

          {!searchForm.destination && !loading && (
            <div style={{ textAlign: "center", padding: "120px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✦</div>
              <div style={{ fontSize: "22px", fontWeight: "300", color: "#c9a84c", marginBottom: "12px" }}>Where Would You Like to Go?</div>
              <div style={{ fontSize: "14px", color: "#5a5040" }}>Enter a destination above to discover luxury hotels</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "120px 20px" }}>
              <div style={{ fontSize: "40px", color: "#c9a84c", marginBottom: "20px", animation: "spin 1.5s linear infinite" }}>✦</div>
              <div style={{ fontSize: "16px", color: "#7a6e5a", letterSpacing: "3px" }}>SEARCHING LUXURY PROPERTIES...</div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ padding: "24px", border: "1px solid rgba(255,100,100,0.3)", background: "rgba(255,100,100,0.05)", color: "#ff8080", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {hotels.map((hotel, idx) => (
              <div
                key={hotel.id || idx}
                onClick={() => navigate(`/hotel/${hotel.id}?checkin=${searchForm.checkin}&checkout=${searchForm.checkout}&adults=${searchForm.adults}`)}
                style={{
                  display: "flex", gap: "0", border: "1px solid rgba(201,168,76,0.15)",
                  cursor: "pointer", transition: "border-color 0.3s", overflow: "hidden",
                  background: "rgba(255,255,255,0.02)",
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"}
                onMouseOut={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"}
              >
                <img
                  src={hotel.thumbnail || hotel.main_photo || `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=70`}
                  alt={hotel.name}
                  style={{ width: "260px", minWidth: "260px", height: "200px", objectFit: "cover" }}
                />
                <div style={{ flex: 1, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                      {"★".repeat(hotel.starRating || hotel.stars || 5)}
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: "300", margin: "0 0 8px", letterSpacing: "0.5px" }}>
                      {hotel.name}
                    </h3>
                    <div style={{ fontSize: "12px", color: "#7a6e5a", marginBottom: "16px", letterSpacing: "1px" }}>
                      {hotel.address?.city || hotel.city || searchForm.destination}
                      {hotel.address?.country ? `, ${hotel.address.country}` : ""}
                    </div>
                    {hotel.facilities && hotel.facilities.slice(0, 3).map(f => (
                      <span key={f} style={{
                        fontSize: "10px", letterSpacing: "1px", color: "#5a5040",
                        border: "1px solid rgba(255,255,255,0.08)", padding: "4px 10px",
                        marginRight: "8px", display: "inline-block",
                      }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ textAlign: "right", minWidth: "160px" }}>
                    {hotel.rate ? (
                      <>
                        <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#7a6e5a", marginBottom: "4px" }}>FROM</div>
                        <div style={{ fontSize: "32px", color: "#c9a84c", fontWeight: "300" }}>
                          ${Math.round(hotel.rate.retailRate?.total?.[0]?.amount || hotel.rate.offerRetailRate?.amount || 0)}
                        </div>
                        <div style={{ fontSize: "11px", color: "#5a5040", letterSpacing: "1px" }}>PER NIGHT · INCL. TAXES</div>
                        <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "4px", letterSpacing: "1px" }}>
                          ✓ {DEFAULT_MARGIN}% COMMISSION APPLIED
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: "13px", color: "#7a6e5a", letterSpacing: "1px" }}>RATES ON REQUEST</div>
                        <div style={{ fontSize: "10px", color: "#5a5040", marginTop: "4px" }}>Select dates to see pricing</div>
                      </>
                    )}
                    <button style={{
                      marginTop: "16px", background: "#c9a84c", color: "#0a0a0a",
                      border: "none", padding: "10px 20px", fontSize: "11px",
                      letterSpacing: "2px", cursor: "pointer", fontWeight: "600", width: "100%",
                    }}>VIEW HOTEL</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
