"""Security hardening: refresh tokens, revoked tokens, MFA, brute force lockout, and performance indexes

Revision ID: 003_security_hardening
Revises: 002_admin_auth_approval
Create Date: 2026-11-03 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = '003_security_hardening'
down_revision: Union[str, None] = '002_admin_auth_approval'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    user_columns = [c['name'] for c in inspector.get_columns('users')]

    # 1. Add MFA and brute force columns to users table safely
    if 'mfa_enabled' not in user_columns:
        op.add_column('users', sa.Column('mfa_enabled', sa.Boolean(), nullable=False, server_default=sa.false()))
    if 'mfa_secret' not in user_columns:
        op.add_column('users', sa.Column('mfa_secret', sa.String(length=64), nullable=True))
    if 'failed_login_attempts' not in user_columns:
        op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'))
    if 'locked_until' not in user_columns:
        op.add_column('users', sa.Column('locked_until', sa.DateTime(), nullable=True))

    existing_tables = inspector.get_table_names()

    # 2. Create refresh_tokens table
    if 'refresh_tokens' not in existing_tables:
        op.create_table(
            'refresh_tokens',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('token_hash', sa.String(length=64), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('replaced_by_hash', sa.String(length=64), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_refresh_tokens_id'), 'refresh_tokens', ['id'], unique=False)
        op.create_index(op.f('ix_refresh_tokens_token_hash'), 'refresh_tokens', ['token_hash'], unique=True)
        op.create_index(op.f('ix_refresh_tokens_user_id'), 'refresh_tokens', ['user_id'], unique=False)

    # 3. Create revoked_tokens table
    if 'revoked_tokens' not in existing_tables:
        op.create_table(
            'revoked_tokens',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('jti', sa.String(length=64), nullable=False),
            sa.Column('token_type', sa.String(length=20), nullable=False, server_default='access'),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('revoked_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_revoked_tokens_id'), 'revoked_tokens', ['id'], unique=False)
        op.create_index(op.f('ix_revoked_tokens_jti'), 'revoked_tokens', ['jti'], unique=True)
        op.create_index(op.f('ix_revoked_tokens_user_id'), 'revoked_tokens', ['user_id'], unique=False)

    # 4. Create performance indexes
    sos_indices = [i['name'] for i in inspector.get_indexes('sos_incidents')]
    if 'ix_sos_incidents_user_created' not in sos_indices:
        op.create_index('ix_sos_incidents_user_created', 'sos_incidents', ['user_id', 'created_at'], unique=False)

    loc_indices = [i['name'] for i in inspector.get_indexes('location_sessions')]
    if 'ix_location_sessions_user_active' not in loc_indices:
        op.create_index('ix_location_sessions_user_active', 'location_sessions', ['user_id', 'is_active'], unique=False)

    audit_indices = [i['name'] for i in inspector.get_indexes('audit_logs')]
    if 'ix_audit_logs_user_created' not in audit_indices:
        op.create_index('ix_audit_logs_user_created', 'audit_logs', ['user_id', 'created_at'], unique=False)

    notif_indices = [i['name'] for i in inspector.get_indexes('notifications')]
    if 'ix_notifications_user_unread' not in notif_indices:
        op.create_index('ix_notifications_user_unread', 'notifications', ['user_id', 'is_read'], unique=False)

def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'revoked_tokens' in existing_tables:
        op.drop_table('revoked_tokens')
    if 'refresh_tokens' in existing_tables:
        op.drop_table('refresh_tokens')

    user_columns = [c['name'] for c in inspector.get_columns('users')]
    for col in ['locked_until', 'failed_login_attempts', 'mfa_secret', 'mfa_enabled']:
        if col in user_columns:
            op.drop_column('users', col)

