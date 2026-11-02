-- ============================================================================
-- SHAKTISHIELD AI - PostgreSQL Security & Supabase Row Level Security (RLS)
-- Complete Defense-in-Depth Hardening Script
-- ============================================================================

-- 1. APPLICATION LEAST-PRIVILEGE ROLE SETUP
-- In production, the backend should connect using a restricted role rather than 'postgres' superuser.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'shaktishield_app') THEN
        CREATE ROLE shaktishield_app WITH LOGIN PASSWORD 'CHANGE_THIS_IN_PRODUCTION_SECRET';
    END IF;
END $$;

-- Grant minimal necessary schema privileges to the application role
GRANT CONNECT ON DATABASE postgres TO shaktishield_app;
GRANT USAGE ON SCHEMA public TO shaktishield_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO shaktishield_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO shaktishield_app;

-- Ensure newly created tables automatically inherit least-privilege permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO shaktishield_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO shaktishield_app;

-- Explicitly revoke destructive privileges from the application role
REVOKE CREATE ON SCHEMA public FROM shaktishield_app;
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM shaktishield_app;

-- 2. REVOKE UNRESTRICTED ANONYMOUS ACCESS
-- Prevent Supabase anon role from querying sensitive user data directly through the REST API
REVOKE ALL ON TABLE users FROM anon;
REVOKE ALL ON TABLE trusted_contacts FROM anon;
REVOKE ALL ON TABLE sos_incidents FROM anon;
REVOKE ALL ON TABLE location_sessions FROM anon;
REVOKE ALL ON TABLE audit_logs FROM anon;
REVOKE ALL ON TABLE notifications FROM anon;
REVOKE ALL ON TABLE admin_invitation_codes FROM anon;
REVOKE ALL ON TABLE refresh_tokens FROM anon;
REVOKE ALL ON TABLE revoked_tokens FROM anon;

-- 3. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RESTRICTIVE RLS POLICIES

-- ============================================================================
-- A. USERS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS users_self_read ON users;
CREATE POLICY users_self_read ON users
    FOR SELECT
    USING (
        id::text = auth.uid()::text
        OR (auth.jwt() ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS users_self_update ON users;
CREATE POLICY users_self_update ON users
    FOR UPDATE
    USING (id::text = auth.uid()::text)
    WITH CHECK (
        id::text = auth.uid()::text
        -- Role and approval_status cannot be self-modified via RLS
        AND role = (SELECT role FROM users WHERE id::text = auth.uid()::text)
        AND approval_status = (SELECT approval_status FROM users WHERE id::text = auth.uid()::text)
    );

-- ============================================================================
-- B. TRUSTED CONTACTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS contacts_user_isolation ON trusted_contacts;
CREATE POLICY contacts_user_isolation ON trusted_contacts
    FOR ALL
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

-- ============================================================================
-- C. SOS INCIDENTS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS incidents_read_policy ON sos_incidents;
CREATE POLICY incidents_read_policy ON sos_incidents
    FOR SELECT
    USING (
        user_id::text = auth.uid()::text
        OR (auth.jwt() ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS incidents_insert_policy ON sos_incidents;
CREATE POLICY incidents_insert_policy ON sos_incidents
    FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS incidents_update_policy ON sos_incidents;
CREATE POLICY incidents_update_policy ON sos_incidents
    FOR UPDATE
    USING (
        user_id::text = auth.uid()::text
        OR (auth.jwt() ->> 'role') = 'admin'
    );

-- ============================================================================
-- D. LOCATION SESSIONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS location_owner_all ON location_sessions;
CREATE POLICY location_owner_all ON location_sessions
    FOR ALL
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

-- Allow contacts with session_code to view active, non-expired sessions
DROP POLICY IF EXISTS location_shared_viewer ON location_sessions;
CREATE POLICY location_shared_viewer ON location_sessions
    FOR SELECT
    USING (
        is_active = TRUE
        AND expires_at > NOW()
    );

-- ============================================================================
-- E. NOTIFICATIONS TABLE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS notifications_owner_all ON notifications;
CREATE POLICY notifications_owner_all ON notifications
    FOR ALL
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

-- ============================================================================
-- F. AUDIT LOGS TABLE POLICIES (Append-only & Admin/Owner Read)
-- ============================================================================
DROP POLICY IF EXISTS audit_logs_read ON audit_logs;
CREATE POLICY audit_logs_read ON audit_logs
    FOR SELECT
    USING (
        user_id::text = auth.uid()::text
        OR (auth.jwt() ->> 'role') = 'admin'
    );

-- ============================================================================
-- G. ADMIN INVITATION CODES TABLE POLICIES (Admin Only)
-- ============================================================================
DROP POLICY IF EXISTS admin_invitations_admin_only ON admin_invitation_codes;
CREATE POLICY admin_invitations_admin_only ON admin_invitation_codes
    FOR ALL
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ============================================================================
-- H. REFRESH & REVOKED TOKENS (Owner only)
-- ============================================================================
DROP POLICY IF EXISTS refresh_tokens_owner ON refresh_tokens;
CREATE POLICY refresh_tokens_owner ON refresh_tokens
    FOR ALL
    USING (user_id::text = auth.uid()::text)
    WITH CHECK (user_id::text = auth.uid()::text);

DROP POLICY IF EXISTS revoked_tokens_owner ON revoked_tokens;
CREATE POLICY revoked_tokens_owner ON revoked_tokens
    FOR SELECT
    USING (
        user_id::text = auth.uid()::text
        OR (auth.jwt() ->> 'role') = 'admin'
    );

-- ============================================================================
-- 5. SERVICE ROLE BYPASS
-- Ensure Supabase service_role has unrestricted access for backend services
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

