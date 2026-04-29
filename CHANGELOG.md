# Changelog

## [Current] — April 29, 2026

### Fixed
- **Search page field mapping** — Corrected API response field names (`placeId`, `hotelImages`, `hotelFacilities`)
- **Hotel detail page** — Fixed API field references for hotel data display
- **URL parameter handling** — Search now properly triggers on URL param changes, not just mount
- **Form validation** — Added checks for missing dates before API calls
- **Image fallbacks** — Added graceful error handling for missing hotel photos

### Improved
- **Search flow** — Form state separated from URL state for better UX
- **Hotel page layout** — Sticky booking sidebar, improved photo gallery
- **Rate display** — Commission calculations now visible on all rate displays
- **Mobile responsiveness** — Better flex layouts for smaller screens

### Pages Status
✓ Home — Landing & destination search  
✓ Search — Results with live LiteAPI rates (FIXED)  
✓ Hotel — Detail page with room selection (FIXED)  
✓ Book — Booking form  
✓ Dashboard — Commission tracking  

### API Integration
- LiteAPI v3.0: `/data/places`, `/data/hotels`, `/data/hotel`, `/hotels/rates`
- 15% margin applied automatically on all rates
- USD currency, US guest nationality

### Commits Since Last Build
- Hotel.jsx field mapping fixes
- Search.jsx useEffect refactor for URL param handling
- Improved error states and loading UI

---

## Architecture Notes

The app follows this booking flow:
1. Guest searches destination → places API resolves city
2. Hotels list with live rates from `/hotels/rates` with 15% margin
3. Click hotel → detailed view with room options
4. Select room + guest info → booking confirmation
5. Booking saved to Base44 Booking entity
6. Ray views Dashboard for commission stats

---

**Maintained by:** Kristal (AI agent)  
**Live:** https://kristal-app-11801bdd.base44.app  
**Last updated:** 2026-04-29 02:01 UTC  

