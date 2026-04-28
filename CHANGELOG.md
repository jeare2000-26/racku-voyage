# Changelog — April 28, 2026

## System Status
- App is live and operational
- All 5 pages deployed (Home, Search, Hotel, Book, Dashboard)
- LiteAPI integration working with 15% margin
- Booking entity fully schemaed with descriptions

## Entities
- Booking: Full schema with field descriptions, enums, defaults
  - Status enum: pending, confirmed, cancelled, completed
  - Payout enum: pending, paid
  - Currency defaults to USD

## Automations (Active)
1. Auto-commit to GitHub — Runs daily at 09:00 UTC
2. New Booking Alert — Triggers on new Booking records

## Recent Fixes
- Fixed Search.jsx: useEffect triggers on URL param changes
- Fixed Hotel.jsx: Corrected LiteAPI field mappings
  - hotelImages (not images)
  - hotelFacilities (not facilities)  
  - hotelDescription (not description)
  - address as string (not object)

## Deployment
- Live: https://kristal-app-11801bdd.base44.app
- GitHub: https://github.com/jeare2000-26/racku-voyage
- Framework: Base44 mini-app (React)
- API: LiteAPI v3.0 with 15% margin

Last updated: April 28, 2026 @ 02:01 UTC
