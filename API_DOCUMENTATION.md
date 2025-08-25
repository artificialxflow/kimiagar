# Yazdan Gold Price Bot API Documentation

## 🌐 Base URL
```
https://yazdan-price.liara.run
```

## 📋 Available Endpoints

### 1. Health Check
**GET** `/health`

**Description:** بررسی وضعیت سرور و سیستم

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-25T...",
  "uptime": 123.45,
  "memory": {
    "rss": 12345678,
    "heapTotal": 12345678,
    "heapUsed": 12345678,
    "external": 12345678
  },
  "scraping": {
    "status": "idle|running|completed|failed",
    "lastUpdate": "2025-08-25T..."
  }
}
```

### 2. Root Information
**GET** `/`

**Description:** اطلاعات کلی API و endpoints موجود

**Response:**
```json
{
  "name": "Yazdan Gold Price Bot API",
  "version": "1.0.0",
  "description": "Real-time gold price scraping and API service",
  "endpoints": {
    "health": "/health",
    "prices": "/api/prices",
    "scrape": "/api/scrape",
    "status": "/api/status"
  }
}
```

### 3. Scrape Prices
**POST** `/api/scrape`

**Description:** اسکرپ کردن قیمت‌های طلا از سایت هدف

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "قیمت‌ها با موفقیت اسکرپ شدند",
  "data": {
    "نقد خرد": {
      "buyPrice": 2500000,
      "sellPrice": 2550000,
      "timestamp": "2025-08-25T..."
    },
    "سکه تمام ۸۶": {
      "buyPrice": 3000000,
      "sellPrice": 3500000,
      "timestamp": "2025-08-25T..."
    },
    "نیم سکه ۸۶": {
      "buyPrice": 1500000,
      "sellPrice": 2000000,
      "timestamp": "2025-08-25T..."
    },
    "ربع سکه ۸۶": {
      "buyPrice": 800000,
      "sellPrice": 1200000,
      "timestamp": "2025-08-25T..."
    }
  },
  "timestamp": "2025-08-25T...",
  "count": 4
}
```

### 4. Get Prices
**GET** `/api/prices`

**Description:** دریافت قیمت‌های اسکرپ شده

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "نقد خرد": {
      "buyPrice": 2500000,
      "sellPrice": 2550000,
      "timestamp": "2025-08-25T..."
    },
    "سکه تمام ۸۶": {
      "buyPrice": 3000000,
      "sellPrice": 3500000,
      "timestamp": "2025-08-25T..."
    },
    "نیم سکه ۸۶": {
      "buyPrice": 1500000,
      "sellPrice": 2000000,
      "timestamp": "2025-08-25T..."
    },
    "ربع سکه ۸۶": {
      "buyPrice": 800000,
      "sellPrice": 1200000,
      "timestamp": "2025-08-25T..."
    }
  },
  "timestamp": "2025-08-25T...",
  "count": 4
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "هیچ قیمتی یافت نشد. ابتدا اسکرپ کنید",
  "error": "No prices available"
}
```

### 5. Scraping Status
**GET** `/api/status`

**Description:** وضعیت عملیات اسکرپ

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "idle|running|completed|failed",
    "lastUpdate": "2025-08-25T...",
    "pricesCount": 4,
    "uptime": 123.45
  }
}
```

## 🔧 Usage Examples

### JavaScript/TypeScript
```javascript
const API_BASE_URL = 'https://yazdan-price.liara.run';

// اسکرپ کردن قیمت‌ها
const scrapePrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error scraping prices:', error);
  }
};

// دریافت قیمت‌ها
const getPrices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prices`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting prices:', error);
  }
};

// بررسی وضعیت سرور
const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking health:', error);
  }
};
```

### Python
```python
import requests

API_BASE_URL = 'https://yazdan-price.liara.run'

# اسکرپ کردن قیمت‌ها
def scrape_prices():
    try:
        response = requests.post(f'{API_BASE_URL}/api/scrape')
        return response.json()
    except Exception as e:
        print(f'Error scraping prices: {e}')

# دریافت قیمت‌ها
def get_prices():
    try:
        response = requests.get(f'{API_BASE_URL}/api/prices')
        return response.json()
    except Exception as e:
        print(f'Error getting prices: {e}')
```

### cURL
```bash
# Health Check
curl https://yazdan-price.liara.run/health

# Get Prices
curl https://yazdan-price.liara.run/api/prices

# Scrape Prices
curl -X POST https://yazdan-price.liara.run/api/scrape

# Get Status
curl https://yazdan-price.liara.run/api/status
```

## ⚠️ Important Notes

1. **قیمت‌ها در حافظه داخلی ذخیره می‌شوند**
2. **هر بار اسکرپ = قیمت‌های جدید**
3. **Restart سرور = قیمت‌ها پاک می‌شوند**
4. **بدون تاریخچه = فقط قیمت‌های فعلی**
5. **پورت 3000 (Liara default)**
6. **بدون احراز هویت (API Key)**
7. **Rate Limiting: 100 requests per 15 minutes**

## 🚀 Deployment Info

- **Platform:** Liara
- **Port:** 3000
- **Build Location:** Iran
- **Status:** Active
- **Last Deploy:** 2025-08-25

## 📞 Support

برای سوالات و مشکلات با API، لطفاً با تیم توسعه تماس بگیرید.
