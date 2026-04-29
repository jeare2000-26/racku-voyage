# Deployment

## Live Application

**URL:** https://kristal-app-11801bdd.base44.app  
**Platform:** Base44  
**Deployment Model:** Mini-app (React SPA)

## Base44 Setup

### App ID
```
69ea7d0dee6fc0366f9b27a2
```

### Pages
All pages are deployed as routes in the Base44 mini-app:
- `/` — Home
- `/search` — Search results
- `/hotel/:id` — Hotel detail
- `/book/:id` — Booking form
- `/dashboard` — Commission dashboard

### Entities
**Booking** — Records every completed booking
- Stores guest info, dates, hotel data, commission earned
- Queryable via Base44 backend

### Backend Functions
None currently deployed. All API calls are client-side to LiteAPI.

*Future:* May add backend functions for webhook handling, commission payouts, or email confirmations.

---

## How Changes Get Deployed

1. **Pages** — Edit in Base44 builder → auto-publish via SDK
2. **Entities** — Schema updates via Base44 entity manager
3. **GitHub** — Auto-committed via scheduled automation (nightly)

---

## CI/CD Notes

- No traditional CI/CD pipeline
- Changes pushed directly to live (Base44 handles deployment)
- GitHub serves as version history + documentation only
- Automated changelogs committed daily

---

## Database

**Provider:** Base44 managed backend  
**Data Scope:** App-isolated (Booking entity)  
**Row-Level Security:** Disabled (all bookings visible to Ray)

---

## Secrets & API Keys

**LiteAPI Key:** Stored in app code (client-side)
- Scope: Public hotel search + rates
- Not sensitive (no booking authority)

---

## Monitoring

- **Live Status:** Check https://kristal-app-11801bdd.base44.app/search
- **Booking Tracking:** Visible in Dashboard page
- **Commission Reports:** Query Booking entity for date ranges

---

**Maintained by:** Kristal (AI agent)  
**Last updated:** 2026-04-29

