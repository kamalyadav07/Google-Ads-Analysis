-- ============================================================
-- Marketing & Landing Page Intelligence Platform
-- Migration 001: Initial Core Schema
-- ============================================================

-- 1. Schema Migration History Tracker
CREATE TABLE IF NOT EXISTS `_migrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Landing Pages Directory (CCTV, NOC, Cyber, VC, Data Center, Networking)
CREATE TABLE IF NOT EXISTS `landing_pages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `target_cpl` DECIMAL(10, 2) DEFAULT 500.00,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Google Ads Campaigns
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `campaign_id` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(32) DEFAULT 'ENABLED',
  `channel_type` VARCHAR(64) DEFAULT 'SEARCH',
  `daily_budget` DECIMAL(12, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Google Ads Ad Groups
CREATE TABLE IF NOT EXISTS `ad_groups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad_group_id` VARCHAR(64) NOT NULL UNIQUE,
  `campaign_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(32) DEFAULT 'ENABLED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_adgroup_campaign` (`campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Google Ads Creatives
CREATE TABLE IF NOT EXISTS `ads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad_id` VARCHAR(64) NOT NULL UNIQUE,
  `ad_group_id` VARCHAR(64) NOT NULL,
  `headline` VARCHAR(255),
  `description` TEXT,
  `final_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ads_adgroup` (`ad_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Google Ads Keywords
CREATE TABLE IF NOT EXISTS `keywords` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `keyword_id` VARCHAR(64) NOT NULL UNIQUE,
  `ad_group_id` VARCHAR(64) NOT NULL,
  `keyword_text` VARCHAR(255) NOT NULL,
  `match_type` VARCHAR(32) DEFAULT 'EXACT',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_keywords_adgroup` (`ad_group_id`),
  INDEX `idx_keyword_text` (`keyword_text`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Google Ads Daily Aggregated Metrics
CREATE TABLE IF NOT EXISTS `ad_metrics_daily` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATE NOT NULL,
  `campaign_id` VARCHAR(64) NOT NULL,
  `ad_group_id` VARCHAR(64) DEFAULT NULL,
  `impressions` INT DEFAULT 0,
  `clicks` INT DEFAULT 0,
  `spend` DECIMAL(12, 2) DEFAULT 0.00,
  `cpc` DECIMAL(8, 2) DEFAULT 0.00,
  `ctr` DECIMAL(5, 4) DEFAULT 0.0000,
  `conversions` INT DEFAULT 0,
  `cost_per_conversion` DECIMAL(10, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_date_campaign_adgroup` (`date`, `campaign_id`, `ad_group_id`),
  INDEX `idx_metrics_date_camp` (`date`, `campaign_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Visitors Identity (Anonymized Tokens)
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `visitor_token` VARCHAR(64) NOT NULL UNIQUE,
  `first_seen_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_seen_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `device_category` ENUM('mobile', 'tablet', 'desktop') DEFAULT 'desktop',
  `device_model` VARCHAR(128) DEFAULT NULL,
  `browser` VARCHAR(64) DEFAULT NULL,
  `os` VARCHAR(64) DEFAULT NULL,
  `screen_width` INT DEFAULT NULL,
  `screen_height` INT DEFAULT NULL,
  `city` VARCHAR(128) DEFAULT 'Delhi',
  `state` VARCHAR(128) DEFAULT 'Delhi NCR',
  `country` VARCHAR(64) DEFAULT 'India',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_visitor_device` (`device_category`),
  INDEX `idx_visitor_geo` (`city`, `state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Visitor Sessions (Acquisition & Engagement)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL UNIQUE,
  `visitor_id` INT DEFAULT NULL,
  `landing_page_slug` VARCHAR(64) NOT NULL,
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL DEFAULT NULL,
  `duration_seconds` INT DEFAULT 0,
  `max_scroll_depth` INT DEFAULT 0,
  `is_bounce` TINYINT(1) DEFAULT 1,
  `is_engaged` TINYINT(1) DEFAULT 0,
  `referrer` VARCHAR(500) DEFAULT NULL,
  `gclid` VARCHAR(255) DEFAULT NULL,
  `utm_source` VARCHAR(128) DEFAULT NULL,
  `utm_medium` VARCHAR(128) DEFAULT NULL,
  `utm_campaign` VARCHAR(128) DEFAULT NULL,
  `utm_term` VARCHAR(128) DEFAULT NULL,
  `utm_content` VARCHAR(128) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sessions_gclid` (`gclid`),
  INDEX `idx_sessions_page_time` (`landing_page_slug`, `started_at`),
  INDEX `idx_sessions_campaign` (`utm_campaign`),
  INDEX `idx_sessions_started` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Behavioral & Telemetry Events
CREATE TABLE IF NOT EXISTS `events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `event_type` VARCHAR(64) NOT NULL,
  `element_id` VARCHAR(128) DEFAULT NULL,
  `element_text` VARCHAR(255) DEFAULT NULL,
  `element_location` VARCHAR(64) DEFAULT 'middle',
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_events_session_type` (`session_id`, `event_type`),
  INDEX `idx_events_type_time` (`event_type`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Form Field-Level Behavioral State & Abandonment
CREATE TABLE IF NOT EXISTS `form_field_events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `form_id` VARCHAR(128) NOT NULL,
  `field_name` VARCHAR(64) NOT NULL,
  `dwell_time_ms` INT DEFAULT 0,
  `error_type` VARCHAR(255) DEFAULT NULL,
  `was_abandoned` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_form_field_name` (`form_id`, `field_name`, `was_abandoned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Technical Health & Error Logs
CREATE TABLE IF NOT EXISTS `technical_health_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) DEFAULT NULL,
  `error_type` VARCHAR(64) NOT NULL,
  `message` TEXT NOT NULL,
  `stack_snippet` TEXT DEFAULT NULL,
  `page_url` VARCHAR(500) DEFAULT NULL,
  `lcp_ms` INT DEFAULT NULL,
  `load_time_ms` INT DEFAULT NULL,
  `http_status` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tech_type_time` (`error_type`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Bitrix24 Leads
CREATE TABLE IF NOT EXISTS `crm_leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bitrix_lead_id` VARCHAR(64) NOT NULL UNIQUE,
  `session_id` VARCHAR(64) DEFAULT NULL,
  `gclid` VARCHAR(255) DEFAULT NULL,
  `service_slug` VARCHAR(64) NOT NULL,
  `lead_status` ENUM('RAW', 'CONTACTED', 'JUNK', 'QUALIFIED') DEFAULT 'RAW',
  `contact_latency_minutes` INT DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `contact_name` VARCHAR(255) DEFAULT NULL,
  `contact_phone` VARCHAR(64) DEFAULT NULL,
  `contact_email` VARCHAR(128) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `qualified_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_leads_session` (`session_id`),
  INDEX `idx_leads_gclid` (`gclid`),
  INDEX `idx_leads_status` (`lead_status`),
  INDEX `idx_leads_service` (`service_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Bitrix24 Deals / Opportunities & Revenue
CREATE TABLE IF NOT EXISTS `crm_deals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `bitrix_deal_id` VARCHAR(64) NOT NULL UNIQUE,
  `lead_id` VARCHAR(64) DEFAULT NULL,
  `deal_stage` ENUM('OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST') DEFAULT 'OPPORTUNITY',
  `deal_value` DECIMAL(14, 2) DEFAULT 0.00,
  `currency` VARCHAR(8) DEFAULT 'INR',
  `loss_reason` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `won_at` TIMESTAMP NULL DEFAULT NULL,
  `lost_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_deals_lead` (`lead_id`),
  INDEX `idx_deals_stage` (`deal_stage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
