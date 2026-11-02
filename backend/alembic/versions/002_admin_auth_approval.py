"""Add admin approval status, organization fields, and invitation codes table

Revision ID: 002_admin_auth_approval
Revises: 001_initial_schema
Create Date: 2026-11-02 20:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision: str = '002_admin_auth_approval'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    user_columns = [c['name'] for c in inspector.get_columns('users')]

    # 1. Add approval and organization columns to users table safely
    if 'approval_status' not in user_columns:
        op.add_column('users', sa.Column('approval_status', sa.String(length=30), nullable=False, server_default='APPROVED'))
    if 'organization_name' not in user_columns:
        op.add_column('users', sa.Column('organization_name', sa.String(length=200), nullable=True))
    if 'authorization_reference' not in user_columns:
        op.add_column('users', sa.Column('authorization_reference', sa.String(length=100), nullable=True))
    if 'license_document_url' not in user_columns:
        op.add_column('users', sa.Column('license_document_url', sa.String(length=255), nullable=True))
    if 'approved_at' not in user_columns:
        op.add_column('users', sa.Column('approved_at', sa.DateTime(), nullable=True))
    if 'approved_by_id' not in user_columns:
        op.add_column('users', sa.Column('approved_by_id', sa.Integer(), nullable=True))

    # 2. Create admin_invitation_codes table if it does not already exist
    existing_tables = inspector.get_table_names()
    if 'admin_invitation_codes' not in existing_tables:
        op.create_table(
            'admin_invitation_codes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('code_hash', sa.String(length=64), nullable=False),
            sa.Column('organization_name', sa.String(length=200), nullable=True),
            sa.Column('created_by_admin_id', sa.Integer(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('is_used', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('used_by_user_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_admin_invitation_codes_id'), 'admin_invitation_codes', ['id'], unique=False)
        op.create_index(op.f('ix_admin_invitation_codes_code_hash'), 'admin_invitation_codes', ['code_hash'], unique=True)
    else:
        # Ensure indices exist
        indices = [i['name'] for i in inspector.get_indexes('admin_invitation_codes')]
        if 'ix_admin_invitation_codes_id' not in indices:
            op.create_index(op.f('ix_admin_invitation_codes_id'), 'admin_invitation_codes', ['id'], unique=False)
        if 'ix_admin_invitation_codes_code_hash' not in indices:
            op.create_index(op.f('ix_admin_invitation_codes_code_hash'), 'admin_invitation_codes', ['code_hash'], unique=True)

def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'admin_invitation_codes' in existing_tables:
        op.drop_index(op.f('ix_admin_invitation_codes_code_hash'), table_name='admin_invitation_codes')
        op.drop_index(op.f('ix_admin_invitation_codes_id'), table_name='admin_invitation_codes')
        op.drop_table('admin_invitation_codes')

    user_columns = [c['name'] for c in inspector.get_columns('users')]
    for col in ['approved_by_id', 'approved_at', 'license_document_url', 'authorization_reference', 'organization_name', 'approval_status']:
        if col in user_columns:
            op.drop_column('users', col)
