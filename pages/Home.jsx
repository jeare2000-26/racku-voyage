// Home.jsx — Racku Voyage landing page
// Full source managed by Kristal (AI agent) on Base44
// See live app: https://kristal-app-11801bdd.base44.app

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_MARGIN = 15;
const DESTINATIONS = [
  { city: "Manila, Philippines", img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80" },
  { city: "Tokyo, Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { city: "Dubai, UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { city: "Paris, France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { city: "Singapore", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80" },
  { city: "London, UK", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80" },
];

export default function Home() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [form, setForm] = useState({ destination: "", checkin: today, checkout: tomorrow, adults: 2 });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.destination) return;
    const p = new URLSearchParams({ ...form });
    navigate(`/search?${p.toString()}`);
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: "#0a0a0a", color: "#f0ead6", minHeight: "100vh" }}>
      {/* See full source in Base44 platform */}
      <div style={{ textAlign: "center", padding: "200px 20px", color: "#7a6e5a" }}>
        <div style={{ fontSize: "32px", color: "#c9a84c", marginBottom: "16px" }}>RACKU VOYAGE</div>
        <div>Full source managed on Base44 platform</div>
        <button onClick={() => navigate("/search")} style={{ marginTop: "24px", background: "#c9a84c", color: "#0a0a0a", border: "none", padding: "12px 28px", cursor: "pointer", fontSize: "13px", letterSpacing: "2px" }}>
          SEARCH HOTELS
        </button>
      </div>
    </div>
  );
}
