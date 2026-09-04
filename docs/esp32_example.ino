/**
 * PRIME System — ESP32 Sensor Node Example Sketch
 * 
 * This sketch demonstrates how an ESP32 connects to:
 * 1. Firebase Realtime Database — for heartbeat/connection status
 * 2. PRIME Backend API — for sending sensor readings
 * 
 * Hardware Requirements:
 * - ESP32 development board
 * - Soil moisture sensor
 * - Water level sensor
 * - NPK sensor (or simulated values)
 * 
 * Required Libraries (install via Arduino Library Manager):
 * - Firebase Arduino Client Library for ESP8266 and ESP32 (by Mobizt)
 * - WiFi (built-in)
 * - HTTPClient (built-in)
 * - ArduinoJson (by Benoit Blanchon)
 * 
 * IMPORTANT: Replace all placeholder values below with your actual credentials.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Firebase_ESP_Client.h>
#include <ArduinoJson.h>

// Provide the token generation process info
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info
#include "addons/RTDBHelper.h"

// ============================================================
// CONFIGURATION — Replace with your actual values
// ============================================================

// WiFi
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// Firebase
#define FIREBASE_API_KEY     "YOUR_FIREBASE_WEB_API_KEY"
#define FIREBASE_DB_URL      "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com"

// PRIME Backend
#define PRIME_API_URL        "http://YOUR_PRIME_SERVER_IP:3000/api/sensors/readings"
#define PRIME_DEVICE_API_KEY "prime-device-key-001-abc123"  // From PRIME device registration

// Device Identity
#define DEVICE_CODE          "ESP32-001"

// Timing
#define HEARTBEAT_INTERVAL_MS   30000   // Send heartbeat every 30 seconds
#define READING_INTERVAL_MS     300000  // Send sensor reading every 5 minutes

// ============================================================
// GLOBAL VARIABLES
// ============================================================

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long lastHeartbeat = 0;
unsigned long lastReading = 0;
bool firebaseReady = false;

// ============================================================
// SETUP
// ============================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌾 PRIME Sensor Node Starting...");
  Serial.print("   Device: ");
  Serial.println(DEVICE_CODE);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("   Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("   Connected! IP: ");
  Serial.println(WiFi.localIP());

  // Configure Firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DB_URL;

  // Anonymous authentication (or configure with email/password)
  auth.user.email = "";
  auth.user.password = "";

  // Token status callback
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  // Wait for Firebase to be ready
  Serial.print("   Connecting to Firebase");
  unsigned long startAttempt = millis();
  while (!Firebase.ready() && millis() - startAttempt < 10000) {
    delay(100);
    Serial.print(".");
  }
  
  if (Firebase.ready()) {
    firebaseReady = true;
    Serial.println("\n   ✅ Firebase connected");
  } else {
    Serial.println("\n   ⚠️ Firebase connection failed — will retry");
  }

  Serial.println("   🌾 PRIME Sensor Node Ready\n");
}

// ============================================================
// MAIN LOOP
// ============================================================

void loop() {
  unsigned long now = millis();

  // Send heartbeat to Firebase
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS || lastHeartbeat == 0) {
    sendHeartbeat();
    lastHeartbeat = now;
  }

  // Send sensor reading to PRIME API
  if (now - lastReading >= READING_INTERVAL_MS || lastReading == 0) {
    sendSensorReading();
    lastReading = now;
  }

  delay(1000);
}

// ============================================================
// HEARTBEAT — Sent to Firebase Realtime Database
// ============================================================

void sendHeartbeat() {
  if (!Firebase.ready()) {
    Serial.println("   ⚠️ Firebase not ready — skipping heartbeat");
    return;
  }

  String path = String("/devices/") + DEVICE_CODE + "/heartbeat";

  FirebaseJson json;
  json.set("status", "online");
  json.set("timestamp", (unsigned long)time(nullptr) * 1000); // Unix ms
  json.set("battery_level", readBatteryLevel());
  json.set("sensor_status", checkSensorHealth() ? "ok" : "fault");
  json.set("firmware_version", "1.0.0");

  if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
    Serial.println("   💓 Heartbeat sent to Firebase");
  } else {
    Serial.print("   ❌ Heartbeat failed: ");
    Serial.println(fbdo.errorReason().c_str());
  }
}

// ============================================================
// SENSOR READING — Sent to PRIME Backend API
// ============================================================

void sendSensorReading() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("   ⚠️ WiFi disconnected — skipping reading");
    return;
  }

  // Read sensors
  float soilMoisture = readSoilMoisture();
  float waterLevel   = readWaterLevel();
  float nitrogen     = readNitrogen();
  float phosphorus   = readPhosphorus();
  float potassium    = readPotassium();

  Serial.printf("   📊 Reading: Moisture=%.1f%%, Water=%.1f%%, N=%.1f, P=%.1f, K=%.1f\n",
    soilMoisture, waterLevel, nitrogen, phosphorus, potassium);

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["soil_moisture"] = soilMoisture;
  doc["water_level"]   = waterLevel;
  doc["nitrogen"]      = nitrogen;
  doc["phosphorus"]    = phosphorus;
  doc["potassium"]     = potassium;

  String payload;
  serializeJson(doc, payload);

  // Send to PRIME API
  HTTPClient http;
  http.begin(PRIME_API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-api-key", PRIME_DEVICE_API_KEY);

  int httpCode = http.POST(payload);

  if (httpCode == 201) {
    Serial.println("   ✅ Sensor reading sent to PRIME");
    String response = http.getString();
    Serial.print("   Response: ");
    Serial.println(response);
  } else {
    Serial.printf("   ❌ PRIME API error: HTTP %d\n", httpCode);
    if (httpCode > 0) {
      Serial.println(http.getString());
    }
  }

  http.end();
}

// ============================================================
// SENSOR FUNCTIONS
// Replace these with your actual sensor reading code
// ============================================================

float readSoilMoisture() {
  // Example: Read from analog pin, convert to percentage
  // int raw = analogRead(34);
  // return map(raw, 4095, 0, 0, 100); // Adjust mapping for your sensor
  return 55.0 + random(-100, 100) / 10.0; // Simulated value: 45-65%
}

float readWaterLevel() {
  // Example: Read from analog or digital sensor
  // int raw = analogRead(35);
  // return map(raw, 0, 4095, 0, 100);
  return 40.0 + random(-100, 100) / 10.0; // Simulated value: 30-50%
}

float readNitrogen() {
  // Example: Read from NPK sensor via RS485/Modbus
  // return readModbusRegister(NITROGEN_REGISTER);
  return 35.0 + random(-150, 150) / 10.0; // Simulated value: 20-50 mg/kg
}

float readPhosphorus() {
  // return readModbusRegister(PHOSPHORUS_REGISTER);
  return 25.0 + random(-100, 100) / 10.0; // Simulated value: 15-35 mg/kg
}

float readPotassium() {
  // return readModbusRegister(POTASSIUM_REGISTER);
  return 30.0 + random(-100, 100) / 10.0; // Simulated value: 20-40 mg/kg
}

float readBatteryLevel() {
  // Example: Read battery voltage from voltage divider
  // float voltage = analogRead(36) * (3.3 / 4095.0) * 2.0;
  // return constrain(map(voltage * 100, 320, 420, 0, 100), 0, 100);
  return 85.0 + random(-50, 50) / 10.0; // Simulated value: 80-90%
}

bool checkSensorHealth() {
  // Return false if any sensor is malfunctioning
  // Example: Check if sensors return values within expected ranges
  return true; // Simulated: all sensors healthy
}
