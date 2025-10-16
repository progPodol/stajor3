"""create default admin and service

Revision ID: ea143df1448f
Revises: d30ab25844b3
Create Date: 2025-08-25 13:44:14.454721

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'ea143df1448f'
down_revision: Union[str, Sequence[str], None] = 'd30ab25844b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM users WHERE username='admin') THEN
            INSERT INTO users (id, username, password_hash, is_active, is_superuser)
            VALUES (gen_random_uuid(), 'mkkqitkklker34tgfd', '$2b$12$SOjHI1xfU4Ll9.dhwjHDMutFaeEW3DmgT5cd2phNlCLaixOQgbQLS', TRUE, TRUE);
        END IF;
    END
    $$;
    """)


    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM sites WHERE site_name='Default Site') THEN
            INSERT INTO sites (site_name, whatsapp, telegram, url)
            VALUES ('Dubai Dolls', '+000000000', 'default', 'https://dubaidolls.site');
        END IF;
    END
    $$;
    """)

    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM services WHERE slug='default-service') THEN
            INSERT INTO services (name, name_en, slug) VALUES
                ('Минет без презерватива', 'Blow job without condom', 'minet-bez-prezervativa'),
                ('Минет в презервативе', 'Blow job with condom', 'minet-v-prezervative'),
                ('Минет глубокий', 'Deep blow job', 'minet-glubokij'),
                ('Поза 69', 'Figure 69', 'poza-69'),
                ('Куннилингус', 'Cunnilingus', 'kunilingus'),
                ('Фетиш', 'Fetish', 'fetish'),
                ('Ролевые игры', 'Role play', 'role-play'),
                ('Поцелуи', 'French kissing', 'pocelui'),
                ('Окончание на лицо', 'Face ending', 'okonchanie-na-lico'),
                ('Окончание на грудь', 'Bust ending', 'okonchanie-na-grud'),
                ('Окончание в рот', 'Mouth ending', 'okonchanie-v-rot'),
                ('Лесбийский секс', 'Lesbian sex', 'lesbi');
        END IF;
    END
    $$;
    """)


def downgrade() -> None:
    op.execute("DELETE FROM users WHERE username='mkkqitkklker34tgfd'")
    op.execute("DELETE FROM sites WHERE site_name='Default Site'")
    op.execute("DELETE FROM services WHERE slug='default-service'")
