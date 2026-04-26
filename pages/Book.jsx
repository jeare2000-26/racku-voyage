import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Booking } from "@/api/entities";

const LITEAPI_KEY = "prod_4924ac14-f585-4c07-98cf-51ea994bdcaf";
const DEFAULT_MARGIN = 15;

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [prebook, setPrebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [guestInfo, setGuestInfo] = useState({
    firstName: "", lastName: "", email: "", phone: "", nationality: "US",
  });

  const rateId = searchParams.get("rateId");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") || 2;
  const hotelName = searchParams.get("hotelName") || id;

  const nights = checkin && checkout
    ? Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000)
    : 1;

  useEffect(() => {
    const doPrebook = async () => {
      if (!rateId) { setLoading(false); return; }
      try {
        const res = await fetch("https://api.liteapi.travel/v3.0/hotels/prebook", {
          method: "POST",
          headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ rateId, usePaymentSdk: false }),
        });
        const data = await res.json();
        setPrebook(data.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    doPrebook();
  }, [rateId]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!prebook?.prebookId) return;
    setSubmitting(true);
    try {
      const res = await fetch("https://api.liteapi.travel/v3.0/hotels/book", {
        method: "POST",
        headers: { "X-API-Key": LITEAPI_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          prebookId: prebook.prebookId,
          guestFirstName: guestInfo.firstName,
          guestLastName: guestInfo.lastName,
          guestEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
          guestNationality: guestInfo.nationality,
          paymentMethod: { type: "CREDIT_CARD" },
        }),
      });
      const data = await res.json();
      const bookingResult = data.data;
      setBooking(bookingResult);

      // Save to Booking entity
      const totalPrice = prebook?.retailRate?.total?.[0]?.amount || 0;
      const commission = Math.round(totalPrice * DEFAULT_MARGIN / 100);

      await Booking.create({
        booking_id: bookingResult?.bookingId || bookingResult?.id || `RV-${Date.now()}`,
        hotel_id: id,
        hotel_name: hotelName,
        guest_first_name: guestInfo.firstName,
        guest_last_name: guestInfo.lastName,
        guest_email: guestInfo.email,
        checkin,
        checkout,
        nights,
        adults: parseInt(adults),
        room_name: prebook?.roomType?.name || "—",
        total_price: Math.round(totalPrice),
        margin_percent: DEFAULT_MARGIN,
        commission_earned: commission,
        currency: "USD",
        status: "confirmed",
        payout_status: "pending",
      });

      setStep(2);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const price = prebook?.retailRate?.total?.[0]?.amount || 0;
  const totalPrice = price;
  const commission = Math.round(totalPrice * DEFAULT_MARGIN / 100);

  if (loading) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", color: "#c9a84c", marginBottom: "20px" }}>✦</div>
        <div style={{ fontSize: "14px", color: "#7a6e5a", letterSpacing: "4px" }}>PREPARING YOUR RESERVATION...</div>
      </div>
    </div>
  );

  // CONFIRMATION PAGE
  if (step === 2 && booking) return (
    <div style={{ fontFamily: "Georgia, serif", background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
      <div style={{ textAlign: "center", maxWidth: "560px" }}>
        <div style={{ fontSize: "48px", color: "#c9a84c", marginBottom: "24px" }}>✦</div>
        <div style={{ fontSize: "11px", letterSpacing: "5px", color: "#c9a84c", marginBottom: "16px" }}>BOOKING CONFIRMED</div>
        <h1 style={{ fontSize: "36px", fontWeight: "300", margin: "0 0 8px" }}>Reservation Complete</h1>
        <p style={{ fontSize: "14px", color: "#7a6e5a", marginBottom: "40px", lineHeight: 1.8 }}>
          A confirmation has been sent to {guestInfo.email}
        </p>
        <div style={{ border: "1px solid rgba(201,168,76,0.3)", padding: "32px", background: "rgba(201,168,76,0.03)", marginBottom: "32px" }}>
          {[
            { label: "BOOKING REFERENCE", value: booking.bookingId || booking.id || "—" },
            { label: "HOTEL", value: hotelName },
            { label: "CHECK IN", value: checkin },
            { label: "CHECK OUT", value: checkout },
            { label: "GUESTS", value: `${adults} Adult${adults > 1 ? "s" : ""}` },
            { label: "NIGHTS", value: nights },
            { label: "TOTAL PAID", value: `$${Math.round(totalPrice)}` },
            { label: "YOUR COMMISSION", value: `$${commission}` },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "10px", letterSpacing: "2px", color: "#5a5040" }}>{item.label}</span>
              <span style={{ fontSize: "13px", color: item.label === "YOUR COMMISSION" ? "#4a9060" : "#d4c5a0" }}>{item.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/")} style={{
          background: "#c9a84c", color: "#0a0a0a", border: "none",
          padding: "14px 40px", fontSize: "12px", letterSpacing: "3px", cursor: "pointer", fontWeight: "600",
        }}>BACK TO HOME</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px", borderBottom: "1px solid rgba(201,168,76,0.15)", background: "#0a0a0a",
      }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <span style={{ fontSize: "22px", color: "#c9a84c", letterSpacing: "3px" }}>RACKU</span>
          <span style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "5px", marginLeft: "8px" }}>VOYAGE</span>
        </div>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#7a6e5a" }}>
          STEP 1: GUEST DETAILS → STEP 2: CONFIRM
        </div>
      </nav>

      <div style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 40px", display: "flex", gap: "60px" }}>

        {/* FORM */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "24px" }}>GUEST INFORMATION</div>
          <form onSubmit={handleBook}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              {[
                { label: "FIRST NAME", key: "firstName", type: "text", required: true },
                { label: "LAST NAME", key: "lastName", type: "text", required: true },
                { label: "EMAIL ADDRESS", key: "email", type: "email", required: true },
                { label: "PHONE NUMBER", key: "phone", type: "tel" },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>
                    {field.label} {field.required && "*"}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={guestInfo[field.key]}
                    onChange={e => setGuestInfo({ ...guestInfo, [field.key]: e.target.value })}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      borderBottom: "1px solid rgba(201,168,76,0.3)", color: "#f0ead6",
                      fontSize: "14px", padding: "10px 0", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", fontSize: "10px", letterSpacing: "3px", color: "#c9a84c", marginBottom: "8px" }}>NATIONALITY</label>
              <select
                value={guestInfo.nationality}
                onChange={e => setGuestInfo({ ...guestInfo, nationality: e.target.value })}
                style={{
                  background: "#1a1a1a", border: "none", borderBottom: "1px solid rgba(201,168,76,0.3)",
                  color: "#f0ead6", fontSize: "14px", padding: "10px 0", outline: "none", width: "100%",
                }}
              >
                {[["US","United States"],["GB","United Kingdom"],["AE","UAE"],["FR","France"],["DE","Germany"],["JP","Japan"],["AU","Australia"],["CA","Canada"]].map(([code, name]) => (
                  <option key={code} value={code} style={{ background: "#1a1a1a" }}>{name}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: "20px", background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.15)", marginBottom: "32px", fontSize: "12px", color: "#7a6e5a", lineHeight: 1.8 }}>
              By completing this booking, you agree to our Terms of Service and cancellation policy. Your payment information is processed securely.
            </div>

            <button
              type="submit"
              disabled={submitting || !prebook}
              style={{
                width: "100%", background: "#c9a84c", color: "#0a0a0a",
                border: "none", padding: "18px", fontSize: "13px", letterSpacing: "3px",
                cursor: submitting ? "not-allowed" : "pointer", fontWeight: "600",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "PROCESSING..." : "COMPLETE BOOKING"}
            </button>
          </form>
        </div>

        {/* SUMMARY */}
        <div style={{ width: "300px", minWidth: "300px" }}>
          <div style={{ border: "1px solid rgba(201,168,76,0.3)", padding: "28px", background: "rgba(201,168,76,0.02)", position: "sticky", top: "40px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#c9a84c", marginBottom: "20px" }}>BOOKING SUMMARY</div>
            {[
              { label: "HOTEL", value: hotelName },
              { label: "CHECK IN", value: checkin },
              { label: "CHECK OUT", value: checkout },
              { label: "NIGHTS", value: nights },
              { label: "GUESTS", value: `${adults} Adult${adults > 1 ? "s" : ""}` },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize: "10px", letterSpacing: "2px", color: "#5a5040" }}>{item.label}</span>
                <span style={{ fontSize: "12px", color: "#d4c5a0" }}>{item.value}</span>
              </div>
            ))}
            {totalPrice > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 8px" }}>
                  <span style={{ fontSize: "13px", color: "#c9a84c", letterSpacing: "2px" }}>TOTAL</span>
                  <span style={{ fontSize: "24px", color: "#c9a84c", fontWeight: "300" }}>${Math.round(totalPrice)}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#4a9060", textAlign: "right", letterSpacing: "1px" }}>
                  Your commission: ${commission}
                </div>
              </>
            )}
            <div style={{ marginTop: "20px", padding: "12px", background: "rgba(74,144,96,0.08)", border: "1px solid rgba(74,144,96,0.2)" }}>
              <div style={{ fontSize: "10px", color: "#4a9060", letterSpacing: "2px", marginBottom: "4px" }}>MARGIN APPLIED</div>
              <div style={{ fontSize: "18px", color: "#4a9060" }}>{DEFAULT_MARGIN}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
