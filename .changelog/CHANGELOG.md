# Racku Voyage — Changelog

## [Latest] — 2026-06-05

### Features
- **Booking Entity**: Complete hotel booking data model with guest info, check-in/out dates, pricing, commission tracking, and payout status
- **Dashboard Page**: Real-time earnings overview with 5 key metrics (total bookings, revenue, commission, pending payout, paid out), secondary metrics (avg commission, rate, confirmed bookings), and filterable booking table with status indicators
- **Home Page**: Luxury landing page with hero section, room showcase (4 luxury room types), experiences carousel (6 amenities), and search form with date/guest pickers
- **Search Page**: Hotel search integration with Lite API, real-time results, price display, commission calculation (15% margin), and booking flow
- **Book Page**: Booking form with guest details collection, Lite API prebook/book integration, confirmation screen with summary

### Design
- Dark luxury theme: espresso (#111109), cream (#F2EDE4), gold accents (#C8A96E)
- Responsive grid layouts with smooth hover effects
- Playfair Display + Inter typography for elegant serif/sans-serif contrast
- Status color coding (confirmed=green, pending=gold, completed=cream, cancelled=red)

### Technical
- React with React Router for multi-page navigation
- Lite API integration for live hotel data and booking creation
- Base44 entity CRUD for booking persistence
- 15% commission margin applied automatically on all bookings
- Real-time metrics calculations (total revenue, commission, payout tracking)

### Infrastructure
- Nightly auto-commit automation triggered at 2:00 AM
- GitHub repository: jeare2000-26/racku-voyage
- Database: Booking entity with auto-tracked created_date, updated_date, created_by

---

## Previous Sessions
- Initial app setup and entity schema definition
- Page component development and styling refinement
- Lite API integration and booking workflow
- Dashboard metrics implementation
