-- =========================================================================
-- DATABASE SCHEMA: Attendance, Leave, and Mission Management System
-- Database Engine: PostgreSQL / Google Cloud SQL
-- Designed for: Enterprise HR & Office Automation Systems (Solar Calendar Compatible)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom ENUMS for System Configuration
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'telework', 'pending_approval');
CREATE TYPE leave_category AS ENUM ('earned', 'sick', 'unpaid', 'other');
CREATE TYPE leave_status AS ENUM ('pending', 'pending_admin', 'approved', 'rejected');
CREATE TYPE mission_scope AS ENUM ('intra_city', 'inter_city', 'abroad');
CREATE TYPE vehicle_type AS ENUM ('personal', 'company', 'public');
CREATE TYPE mission_status AS ENUM ('pending', 'pending_admin', 'approved', 'rejected');

-- -------------------------------------------------------------------------
-- 1. TABLE: users (Personnel Metadata & Disciplinary Scores)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee', -- 'employee', 'internal_manager', 'admin'
    disciplinary_score INT NOT NULL DEFAULT 100, -- Base disciplinary score (Out of 100)
    allowed_leave_balance NUMERIC(4, 2) NOT NULL DEFAULT 2.5, -- Monthly accrued leave balance in days
    is_working BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address_restriction VARCHAR(45) NULL, -- Optional locked IP for secure check-ins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 2. TABLE: attendance_records (Daily Punch-in/Out & Geofencing)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    solar_date VARCHAR(10) NOT NULL, -- Format: YYYY/MM/DD (Persian Solar Date)
    check_in_time TIME NULL, -- Exact precise check-in time (HH:MM:SS)
    check_out_time TIME NULL, -- Exact precise check-out time (HH:MM:SS)
    
    -- Geofencing and Coordinates
    latitude NUMERIC(9, 6) NULL, -- GPS coordinate captured at click
    longitude NUMERIC(9, 6) NULL, -- GPS coordinate captured at click
    geofence_status attendance_status NOT NULL DEFAULT 'present', -- 'present', 'telework', etc.
    location_name VARCHAR(150) NOT NULL DEFAULT 'دفتر مرکزی هلدینگ',
    
    -- GPS Discrepancy & Manual Verification Request Workflow
    gps_discrepancy_detected BOOLEAN NOT NULL DEFAULT FALSE,
    manual_location_description TEXT NULL, -- Custom address entered during GPS outage
    verification_status VARCHAR(20) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    verified_by VARCHAR(50) REFERENCES users(id) NULL, -- Verified exclusively by Internal Manager / Admin
    
    -- Security & Device Fingerprint
    device_ip VARCHAR(45) NOT NULL, -- User's client IP address (IPv4 / IPv6)
    
    -- Disciplinary Computations
    delay_minutes INT NOT NULL DEFAULT 0,
    score_penalty INT NOT NULL DEFAULT 0, -- Deducted score points for this entry
    score_bonus INT NOT NULL DEFAULT 0, -- Awarded score points for punctual entry
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_daily_attendance UNIQUE(user_id, solar_date)
);

-- Indexes for performance
CREATE INDEX idx_attendance_user_date ON attendance_records(user_id, solar_date);
CREATE INDEX idx_attendance_verification ON attendance_records(verification_status);

-- -------------------------------------------------------------------------
-- 3. TABLE: leave_requests (Advanced Leaves with Substitutes)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL, -- 'daily' (روزانه) or 'hourly' (ساعتی)
    category leave_category NOT NULL DEFAULT 'earned', -- استحقاقی، استعلاجی، بدون حقوق
    
    -- Date & Time fields (Solar Calendar)
    start_date VARCHAR(10) NOT NULL, -- format: YYYY/MM/DD
    end_date VARCHAR(10) NULL, -- Required for 'daily' leaves
    start_time TIME NULL, -- Required for 'hourly' leaves
    end_time TIME NULL, -- Required for 'hourly' leaves
    
    reason TEXT NOT NULL, -- Detailed explanation
    rejection_comment TEXT NULL, -- Mandatory field if the request is rejected
    
    -- Workflow parameters (2-Tier Approval Chain)
    status leave_status NOT NULL DEFAULT 'pending',
    
    -- Organizational details
    substitute_user_id VARCHAR(50) REFERENCES users(id) NULL, -- Selected peer backup user
    medical_attachment_url TEXT NULL, -- Mandatory URL if category = 'sick'
    
    sent_to_payroll BOOLEAN NOT NULL DEFAULT FALSE, -- Set to TRUE upon final system admin approval
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for leaf queries
CREATE INDEX idx_leaves_user ON leave_requests(user_id);
CREATE INDEX idx_leaves_status ON leave_requests(status);
CREATE INDEX idx_leaves_dates ON leave_requests(start_date, end_date);

-- -------------------------------------------------------------------------
-- 4. TABLE: mission_requests (Missions & Post-Mission Compliance Reports)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mission_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL, -- 'daily' or 'hourly'
    scope_type mission_scope NOT NULL DEFAULT 'intra_city', -- درون‌شهری، بین‌شهری، خارجی
    
    -- Destination & Logistics
    destination_address TEXT NOT NULL, -- Detailed destination address
    destination_company VARCHAR(150) NULL, -- Name of target organization
    approximate_coordinates VARCHAR(50) NULL, -- Approximate coordinates
    vehicle_type vehicle_type NOT NULL DEFAULT 'personal', -- وسیله نقلیه
    
    -- Financial Configuration
    requested_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Pre-trip advance budget / تنخواه درخواستی
    
    -- Date & Time Configuration
    start_date VARCHAR(10) NOT NULL, -- format: YYYY/MM/DD
    end_date VARCHAR(10) NULL, -- For daily missions
    start_time TIME NULL, -- For hourly missions
    end_time TIME NULL, -- For hourly missions
    
    reason TEXT NOT NULL, -- Mission objectives
    rejection_comment TEXT NULL, -- Mandatory comment upon rejection
    
    -- Workflow Status
    status mission_status NOT NULL DEFAULT 'pending',
    sent_to_payroll BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Post-Mission Disciplinary Report Submission System
    is_report_submitted BOOLEAN NOT NULL DEFAULT FALSE, -- Flag indicating completion
    report_content TEXT NULL, -- Mandatory report content submitted by personnel post-travel
    report_submitted_at TIMESTAMP WITH TIME ZONE NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for mission queries
CREATE INDEX idx_missions_user ON mission_requests(user_id);
CREATE INDEX idx_missions_status ON mission_requests(status);
CREATE INDEX idx_missions_compliance ON mission_requests(user_id, is_report_submitted);

-- -------------------------------------------------------------------------
-- 5. TABLE: system_notifications (Instant Slack/In-App Alerts)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_role VARCHAR(50) NOT NULL, -- e.g., 'internal_manager' or 'admin'
    sender_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
