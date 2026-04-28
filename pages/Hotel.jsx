import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;
const NAV_ITEMS = ["Rooms", "Gallery", "Conference Halls", "About", "Specials", "News", "Contact"];
const RESTAURANT_ITEMS = ["Restaurant", "Lobby Bar", "Basement Bar", "Rooftop Bar"];

const T = {
  bg: "#0B0F1A", bgCard: "#111827", bgCardHover: "#161D2E", sidebar: "#0D1120",
  border: "#1E2A3D", gold: "#C9A84C", goldLight: "#E0C06A", goldMuted: "#8A6E32",
  text: "#F0EAD6", textMuted: "#8A99B8", textFaint: "#4A5568", white: "#FFFFFF",
};

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function Hotel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
        const hRes = await fetch(`https://api.liteapi.travel/v3.0/data/hotel?hotelId=${id}`, { headers: { "X-API-Key": LITEAPI_KEY } });
        const hJson = await hRes.json();
        if (!hJson.data) { setError("Hotel not found."); setLoading(false); return; }
        setHotel(hJson.data);
        if (checkin && checkout) {
          const rRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
            method: "POST",
            headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ hotelIds: [id], checkin, checkout, occupancies: [{ adults: parseInt(adults) || 2 }], currency: "USD", guestNationality: "US", margin: DEFAULT_MARGIN }),
          });
          const rooms = (await rRes.json()).data?.find(r => r.hotelId === id)?.roomTypes || [];
          setRates(rooms);
          if (rooms.length) setSelectedRoom(rooms[0]);
        }
      } catch (err) { setError("Failed to load hotel details."); }
      setLoading(false);
    };
    load();
  }, [id, checkin, checkout, adults]);

  if (loading) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "32px", height: "32px", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ fontSize: "11px", color: T.textFaint, letterSpacing: "5px", textTransform: "uppercase" }}>Loading hotel...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !hotel) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", color: "#E57373", marginBottom: "20px" }}>{error || "Hotel not found"}</div>
        <button onClick={() => navigate(-1)} style={{ background: T.gold, color: T.bg, border: "none", padding: "10px 24px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600 }}>← Go Back</button>
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
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", backgroundColor: T.bg, color: T.text, minHeight: "100vh", display: "flex" }}>

      {/* SIDEBAR */}
      <aside style={{ width: "180px", minWidth: "180px", padding: "28px 20px", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, background: T.sidebar, overflowY: "auto" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.gold, textTransform: "uppercase", marginBottom: "36px", cursor: "pointer" }} onClick={() => navigate("/")}>RACKU VOYAGE</div>
          {NAV_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "12px", color: T.textMuted, marginBottom: "10px", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.gold}
              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
              onClick={() => navigate("/")}>{item}</div>
          ))}
          <div style={{ height: "1px", background: T.border, margin: "18px 0" }} />
          {RESTAURANT_ITEMS.map(item => (
            <div key={item} style={{ fontSize: "11px", color: T.textFaint, marginBottom: "9px" }}>{item}</div>
          ))}
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1px solid ${T.goldMuted}`, color: T.gold, padding: "7px 12px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", width: "100%" }}>← Back</button>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: "180px", flex: 1 }}>

        {/* HERO */}
        <div style={{ position: "relative", height: "480px", overflow: "hidden" }}>
          <img src={mainPhoto} alt={hotel.name}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }}
          />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${T.bg} 100%)` }} />
          <button onClick={() => navigate(-1)} style={{
            position: "absolute", top: "24px", right: "32px",
            background: "rgba(11,15,26,0.8)", border: `1px solid ${T.goldMuted}`, color: T.gold,
            padding: "8px 16px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase",
          }}>← Results</button>
        </div>

        {/* PHOTO STRIP */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: "4px", padding: "8px 48px", overflowX: "auto", background: T.bg }}>
            {photos.slice(0, 8).map((url, i) => (
              <img key={i} src={url} alt="" onClick={() => setActiveImg(i)}
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: "80px", height: "52px", objectFit: "cover", cursor: "pointer", flexShrink: 0, border: `1px solid ${activeImg === i ? T.gold : "transparent"}`, opacity: activeImg === i ? 1 : 0.45, transition: "all 0.2s", filter: "brightness(0.85)" }}
              />
            ))}
          </div>
        )}

        {/* BODY */}
        <div style={{ display: "flex", padding: "40px 48px 60px", gap: "48px" }}>

          {/* LEFT */}
          <div style={{ flex: 1 }}>
            {(hotel.stars || 0) > 0 && (
              <div style={{ fontSize: "13px", color: T.gold, marginBottom: "10px", letterSpacing: "2px" }}>
                {"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}
              </div>
            )}
            <h1 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300, margin: "0 0 8px", letterSpacing: "-0.5px", color: T.text }}>{hotel.name}</h1>
            <div style={{ fontSize: "12px", color: T.textMuted, marginBottom: "28px" }}>{addressStr}</div>

            {hotel.rating > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
                <span style={{ background: T.gold, color: T.bg, padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{hotel.rating}/10</span>
                {hotel.reviewCount > 0 && <span style={{ fontSize: "11px", color: T.textFaint }}>{Number(hotel.reviewCount).toLocaleString()} reviews</span>}
              </div>
            )}

            {description && (
              <div style={{ marginBottom: "40px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.textFaint, textTransform: "uppercase", marginBottom: "14px" }}>About</div>
                <p style={{ fontSize: "14px", lineHeight: 1.9, color: T.textMuted, margin: 0, maxWidth: "600px" }}>
                  {description.slice(0, 600)}{description.length > 600 ? "..." : ""}
                </p>
              </div>
            )}

            {facilities.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.textFaint, textTransform: "uppercase", marginBottom: "14px" }}>Amenities</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 24px" }}>
                  {facilities.slice(0, 16).map((f, i) => (
                    <div key={i} style={{ fontSize: "12px", color: T.textMuted, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: T.goldMuted }}>◆</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROOMS */}
            {rates.length > 0 && (
              <div>
                <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.textFaint, textTransform: "uppercase", marginBottom: "14px" }}>Select Room</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {rates.map((room, idx) => {
                    const rate = room.rates?.[0];
                    const price = rate?.retailRate?.total?.[0]?.amount || 0;
                    const commission = Math.round(price * DEFAULT_MARGIN / 100);
                    const isSelected = selectedRoom === room;
                    return (
                      <div key={idx} onClick={() => setSelectedRoom(room)} style={{
                        padding: "18px 20px", background: isSelected ? T.bgCardHover : T.bgCard,
                        cursor: "pointer", transition: "background 0.2s",
                        borderLeft: `3px solid ${isSelected ? T.gold : "transparent"}`,
                        border: `1px solid ${isSelected ? T.gold : T.border}`,
                        marginBottom: "2px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: "14px", marginBottom: "4px", color: T.text }}>{room.name || `Room ${idx + 1}`}</div>
                            <div style={{ fontSize: "11px", color: T.textFaint }}>{rate?.boardName || "Room Only"}</div>
                          </div>
                          {price > 0 && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "24px", color: T.text, fontWeight: 300, lineHeight: 1 }}>${Math.round(price)}</div>
                              <div style={{ fontSize: "9px", color: T.textFaint, letterSpacing: "1px", textTransform: "uppercase" }}>/Night</div>
                              <div style={{ fontSize: "10px", color: T.gold, marginTop: "2px" }}>+${commission} commission</div>
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

          {/* RIGHT — booking summary */}
          <div style={{ width: "270px", minWidth: "270px" }}>
            <div style={{ border: `1px solid ${T.border}`, padding: "24px", background: T.bgCard, position: "sticky", top: "20px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase", marginBottom: "18px" }}>Your Booking</div>
              {[
                ["Hotel", hotel.name],
                ["Check In", checkin || "—"],
                ["Check Out", checkout || "—"],
                ["Nights", nights],
                ["Guests", `${adults} Adult${parseInt(adults) > 1 ? "s" : ""}`],
                ["Room", selectedRoom?.name || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.textFaint, textTransform: "uppercase" }}>{k}</span>
                  <span style={{ fontSize: "11px", color: T.textMuted, textAlign: "right", maxWidth: "150px" }}>{String(v)}</span>
                </div>
              ))}
              {selectedPrice > 0 && (
                <>
                  <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: T.textMuted }}>${Math.round(selectedPrice)} × {nights} night{nights > 1 ? "s" : ""}</span>
                      <span style={{ fontSize: "13px", color: T.text }}>${totalPrice}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", color: T.gold }}>Commission ({DEFAULT_MARGIN}%)</span>
                      <span style={{ fontSize: "12px", color: T.gold }}>+${totalCommission}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => navigate(bookUrl)}
                    style={{ width: "100%", background: T.gold, color: T.bg, border: "none", padding: "14px", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", marginTop: "18px", fontWeight: 600, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.goldLight}
                    onMouseLeave={e => e.currentTarget.style.background = T.gold}>
                    Book Now · ${totalPrice}
                  </button>
                </>
              )}
              {rates.length === 0 && !loading && (
                <div style={{ marginTop: "14px", fontSize: "11px", color: T.textFaint, textAlign: "center", lineHeight: 1.8 }}>No availability for these dates.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
