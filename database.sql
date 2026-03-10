-- MigrateHub PostgreSQL Database Schema
-- Production-Ready for SaaS Migration CRM

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agencies Table
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    contact_email VARCHAR(255),
    contact_number VARCHAR(50),
    address TEXT,
    tier VARCHAR(20) DEFAULT 'FREE', -- FREE, PRO, ENTERPRISE
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, PENDING, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL, -- SUPERADMIN, ADMIN, AGENT, USER
    phone_number VARCHAR(50),
    whatsapp_number VARCHAR(50),
    address TEXT,
    mailing_address TEXT,
    gender VARCHAR(20),
    age INTEGER,
    date_of_birth DATE,
    nationality VARCHAR(100),
    marital_status VARCHAR(20),
    profile_photo TEXT, -- URL to storage
    
    -- Client Specific Fields
    target_country VARCHAR(100),
    visa_type VARCHAR(100),
    education_level VARCHAR(100),
    english_test_score VARCHAR(50),
    passport_number VARCHAR(100),
    application_status VARCHAR(50) DEFAULT 'REGISTRATION',
    
    -- Agent Specific Fields
    agency_name VARCHAR(255),
    license_no VARCHAR(100),
    experience_years INTEGER,
    countries_supported TEXT[],
    languages_spoken TEXT[],
    bio TEXT,
    
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_by_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'UPLOADED', -- UPLOADED, UNDER_REVIEW, APPROVED, REJECTED, CORRECTION_NEEDED
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    file_attachment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meetings Table
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60, -- minutes
    meeting_link TEXT,
    type VARCHAR(50) DEFAULT 'ZOOM', -- ZOOM, GOOGLE_MEET, WHATSAPP, IN_PERSON
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, RESCHEDULE_REQUESTED, DECLINED, COMPLETED
    reschedule_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices/Payments Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, CANCELLED
    payment_method VARCHAR(50), -- STRIPE, PAYPAL, CASH, BANK_TRANSFER
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global Settings / Metadata
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE, -- NULL for global system defaults
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, key)
);

-- Payment Gateways Credentials
CREATE TABLE payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- STRIPE, PAYPAL, BANK, CASH
    is_active BOOLEAN DEFAULT FALSE,
    credentials JSONB NOT NULL, -- Encrypted storage recommended in prod
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, type)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_agencies_modtime BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON documents FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_meetings_modtime BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_system_settings_modtime BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_payment_gateways_modtime BEFORE UPDATE ON payment_gateways FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Sample Data Injection (Matches Front-end Defaults)
INSERT INTO agencies (name, license_number, contact_email, tier, status)
VALUES ('Alpha Migration Experts', 'AME-2024-001', 'admin@alphamigration.com', 'ENTERPRISE', 'ACTIVE');

-- Insert Super Admin (Password: eternals - Hash for representation only)
INSERT INTO users (full_name, email, password_hash, role, nationality)
VALUES ('Akil Superadmin', 'akil', '$2b$12$Kj00G.f9/W.P5u9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9.9', 'SUPERADMIN', 'Global');
