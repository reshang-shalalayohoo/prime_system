# PRIME System — Setup Guide

## Prerequisites

- **Node.js** v18+ and npm
- **XAMPP** (with MySQL/Apache) — [Download](https://www.apachefriends.org/)
- **Firebase** account — [Console](https://console.firebase.google.com/)
- **Arduino IDE** (for ESP32 firmware) — [Download](https://www.arduino.cc/en/software)

---

## 1. MySQL Database Setup (XAMPP / phpMyAdmin)

### 1.1 Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** modules
3. Verify MySQL is running on port **3306**

### 1.2 Create the Database

**Option A — Automatic (recommended):**

The seed script creates the database automatically:

```bash
cd backend
npm run seed
```

**Option B — Manual via phpMyAdmin:**

1. Open phpMyAdmin: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. Click **"New"** in the left sidebar
3. Enter database name: `prime_db`
4. Set collation to: `utf8mb4_unicode_ci`
5. Click **"Create"**
6. Select the `prime_db` database
7. Click the **"Import"** tab
8. Click **"Choose File"** and select: `backend/src/database/schema.sql`
9. Click **"Go"** to import

This creates all 9 tables:
- `users` — Farmer and Admin accounts
- `fields` — Rice paddy field records
- `devices` — ESP32 sensor nodes
- `sensor_readings` — Soil moisture, water level, NPK values
- `reference_values` — SSNM/NOPT thresholds per growth stage
- `recommendations` — Fertilizer recommendations
- `fertilizer_logs` — Fertilizer application records
- `alerts` — System and nutrient alerts
- `activity_logs` — User activity audit trail

---

## 2. Backend Configuration

### 2.1 Environment Variables

Copy the example and fill in your values:

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=3000
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=http://localhost:5173

# MySQL (XAMPP defaults)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=prime_db
MYSQL_USER=root
MYSQL_PASSWORD=

# Firebase (see Section 3)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# Device monitoring
DEVICE_OFFLINE_TIMEOUT_MS=300000
DEVICE_CHECK_INTERVAL_MS=60000
```

> **Note:** XAMPP's default MySQL user is `root` with an empty password. For production, create a dedicated user with a strong password.

### 2.2 Install Dependencies & Seed

```bash
cd backend
npm install
npm run seed
```

### 2.3 Start the Backend

```bash
npm start
# or for development with auto-reload:
npm run dev
```

Verify: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 3. Firebase Setup (ESP32 Connection Monitoring)

Firebase is used **only** for ESP32 sensor device heartbeat/connection verification. The main application database remains MySQL.

### 3.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it (e.g., `prime-system`)
3. Disable Google Analytics (optional)
4. Click **"Create project"**

### 3.2 Enable Realtime Database

1. In your Firebase project, go to **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose your region
4. Start in **Test mode** (for development) or configure security rules:

```json
{
  "rules": {
    "devices": {
      "$deviceCode": {
        "heartbeat": {
          ".read": true,
          ".write": "auth != null || data.child('api_key').exists()"
        }
      }
    }
  }
}
```

### 3.3 Generate Service Account Key

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. From the JSON, copy these values into your `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
5. Set `FIREBASE_DATABASE_URL` to your RTDB URL (shown in the Realtime Database page)

> **IMPORTANT:** Never commit the service account JSON file to version control. Keep it secure.

### 3.4 Firebase Data Structure

The ESP32 writes heartbeat data to this path:

```
/devices/{device_code}/heartbeat
```

Example for device `ESP32-001`:

```json
{
  "devices": {
    "ESP32-001": {
      "heartbeat": {
        "status": "online",
        "timestamp": 1693500000000,
        "battery_level": 87.5,
        "sensor_status": "ok",
        "firmware_version": "1.0.0"
      }
    }
  }
}
```

---

## 4. ESP32 Configuration

### 4.1 Required Libraries

Install in Arduino IDE:
- **Firebase Arduino Client Library for ESP8266 and ESP32** by Mobizt
- **WiFi** (built-in for ESP32)

### 4.2 ESP32 Firmware

See `docs/esp32_example.ino` for a complete reference sketch.

Key configuration on the ESP32:
- **WiFi SSID/Password** — your local network
- **Firebase API Key** — from Firebase Console → Project Settings → General → Web API Key
- **Firebase Database URL** — your RTDB URL
- **Device Code** — must match a device registered in PRIME (e.g., `ESP32-001`)
- **Device API Key** — the API key generated when registering the device in PRIME

### 4.3 Heartbeat Sending

The ESP32 should send a heartbeat to Firebase every **30–60 seconds**:

```
Path: /devices/ESP32-001/heartbeat
Data: {
  "status": "online",
  "timestamp": <unix_ms>,
  "battery_level": <0-100>,
  "sensor_status": "ok"
}
```

---

## 5. How Device Status Works

### Connection Flow

```
ESP32 → Firebase RTDB → PRIME Backend Listener → MySQL → Socket.io → Frontend
```

### Status Determination

| Status | Condition |
|--------|-----------|
| **Online** | Last heartbeat within the configured timeout (default 5 min) |
| **Offline** | No heartbeat received within the timeout period |
| **Fault** | Heartbeat received with `sensor_status: "fault"` |

### Timeout Configuration

Set via environment variables:
- `DEVICE_OFFLINE_TIMEOUT_MS` — milliseconds before marking offline (default: `300000` = 5 min)
- `DEVICE_CHECK_INTERVAL_MS` — how often the backend checks for timeouts (default: `60000` = 1 min)

### Key Concepts (Kept Separate)

1. **Device connectivity** — Is the ESP32 communicating? (Firebase heartbeat)
2. **Sensor health** — Are the sensors providing valid readings? (validation in ingestion pipeline)
3. **Sensor data** — What are the actual soil moisture, water level, NPK values? (sensor readings)

---

## 6. Testing the Complete Workflow

### 6.1 Test MySQL Connection

```bash
cd backend
npm start
# Look for: ✅ MySQL connected successfully
```

### 6.2 Test Authentication

```bash
# Login as farmer
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"farmer1\",\"password\":\"password123\"}"

# Login as admin
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin1\",\"password\":\"password123\"}"
```

### 6.3 Test Sensor Ingestion

```bash
curl -X POST http://localhost:3000/api/sensors/readings ^
  -H "Content-Type: application/json" ^
  -H "x-device-api-key: prime-device-key-001-abc123" ^
  -d "{\"soil_moisture\":65.2,\"water_level\":45.8,\"nitrogen\":28.5,\"phosphorus\":22.1,\"potassium\":38.7}"
```

### 6.4 Test Firebase Heartbeat

To simulate an ESP32 heartbeat without hardware, write directly to Firebase RTDB:

1. Open Firebase Console → Realtime Database
2. Navigate to `/devices/ESP32-001/heartbeat`
3. Set the following JSON:

```json
{
  "status": "online",
  "timestamp": 1693500000000,
  "battery_level": 85.0,
  "sensor_status": "ok"
}
```

4. Check the backend console for: `📡 Device ESP32-001: offline → online`
5. Check Device Monitoring page — status should update to "online"

### 6.5 Test Offline Detection

1. Stop updating the Firebase heartbeat
2. Wait for the timeout period (5 minutes by default)
3. The backend should log: `⏰ Device ESP32-001 timed out`
4. Device Monitoring should show "offline"

---

## 7. Frontend

The frontend requires **no changes**. Start it normally:

```bash
cd frontend
npm install
npm run dev
```

Access: [http://localhost:5173](http://localhost:5173)

Demo accounts:
- **Farmer:** `farmer1` / `password123`
- **Admin:** `admin1` / `password123`

---

## 8. Architecture Summary

```
Frontend (React + Vite + Tailwind CSS + Recharts)
  ↓ REST API / Socket.io
Backend (Node.js + Express.js + Socket.io)
  ↙                    ↘
MySQL / phpMyAdmin      Firebase RTDB
(Primary database)      (ESP32 heartbeat only)
                            ↑
                        ESP32 Sensor Node
                        (Soil Moisture + Water Level + NPK)
```
