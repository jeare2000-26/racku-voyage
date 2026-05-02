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

// Fallback room images by tier keyword
const ROOM_FALLBACKS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
  "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=600&q=80",
];

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function RoomCard({ room, index, nights, adults, id, checkin, checkout, hotelName, hotelPhotos, navigate }) {
  const [hovered, setHovered] = useState(false);

  const rate = room.rates?.[0];
  const nightlyPrice = rate?.retailRate?.total?.[0]?.amount || 0;
  const totalPrice = Math.round(nightlyPrice * nights);
  const commission = Math.round(totalPrice * DEFAULT_MARGIN / 100);

  // Fees breakdown
  const taxes = rate?.retailRate?.taxes?.[0]?.amount || 0;
  const fees = rate?.retailRate?.fees?.[0]?.amount || 0;
  const basePrice = nightlyPrice - taxes - fees;

  // Cancellation policy
  const cancelInfo = rate?.cancellationPolicies?.cancelPolicyInfos?.[0];
  const isFreeCancellation = cancelInfo?.cancelTime || rate?.boardType === "RO";

  // Board type label
  const boardLabels = { RO: "Room Only", BB: "Bed & Breakfast", HB: "Half Board", FB: "Full Board", AI: "All Inclusive" };
  const boardType = boardLabels[rate?.boardType] || rate?.boardType || "Room Only";

  // Max occupancy / bed info
  const maxOccupancy = room.maxOccupancy || adults;
  const bedType = room.bedConfiguration || "";

  // Room photo: use hotel photos offset by index as room illustration
  const roomPhoto = hotelPhotos[index + 1] || hotelPhotos[index] || ROOM_FALLBACKS[index % ROOM_FALLBACKS.length];

  const bookUrl = `/book?hotelId=${id}&rateId=${encodeURIComponent(rate?.rateId || "")}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotelName)}&roomName=${encodeURIComponent(room.name || "")}&price=${totalPrice}&commission=${commission}`;

  if (!nightlyPrice) return null; // skip rooms with no price

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? T.terracotta : T.border}`,
        background: hovered ? T.cardHover : T.card,
        transition: "all 0.3s",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ROOM PHOTO */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", flexShrink: 0 }}>
        <img
          src={roomPhoto}
          alt={room.name}
          onError={e => { e.target.src = ROOM_FALLBACKS[index % ROOM_FALLBACKS.length]; }}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.5s",
            filter: "brightness(0.82)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(14,11,8,0.7) 100%)" }} />

        {/* Board type badge */}
        <div style={{ position: "absolute", top: "14px", left: "14px", background: "rgba(14,11,8,0.82)", border: `1px solid ${T.border}`, padding: "4px 10px" }}>
          <span style={{ fontSize: "9px", letterSpacing: "2px", color: T.sandMuted, textTransform: "uppercase" }}>{boardType}</span>
        </div>

        {/* Free cancellation badge */}
        {isFreeCancellation && (
          <div style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(27,75,75,0.85)", border: "1px solid #1B4B4B", padding: "4px 10px" }}>
            <span style={{ fontSize: "9px", letterSpacing: "1px", color: "#6BBFBF", textTransform: "uppercase" }}>Free Cancel</span>
          </div>
        )}

        {/* Room name at bottom of photo */}
        <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 300, color: T.sand, textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}>
            {room.name}
          </div>
        </div>
      </div>

      {/* ROOM DETAILS */}
      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Quick attributes */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            maxOccupancy && `👥 Up to ${maxOccupancy} guests`,
            bedType && `🛏 ${bedType}`,
            `🌙 ${nights} night${nights > 1 ? "s" : ""}`,
          ].filter(Boolean).map((tag, i) => (
            <span key={i} style={{ fontSize: "10px", color: T.sandFaint, background: T.bg, border: `1px solid ${T.border}`, padding: "3px 10px", letterSpacing: "0.5px" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Fee Breakdown */}
        <div style={{ background: T.bg, border: `1px solid ${T.border}`, padding: "14px 16px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "3px", color: T.sandFaint, textTransform: "uppercase", marginBottom: "10px" }}>Price Breakdown</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", color: T.sandMuted }}>Nightly Rate</span>
            <span style={{ fontSize: "11px", color: T.sand }}>${Math.round(nightlyPrice)}</span>
          </div>

          {taxes > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: T.sandFaint }}>Taxes & Charges</span>
              <span style={{ fontSize: "11px", color: T.sandFaint }}>${Math.round(taxes)}</span>
            </div>
          )}

          {fees > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: T.sandFaint }}>Hotel Fees</span>
              <span style={{ fontSize: "11px", color: T.sandFaint }}>${Math.round(fees)}</span>
            </div>
          )}

          <div style={{ height: "1px", background: T.border, margin: "10px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "10px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>
              Total · {nights} night{nights > 1 ? "s" : ""}
            </span>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 300, color: T.sand }}>${totalPrice}</span>
              <span style={{ fontSize: "10px", color: T.sandFaint, marginLeft: "4px" }}>USD</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
            <span style={{ fontSize: "10px", color: T.sandFaint }}>Your commission (15%)</span>
            <span style={{ fontSize: "12px", color: T.terracottaLight, fontWeight: 500 }}>+${commission}</span>
          </div>
        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={() => navigate(bookUrl)}
          style={{
            width: "100%",
            background: hovered ? T.terracottaLight : T.terracotta,
            color: T.sand,
            border: "none",
            padding: "14px",
            fontSize: "10px",
            letterSpacing: "3px",
            cursor: "pointer",
            textTransform: "uppercase",
            fontFamily: "inherit",
            fontWeight: 600,
            transition: "background 0.2s",
            marginTop: "auto",
          }}
        >
          Book This Room
        </button>
      </div>
    </div>
  );
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

  const availableRooms = rates.filter(r => r.rates?.[0]?.retailRate?.total?.[0]?.amount > 0);

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.sand, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        .thumb-img:hover { opacity: 1 !important; border-color: ${T.terracottaLight} !important; }
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
            {photos.slice(0, 12).map((url, i) => (
              <img key={i} src={url} alt="" onClick={() => setActiveImg(i)}
                className="thumb-img"
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: "88px", height: "58px", objectFit: "cover", cursor: "pointer", flexShrink: 0, border: `2px solid ${activeImg === i ? T.terracotta : "transparent"}`, opacity: activeImg === i ? 1 : 0.48, transition: "all 0.2s" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* BODY: about + amenities, full width then rooms */}
      <div style={{ padding: "48px 48px 0", maxWidth: "1400px" }}>

        {/* About + Amenities side by side */}
        <div style={{ display: "flex", gap: "60px", marginBottom: "56px", paddingBottom: "56px", borderBottom: `1px solid ${T.border}` }}>

          {/* Description */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
              <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>About This Property</span>
            </div>
            {description ? (
              <p style={{ fontSize: "15px", lineHeight: 1.9, color: T.sandMuted, margin: 0 }}>
                {description.slice(0, 600)}{description.length > 600 ? "..." : ""}
              </p>
            ) : (
              <p style={{ fontSize: "14px", color: T.sandFaint, margin: 0, fontStyle: "italic" }}>No description available.</p>
            )}
          </div>

          {/* Facilities */}
          {facilities.length > 0 && (
            <div style={{ width: "380px", minWidth: "380px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
                <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>Amenities</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {facilities.slice(0, 10).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: T.card, border: `1px solid ${T.border}` }}>
                    <span style={{ color: T.terracotta, fontSize: "10px", flexShrink: 0 }}>✦</span>
                    <span style={{ fontSize: "11px", color: T.sandMuted }}>{typeof f === "string" ? f : f.facilityName || f.name || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ ROOMS SECTION ═══════════════ */}
      <div style={{ padding: "0 48px 80px", maxWidth: "1400px" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
              <div style={{ width: "32px", height: "1px", background: T.terracotta }} />
              <span style={{ fontSize: "9px", letterSpacing: "4px", color: T.terracotta, textTransform: "uppercase" }}>Select Your Room</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "36px", fontWeight: 300, margin: 0, color: T.sand }}>
              Available Rooms & Suites
            </h2>
          </div>
          {availableRooms.length > 0 && (
            <div style={{ fontSize: "12px", color: T.sandFaint, textAlign: "right", lineHeight: 1.7 }}>
              <span style={{ color: T.terracottaLight, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "22px", fontWeight: 300 }}>{availableRooms.length}</span>
              <br />room type{availableRooms.length !== 1 ? "s" : ""} available
            </div>
          )}
        </div>

        {/* Stay context bar */}
        <div style={{ display: "flex", gap: "2px", marginBottom: "32px" }}>
          {[
            ["Check In", checkin],
            ["Check Out", checkout],
            [`${nights} Night${nights > 1 ? "s" : ""}`, "Duration"],
            [`${adults} Guest${parseInt(adults) > 1 ? "s" : ""}`, "Occupancy"],
          ].map(([val, label]) => (
            <div key={label} style={{ flex: 1, padding: "12px 18px", background: T.card, border: `1px solid ${T.border}`, textAlign: "center" }}>
              <div style={{ fontFamily: "'Georgia',serif", fontSize: "14px", color: T.sand, marginBottom: "3px" }}>{val}</div>
              <div style={{ fontSize: "8px", letterSpacing: "2px", color: T.sandFaint, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Room cards grid */}
        {availableRooms.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "3px" }}>
            {availableRooms.map((room, i) => (
              <RoomCard
                key={i}
                room={room}
                index={i}
                nights={nights}
                adults={adults}
                id={id}
                checkin={checkin}
                checkout={checkout}
                hotelName={hotel.name}
                hotelPhotos={photos}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: "60px", border: `1px solid ${T.border}`, background: T.card, textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🏨</div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 300, color: T.sand, marginBottom: "10px" }}>
              No Availability
            </div>
            <div style={{ fontSize: "13px", color: T.sandFaint, marginBottom: "28px" }}>
              No rooms are available for your selected dates. Try adjusting your check-in or check-out.
            </div>
            <button onClick={() => navigate(-1)} style={{ background: T.terracotta, color: T.sand, border: "none", padding: "12px 32px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "inherit", fontWeight: 600 }}>
              ← Modify Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
