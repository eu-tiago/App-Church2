-- =============================================================================
-- CHURCHFLOW SAAS - ESQUEMA DE BANCO DE DADOS MYSQL 8.0+
-- Versão da Migration: 001_initial_schema.sql
-- Padrão: Multi-Tenant com Isolamento Lógico por tenant_id
-- Motor: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. SAAS & PLANOS DE ASSINATURA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plans` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `monthly_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `annual_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `max_members` INT NOT NULL DEFAULT 100,
  `max_users` INT NOT NULL DEFAULT 5,
  `max_cells` INT NOT NULL DEFAULT 10,
  `max_events_per_month` INT NOT NULL DEFAULT 2,
  `has_financial_module` BOOLEAN NOT NULL DEFAULT TRUE,
  `has_payment_gateway` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_bi_analytics` BOOLEAN NOT NULL DEFAULT FALSE,
  `has_multi_congregations` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenants` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `document_cnpj` VARCHAR(20) NULL,
  `contact_email` VARCHAR(150) NOT NULL,
  `contact_phone` VARCHAR(25) NULL,
  `subdomain` VARCHAR(80) NULL UNIQUE,
  `plan_id` VARCHAR(36) NOT NULL,
  `status` ENUM('trial', 'active', 'past_due', 'suspended', 'cancelled') NOT NULL DEFAULT 'trial',
  `trial_ends_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenants_status` (`status`),
  CONSTRAINT `fk_tenants_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_settings` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL UNIQUE,
  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#0F172A',
  `secondary_color` VARCHAR(20) NOT NULL DEFAULT '#2563EB',
  `logo_url` TEXT NULL,
  `timezone` VARCHAR(50) NOT NULL DEFAULT 'America/Sao_Paulo',
  `date_format` VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
  `currency` VARCHAR(5) NOT NULL DEFAULT 'BRL',
  `allow_public_registrations` BOOLEAN NOT NULL DEFAULT TRUE,
  `enable_sms_notifications` BOOLEAN NOT NULL DEFAULT FALSE,
  `enable_whatsapp_notifications` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_settings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `plan_id` VARCHAR(36) NOT NULL,
  `status` ENUM('active', 'trialing', 'past_due', 'canceled', 'unpaid') NOT NULL DEFAULT 'active',
  `current_period_start` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `current_period_end` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) NULL,
  `auto_renew` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_tenant` (`tenant_id`),
  CONSTRAINT `fk_subscriptions_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. CONGREGAÇÕES (CAMPUS / SEDE / FILIAIS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `congregations` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `code` VARCHAR(20) NULL,
  `is_main` BOOLEAN NOT NULL DEFAULT FALSE,
  `phone` VARCHAR(25) NULL,
  `email` VARCHAR(100) NULL,
  `postal_code` VARCHAR(15) NULL,
  `address` VARCHAR(200) NULL,
  `city` VARCHAR(80) NULL,
  `state` VARCHAR(10) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_congregations_tenant` (`tenant_id`, `is_active`),
  CONSTRAINT `fk_congregations_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. USUÁRIOS, SESSÕES E CONTROLE DE ACESSO (RBAC)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(80) NOT NULL,
  `description` VARCHAR(200) NULL,
  `is_system_role` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(80) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` VARCHAR(36) NOT NULL,
  `permission_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NULL, -- NULL apenas para Superadministrador global do SaaS
  `congregation_id` VARCHAR(36) NULL,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(25) NULL,
  `avatar_url` TEXT NULL,
  `role_code` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_tenant` (`tenant_id`, `role_code`),
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. MEMBROS E VISITANTES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `members` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `photo_url` TEXT NULL,
  `birth_date` DATE NULL,
  `phone` VARCHAR(25) NULL,
  `email` VARCHAR(120) NULL,
  `cpf` VARCHAR(14) NULL,
  `gender` ENUM('M', 'F') NULL,
  `marital_status` ENUM('solteiro', 'casado', 'viuvo', 'divorciado', 'outro') NULL,
  `address` VARCHAR(200) NULL,
  `neighborhood` VARCHAR(80) NULL,
  `city` VARCHAR(80) NULL,
  `state` VARCHAR(10) NULL,
  `postal_code` VARCHAR(15) NULL,
  `conversion_date` DATE NULL,
  `baptism_date` DATE NULL,
  `membership_status` ENUM('ativo', 'inativo', 'em_disciplina', 'transferido', 'falecido') NOT NULL DEFAULT 'ativo',
  `is_leader` BOOLEAN NOT NULL DEFAULT FALSE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_members_tenant_status` (`tenant_id`, `membership_status`),
  KEY `idx_members_congregation` (`congregation_id`),
  CONSTRAINT `fk_members_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `visitors` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `email` VARCHAR(120) NULL,
  `first_visit_date` DATE NOT NULL,
  `first_cell_id` VARCHAR(36) NULL,
  `invited_by_member_id` VARCHAR(36) NULL,
  `funnel_stage` ENUM('novo', 'primeiro_contato', 'integracao', 'discipulado', 'membro', 'desistente') NOT NULL DEFAULT 'novo',
  `notes` TEXT NULL,
  `converted_to_member_id` VARCHAR(36) NULL,
  `converted_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_visitors_tenant_stage` (`tenant_id`, `funnel_stage`),
  CONSTRAINT `fk_visitors_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visitors_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`),
  CONSTRAINT `fk_visitors_converted_member` FOREIGN KEY (`converted_to_member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. CÉLULAS E REUNIÕES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cells` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('mista', 'jovens', 'homens', 'mulheres', 'criancas', 'casais', 'empresarios') NOT NULL DEFAULT 'mista',
  `day_of_week` ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL DEFAULT 'quarta',
  `meeting_time` TIME NOT NULL DEFAULT '20:00:00',
  `postal_code` VARCHAR(15) NULL,
  `address` VARCHAR(200) NOT NULL,
  `neighborhood` VARCHAR(80) NOT NULL,
  `city` VARCHAR(80) NULL,
  `state` VARCHAR(10) NULL,
  `leader_id` VARCHAR(36) NOT NULL,
  `co_leader_id` VARCHAR(36) NULL,
  `supervisor_id` VARCHAR(36) NULL,
  `coordinator_id` VARCHAR(36) NULL,
  `opening_date` DATE NOT NULL,
  `max_capacity` INT NOT NULL DEFAULT 15,
  `status` ENUM('ativa', 'em_multiplicacao', 'pausada', 'encerrada') NOT NULL DEFAULT 'ativa',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cells_tenant_status` (`tenant_id`, `status`),
  KEY `idx_cells_leader` (`leader_id`),
  CONSTRAINT `fk_cells_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cells_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`),
  CONSTRAINT `fk_cells_leader` FOREIGN KEY (`leader_id`) REFERENCES `members` (`id`),
  CONSTRAINT `fk_cells_coleader` FOREIGN KEY (`co_leader_id`) REFERENCES `members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cell_members` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `cell_id` VARCHAR(36) NOT NULL,
  `member_id` VARCHAR(36) NOT NULL,
  `role_in_cell` ENUM('lider', 'colider', 'anfitriao', 'membro', 'visitante_recorrente') NOT NULL DEFAULT 'membro',
  `joined_at` DATE NOT NULL,
  `left_at` DATE NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cell_member` (`cell_id`, `member_id`),
  KEY `idx_cell_members_tenant` (`tenant_id`),
  CONSTRAINT `fk_cm_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cm_cell` FOREIGN KEY (`cell_id`) REFERENCES `cells` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cm_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cell_meetings` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `cell_id` VARCHAR(36) NOT NULL,
  `meeting_date` DATE NOT NULL,
  `theme` VARCHAR(150) NOT NULL,
  `leader_in_charge_id` VARCHAR(36) NOT NULL,
  `total_members_present` INT NOT NULL DEFAULT 0,
  `total_visitors_present` INT NOT NULL DEFAULT 0,
  `total_absent` INT NOT NULL DEFAULT 0,
  `offering_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `decisions_count` INT NOT NULL DEFAULT 0,
  `prayer_requests` TEXT NULL,
  `observations` TEXT NULL,
  `photo_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meetings_tenant_cell` (`tenant_id`, `cell_id`, `meeting_date`),
  CONSTRAINT `fk_meetings_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meetings_cell` FOREIGN KEY (`cell_id`) REFERENCES `cells` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meetings_leader` FOREIGN KEY (`leader_in_charge_id`) REFERENCES `members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cell_attendance` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `meeting_id` VARCHAR(36) NOT NULL,
  `member_id` VARCHAR(36) NULL,
  `visitor_id` VARCHAR(36) NULL,
  `attendee_name` VARCHAR(120) NOT NULL,
  `is_present` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_visitor` BOOLEAN NOT NULL DEFAULT FALSE,
  `notes` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_attendance_meeting` (`meeting_id`),
  CONSTRAINT `fk_attendance_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `cell_meetings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. DISCIPULADO E JORNADA PASTORAL
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pastoral_followups` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `visitor_id` VARCHAR(36) NULL,
  `member_id` VARCHAR(36) NULL,
  `responsible_user_id` VARCHAR(36) NOT NULL,
  `stage` ENUM('visitante', 'primeiro_contato', 'integracao', 'discipulado', 'membro_ativo', 'lider_formacao') NOT NULL,
  `channel` ENUM('presencial', 'whatsapp', 'ligacao', 'visita_domiciliar') NOT NULL DEFAULT 'whatsapp',
  `scheduled_date` DATE NULL,
  `completed_date` DATE NULL,
  `notes` TEXT NOT NULL,
  `status` ENUM('pendente', 'concluido', 'cancelado') NOT NULL DEFAULT 'pendente',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_followups_tenant_stage` (`tenant_id`, `stage`),
  CONSTRAINT `fk_followups_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_followups_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_followups_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_followups_user` FOREIGN KEY (`responsible_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. MINISTÉRIOS E DEPARTAMENTOS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ministries` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `leader_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ministries_tenant` (`tenant_id`),
  CONSTRAINT `fk_ministries_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ministries_leader` FOREIGN KEY (`leader_id`) REFERENCES `members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ministry_members` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `ministry_id` VARCHAR(36) NOT NULL,
  `member_id` VARCHAR(36) NOT NULL,
  `function_name` VARCHAR(80) NOT NULL DEFAULT 'Voluntário',
  `joined_at` DATE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_min_member` (`ministry_id`, `member_id`),
  CONSTRAINT `fk_mm_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mm_ministry` FOREIGN KEY (`ministry_id`) REFERENCES `ministries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mm_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. EVENTOS, LOTES E INSCRIÇÕES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `banner_url` TEXT NULL,
  `category` ENUM('congresso', 'conferencia', 'retiro', 'acampamento', 'encontro_casais', 'seminario', 'jovens', 'arrecadacao', 'outro') NOT NULL DEFAULT 'conferencia',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `location_name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(200) NOT NULL,
  `organizer_name` VARCHAR(100) NOT NULL,
  `is_paid` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_published` BOOLEAN NOT NULL DEFAULT TRUE,
  `capacity` INT NOT NULL DEFAULT 500,
  `cancellation_policy` TEXT NULL,
  `terms_and_conditions` TEXT NULL,
  `payment_provider_id` VARCHAR(36) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_events_tenant_slug` (`tenant_id`, `slug`),
  KEY `idx_events_tenant_dates` (`tenant_id`, `start_date`),
  CONSTRAINT `fk_events_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_events_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `event_ticket_lots` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `quantity_total` INT NOT NULL,
  `quantity_sold` INT NOT NULL DEFAULT 0,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lots_event` (`event_id`, `is_active`),
  CONSTRAINT `fk_lots_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lots_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `lot_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `attendee_name` VARCHAR(120) NOT NULL,
  `attendee_email` VARCHAR(120) NOT NULL,
  `attendee_phone` VARCHAR(25) NOT NULL,
  `attendee_cpf` VARCHAR(14) NULL,
  `congregation_name` VARCHAR(100) NULL,
  `cell_name` VARCHAR(100) NULL,
  `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `final_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('pix', 'credit_card', 'boleto', 'cortesia') NOT NULL DEFAULT 'pix',
  `payment_status` ENUM('pendente', 'aprovado', 'recusado', 'reembolsado', 'cancelado') NOT NULL DEFAULT 'pendente',
  `gateway_provider` VARCHAR(50) NULL,
  `gateway_transaction_id` VARCHAR(100) NULL,
  `qr_code_token` VARCHAR(100) NOT NULL UNIQUE,
  `checked_in` BOOLEAN NOT NULL DEFAULT FALSE,
  `checked_in_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_registrations_event_status` (`event_id`, `payment_status`),
  KEY `idx_registrations_tenant` (`tenant_id`),
  CONSTRAINT `fk_reg_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_lot` FOREIGN KEY (`lot_id`) REFERENCES `event_ticket_lots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `event_expenses` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `event_id` VARCHAR(36) NOT NULL,
  `description` VARCHAR(150) NOT NULL,
  `category` ENUM('alimentacao', 'locacao', 'som_iluminacao', 'divulgacao', 'palestrante', 'hospedagem', 'transporte', 'materiais', 'outros') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `supplier_name` VARCHAR(120) NOT NULL,
  `due_date` DATE NOT NULL,
  `payment_date` DATE NULL,
  `status` ENUM('pendente', 'pago', 'cancelado') NOT NULL DEFAULT 'pendente',
  `receipt_url` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_event` (`event_id`, `status`),
  CONSTRAINT `fk_ee_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ee_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. FINANCEIRO GERAL E CENTROS DE CUSTO
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `financial_accounts` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `bank_name` VARCHAR(80) NOT NULL,
  `account_type` ENUM('corrente', 'poupanca', 'caixa_fisico', 'gateway_virtual') NOT NULL DEFAULT 'corrente',
  `agency` VARCHAR(20) NULL,
  `account_number` VARCHAR(30) NULL,
  `initial_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `current_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_accounts_tenant` (`tenant_id`),
  CONSTRAINT `fk_fa_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fa_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `financial_categories` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `type` ENUM('receita', 'despesa') NOT NULL,
  `code` VARCHAR(20) NULL,
  `is_system` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  KEY `idx_fcat_tenant` (`tenant_id`, `type`),
  CONSTRAINT `fk_fcat_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `financial_cost_centers` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NULL,
  `event_id` VARCHAR(36) NULL, -- Vinculação automática com centro de custo de eventos
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  KEY `idx_fcc_tenant` (`tenant_id`),
  CONSTRAINT `fk_fcc_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fcc_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `financial_transactions` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `congregation_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NOT NULL,
  `cost_center_id` VARCHAR(36) NULL,
  `event_id` VARCHAR(36) NULL,
  `type` ENUM('receita', 'despesa', 'transferencia') NOT NULL,
  `nature` ENUM('dizimo', 'oferta', 'evento_inscricao', 'doacao', 'aluguel', 'utilidades', 'ministerio', 'folha', 'outros') NOT NULL,
  `description` VARCHAR(200) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `fee_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `net_amount` DECIMAL(12,2) NOT NULL,
  `due_date` DATE NOT NULL,
  `competence_date` DATE NOT NULL,
  `payment_date` DATE NULL,
  `status` ENUM('pendente', 'pago', 'cancelado', 'estornado') NOT NULL DEFAULT 'pago',
  `payer_or_receiver` VARCHAR(120) NULL,
  `member_id` VARCHAR(36) NULL,
  `gateway_provider` VARCHAR(50) NULL,
  `gateway_transaction_id` VARCHAR(100) NULL,
  `document_number` VARCHAR(80) NULL,
  `is_reconciled` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_by_user_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ft_tenant_dates` (`tenant_id`, `payment_date`),
  KEY `idx_ft_tenant_status` (`tenant_id`, `status`),
  KEY `idx_ft_event` (`event_id`),
  CONSTRAINT `fk_ft_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ft_congregation` FOREIGN KEY (`congregation_id`) REFERENCES `congregations` (`id`),
  CONSTRAINT `fk_ft_account` FOREIGN KEY (`account_id`) REFERENCES `financial_accounts` (`id`),
  CONSTRAINT `fk_ft_category` FOREIGN KEY (`category_id`) REFERENCES `financial_categories` (`id`),
  CONSTRAINT `fk_ft_cost_center` FOREIGN KEY (`cost_center_id`) REFERENCES `financial_cost_centers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ft_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ft_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ft_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. INTEGRAÇÃO COM GATEWAYS DE PAGAMENTO & WEBHOOKS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_integrations` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `provider` ENUM('asaas', 'mercadopago', 'stripe', 'pagbank') NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `api_key_encrypted` TEXT NOT NULL,
  `access_token_encrypted` TEXT NULL,
  `webhook_secret_encrypted` TEXT NULL,
  `is_sandbox` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_health_check_at` TIMESTAMP NULL,
  `last_health_status` ENUM('healthy', 'error', 'untested') NOT NULL DEFAULT 'untested',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pi_tenant_provider` (`tenant_id`, `provider`),
  CONSTRAINT `fk_pi_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_webhook_events` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `provider` ENUM('asaas', 'mercadopago', 'stripe', 'pagbank') NOT NULL,
  `external_event_id` VARCHAR(150) NOT NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `payload_json` JSON NOT NULL,
  `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pendente', 'processado', 'falha', 'ignorado_duplicado') NOT NULL DEFAULT 'pendente',
  `retry_count` INT NOT NULL DEFAULT 0,
  `error_message` TEXT NULL,
  `processed_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_webhook_idempotency` (`tenant_id`, `provider`, `external_event_id`),
  KEY `idx_webhook_status` (`tenant_id`, `status`),
  CONSTRAINT `fk_pwe_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. AUDITORIA E LOGS (LGPD & COMPLIANCE)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `user_name` VARCHAR(120) NULL,
  `action` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(36) NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_tenant_time` (`tenant_id`, `created_at`),
  CONSTRAINT `fk_audit_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
