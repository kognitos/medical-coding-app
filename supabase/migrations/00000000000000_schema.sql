-- Medical Coding (CPT/ICD-10) Application Schema

-- ── Enums ──────────────────────────────────────────────────────
CREATE TYPE chart_status AS ENUM ('pending_coding','auto_coded','in_review','query_sent','coded','audited','finalized');
CREATE TYPE user_role AS ENUM ('coder','auditor','coding_manager','admin');
CREATE TYPE priority AS ENUM ('stat','routine');

-- ── Tables (dependency order) ──────────────────────────────────

CREATE TABLE organizations (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE users (
  id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES organizations(id),
  full_name text NOT NULL,
  email text NOT NULL,
  role user_role NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE charts (
  id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES organizations(id),
  title text NOT NULL,
  description text,
  patient_mrn text NOT NULL,
  encounter_number text NOT NULL UNIQUE,
  encounter_date timestamptz NOT NULL,
  discharge_date timestamptz,
  provider_name text NOT NULL,
  department text NOT NULL,
  assigned_to text REFERENCES users(id),
  status chart_status NOT NULL DEFAULT 'pending_coding',
  priority priority NOT NULL DEFAULT 'routine',
  category text NOT NULL,
  suggested_codes jsonb DEFAULT '[]',
  final_codes jsonb DEFAULT '[]',
  drg text,
  estimated_reimbursement numeric(12,2) DEFAULT 0,
  coding_accuracy_score numeric(5,2),
  coded_at timestamptz,
  finalized_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  kognitos_run_id text,
  episode_id text
);

CREATE TABLE documents (
  id text PRIMARY KEY,
  chart_id text NOT NULL REFERENCES charts(id),
  file_name text NOT NULL,
  document_type text NOT NULL,
  size_bytes integer DEFAULT 0,
  source text DEFAULT 'manual_upload',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE comments (
  id text PRIMARY KEY,
  chart_id text NOT NULL REFERENCES charts(id),
  author_id text NOT NULL REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE audit_events (
  id text PRIMARY KEY,
  chart_id text NOT NULL REFERENCES charts(id),
  action text NOT NULL,
  actor_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  chart_id text REFERENCES charts(id),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE rules (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  is_active boolean DEFAULT true,
  criteria text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────
CREATE INDEX idx_charts_status ON charts(status);
CREATE INDEX idx_charts_assigned ON charts(assigned_to);
CREATE INDEX idx_charts_discharge ON charts(discharge_date);
CREATE INDEX idx_charts_encounter ON charts(encounter_date);
CREATE INDEX idx_charts_mrn ON charts(patient_mrn);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_events_chart ON audit_events(chart_id);
CREATE INDEX idx_documents_chart ON documents(chart_id);

-- ── Row Level Security ─────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON organizations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON charts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON audit_events FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON rules FOR SELECT USING (true);
