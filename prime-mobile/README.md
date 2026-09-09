# PRIME Mobile — Palay Resource and Irrigation Monitoring for Fertilizer Efficiency

PRIME Mobile is the cross-platform React Native / Expo application for the **PRIME System**. It enables farmers and administrators to monitor real-time soil nutrient levels (NPK), irrigation depth, soil moisture, and receive precision fertilizer recommendations directly on mobile devices.

---

## 🚀 Key Features

### 🌾 Farmer Features
- **Real-Time Sensor Monitoring:** Live telemetry pings for Nitrogen, Phosphorus, Potassium, pH, Soil Moisture, and Water Level.
- **Precision Fertilizer Recommendations:** Automated stage-specific advice calculated for rice (Palay) growth phases.
- **Application Logging:** Record manual or recommended fertilizer applications.
- **Field Alerts:** Automated high/low threshold alerts with severity indicators.
- **Seasonal Reports:** Comprehensive summary of seasonal application metrics and efficiency index.

### 🛡️ Admin Features
- **System Executive Dashboard:** Overview of connected nodes, active farmers, and system health.
- **IoT Node Provisioning:** Provision, configure, and monitor ESP32 sensor hardware.
- **NPK Reference Threshold Calibration:** Fine-tune target nutrient ranges per crop stage.
- **User Account Management:** Register and manage farmers and administrators.
- **Audit Logs:** Full system security and activity audit trails.

---

## 🛠️ Technology Stack
- **Framework:** Expo (React Native) with Expo Router (File-based navigation)
- **Styling:** NativeWind / Tailwind CSS & StyleSheet
- **Networking:** Axios API Client with interceptors
- **Real-Time Data:** Socket.io Client for live telemetry push
- **State & Storage:** React Context API + Expo SecureStore
- **Icons:** @expo/vector-icons (Ionicons)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file or modify `.env.example`:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000/api
```

### 3. Run Development Server
```bash
npx expo start
```

Use **Expo Go** on Android/iOS devices or press `a` for Android Emulator / `i` for iOS Simulator.
