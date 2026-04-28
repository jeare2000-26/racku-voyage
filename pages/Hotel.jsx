import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;
const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function Hotel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read hotelId from query param (not useParams)
  const id = searchParams.get("hotelId");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") || "2";

  const [hotel, setHotel] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  const nights = checkin && checkout
    ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000))
    : 1;

  useEffect(() => {
    if (!id) { setError("No hotel ID provided."); setLoading(false); return; }

    const load = async () => {
      setLoading(true); setError("");
      try {
        const hRes = await fetch(
          `https://api.liteapi.travel/v3.0/data/hotel?hotelId=${id}`,
          { headers: { "X-API-Key": LITEAPI_KEY } }
        );
        const hJson = await hRes.json();
        if (!hJson.data) { setError("Hotel not found."); setLoading(false); return; }
        setHotel(hJson.data);

        if (checkin && checkout) {
          const rRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
            method: "POST",
            headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              hotelIds: [id],
              checkin, checkout,
              occupancies: [{ adults: parseInt(adults) || 2 }],
              currency: "USD", guestNationality: "US", margin: DEFAULT_MARGIN,
            }),
          });
          const rJson = await rRes.json();
          const rooms = rJson.data?.find(r => r.hotelId === id)?.roomTypes || [];
          setRates(rooms);
          if (rooms.length) setSelectedRoom(rooms[0]);
        }
      } catch (err) {
        setError("Failed to load hotel details.");
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [id, checkin, checkout, adults]);

  if (loading) return (
    <div style={{ background: "#F0EDE8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ fontSize: "11px", color: "#CBCBCB", letterSpacing: "5px", textTransform: "uppercase" }}>Loading hotel...</div>
    </div>
  );

  if (error || !hotel) return (
    <div style={{ background: "#F0EDE8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", color: "#4D2D1B", marginBottom: "20px" }}>{error || "Hotel not found"}</div>
        <button onClick={() => navigate(-1)} style={{ background: "#1E1612", color: "#F0EDE8", border: "none", padding: "10px 24px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>← Go Back</button>
      </div>
    </div>
  );

  const photos = (hotel.hotelImages || []).map(img => img.url || img.urlHd).filter(Boolean);
  const mainPhoto = photos[activeImg] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80";
  const facilities = hotel.hotelFacilities || [];
  const description = stripHtml(hotel.hotelDescription || hotel.description || "");
  const addressStr = typeof hotel.address === "string"
    ? hotel.address
    : [hotel.address?.line1, hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ");

  const selectedRate = selectedRoom?.rates?.[0];
  const selectedPrice = selectedRate?.retailRate?.total?.[0]?.amount || 0;
  const totalPrice = Math.round(selectedPrice * nights);
  const totalCommission = Math.round(totalPrice * DEFAULT_MARGIN / 100);

  const bookUrl = `/book?hotelId=${id}&rateId=${encodeURIComponent(selectedRate?.rateId || "")}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotel.name)}&roomName=${encodeURIComponent(selectedRoom?.name || "")}&price=${totalPrice}&commission=${totalCommission}`;

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
            <div key={item} style={{ fontSize: "12px", color: "#46424A", marginBottom: "10px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = "#1E1612"}
              onMouseLeave={e => e.currentTarget.style.color = "#46424A"}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: "#D8D3CC", margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: "#867878", marginBottom: "9px" }}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} style={{
          background: "transparent", border: "1px solid #CBCBCB", color: "#46424A",
          padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%",
        }}>← Back</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1 }}>

        {/* HERO IMAGE */}
        <div style={{ position: "relative", height: "480px", overflow: "hidden" }}>
          <img src={mainPhoto} alt={hotel.name}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(240,237,232,0) 40%, rgba(240,237,232,1) 100%)" }} />
          <button onClick={() => navigate(-1)} style={{
            position: "absolute", top: "24px", right: "32px",
            background: "rgba(240,237,232,0.9)", border: "1px solid #D8D3CC", color: "#1E1612",
            padding: "8px 16px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase",
          }}>← Results</button>
        </div>

        {/* PHOTO STRIP */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: "4px", padding: "8px 48px", overflowX: "auto", background: "#F0EDE8" }}>
            {photos.slice(0, 8).map((url, i) => (
              <img key={i} src={url} alt="" onClick={() => setActiveImg(i)}
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: "80px", height: "52px", objectFit: "cover", cursor: "pointer", flexShrink: 0, border: `1px solid ${activeImg === i ? "#1E1612" : "transparent"}`, opacity: activeImg === i ? 1 : 0.5, transition: "all 0.2s" }}
              />
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div style={{ display: "flex", padding: "40px 48px 60px", gap: "48px" }}>

          {/* LEFT — Details */}
          <div style={{ flex: 1 }}>
            {(hotel.stars || 0) > 0 && (
              <div style={{ fontSize: "11px", color: "#867878", marginBottom: "10px", letterSpacing: "2px" }}>
                {"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}
              </div>
            )}
            <h1 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              {hotel.name}
            </h1>
            <div style={{ fontSize: "12px", color: "#867878", marginBottom: "28px" }}>{addressStr}</div>

            {hotel.rating > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
                <span style={{ background: "#1E1612", color: "#F0EDE8", padding: "3px 10px", fontSize: "12px" }}>{hotel.rating}/10</span>
                {hotel.reviewCount > 0 && <span style={{ fontSize: "11px", color: "#CBCBCB" }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
              </div>
            )}

            {description && (
              <div style={{ marginBottom: "40px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "14px" }}>About</div>
                <p style={{ fontSize: "14px", lineHeight: 1.9, color: "#46424A", margin: 0, maxWidth: "600px" }}>
                  {description.slice(0, 600)}{description.length > 600 ? "..." : ""}
                </p>
              </div>
            )}

            {facilities.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "14px" }}>Amenities</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 24px" }}>
                  {facilities.slice(0, 16).map((f, i) => (
                    <div key={i} style={{ fontSize: "12px", color: "#46424A", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#CBCBCB" }}>—</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROOM SELECTION */}
            {rates.length > 0 && (
              <div>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "14px" }}>Select Room</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#D8D3CC" }}>
                  {rates.map((room, idx) => {
                    const rate = room.rates?.[0];
                    const price = rate?.retailRate?.total?.[0]?.amount || 0;
                    const commission = Math.round(price * DEFAULT_MARGIN / 100);
                    const isSelected = selectedRoom === room;
                    return (
                      <div key={idx} onClick={() => setSelectedRoom(room)} style={{
                        padding: "18px 20px", background: isSelected ? "#FAFAF8" : "#F0EDE8",
                        cursor: "pointer", transition: "background 0.2s",
                        borderLeft: isSelected ? "3px solid #1E1612" : "3px solid transparent",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: "14px", marginBottom: "4px" }}>{room.name || `Room ${idx + 1}`}</div>
                            <div style={{ fontSize: "11px", color: "#867878" }}>{rate?.boardName || "Room Only"}</div>
                          </div>
                          {price > 0 && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "24px", color: "#1E1612", fontWeight: 300, lineHeight: 1 }}>${Math.round(price)}</div>
                              <div style={{ fontSize: "9px", color: "#CBCBCB", letterSpacing: "1px", textTransform: "uppercase" }}>/Night</div>
                              <div style={{ fontSize: "10px", color: "#4D2D1B", marginTop: "2px" }}>+${commission} commission</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Booking summary */}
          <div style={{ width: "270px", minWidth: "270px" }}>
            <div style={{ border: "1px solid #D8D3CC", padding: "24px", background: "#FAFAF8", position: "sticky", top: "20px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#CBCBCB", textTransform: "uppercase", marginBottom: "18px" }}>Your Booking</div>

              {[
                ["Hotel", hotel.name],
                ["Check In", checkin || "—"],
                ["Check Out", checkout || "—"],
                ["Nights", nights],
                ["Guests", `${adults} Adult${parseInt(adults) > 1 ? "s" : ""}`],
                ["Room", selectedRoom?.name || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #EDEAE6" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "2px", color: "#CBCBCB", textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontSize: "11px", color: "#46424A", textAlign: "right", maxWidth: "150px" }}>{String(v)}</span>
                </div>
              ))}

              {selectedPrice > 0 && (
                <>
                  <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #D8D3CC" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: "#867878" }}>${Math.round(selectedPrice)} × {nights} night{nights > 1 ? "s" : ""}</span>
                      <span style={{ fontSize: "13px", color: "#1E1612" }}>${totalPrice}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", color: "#4D2D1B" }}>Commission ({DEFAULT_MARGIN}%)</span>
                      <span style={{ fontSize: "12px", color: "#4D2D1B" }}>+${totalCommission}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(bookUrl)}
                    style={{ width: "100%", background: "#1E1612", color: "#F0EDE8", border: "none", padding: "14px", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", marginTop: "18px" }}>
                    Book Now · ${totalPrice}
                  </button>
                </>
              )}

              {rates.length === 0 && !loading && (
                <div style={{ marginTop: "14px", fontSize: "11px", color: "#CBCBCB", textAlign: "center", lineHeight: 1.8 }}>
                  No availability for these dates.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
