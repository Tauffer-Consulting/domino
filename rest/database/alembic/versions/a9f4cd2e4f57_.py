"""
Update permission enum values

Revision ID: a9f4cd2e4f57
Revises: ab54cfed2bdc
Create Date: 2024-03-22 10:29:23.445775

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a9f4cd2e4f57'
down_revision = 'ab54cfed2bdc'
branch_labels = None
depends_on = None


from alembic import op

def upgrade():
    op.execute("ALTER TABLE user_workspace_associative ALTER COLUMN permission DROP DEFAULT")
    op.execute("CREATE TYPE permission_new AS ENUM ('owner', 'admin', 'write', 'read')")
    op.execute("ALTER TABLE user_workspace_associative ALTER COLUMN permission TYPE permission_new USING permission::text::permission_new")
    op.execute("DROP TYPE permission")
    op.execute("ALTER TYPE permission_new RENAME TO permission")
    op.execute("ALTER TABLE user_workspace_associative ALTER COLUMN permission SET DEFAULT 'owner'")

def downgrade():
    op.execute("ALTER TABLE user_workspace_associative ALTER COLUMN permission DROP DEFAULT")
    op.execute("CREATE TYPE permission_new AS ENUM ('owner', 'read', 'Config')")
    op.execute("ALTER TABLE user_workspace_associative ALTER COLUMN permission TYPE permission_new USING permission::text::permission_new")
    op.execute("DROP TYPE permission")
    op.execute("ALTER TYPE permission_new RENAME TO permission")
    op.execute("ALTER TABLE user_workspace_associative ALTER COLUMN permission SET DEFAULT 'owner'")