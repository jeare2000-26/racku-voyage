# LiteAPI Integration Reference

## Current Endpoints

### 1. Place Search
**Endpoint:** `GET /v3.0/data/places`

Resolves a city/destination string to a placeId.

```
GET https://api.liteapi.travel/v3.0/data/places?textQuery=Manila,+Philippines&type=locality
```

**Used by:** Search page (searchForm.destination → placeId)

**Returns:** 
```json
{
  "data": [{
    "placeId": "ChIJi8MeVwPKlzMRH8FpEHXV0Wk",
    "displayName": "Manila",
    "formattedAddress": "Metro Manila, Philippines",
    "types": ["political", "locality", "geocode"]
  }]
}
```

---

### 2. Hotel List by Place
**Endpoint:** `GET /v3.0/data/hotels`

Gets hotels in a city.

```
GET https://api.liteapi.travel/v3.0/data/hotels?placeId=ChIJi8MeVwPKlzMRH8FpEHXV0Wk&limit=20&language=en
```

**Used by:** Search page results

**Returns:**
```json
{
  "data": [{
    "id": "lpc8fd5",
    "name": "Savoy Hotel Manila",
    "starRating": 4,
    "city": "Manila",
    "country": "Philippines",
    "hotelImages": [{
      "url": "https://static.cupid.travel/hotels/...",
      "urlHd": "https://..."
    }],
    "hotelFacilities": ["Pool", "WiFi", "..."]
  }]
}
```

---

### 3. Hotel Details
**Endpoint:** `GET /v3.0/data/hotel`

Full details for a single hotel.

```
GET https://api.liteapi.travel/v3.0/data/hotel?hotelId=lpc8fd5
```

**Used by:** Hotel detail page

**Key Fields:**
- `hotelDescription` (HTML)
- `hotelImages[]` with `.url` and `.urlHd`
- `hotelFacilities[]` (array of strings)
- `address` (string: "Andrews Avenue Newport City")
- `starRating`, `rating`, `reviewCount`

---

### 4. Hotel Rates
**Endpoint:** `POST /v3.0/hotels/rates`

Gets pricing for specific hotels + dates + occupancy.

```json
POST https://api.liteapi.travel/v3.0/hotels/rates
{
  "hotelIds": ["lpc8fd5", "lp867bc"],
  "checkin": "2026-05-10",
  "checkout": "2026-05-11",
  "occupancies": [{"adults": 2}],
  "currency": "USD",
  "guestNationality": "US",
  "margin": 15
}
```

**Used by:** Search page (search results), Hotel page (room selection)

**Returns:**
```json
{
  "data": [{
    "hotelId": "lpc8fd5",
    "roomTypes": [{
      "name": "Standard Room",
      "rates": [{
        "rateId": "...",
        "boardName": "Room Only",
        "retailRate": {
          "total": [{"amount": 63.80}]
        },
        "cancellationPolicies": {...}
      }]
    }]
  }]
}
```

**Margin:** Applied server-side. Set to 15 for Racku Voyage.

---

### 5. Prebook Hotel (Future)
**Endpoint:** `POST /v3.0/hotels/prebook`

Reserve a room before final booking.

```json
{
  "rateId": "...",
  "guestInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

---

### 6. Book Hotel (Future)
**Endpoint:** `POST /v3.0/hotels/book`

Finalize the booking with payment.

---

## Authentication

All requests require header:
```
X-API-Key: prod_4924ac14-f585-4c07-98cf-51ea994bdcaf
```

---

## Common Mappings

| LiteAPI Response | App Usage |
|---|---|
| `hotelImages` | Hotel photo carousel |
| `hotelFacilities` | Amenities list |
| `hotelDescription` | About section (strip HTML) |
| `roomTypes[].rates[].retailRate.total[0].amount` | Price per night |
| `roomTypes[].rates[].cancellationPolicies` | Refund info |

---

## Current Margin

**15%** applied on all rates via `/hotels/rates?margin=15`

Calculation:
```
CommissionPerNight = Price × 0.15
CommissionTotal = CommissionPerNight × Nights
```

---

## Error Handling

- No location found: "Try "Manila, Philippines" or "Paris, France""
- No hotels found: "Try a nearby city"
- No rates: "Dates/guests unavailable — try different selection"

---

**Last Updated:** 2026-04-29  
**API Version:** v3.0  
**Base URL:** https://api.liteapi.travel

