"""empty message

Revision ID: 851c49af162b
Revises: 
Create Date: 2023-04-04 16:14:05.246046

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '851c49af162b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('email', sa.String(length=50), nullable=True),
    sa.Column('password', sa.String(length=200), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('workspace',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('github_access_token', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('piece_repository',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=True),
    sa.Column('source', sa.Enum('github', 'default', 'Config', name='repositorysource'), nullable=True),
    sa.Column('path', sa.String(length=250), nullable=True),
    sa.Column('version', sa.String(length=10), nullable=True),
    sa.Column('dependencies_map', sa.JSON(), nullable=True),
    sa.Column('compiled_metadata', sa.JSON(), nullable=True),
    sa.Column('workspace_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('user_workspace_associative',
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('workspace_id', sa.Integer(), nullable=False),
    sa.Column('permission', sa.Enum('owner', 'read', 'Config', name='permission'), server_default='owner', nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='cascade'),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('user_id', 'workspace_id')
    )
    op.create_table('workflow',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('uuid_name', sa.String(length=50), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('schema', sa.JSON(), nullable=True),
    sa.Column('ui_schema', sa.JSON(), nullable=True),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('last_changed_at', sa.DateTime(), nullable=False),
    sa.Column('start_date', sa.DateTime(), nullable=True),
    sa.Column('end_date', sa.DateTime(), nullable=True),
    sa.Column('schedule_interval', sa.Enum('none', 'once', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'Config', name='workflowscheduleinterval'), nullable=True),
    sa.Column('workspace_id', sa.Integer(), nullable=False),
    sa.Column('last_changed_by', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['last_changed_by'], ['user.id'], ),
    sa.ForeignKeyConstraint(['workspace_id'], ['workspace.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('uuid_name')
    )
    op.create_table('piece',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('dependency', sa.JSON(), nullable=True),
    sa.Column('source_image', sa.String(), nullable=True),
    sa.Column('input_schema', sa.JSON(), server_default=sa.text("'{}'::jsonb"), nullable=False),
    sa.Column('output_schema', sa.JSON(), server_default=sa.text("'{}'::jsonb"), nullable=False),
    sa.Column('secrets_schema', sa.JSON(), server_default=sa.text("'{}'::jsonb"), nullable=False),
    sa.Column('style', sa.JSON(), nullable=True),
    sa.Column('repository_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['repository_id'], ['piece_repository.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('secret',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('value', sa.String(), nullable=True),
    sa.Column('piece_repository_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['piece_repository_id'], ['piece_repository.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('workflow_piece_repository_associative',
    sa.Column('workflow_id', sa.Integer(), nullable=False),
    sa.Column('piece_repository_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['piece_repository_id'], ['piece_repository.id'], ondelete='cascade'),
    sa.ForeignKeyConstraint(['workflow_id'], ['workflow.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('workflow_id', 'piece_repository_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('workflow_piece_repository_associative')
    op.drop_table('secret')
    op.drop_table('piece')
    op.drop_table('workflow')
    op.drop_table('user_workspace_associative')
    op.drop_table('piece_repository')
    op.drop_table('workspace')
    op.drop_table('user')
    # ### end Alembic commands ###
