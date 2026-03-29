CREATE DATABASE IF NOT EXISTS migration_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE migration_crm;

-- Legacy compatibility table. New deployments use normalized tables below.
CREATE TABLE IF NOT EXISTS app_state (
  id TINYINT UNSIGNED PRIMARY KEY,
  state_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(state_json))
);

INSERT INTO app_state (id, state_json)
VALUES (1, JSON_OBJECT())
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(96) PRIMARY KEY,
  role VARCHAR(32) NOT NULL,
  email VARCHAR(255) NULL,
  full_name VARCHAR(255) NULL,
  approval_status VARCHAR(32) NULL,
  agency_id VARCHAR(96) NULL,
  assigned_agent_id VARCHAR(96) NULL,
  requested_agent_id VARCHAR(96) NULL,
  application_status VARCHAR(64) NULL,
  registration_date DATETIME NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_users_role (role),
  INDEX idx_users_agency_id (agency_id),
  INDEX idx_users_assigned_agent_id (assigned_agent_id),
  INDEX idx_users_requested_agent_id (requested_agent_id),
  INDEX idx_users_email (email)
);

CREATE TABLE IF NOT EXISTS agencies (
  id VARCHAR(96) PRIMARY KEY,
  owner_id VARCHAR(96) NULL,
  name VARCHAR(255) NULL,
  subscription_plan VARCHAR(32) NULL,
  status VARCHAR(32) NULL,
  joined_at DATETIME NULL,
  revenue DECIMAL(14,2) NULL,
  total_clients INT NULL,
  total_agents INT NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_agencies_owner_id (owner_id),
  INDEX idx_agencies_status (status)
);

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(96) NULL,
  uploaded_by_id VARCHAR(96) NULL,
  name VARCHAR(255) NULL,
  category VARCHAR(128) NULL,
  status VARCHAR(64) NULL,
  uploaded_at DATETIME NULL,
  file_url TEXT NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_documents_user_id (user_id),
  INDEX idx_documents_uploaded_by_id (uploaded_by_id),
  INDEX idx_documents_status (status),
  INDEX idx_documents_category (category),
  INDEX idx_documents_uploaded_at (uploaded_at)
);

CREATE TABLE IF NOT EXISTS library_documents (
  id VARCHAR(96) PRIMARY KEY,
  uploaded_by_id VARCHAR(96) NULL,
  name VARCHAR(255) NULL,
  category VARCHAR(128) NULL,
  uploaded_at DATETIME NULL,
  file_url TEXT NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_library_documents_uploaded_by_id (uploaded_by_id),
  INDEX idx_library_documents_category (category),
  INDEX idx_library_documents_uploaded_at (uploaded_at)
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(96) PRIMARY KEY,
  sender_id VARCHAR(96) NULL,
  receiver_id VARCHAR(96) NULL,
  timestamp_at DATETIME NULL,
  is_read TINYINT(1) NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_messages_sender_id (sender_id),
  INDEX idx_messages_receiver_id (receiver_id),
  INDEX idx_messages_timestamp_at (timestamp_at),
  INDEX idx_messages_is_read (is_read)
);

CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR(96) PRIMARY KEY,
  agent_id VARCHAR(96) NULL,
  user_id VARCHAR(96) NULL,
  title VARCHAR(255) NULL,
  type VARCHAR(32) NULL,
  status VARCHAR(64) NULL,
  session_outcome VARCHAR(64) NULL,
  start_time DATETIME NULL,
  duration INT NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_meetings_agent_id (agent_id),
  INDEX idx_meetings_user_id (user_id),
  INDEX idx_meetings_status (status),
  INDEX idx_meetings_start_time (start_time)
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(96) NULL,
  amount DECIMAL(14,2) NULL,
  currency VARCHAR(16) NULL,
  status VARCHAR(32) NULL,
  method VARCHAR(32) NULL,
  payment_date DATETIME NULL,
  description VARCHAR(512) NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_payments_user_id (user_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_method (method),
  INDEX idx_payments_currency (currency),
  INDEX idx_payments_payment_date (payment_date)
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(96) PRIMARY KEY,
  user_id VARCHAR(96) NULL,
  type VARCHAR(64) NULL,
  title VARCHAR(255) NULL,
  is_read TINYINT(1) NULL,
  link_tab VARCHAR(64) NULL,
  timestamp_at DATETIME NULL,
  payload_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(payload_json)),
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_is_read (is_read),
  INDEX idx_notifications_timestamp_at (timestamp_at)
);

CREATE TABLE IF NOT EXISTS state_kv (
  state_key VARCHAR(128) PRIMARY KEY,
  value_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (JSON_VALID(value_json))
);