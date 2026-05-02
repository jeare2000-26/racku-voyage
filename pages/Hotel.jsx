import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

const T = {
  bg: "#111109",
  bgCard: "#191912",
  cream: "#F2EDE4",
  creamMuted: "#BDB9B0",
  creamFaint: "#6B6860",
  gold: "#C8A96E",
  goldMuted: "#8A7248",
  goldFaint: "#3D3220",
  border: "#2A2820",
  borderLight: "#3A3830",
};

const ROOM_FALLBACKS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=85",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=700&q=85",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=700&q=85",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&q=85",
  "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=700&q=85",
];

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function RoomCard({ room, index, nights, adults, id, checkin, checkout, hotelName, hotelPhotos, navigate }) {
  const [hovered, setHovered] = useState(false);
  const rate = room.rates?.[0];
  const nightlyPrice = rate?.retailRate?.total?.[0]?.amount || 0;
  if (!nightlyPrice) return null;

  const totalPrice = Math.round(nightlyPrice * nights);
  const commission = Math.round(totalPrice * DEFAULT_MARGIN / 100);
  const taxes = rate?.retailRate?.taxes?.[0]?.amount || 0;
  const fees = rate?.retailRate?.fees?.[0]?.amount || 0;
  const boardLabels = { RO: "Room Only", BB: "Bed & Breakfast", HB: "Half Board", FB: "Full Board", AI: "All Inclusive" };
  const boardType = boardLabels[rate?.boardType] || rate?.boardType || "Room Only";
  const isFreeCancellation = !!(rate?.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime);
  const maxOccupancy = room.maxOccupancy || adults;
  const roomPhoto = hotelPhotos[index + 1] || hotelPhotos[index] || ROOM_FALLBACKS[index % ROOM_FALLBACKS.length];
  const bookUrl = `/book?hotelId=${id}&rateId=${encodeURIComponent(rate?.rateId || "")}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&hotelName=${encodeURIComponent(hotelName)}&roomName=${encodeURIComponent(room.name || "")}&price=${totalPrice}&commission=${commission}`;

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ border: `1px solid ${hovered ? T.gold : T.border}`, background: hovered ? T.bgCard : T.bg, transition: "all 0.3s", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Photo */}
      <div style={{ position: "relative", height: "230px", overflow: "hidden", flexShrink: 0 }}>
        <img src={roomPhoto} alt={room.name}
          onError={e => { e.target.src = ROOM_FALLBACKS[index % ROOM_FALLBACKS.length]; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.55s", filter: "brightness(0.72)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(17,17,9,0.88) 100%)" }} />

        {/* Badges */}
        <div style={{ position: "absolute", top: "14px", left: "14px", background: "rgba(17,17,9,0.82)", border: `1px solid ${T.border}`, padding: "4px 12px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamMuted, textTransform: "uppercase" }}>{boardType}</span>
        </div>
        {isFreeCancellation && (
          <div style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(27,60,27,0.85)", border: "1px solid #2A5A2A", padding: "4px 12px" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "1px", color: "#7EC87E", textTransform: "uppercase" }}>Free Cancel</span>
          </div>
        )}

        {/* Room number + name overlay */}
        <div style={{ position: "absolute", bottom: "16px", left: "18px", right: "18px" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontSize: "11px", color: "rgba(200,169,110,0.55)", marginBottom: "4px" }}>0{index + 1}</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 400, color: T.cream }}>{room.name}</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Attributes row */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            `${nights} night${nights > 1 ? "s" : ""}`,
            `Up to ${maxOccupancy} guests`,
            boardType,
          ].map((tag, i) => (
            <span key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: T.creamFaint, background: T.bgCard, border: `1px solid ${T.border}`, padding: "3px 10px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Price breakdown */}
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, padding: "16px 18px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "3px", color: T.creamFaint, textTransform: "uppercase", marginBottom: "12px" }}>Price Breakdown</div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamMuted, fontWeight: 300 }}>Nightly rate</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.cream }}>${Math.round(nightlyPrice)}</span>
          </div>
          {taxes > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamFaint, fontWeight: 300 }}>Taxes & charges</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamFaint }}>${Math.round(taxes)}</span>
            </div>
          )}
          {fees > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamFaint, fontWeight: 300 }}>Hotel fees</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamFaint }}>${Math.round(fees)}</span>
            </div>
          )}

          <div style={{ height: "1px", background: T.border, margin: "12px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase", marginBottom: "2px" }}>Total · {nights} nights</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.gold, fontWeight: 400 }}>Your commission: +${commission}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "30px", fontWeight: 400, color: T.cream, lineHeight: 1 }}>${totalPrice}</span>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: T.creamFaint, textTransform: "uppercase", letterSpacing: "1px" }}>USD</div>
            </div>
          </div>
        </div>

        {/* Book button */}
        <button onClick={() => navigate(bookUrl)}
          style={{ width: "100%", background: hovered ? T.gold : "transparent", color: hovered ? T.bg : T.gold, border: `1px solid ${T.goldMuted}`, padding: "14px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", fontWeight: 500, transition: "all 0.25s", marginTop: "auto" }}>
          Reserve This Room →
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
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", flexDirection: "column", gap: "20px" }}>
      <div style={{ width: "36px", height: "36px", border: `1.5px solid ${T.border}`, borderTop: `1.5px solid ${T.gold}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ fontSize: "10px", color: T.creamFaint, letterSpacing: "5px", textTransform: "uppercase" }}>Loading Property...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
    </div>
  );

  if (error || !hotel) return (
    <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "13px", color: "#E57373", marginBottom: "24px" }}>{error || "Hotel not found"}</div>
        <button onClick={() => navigate(-1)} style={{ background: T.gold, color: T.bg, border: "none", padding: "12px 28px", cursor: "pointer", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>← Go Back</button>
      </div>
    </div>
  );

  const photos = (hotel.hotelImages || []).map(img => img.url || img.urlHd).filter(Boolean);
  const mainPhoto = photos[activeImg] || "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=90";
  const facilities = hotel.hotelFacilities || [];
  const description = stripHtml(hotel.hotelDescription || hotel.description || "");
  const addressStr = typeof hotel.address === "string" ? hotel.address : [hotel.address?.line1, hotel.address?.city, hotel.address?.country].filter(Boolean).join(", ");
  const availableRooms = rates.filter(r => r.rates?.[0]?.retailRate?.total?.[0]?.amount > 0);

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: T.bg, color: T.cream, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-track { background: ${T.bg}; } ::-webkit-scrollbar-thumb { background: ${T.border}; }
        .thumb:hover { opacity: 1 !important; border-color: ${T.gold} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", background: "rgba(17,17,9,0.96)", backdropFilter: "blur(8px)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, letterSpacing: "5px", color: T.cream, cursor: "pointer" }} onClick={() => navigate("/")}>
          Racku <em style={{ color: T.gold, fontStyle: "italic" }}>Voyage</em>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.creamMuted, padding: "7px 22px", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "2px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.creamMuted; }}>
          ← Back to Results
        </button>
      </nav>

      {/* HERO */}
      <div style={{ paddingTop: "62px" }}>
        <div style={{ position: "relative", height: "540px", overflow: "hidden" }}>
          <img src={mainPhoto} alt={hotel.name}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1600&q=90"; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.62)", transition: "opacity 0.4s" }}
          />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 45%, ${T.bg} 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(17,17,9,0.5) 0%, transparent 50%)" }} />

          <div style={{ position: "absolute", bottom: "44px", left: "56px" }}>
            {(hotel.stars || 0) > 0 && (
              <div style={{ fontSize: "13px", color: T.gold, marginBottom: "10px", letterSpacing: "3px" }}>
                {"★".repeat(Math.min(Math.round(hotel.stars || 0), 5))}
              </div>
            )}
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 58px)", fontWeight: 400, margin: "0 0 8px", color: T.cream }}>
              {hotel.name}
            </h1>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: T.creamMuted, fontWeight: 300 }}>{addressStr}</div>
          </div>

          {hotel.rating > 0 && (
            <div style={{ position: "absolute", bottom: "54px", right: "56px", textAlign: "center", background: "rgba(17,17,9,0.88)", border: `1px solid ${T.goldMuted}`, padding: "16px 22px" }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 300, color: T.gold, lineHeight: 1 }}>{hotel.rating}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase", marginTop: "3px" }}>/ 10 Rating</div>
              {hotel.reviewCount > 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, marginTop: "5px" }}>{Number(hotel.reviewCount).toLocaleString()} reviews</div>}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: "3px", padding: "6px 56px", background: T.bg, overflowX: "auto" }}>
            {photos.slice(0, 12).map((url, i) => (
              <img key={i} src={url} alt="" onClick={() => setActiveImg(i)} className="thumb"
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: "90px", height: "60px", objectFit: "cover", cursor: "pointer", flexShrink: 0, border: `2px solid ${activeImg === i ? T.gold : "transparent"}`, opacity: activeImg === i ? 1 : 0.45, transition: "all 0.2s" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ABOUT + AMENITIES */}
      <div style={{ padding: "52px 56px 0" }}>
        <div style={{ display: "flex", gap: "64px", marginBottom: "60px", paddingBottom: "60px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px" }}>
              <div style={{ width: "40px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase" }}>About This Property</span>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", lineHeight: 1.9, color: T.creamMuted, margin: 0, fontWeight: 300 }}>
              {description ? description.slice(0, 600) + (description.length > 600 ? "..." : "") : "No description available."}
            </p>
          </div>

          {facilities.length > 0 && (
            <div style={{ width: "360px", minWidth: "360px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "22px" }}>
                <div style={{ width: "40px", height: "1px", background: T.gold }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase" }}>Amenities</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {facilities.slice(0, 10).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: T.bgCard, border: `1px solid ${T.border}` }}>
                    <span style={{ color: T.gold, fontSize: "8px", flexShrink: 0 }}>◈</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: T.creamMuted, fontWeight: 300 }}>{typeof f === "string" ? f : f.facilityName || f.name || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ROOMS GRID ═══ */}
      <div style={{ padding: "0 56px 80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "36px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "1px", background: T.gold }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", letterSpacing: "4px", color: T.gold, textTransform: "uppercase" }}>Select Your Room</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400, margin: 0, color: T.cream }}>
              Available Rooms & Suites
            </h2>
          </div>
          {availableRooms.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 300, fontStyle: "italic", color: T.gold }}>{availableRooms.length}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: T.creamFaint, textTransform: "uppercase", letterSpacing: "1px" }}>Room type{availableRooms.length !== 1 ? "s" : ""} available</div>
            </div>
          )}
        </div>

        {/* Stay context bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", marginBottom: "36px", border: `1px solid ${T.border}` }}>
          {[["Check In", checkin], ["Check Out", checkout], [`${nights} Night${nights > 1 ? "s" : ""}`, "Duration"], [`${adults} Guest${parseInt(adults) > 1 ? "s" : ""}`, "Occupancy"]].map(([val, label]) => (
            <div key={label} style={{ padding: "14px 20px", background: T.bgCard, textAlign: "center", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "15px", fontStyle: "italic", color: T.cream, marginBottom: "3px" }}>{val}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "8px", letterSpacing: "2px", color: T.creamFaint, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Room cards */}
        {availableRooms.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "3px" }}>
            {availableRooms.map((room, i) => (
              <RoomCard key={i} room={room} index={i} nights={nights} adults={adults} id={id}
                checkin={checkin} checkout={checkout} hotelName={hotel.name} hotelPhotos={photos} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "64px", border: `1px solid ${T.border}`, background: T.bgCard, textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 300, fontStyle: "italic", color: T.cream, marginBottom: "12px" }}>No Availability</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: T.creamFaint, marginBottom: "28px", fontWeight: 300 }}>No rooms available for your selected dates. Try adjusting your search.</div>
            <button onClick={() => navigate(-1)} style={{ background: T.gold, color: T.bg, border: "none", padding: "13px 32px", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 500 }}>
              ← Modify Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
