-- Migration: Add latitude and longitude to devices table
-- Run this if the database already exists

ALTER TABLE devices ADD COLUMN IF NOT EXISTS latitude DOUBLE DEFAULT NULL AFTER field_id;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS longitude DOUBLE DEFAULT NULL AFTER latitude;
