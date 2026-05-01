# Changelog

## May 1, 2026 — Bug Fixes & Field Mapping Corrections

### Search.jsx — Fixed URL parameter handling
- Rewrote search component to properly react to URL param changes
- Separated form state from URL state (typing doesn't trigger API until submit)
- Added date validation before search submission
- Fixed issue where search wouldn't re-fire when navigating back to Search page
- All searches now correctly trigger LiteAPI places → hotels → rates pipeline

### Hotel.jsx — Corrected LiteAPI field mappings
- Fixed all v3.0 API field names:
  - `hotel.images` → `hotel.hotelImages` (array of photo objects)
  - `hotel.facilities` → `hotel.hotelFacilities` (array of facility names)
  - `hotel.description` → `hotel.hotelDescription` (HTML string, now stripped)
  - `hotel.address` → correctly reads as plain string
- Added photo gallery with thumbnail strip
- Room selection now displays real rates and commissions
- Booking sidebar shows complete trip summary and $commission calculation
- All hotel detail pages now fully functional

### Testing
- Verified LiteAPI endpoints working: /data/places, /data/hotels, /hotels/rates, /data/hotel
- Tested full flow: Manila search → 15 hotels → $64-$232 rates with 15% margin
- Confirmed hotel detail page loads photos, amenities, rooms, and price calculations

### Status
✅ Search fully functional  
✅ Hotel detail pages working  
✅ Commission calculations applied  
⏳ Book.jsx & Dashboard.jsx next

