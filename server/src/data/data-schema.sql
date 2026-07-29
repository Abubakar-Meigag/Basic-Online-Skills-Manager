CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organisations(
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_name  TEXT NOT NULL,
      type               TEXT NOT NULL,
      email_domain       TEXT NOT NULL,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users(
      id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email              TEXT NOT NULL UNIQUE,
      organisation_id    UUID REFERENCES organisations(id) ON DELETE SET NULL,
      is_active          BOOLEAN NOT NULL DEFAULT TRUE,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at      TIMESTAMPTZ
);

CREATE TABLE courses(
      id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_name               TEXT NOT NULL DEFAULT 'Basic Online Skills',
      commercial_org_id         UUID NOT NULL REFERENCES organisations(id) ON DELETE RESTRICT,
      outreach_org_id           UUID REFERENCES organisations(id) ON DELETE RESTRICT,
      account_name              TEXT NOT NULL,
      contract_name             TEXT NOT NULL,
      trainee_target            INTEGER NOT NULL CHECK(trainee_target > 0),
      deadline                  DATE NOT NULL,
      city                      TEXT NOT NULL,
      status                    TEXT NOT NULL DEFAULT 'request_pending',
      start_date                DATE,
      end_date                  DATE,
      venue_address             TEXT,
      contact_name              TEXT,
      contact_email             TEXT,
      client_group_description  TEXT,
      tech_level                TEXT,
      goal                      TEXT,
      lunch_arrangement         TEXT,
      expenses_notes            TEXT,
      note                      TEXT,
      created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log(
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      action        TEXT NOT NULL,
      entity_type   TEXT NOT NULL,
      entity_id     UUID NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);