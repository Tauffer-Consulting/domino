"""add is_compose_column _in_piece_table

Revision ID: db8dc6c75b71
Revises: c25e53090da7
Create Date: 2023-10-26 07:30:25.873993

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'db8dc6c75b71'
down_revision = 'c25e53090da7'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('piece', sa.Column('is_compose', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('piece', 'is_compose')
    # ### end Alembic commands ###
