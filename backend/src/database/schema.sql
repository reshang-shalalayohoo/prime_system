-- PRIME System Database Schema
-- MySQL (XAMPP / phpMyAdmin)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('farmer', 'admin') NOT NULL DEFAULT 'farmer',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500),
  area_hectares DOUBLE,
  crop_type VARCHAR(100) DEFAULT 'Palay',
  growth_stage VARCHAR(100) DEFAULT 'Vegetative',
  user_id INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_fields_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_code VARCHAR(100) NOT NULL UNIQUE,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  field_id INT,
  latitude DOUBLE DEFAULT NULL,
  longitude DOUBLE DEFAULT NULL,
  status ENUM('online', 'offline', 'fault') NOT NULL DEFAULT 'offline',
  battery_level DOUBLE DEFAULT 100.0,
  last_communication DATETIME,
  last_heartbeat DATETIME,
  firebase_uid VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (field_id) REFERENCES fields(id),
  INDEX idx_devices_field_id (field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sensor_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  field_id INT NOT NULL,
  soil_moisture DOUBLE NOT NULL,
  water_level DOUBLE NOT NULL,
  nitrogen DOUBLE NOT NULL,
  phosphorus DOUBLE NOT NULL,
  potassium DOUBLE NOT NULL,
  is_valid TINYINT(1) NOT NULL DEFAULT 1,
  raw_data TEXT,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (field_id) REFERENCES fields(id),
  INDEX idx_sensor_readings_device_id (device_id),
  INDEX idx_sensor_readings_field_id (field_id),
  INDEX idx_sensor_readings_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reference_values (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nutrient ENUM('nitrogen', 'phosphorus', 'potassium') NOT NULL,
  growth_stage VARCHAR(100) NOT NULL,
  min_sufficient DOUBLE NOT NULL,
  max_sufficient DOUBLE NOT NULL,
  unit VARCHAR(50) DEFAULT 'mg/kg',
  updated_by INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id),
  UNIQUE KEY uq_nutrient_stage (nutrient, growth_stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sensor_reading_id INT NOT NULL,
  field_id INT NOT NULL,
  n_status ENUM('Deficient', 'Sufficient', 'Excess') NOT NULL,
  p_status ENUM('Deficient', 'Sufficient', 'Excess') NOT NULL,
  k_status ENUM('Deficient', 'Sufficient', 'Excess') NOT NULL,
  fertilizer_type VARCHAR(255),
  application_rate VARCHAR(100),
  recommendation_text TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sensor_reading_id) REFERENCES sensor_readings(id),
  FOREIGN KEY (field_id) REFERENCES fields(id),
  INDEX idx_recommendations_field_id (field_id),
  INDEX idx_recommendations_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fertilizer_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  user_id INT NOT NULL,
  fertilizer_type VARCHAR(255) NOT NULL,
  amount_kg DOUBLE NOT NULL,
  notes TEXT,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (field_id) REFERENCES fields(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT,
  user_id INT,
  type ENUM('nutrient_deficiency', 'nutrient_excess', 'invalid_reading', 'device_offline', 'system') NOT NULL,
  message TEXT NOT NULL,
  severity ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'warning',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (field_id) REFERENCES fields(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_alerts_user_id (user_id),
  INDEX idx_alerts_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  details TEXT,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_activity_logs_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
