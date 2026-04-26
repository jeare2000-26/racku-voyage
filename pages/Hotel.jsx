import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

export default function Hotel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") || 2;

  const nights = checkin && checkout
    ? Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)
    : 1;

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const [hotelRes, ratesRes] = await Promise.all([
          fetch(`https://api.liteapi.travel/v3.0/data/hotel?hotelId=${id}`, {
            headers: { "X-API-Key": LITEAPI_KEY }
          }),
          checkin && checkout ? fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
            method: "POST",
            headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              hotelIds: [id],
              checkin, checkout,
              occupancies: [{ adults: parseInt(adults) }],
              currency: "USD",
              guestNationality: "US",
              margin: DEFAULT_MARGIN,
            })
          }) : Promise.resolve(null)
        ]);

        const hotelData = await hotelRes.json();
        setHotel(hotelData.data);

        if (ratesRes) {
          const ratesData = await ratesRes.json();
          const hotelRates = ratesData.data?.find(r => r.hotelId === id);
          setRates(hotelRates?.roomTypes || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchHotel();
  }, [id]);

  if (loading) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", color: "#c9a84c", marginBottom: "20px" }}>✦</div>
        <div style={{ fontSize: "14px", color: "#7a6e5a", letterSpacing: "4px" }}>LOADING HOTEL DETAILS...</div>
      </div>
    </div>
  );

  if (!hotel) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "14px", color: "#7a6e5a", letterSpacing: "3px" }}>HOTEL NOT FOUND</div>
        <button onClick={() => navigate(-1)} style={{ marginTop: "20px", background: "#c9a84c", color: "#0a0a0a", border: "none", padding: "12px 28px", cursor: "pointer", letterSpacing: "2px", fontSize: "12px" }}>GO BACK</button>
      </div>
    </div>
  );

  const photos = hotel.images || [];
  const mainPhoto = photos[activeImg] || hotel.thumbnail || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80";

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px", borderBottom: "1px solid rgba(201,168,76,0.15)",
        background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px" }}>RACKU</span>
          <span style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "5px", marginLeft: "8px" }}>VOYAGE</span>
        </div>
        <button onClick={() => navigate(-1)} style={{
          background: "transparent", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c",
          padding: "8px 20px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer",
        }}>← BACK TO RESULTS</button>
      </nav>

      {/* HERO IMAGE */}
      <div style={{ position: "relative", height: "520px", overflow: "hidden" }}>
        <img
          src={typeof mainPhoto === "string" ? mainPhoto : mainPhoto?.url || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"}
          alt={hotel.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(10,10,10,1) 100%)" }} />
        <div style={{ position: "absolute", bottom: "40px", left: "60px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "10px" }}>
            {"★".repeat(hotel.starRating || 5)}
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: "300", margin: 0, letterSpacing: "1px" }}>{hotel.name}</h1>
          <div style={{ fontSize: "13px", color: "#b0a080", marginTop: "8px", letterSpacing: "2px" }}>
            {hotel.address?.line1 && `${hotel.address.line1}, `}
            {hotel.address?.city && `${hotel.address.city}, `}
            {hotel.address?.country}
          </div>
        </div>
      </div>

      {/* THUMBNAIL STRIP */}
      {photos.length > 1 && (
        <div style={{ display: "flex", gap: "8px", padding: "16px 60px", overflowX: "auto", background: "#080808" }}>
          {photos.slice(0, 8).map((photo, i) => (
            <img
              key={i}
              src={typeof photo === "string" ? photo : photo?.url}
              alt=""
              onClick={() => setActiveImg(i)}
              style={{
                width: "100px", height: "70px", objectFit: "cover", cursor: "pointer", flexShrink: 0,
                border: activeImg === i ? "2px solid #c9a84c" : "2px solid transparent",
                opacity: activeImg === i ? 1 : 0.6, transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "0", padding: "0 60px 60px", marginTop: "40px" }}>

        {/* LEFT: DETAILS */}
        <div style={{ flex: 1, paddingRight: "60px" }}>
          {hotel.description && (
            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "16px" }}>ABOUT THE PROPERTY</div>
              <p style={{ fontSize: "15px", lineHeight: 1.9, color: "#b0a080", margin: 0 }}>
                {typeof hotel.description === "string" ? hotel.description : hotel.description?.en || "Experience unparalleled luxury at this exceptional property."}
              </p>
            </div>
          )}

          {hotel.facilities && hotel.facilities.length > 0 && (
            <div style={{ marginBottom: "48px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "20px" }}>AMENITIES & FACILITIES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {hotel.facilities.slice(0, 12).map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "4px", height: "4px", background: "#c9a84c", borderRadius: "50%" }} />
                    <span style={{ fontSize: "13px", color: "#7a6e5a", letterSpacing: "1px" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVAILABLE ROOMS */}
          {rates.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "20px" }}>AVAILABLE ROOMS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {rates.map((room, idx) => {
                  const rate = room.rates?.[0];
                  const price = rate?.retailRate?.total?.[0]?.amount || rate?.offerRetailRate?.amount || 0;
                  const commission = Math.round(price * DEFAULT_MARGIN / 100);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedRoom(room)}
                      style={{
                        padding: "24px", border: selectedRoom === room ? "1px solid #c9a84c" : "1px solid rgba(201,168,76,0.2)",
                        cursor: "pointer", background: selectedRoom === room ? "rgba(201,168,76,0.05)" : "transparent",
                        transition: "all 0.3s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: "15px", marginBottom: "6px", fontWeight: "400" }}>{room.name || `Room Type ${idx + 1}`}</div>
                          <div style={{ fontSize: "11px", color: "#7a6e5a", letterSpacing: "1px" }}>
                            {rate?.boardName || "Room Only"} · {rate?.cancellationPolicies?.[0]?.type === "FREE" ? "✓ Free Cancellation" : "Non-refundable"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "28px", color: "#c9a84c", fontWeight: "300" }}>${Math.round(price)}</div>
                          <div style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px" }}>PER NIGHT</div>
                          <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "4px" }}>+${commission} commission</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rates.length === 0 && checkin && checkout && !loading && (
            <div style={{ padding: "24px", border: "1px solid rgba(201,168,76,0.15)", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: "#7a6e5a" }}>No rates available for selected dates. Try different dates.</div>
            </div>
          )}
        </div>

        {/* RIGHT: BOOKING PANEL */}
        <div style={{ width: "340px", minWidth: "340px" }}>
          <div style={{
            position: "sticky", top: "80px",
            border: "1px solid rgba(201,168,76,0.3)",
            background: "rgba(201,168,76,0.03)",
            padding: "32px",
          }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "24px", textAlign: "center" }}>
              YOUR RESERVATION
            </div>

            <div style={{ marginBottom: "20px" }}>
              {[
                { label: "CHECK IN", value: checkin || "Select date" },
                { label: "CHECK OUT", value: checkout || "Select date" },
                { label: "GUESTS", value: `${adults} Adult${adults > 1 ? "s" : ""}` },
                { label: "DURATION", value: `${nights} Night${nights > 1 ? "s" : ""}` },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: "10px", letterSpacing: "2px", color: "#5a5040" }}>{item.label}</span>
                  <span style={{ fontSize: "13px", color: "#d4c5a0" }}>{item.value}</span>
                </div>
              ))}
            </div>

            {selectedRoom && (() => {
              const rate = selectedRoom.rates?.[0];
              const pricePerNight = rate?.retailRate?.total?.[0]?.amount || rate?.offerRetailRate?.amount || 0;
              const totalPrice = pricePerNight * nights;
              const totalCommission = Math.round(totalPrice * DEFAULT_MARGIN / 100);
              return (
                <div style={{ marginBottom: "24px", padding: "16px", background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#7a6e5a", marginBottom: "8px" }}>{selectedRoom.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", color: "#7a6e5a" }}>${Math.round(pricePerNight)} × {nights} nights</span>
                    <span style={{ fontSize: "12px", color: "#d4c5a0" }}>${Math.round(totalPrice)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
                    <span style={{ fontSize: "13px", color: "#c9a84c", letterSpacing: "1px" }}>TOTAL</span>
                    <span style={{ fontSize: "20px", color: "#c9a84c", fontWeight: "300" }}>${Math.round(totalPrice)}</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#4a9060", marginTop: "8px", textAlign: "right" }}>
                    Est. commission: ${totalCommission}
                  </div>
                </div>
              );
            })()}

            <button
              disabled={!selectedRoom}
              onClick={() => navigate(`/book/${id}?rateId=${selectedRoom?.rates?.[0]?.id}&checkin=${checkin}&checkout=${checkout}&adults=${adults}`)}
              style={{
                width: "100%", background: selectedRoom ? "#c9a84c" : "rgba(201,168,76,0.3)",
                color: selectedRoom ? "#0a0a0a" : "#5a5040",
                border: "none", padding: "16px", fontSize: "12px", letterSpacing: "3px",
                cursor: selectedRoom ? "pointer" : "not-allowed", fontWeight: "600",
                transition: "all 0.3s",
              }}
            >
              {selectedRoom ? "PROCEED TO BOOK" : "SELECT A ROOM"}
            </button>

            {!selectedRoom && (
              <div style={{ fontSize: "11px", color: "#5a5040", textAlign: "center", marginTop: "12px", letterSpacing: "1px" }}>
                Choose a room from the left to continue
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {["🔒 Secure Booking", "✓ Best Price", "24/7 Support"].map(b => (
                <span key={b} style={{ fontSize: "10px", color: "#5a5040", letterSpacing: "1px" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
