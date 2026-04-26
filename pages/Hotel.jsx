import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

// Strip HTML tags from description
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function Hotel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") || 2;
  const hotelName = searchParams.get("hotelName") || "";

  const nights = checkin && checkout
    ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000))
    : 1;

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch hotel details and rates in parallel
        const [hotelRes, ratesRes] = await Promise.all([
          fetch(`https://api.liteapi.travel/v3.0/data/hotel?hotelId=${id}`, {
            headers: { "X-API-Key": LITEAPI_KEY },
          }),
          (checkin && checkout)
            ? fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
                method: "POST",
                headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
                body: JSON.stringify({
                  hotelIds: [id],
                  checkin,
                  checkout,
                  occupancies: [{ adults: parseInt(adults) }],
                  currency: "USD",
                  guestNationality: "US",
                  margin: DEFAULT_MARGIN,
                }),
              })
            : Promise.resolve(null),
        ]);

        const hotelJson = await hotelRes.json();
        if (!hotelJson.data) { setError("Hotel not found."); setLoading(false); return; }
        setHotel(hotelJson.data);

        if (ratesRes) {
          const ratesJson = await ratesRes.json();
          const hotelRates = ratesJson.data?.find(r => r.hotelId === id);
          setRates(hotelRates?.roomTypes || []);
          if (hotelRates?.roomTypes?.length > 0) setSelectedRoom(hotelRates.roomTypes[0]);
        }
      } catch (err) {
        setError("Failed to load hotel. Please try again.");
        console.error(err);
      }
      setLoading(false);
    };
    fetchHotel();
  }, [id, checkin, checkout, adults]);

  if (loading) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", color: "#c9a84c", marginBottom: "20px" }}>✦</div>
        <div style={{ fontSize: "13px", color: "#7a6e5a", letterSpacing: "4px" }}>LOADING HOTEL...</div>
      </div>
    </div>
  );

  if (error || !hotel) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", color: "#ff8080", letterSpacing: "3px", marginBottom: "20px" }}>{error || "HOTEL NOT FOUND"}</div>
        <button onClick={() => navigate(-1)} style={{ background: "#c9a84c", color: "#0a0a0a", border: "none", padding: "12px 28px", cursor: "pointer", letterSpacing: "2px", fontSize: "12px" }}>← GO BACK</button>
      </div>
    </div>
  );

  // Correct field names from LiteAPI v3
  const photos = (hotel.hotelImages || []).map(img => img.url || img.urlHd).filter(Boolean);
  const mainPhoto = photos[activeImg] || hotel.main_photo || hotel.thumbnail || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80";
  const facilities = hotel.hotelFacilities || hotel.facilities || [];
  const description = stripHtml(hotel.hotelDescription || hotel.description || "");
  const starRating = hotel.starRating || hotel.stars || 0;
  const addressStr = typeof hotel.address === "string" ? hotel.address : [hotel.address?.line1, hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ");
  const cityCountry = [hotel.city, hotel.country?.toUpperCase()].filter(Boolean).join(", ");

  // Best rate from selected room
  const selectedRate = selectedRoom?.rates?.[0];
  const selectedPrice = selectedRate?.retailRate?.total?.[0]?.amount || 0;
  const selectedCommission = Math.round(selectedPrice * DEFAULT_MARGIN / 100);
  const totalPrice = Math.round(selectedPrice * nights);
  const totalCommission = Math.round(selectedCommission * nights);

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 48px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px", color: "#c9a84c", letterSpacing: "3px" }}>RACKU</span>
          <span style={{ fontSize: "10px", color: "#c9a84c", letterSpacing: "5px" }}>VOYAGE</span>
        </div>
        <button onClick={() => navigate(-1)} style={{
          background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c",
          padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer",
        }}>← RESULTS</button>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", height: "480px", overflow: "hidden" }}>
        <img
          src={mainPhoto}
          alt={hotel.name}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"; }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,10,0.2) 30%, rgba(10,10,10,1) 100%)" }} />
        <div style={{ position: "absolute", bottom: "36px", left: "48px" }}>
          {starRating > 0 && (
            <div style={{ fontSize: "13px", color: "#c9a84c", marginBottom: "8px", letterSpacing: "2px" }}>
              {"★".repeat(Math.min(Math.round(starRating), 5))}
            </div>
          )}
          <h1 style={{ fontSize: "40px", fontWeight: "300", margin: "0 0 8px", lineHeight: 1.2, maxWidth: "700px" }}>{hotel.name}</h1>
          <div style={{ fontSize: "12px", color: "#b0a080", letterSpacing: "2px" }}>
            {addressStr && <span>{addressStr} · </span>}
            <span>{cityCountry}</span>
          </div>
          {hotel.rating > 0 && (
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ background: "#4a9060", color: "#fff", padding: "3px 10px", fontSize: "13px" }}>{hotel.rating}/10</span>
              <span style={{ fontSize: "11px", color: "#7a6e5a" }}>{hotel.reviewCount?.toLocaleString()} reviews</span>
            </div>
          )}
        </div>
      </div>

      {/* PHOTO STRIP */}
      {photos.length > 1 && (
        <div style={{ display: "flex", gap: "6px", padding: "12px 48px", overflowX: "auto", background: "#080808" }}>
          {photos.slice(0, 10).map((url, i) => (
            <img key={i} src={url} alt="" onClick={() => setActiveImg(i)}
              onError={e => { e.target.style.display = "none"; }}
              style={{
                width: "90px", height: "62px", objectFit: "cover", cursor: "pointer", flexShrink: 0,
                border: activeImg === i ? "2px solid #c9a84c" : "2px solid transparent",
                opacity: activeImg === i ? 1 : 0.55, transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", padding: "40px 48px 60px", gap: "48px" }}>

        {/* LEFT */}
        <div style={{ flex: 1 }}>

          {/* Description */}
          {description && (
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "14px" }}>ABOUT</div>
              <p style={{ fontSize: "14px", lineHeight: 1.9, color: "#b0a080", margin: 0 }}>
                {description.slice(0, 600)}{description.length > 600 ? "..." : ""}
              </p>
            </div>
          )}

          {/* Facilities */}
          {facilities.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "14px" }}>AMENITIES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {facilities.slice(0, 16).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "4px", height: "4px", background: "#c9a84c", borderRadius: "50%", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "#7a6e5a" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room list */}
          {rates.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "14px" }}>SELECT A ROOM</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {rates.map((room, idx) => {
                  const rate = room.rates?.[0];
                  const price = rate?.retailRate?.total?.[0]?.amount || 0;
                  const commission = Math.round(price * DEFAULT_MARGIN / 100);
                  const isSelected = selectedRoom === room;
                  const refundable = rate?.cancellationPolicies?.cancelPolicyInfos?.length > 0;
                  return (
                    <div key={idx} onClick={() => setSelectedRoom(room)} style={{
                      padding: "20px 22px", border: isSelected ? "1px solid #c9a84c" : "1px solid rgba(201,168,76,0.15)",
                      cursor: "pointer", background: isSelected ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.01)",
                      transition: "all 0.25s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "14px", marginBottom: "5px" }}>{room.name || `Room Type ${idx + 1}`}</div>
                          <div style={{ fontSize: "11px", color: "#7a6e5a", letterSpacing: "1px" }}>
                            {rate?.boardName || "Room Only"}
                            {refundable ? " · ✓ Free Cancellation" : " · Non-refundable"}
                          </div>
                          {rate?.paymentTypes && (
                            <div style={{ fontSize: "10px", color: "#5a5040", marginTop: "4px" }}>
                              {rate.paymentTypes.includes("NUITEE_PAY") ? "Pay now" : "Pay at hotel"}
                            </div>
                          )}
                        </div>
                        {price > 0 && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "26px", color: "#c9a84c", fontWeight: "300", lineHeight: 1 }}>${Math.round(price)}</div>
                            <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px" }}>/ NIGHT</div>
                            <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "3px" }}>+${commission} commission</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rates.length === 0 && !loading && (
            <div style={{ padding: "24px", border: "1px solid rgba(201,168,76,0.15)", color: "#7a6e5a", fontSize: "13px", lineHeight: 1.8 }}>
              No rates available for the selected dates. Try adjusting your check-in or check-out.
            </div>
          )}
        </div>

        {/* RIGHT: BOOKING SIDEBAR */}
        <div style={{ width: "300px", minWidth: "300px" }}>
          <div style={{ border: "1px solid rgba(201,168,76,0.3)", padding: "28px", background: "rgba(201,168,76,0.02)", position: "sticky", top: "64px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "20px" }}>YOUR BOOKING</div>

            {[
              { label: "HOTEL", value: hotel.name },
              { label: "CHECK IN", value: checkin || "—" },
              { label: "CHECK OUT", value: checkout || "—" },
              { label: "NIGHTS", value: nights },
              { label: "GUESTS", value: `${adults} Adult${adults > 1 ? "s" : ""}` },
              { label: "ROOM", value: selectedRoom?.name || "—" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "10px", letterSpacing: "2px", color: "#5a5040" }}>{item.label}</span>
                <span style={{ fontSize: "11px", color: "#d4c5a0", textAlign: "right", maxWidth: "160px" }}>{item.value}</span>
              </div>
            ))}

            {selectedPrice > 0 && (
              <>
                <div style={{ marginTop: "16px", padding: "14px 0", borderTop: "1px solid rgba(201,168,76,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#7a6e5a" }}>${Math.round(selectedPrice)} × {nights} night{nights > 1 ? "s" : ""}</span>
                    <span style={{ fontSize: "14px", color: "#c9a84c" }}>${totalPrice}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "#4a9060" }}>Your commission</span>
                    <span style={{ fontSize: "14px", color: "#4a9060" }}>+${totalCommission}</span>
                  </div>
                </div>

                <div style={{ padding: "12px", background: "rgba(74,144,96,0.06)", border: "1px solid rgba(74,144,96,0.2)", margin: "12px 0 20px" }}>
                  <div style={{ fontSize: "10px", color: "#4a9060", letterSpacing: "2px", marginBottom: "4px" }}>MARGIN APPLIED</div>
                  <div style={{ fontSize: "22px", color: "#4a9060", fontWeight: "300" }}>{DEFAULT_MARGIN}%</div>
                </div>

                <button
                  onClick={() => navigate(`/book/${id}?rateId=${encodeURIComponent(selectedRate?.rateId || "")}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}`)}
                  style={{
                    width: "100%", background: "#c9a84c", color: "#0a0a0a",
                    border: "none", padding: "16px", fontSize: "12px", letterSpacing: "3px",
                    cursor: "pointer", fontWeight: "700",
                  }}
                >
                  BOOK NOW · ${totalPrice}
                </button>
              </>
            )}

            {rates.length === 0 && (
              <div style={{ marginTop: "16px", fontSize: "12px", color: "#5a5040", textAlign: "center", lineHeight: 1.8 }}>
                Select dates on the search page to see available rates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
