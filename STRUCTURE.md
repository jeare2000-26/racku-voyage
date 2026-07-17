# Project Structure

This repo contains the schema and entity definitions for Racku Voyage.

## Full Source

The full React page source is managed on the Base44 platform (live deployment environment).
Pages are built and deployed directly from Base44's mini-app builder.

**Live app:** https://kristal-app-11801bdd.base44.app

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home.jsx | / | Landing page with hero search |
| Search.jsx | /search | Hotel search results with live LiteAPI rates |
| Hotel.jsx | /hotel/:id | Hotel detail, photos, room selection |
| Book.jsx | /book/:id | Guest info form + booking confirmation |
| Dashboard.jsx | /dashboard | Commission & booking analytics |

## Entities

| Entity | Description |
|--------|-------------|
| Booking | Tracks every booking with commission data |

## API

- **LiteAPI v3.0** — hotel search, rates, booking
- **Margin:** 15% applied to all rates
- **Currency:** USD

## Architecture

```
Guest → Home → Search (LiteAPI /data/places + /data/hotels + /hotels/rates)
             → Hotel (LiteAPI /data/hotel + /hotels/rates)
             → Book  (LiteAPI /hotels/prebook + /hotels/book)
             → Booking entity saved to Base44 DB

Ray → Dashboard (reads Booking entity, shows commission stats)
```
