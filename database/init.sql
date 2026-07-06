-- File: GuardianAI/database/init.sql
-- Database initialization script for GuardianAI system

-- Create database (if using PostgreSQL)
CREATE DATABASE guardianai;

-- Connect to the database before running these commands:

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cameras table  
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT,
    ip_address VARCHAR(50),
    port INTEGER,
    username VARCHAR(50),
    password VARCHAR(255), -- In production: encrypted
    stream_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id),
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'ignored')),
    summary TEXT,
    detected_objects JSONB,
    severity_score FLOAT,
    confidence_score FLOAT,
    screenshot_path VARCHAR(255),
    video_clip_path VARCHAR(255),
    resolution VARCHAR(20),
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    camera_id INTEGER REFERENCES cameras(id),
    alert_type VARCHAR(20) CHECK (alert_type IN ('email', 'sms', 'telegram', 'webhook', 'dashboard')),
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    priority VARCHAR(20)
);

-- Create incident_reports table
CREATE TABLE IF NOT EXISTS incident_reports (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    generator_agent VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_type VARCHAR(50),
    file_path VARCHAR(255),
    content_summary TEXT
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20) NOT NULL,
    source VARCHAR(50),
    message TEXT NOT NULL,
    details JSONB
);

-- Create config_settings table
CREATE TABLE IF NOT EXISTS config_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cameras_location ON cameras(location);
CREATE INDEX IF NOT EXISTS idx_incidents_camera_time ON incidents(camera_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status_time ON incidents(status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_time ON alerts(is_sent, sent_at DESC);

-- Insert default configuration values
INSERT INTO config_settings (key, value, description) VALUES 
('system_name', 'GuardianAI', 'Name of the system'),
('default_threat_threshold', '0.75', 'Minimum confidence for threat detection'),
('max_alerts_per_hour', '100', 'Maximum alerts allowed per hour to prevent spam'),
('notification_timeout_seconds', '30', 'Timeout in seconds for notification attempts');

-- Insert default admin user (hashed password: "admin123")
INSERT INTO users (username, email, hashed_password, role) VALUES 
('admin', 'admin@guardianai.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin');

-- Insert sample camera (in production, this would be done via API)
INSERT INTO cameras (name, location, stream_url) VALUES 
('Main Entrance', 'Building A - Main Entrance', 'rtsp://camera1/stream'),
('Parking Lot', 'Building B - Parking Area', 'rtsp://camera2/stream');
