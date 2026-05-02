import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

const T = {
  bg: "#0E0B08",
  sand: "#F5EDD6",
  sandMuted: "#C8B89A",
  sandFaint: "#7A6B55",
  terracotta: "#C4622D",
  terracottaLight: "#D97B4A",
  terracottaDark: "#8C3F18",
  teal: "#1B4B4B",
  card: "#17120D",
  cardHover: "#1F1812",
  border: "#2E2318",
  borderLight: "#3D3022",
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

  const nights = checkin && checkout ? Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)) : 1;

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
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", flexDirection: "column", gap: "20px" }}>
      <div style={{ width: "36px", height: "36px", border: `2px solid ${T.border}`, borderTop: `2px solid ${T.terracotta}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ fontSize: "10px", color: T.sandFaint, letterSpacing: "5px", textTransform: "uppercase" }}>Loading Property...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !hotel) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", color: "#E57373", marginBottom: "24px" }}>{error || "Hotel not found"}</div>
        <button onClick={() => navigate(-1)} style={{ background: T.terracotta, color: T.sand, border: "none", padding: "12px 28px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "inherit" }}>← Go Back</button>
      </div>
    </div>
  );

  const photos = (hotel.hotelImages || []).map(img => img.url || img.urlHd).filter(Boolean);
  const mainPhoto = photos[activeImg] || "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=90";
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
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.sand, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        .room-card:hover { border-color: ${T.terracotta} !important; background: ${T.cardHover} !important; }
        .thumb-img:hover { opacity: 1 !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", background: "rgba(14,11,8,0.95)", backdropFilter: "blur(6px)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, letterSpacing: "5px", color: T.sand, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku<span style={{ color: T.terracotta }}>·</span>Voyage
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.sandMuted, padding: "7px 20px", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.terracotta; e.currentTarget.style.color = T.terracotta; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sandMuted; }}>
          ← Back to Results
        </button>
      </nav>

      {/* HERO GALLERY */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{ position: "relative", height: "520px", overflow: "hidden" }}>
          <img src={mainPhoto} alt={hotel.name}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=90"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)", transition: "opacity 0.4s" }}
          />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 50%, ${T.bg} 100%)` }} />

          {/* Hotel name overlay */}
          <div style={{ position: "absolute", bottom: "40px", left: "48px" }}>
            {(hotel.stars || 0) > 0 && (
              <div style={{ fontSize: "13px", color: T.terracottaLight, marginBottom: "8px", letterSpacing: "3px" }}>
                {"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}
              </div>
            )}
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(32px, 4vw, 54px)", fontWeight: 300, margin: "0 0 6px", color: T.sand, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
              {hotel.name}
            </h1>
            <div style={{ fontSize: "13px", color: T.sandMuted }}>{addressStr}</div>
          </div>

          {/* Rating badge */}
          {hotel.rating > 0 && (
            <div style={{ position: "absolute", bottom: "50px", right: "48px", textAlign: "center", background: "rgba(14,11,8,0.85)", border: `1px solid ${T.terracottaDark}`, padding: "14px 20px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "32px", fontWeight: 300, color: T.terracottaLight, lineHeight: 1 }}>{hotel.rating}</div>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase", marginTop: "3px" }}>/ 10</div>
              {hotel.reviewCount > 0 && <div style={{ fontSize: "10px", color: T.sandFaint, marginTop: "4px" }}>{Number(hotel.reviewCount).toLocaleString()} reviews</div>}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: "3px", padding: "8px 48px", background: T.bg, overflowX: "auto" }}>
            {photos.slice(0, 10).map((url, i) => (
              <img key={i} src={url} alt="" onClick={() => setActiveImg(i)}
                className="thumb-img"
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: "88px", height: "58px", objectFit: "cover", cursor: "pointer", flexShrink: 0, border: `2px solid ${activeImg === i ? T.terracotta : "transparent"}`, opacity: activeImg === i ? 1 : 0.5, transition: "all 0.2s" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* BODY */}
      <div style={{ display: "flex", padding: "40px 48px 80px", gap: "60px", maxWidth: "1400px" }}>

        {/* LEFT CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Description */}
          {description && (
            <div style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
                <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>About This Property</span>
              </div>
              <p style={{ fontSize: "15px", lineHeight: 1.9, color: T.sandMuted, margin: 0, maxWidth: "640px" }}>
                {description.slice(0, 700)}{description.length > 700 ? "..." : ""}
              </p>
            </div>
          )}

          {/* Facilities */}
          {facilities.length > 0 && (
            <div style={{ marginBottom: "48px", paddingBottom: "48px", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
                <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>Amenities</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {facilities.slice(0, 12).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: T.card, border: `1px solid ${T.border}` }}>
                    <span style={{ color: T.terracotta, fontSize: "12px" }}>✦</span>
                    <span style={{ fontSize: "11px", color: T.sandMuted, letterSpacing: "0.3px" }}>{typeof f === "string" ? f : f.facilityName || f.name || JSON.stringify(f)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room selection */}
          {rates.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
                <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>Available Rooms</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {rates.map((room, i) => {
                  const rate = room.rates?.[0];
                  const price = rate?.retailRate?.total?.[0]?.amount || 0;
                  const isSelected = selectedRoom?.name === room.name;
                  return (
                    <div key={i} className="room-card" onClick={() => setSelectedRoom(room)}
                      style={{ padding: "20px 24px", border: `1px solid ${isSelected ? T.terracotta : T.border}`, background: isSelected ? T.cardHover : T.card, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "15px", color: T.sand, marginBottom: "4px", fontFamily: "'Georgia',serif" }}>{room.name}</div>
                        <div style={{ fontSize: "10px", color: T.sandFaint, letterSpacing: "1px" }}>
                          {rate?.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime ? "Free cancellation available" : "Standard rate"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {price > 0 && (
                          <>
                            <div style={{ fontFamily: "'Georgia',serif", fontSize: "22px", color: T.sand, fontWeight: 300 }}>${Math.round(price)}</div>
                            <div style={{ fontSize: "9px", color: T.sandFaint, textTransform: "uppercase", letterSpacing: "1px" }}>/night</div>
                            {isSelected && <div style={{ fontSize: "10px", color: T.terracottaLight, marginTop: "4px" }}>Selected ✓</div>}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rates.length === 0 && !loading && (
            <div style={{ padding: "32px", border: `1px solid ${T.border}`, background: T.card, textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: T.sandFaint, letterSpacing: "3px", textTransform: "uppercase" }}>No availability for selected dates</div>
            </div>
          )}
        </div>

        {/* RIGHT: BOOKING PANEL */}
        <div style={{ width: "340px", minWidth: "340px", position: "sticky", top: "82px", alignSelf: "flex-start" }}>
          <div style={{ border: `1px solid ${T.borderLight}`, background: T.card }}>
            {/* Header */}
            <div style={{ padding: "24px 28px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg, ${T.terracottaDark}, #4A1A08)` }}>
              <div style={{ fontSize: "9px", letterSpacing: "4px", color: T.sandMuted, textTransform: "uppercase", marginBottom: "6px" }}>Book Your Stay</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 300, color: T.sand }}>{hotel.name}</div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", marginBottom: "20px" }}>
                {[["Check In", checkin], ["Check Out", checkout]].map(([label, val]) => (
                  <div key={label} style={{ padding: "12px 14px", background: T.bg, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: "8px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: T.sand }}>{val || "—"}</div>
                  </div>
                ))}
              </div>

              {/* Stay summary */}
              <div style={{ padding: "14px", background: T.bg, border: `1px solid ${T.border}`, marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", color: T.sandFaint }}>{nights} night{nights > 1 ? "s" : ""} · {adults} guest{parseInt(adults) > 1 ? "s" : ""}</span>
                  <span style={{ fontSize: "11px", color: T.sandMuted }}>{selectedRoom?.name || "Select a room"}</span>
                </div>
                {selectedRoom && (
                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", color: T.sandFaint }}>Total</span>
                      <span style={{ fontFamily: "'Georgia',serif", fontSize: "20px", color: T.sand, fontWeight: 300 }}>${totalPrice}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", color: T.sandFaint }}>Your commission</span>
                      <span style={{ fontSize: "13px", color: T.terracottaLight }}>+${totalCommission}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedRoom && selectedRate ? (
                <button onClick={() => navigate(bookUrl)} style={{ width: "100%", background: T.terracotta, color: T.sand, border: "none", padding: "16px", fontSize: "11px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.terracottaLight}
                  onMouseLeave={e => e.currentTarget.style.background = T.terracotta}>
                  Reserve This Room
                </button>
              ) : (
                <div style={{ width: "100%", background: T.border, color: T.sandFaint, padding: "16px", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "inherit", textAlign: "center" }}>
                  {rates.length === 0 ? "No Availability" : "Select a Room"}
                </div>
              )}

              <div style={{ fontSize: "10px", color: T.sandFaint, textAlign: "center", marginTop: "12px", lineHeight: 1.7 }}>
                No payment charged now.<br />Review details on next step.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
